import marketplaceImg from '../assets/marketplace1.webp';
import aboutImg from '../assets/aboutpage1.webp';
import communityImg from '../assets/community1.webp';

/**
 * Preload high-priority hero images in background memory
 * so navigation reveals images instantaneously with zero decode hitch.
 */
export function preloadHeroImages() {
  const images = [marketplaceImg, aboutImg, communityImg];
  images.forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}
