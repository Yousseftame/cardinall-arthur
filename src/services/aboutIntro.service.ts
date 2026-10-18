import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AboutIntroStat {
  /** Display value, e.g. "10+", "95%" */
  value: string;
  /** Label under the value, e.g. "YEARS OF EXPERIENCE" */
  label: string;
}

export interface AboutIntroRecord {
  description: string;
  /** Always three stats for the About intro row */
  stats: [AboutIntroStat, AboutIntroStat, AboutIntroStat];
  updatedAt: string;
}

const SETTINGS_COLLECTION = 'settings';
const ABOUT_INTRO_DOC = 'aboutIntro';
const ABOUT_INTRO_STORAGE_KEY = 'cardinall_about_intro';

export const DEFAULT_ABOUT_INTRO: AboutIntroRecord = {
  description:
    "WE'RE UI/UX DESIGNERS FOCUSED ON CREATING USER-CENTERED DIGITAL PRODUCTS THAT ARE FUNCTIONAL, ACCESSIBLE, AND VISUALLY ENGAGING. FROM MOBILE APPS TO COMPLEX DASHBOARDS, WE TURN IDEAS INTO INTUITIVE, ENJOYABLE EXPERIENCES.",
  stats: [
    { value: '10+', label: 'YEARS OF EXPERIENCE' },
    { value: '40+', label: 'PROJECTS COMPLETED' },
    { value: '95%', label: 'REPEAT CLIENTS' },
  ],
  updatedAt: new Date(0).toISOString(),
};

function normalizeStat(raw: unknown, fallback: AboutIntroStat): AboutIntroStat {
  if (!raw || typeof raw !== 'object') return { ...fallback };
  const obj = raw as Record<string, unknown>;
  const value = String(obj.value ?? '').trim();
  const label = String(obj.label ?? '').trim();
  return {
    value: value || fallback.value,
    label: label || fallback.label,
  };
}

function normalizeRecord(raw: unknown): AboutIntroRecord {
  const base = DEFAULT_ABOUT_INTRO;
  if (!raw || typeof raw !== 'object') {
    return {
      description: base.description,
      stats: [
        { ...base.stats[0] },
        { ...base.stats[1] },
        { ...base.stats[2] },
      ],
      updatedAt: base.updatedAt,
    };
  }

  const obj = raw as Record<string, unknown>;
  const description = String(obj.description ?? '').trim() || base.description;
  const statsRaw = Array.isArray(obj.stats) ? obj.stats : [];

  const stats: [AboutIntroStat, AboutIntroStat, AboutIntroStat] = [
    normalizeStat(statsRaw[0], base.stats[0]),
    normalizeStat(statsRaw[1], base.stats[1]),
    normalizeStat(statsRaw[2], base.stats[2]),
  ];

  return {
    description,
    stats,
    updatedAt:
      typeof obj.updatedAt === 'string' && obj.updatedAt
        ? obj.updatedAt
        : new Date().toISOString(),
  };
}

function getLocalAboutIntro(): AboutIntroRecord | null {
  try {
    const raw = localStorage.getItem(ABOUT_INTRO_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRecord(JSON.parse(raw));
  } catch (e) {
    console.warn('Could not read local About Intro store:', e);
    return null;
  }
}

function saveLocalAboutIntro(record: AboutIntroRecord) {
  try {
    localStorage.setItem(ABOUT_INTRO_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event('cardinall_about_intro_updated'));
  } catch (e) {
    console.warn('Could not save local About Intro store:', e);
  }
}

/**
 * Fetches About Us Intro (description + 3 stats).
 * Prefers Firestore `settings/aboutIntro`, falls back to localStorage, then defaults.
 */
export async function getAboutIntro(): Promise<AboutIntroRecord> {
  const local = getLocalAboutIntro();

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ABOUT_INTRO_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const remote = normalizeRecord(snap.data());
      saveLocalAboutIntro(remote);
      return remote;
    }

    if (local) return local;
    return normalizeRecord(DEFAULT_ABOUT_INTRO);
  } catch (error) {
    console.warn('Using local/default About Intro due to fetch error:', error);
    return local ?? normalizeRecord(DEFAULT_ABOUT_INTRO);
  }
}

export type AboutIntroInput = {
  description: string;
  stats: [AboutIntroStat, AboutIntroStat, AboutIntroStat];
};

/**
 * Saves About Us Intro to Firestore + local cache.
 */
export async function updateAboutIntro(input: AboutIntroInput): Promise<AboutIntroRecord> {
  const description = String(input.description ?? '').trim();
  if (!description) {
    throw new Error('Description is required.');
  }

  const stats: [AboutIntroStat, AboutIntroStat, AboutIntroStat] = [
    normalizeStat(input.stats[0], DEFAULT_ABOUT_INTRO.stats[0]),
    normalizeStat(input.stats[1], DEFAULT_ABOUT_INTRO.stats[1]),
    normalizeStat(input.stats[2], DEFAULT_ABOUT_INTRO.stats[2]),
  ];

  for (let i = 0; i < 3; i++) {
    if (!stats[i].value.trim()) {
      throw new Error(`Stat ${i + 1} value is required.`);
    }
    if (!stats[i].label.trim()) {
      throw new Error(`Stat ${i + 1} label is required.`);
    }
  }

  const now = new Date().toISOString();
  const record: AboutIntroRecord = {
    description,
    stats,
    updatedAt: now,
  };

  saveLocalAboutIntro(record);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ABOUT_INTRO_DOC);
    await setDoc(
      docRef,
      {
        description: record.description,
        stats: record.stats,
        updatedAt: record.updatedAt,
        _serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to update About Intro in Firestore:', error);
    throw error;
  }

  return record;
}
