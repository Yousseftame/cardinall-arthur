/**
 * Static images for Latest Projects (home) — live in /src/assets.
 * Admin picks from these keys — never uploads to Firebase.
 * Add new assets here when you drop files into assets.
 */
import latest1 from '../assets/latest.svg';
import latest2 from '../assets/latest2.svg';
import breaksection from '../assets/breaksection.webp';
import heroBg from '../assets/hero-bg.avif';
import marketplace1 from '../assets/marketplace1.webp';
import marketplace2 from '../assets/marketplace2.webp';
import banner1 from '../assets/banner1.webp';
import banner2 from '../assets/banner2.webp';
import aboutPage from '../assets/aboutpage1.webp';
import community from '../assets/community1.webp';

export interface LatestProjectImageOption {
  key: string;
  label: string;
  src: string;
}

export const LATEST_PROJECT_IMAGES: LatestProjectImageOption[] = [
  { key: 'crimson-dust', label: 'Crimson Dust', src: latest1 },
  { key: 'noir-collection', label: 'Noir Collection', src: latest2 },
  { key: 'breaksection', label: 'Break Section', src: breaksection },
  { key: 'hero', label: 'Hero Portrait', src: heroBg },
  { key: 'marketplace-1', label: 'Marketplace 1', src: marketplace1 },
  { key: 'marketplace-2', label: 'Marketplace 2', src: marketplace2 },
  { key: 'banner-1', label: 'Banner 1', src: banner1 },
  { key: 'banner-2', label: 'Banner 2', src: banner2 },
  { key: 'about', label: 'About', src: aboutPage },
  { key: 'community', label: 'Community', src: community },
];

export const DEFAULT_LATEST_PROJECT_IMAGE_KEY =
  LATEST_PROJECT_IMAGES[0]?.key ?? 'crimson-dust';

const IMAGE_MAP = Object.fromEntries(
  LATEST_PROJECT_IMAGES.map((img) => [img.key, img.src])
) as Record<string, string>;

export function resolveLatestProjectImage(key: string | undefined | null): string {
  if (key && IMAGE_MAP[key]) return IMAGE_MAP[key];
  return IMAGE_MAP[DEFAULT_LATEST_PROJECT_IMAGE_KEY] ?? '';
}

export function isValidLatestProjectImageKey(key: string): boolean {
  return Boolean(key && IMAGE_MAP[key]);
}
