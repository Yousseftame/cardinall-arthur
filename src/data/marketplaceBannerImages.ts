/**
 * Static images for Marketplace banners — live in /src/assets.
 * Admin picks from these keys — never uploads to Firebase.
 */
import marketplace1 from '../assets/marketplace1.webp';
import marketplace2 from '../assets/marketplace2.webp';
import banner1 from '../assets/banner1.webp';
import banner2 from '../assets/banner2.webp';
import heroBg from '../assets/hero-bg.avif';
import aboutPage from '../assets/aboutpage1.webp';
import community from '../assets/community1.webp';
import breaksection from '../assets/breaksection.webp';

export interface MarketplaceBannerImageOption {
  key: string;
  label: string;
  src: string;
}

export const MARKETPLACE_BANNER_IMAGES: MarketplaceBannerImageOption[] = [
  { key: 'marketplace-2', label: 'Marketplace 2', src: marketplace2 },
  { key: 'banner-2', label: 'Banner 2', src: banner2 },
  { key: 'marketplace-1', label: 'Marketplace 1', src: marketplace1 },
  { key: 'banner-1', label: 'Banner 1', src: banner1 },
  { key: 'hero', label: 'Hero Portrait', src: heroBg },
  { key: 'about', label: 'About', src: aboutPage },
  { key: 'community', label: 'Community', src: community },
  { key: 'breaksection', label: 'Break Section', src: breaksection },
];

export const DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY =
  MARKETPLACE_BANNER_IMAGES[0]?.key ?? 'marketplace-2';

const IMAGE_MAP = Object.fromEntries(
  MARKETPLACE_BANNER_IMAGES.map((img) => [img.key, img.src])
) as Record<string, string>;

export function resolveMarketplaceBannerImage(
  key: string | undefined | null
): string {
  if (key && IMAGE_MAP[key]) return IMAGE_MAP[key];
  return IMAGE_MAP[DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY] ?? '';
}

export function isValidMarketplaceBannerImageKey(key: string): boolean {
  return Boolean(key && IMAGE_MAP[key]);
}

/** Split heading into display lines (one phrase per line in admin). */
export function splitBannerHeading(heading: string): string[] {
  const byNewline = heading
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (byNewline.length > 0) return byNewline;
  return [];
}
