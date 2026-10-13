/**
 * Static product images live in /src/assets.
 * Admin builds a gallery from these keys — never uploads to Firebase.
 * Add new assets here when you drop files into assets.
 */
import bag1 from '../assets/690725e34cc7bc9a71464b6e_Elegant Black Handbag.avif';
import bag2 from '../assets/6907260496f08def56838d36_Black Leather Handbag.avif';
import bag3 from '../assets/69073d30b82ece2f5b69f07d_Beige Tote Bag Display.avif';


export interface ProductImageOption {
  key: string;
  label: string;
  src: string;
}

export const PRODUCT_IMAGES: ProductImageOption[] = [
  { key: 'bag1', label: 'Elegant Black', src: bag1 },
  { key: 'bag2', label: 'Black Leather', src: bag2 },
  { key: 'bag3', label: 'Beige Tote', src: bag3 },
];

/** Soft cap for a product gallery (storefront carousels stay usable). */
export const MAX_PRODUCT_GALLERY_IMAGES = 8;

const IMAGE_MAP = Object.fromEntries(
  PRODUCT_IMAGES.map((img) => [img.key, img.src])
) as Record<string, string>;

export const DEFAULT_PRODUCT_IMAGE_KEY = PRODUCT_IMAGES[0]?.key ?? 'bag1';

export function resolveProductImage(key: string | undefined | null): string {
  if (key && IMAGE_MAP[key]) return IMAGE_MAP[key];
  return IMAGE_MAP[DEFAULT_PRODUCT_IMAGE_KEY] ?? '';
}

export function isValidProductImageKey(key: string): boolean {
  return Boolean(key && IMAGE_MAP[key]);
}

/** Resolve an ordered gallery of static asset keys to image URLs. */
export function resolveProductGallery(keys: string[] | undefined | null): string[] {
  if (!Array.isArray(keys) || keys.length === 0) {
    const fallback = resolveProductImage(DEFAULT_PRODUCT_IMAGE_KEY);
    return fallback ? [fallback] : [];
  }

  const urls = keys
    .map((key) => (isValidProductImageKey(key) ? resolveProductImage(key) : ''))
    .filter(Boolean);

  if (urls.length === 0) {
    const fallback = resolveProductImage(DEFAULT_PRODUCT_IMAGE_KEY);
    return fallback ? [fallback] : [];
  }

  return urls;
}
