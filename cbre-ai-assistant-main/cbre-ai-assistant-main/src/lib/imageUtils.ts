/**
 * Utility functions for generating compatible property images
 * 
 * These functions help generate reliable image URLs that work in the application.
 * Unsplash direct image URLs may not work due to CORS or authentication issues.
 */

export type PropertyType = 'Office' | 'Industrial' | 'Retail' | 'Residential' | 'Mixed-Use';

/**
 * Generates a compatible Unsplash Source API URL
 * This is more reliable than direct Unsplash image URLs
 * 
 * @param width - Image width in pixels (default: 800)
 * @param height - Image height in pixels (default: 600)
 * @param keyword - Search keyword for the image (e.g., "office", "warehouse", "retail")
 * @returns Unsplash Source API URL
 */
export function getUnsplashSourceUrl(
  width: number = 800,
  height: number = 600,
  keyword?: string
): string {
  if (keyword) {
    return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
  }
  return `https://source.unsplash.com/${width}x${height}/?building`;
}

/**
 * Generates a property-appropriate image URL based on property type
 * 
 * @param propertyType - The type of property (Office, Industrial, Retail, etc.)
 * @param width - Image width (default: 800)
 * @param height - Image height (default: 600)
 * @returns Compatible image URL
 */
export function getPropertyImageUrl(
  propertyType: PropertyType | string,
  width: number = 800,
  height: number = 600
): string {
  const keywords: Record<string, string> = {
    'Office': 'modern office building',
    'Industrial': 'warehouse industrial',
    'Retail': 'retail shopping center',
    'Residential': 'apartment building',
    'Mixed-Use': 'mixed use building',
  };

  const keyword = keywords[propertyType] || 'commercial building';
  return getUnsplashSourceUrl(width, height, keyword);
}

/**
 * Alternative: Use Picsum Photos (more reliable, no CORS issues)
 * This service provides random high-quality images
 * 
 * @param width - Image width (default: 800)
 * @param height - Image height (default: 600)
 * @param seed - Optional seed for consistent images (use property ID)
 * @returns Picsum Photos URL
 */
export function getPicsumImageUrl(
  width: number = 800,
  height: number = 600,
  seed?: string | number
): string {
  if (seed) {
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }
  return `https://picsum.photos/${width}/${height}`;
}

/**
 * Alternative: Use Placeholder.com (for testing/fallback)
 * 
 * @param width - Image width (default: 800)
 * @param height - Image height (default: 600)
 * @param text - Optional text to display on placeholder
 * @returns Placeholder.com URL
 */
export function getPlaceholderImageUrl(
  width: number = 800,
  height: number = 600,
  text?: string
): string {
  if (text) {
    return `https://placehold.co/${width}x${height}?text=${encodeURIComponent(text)}`;
  }
  return `https://placehold.co/${width}x${height}`;
}

/**
 * Validates if an image URL is likely to work
 * Checks for common patterns that indicate compatibility
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for common image URL patterns
  const validPatterns = [
    /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)/i,
    /^https?:\/\/.*unsplash\.com/i,
    /^https?:\/\/.*picsum\.photos/i,
    /^https?:\/\/.*placehold\.co/i,
    /^https?:\/\/.*source\.unsplash\.com/i,
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
}

/**
 * Gets a fallback image URL if the primary image fails
 */
export function getFallbackImageUrl(propertyType?: PropertyType | string): string {
  return getPropertyImageUrl(propertyType || 'Office', 800, 600);
}

/**
 * Image size presets for different contexts
 */
export const ImageSizes = {
  card: { width: 400, height: 300 },      // For PropertyCard in sidebar
  detail: { width: 800, height: 500 },    // For detail dialog
  fullscreen: { width: 1200, height: 675 }, // For fullscreen mode
  thumbnail: { width: 200, height: 150 }, // For thumbnails
} as const;

/**
 * Optimizes an image URL by adding or updating size parameters
 * Works with Unsplash, Picsum, and other common image services
 * 
 * @param url - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized image URL with size parameters
 */
export function optimizeImageUrl(
  url: string,
  width: number,
  height: number
): string {
  if (!url) return url;

  // If it's already a source.unsplash.com URL, update the size
  if (url.includes('source.unsplash.com')) {
    const match = url.match(/source\.unsplash\.com\/(\d+)x(\d+)/);
    if (match) {
      return url.replace(/source\.unsplash\.com\/\d+x\d+/, `source.unsplash.com/${width}x${height}`);
    }
    // If no size in URL, add it before the query
    const queryIndex = url.indexOf('?');
    if (queryIndex > 0) {
      return url.replace('source.unsplash.com/', `source.unsplash.com/${width}x${height}/`);
    }
    return url.replace('source.unsplash.com/', `source.unsplash.com/${width}x${height}/`);
  }

  // If it's a picsum.photos URL, update the size
  if (url.includes('picsum.photos')) {
    const seedMatch = url.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/);
    if (seedMatch) {
      return url.replace(/picsum\.photos\/seed\/[^/]+\/\d+\/\d+/, `picsum.photos/seed/${seedMatch[1]}/${width}/${height}`);
    }
    const sizeMatch = url.match(/picsum\.photos\/(\d+)\/(\d+)/);
    if (sizeMatch) {
      return url.replace(/picsum\.photos\/\d+\/\d+/, `picsum.photos/${width}/${height}`);
    }
  }

  // If it's an images.unsplash.com URL, add size parameters
  if (url.includes('images.unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('h', height.toString());
    urlObj.searchParams.set('fit', 'crop');
    return urlObj.toString();
  }

  // For other URLs, try to add size parameters if they support it
  // Otherwise return the original URL
  return url;
}

/**
 * Gets an optimized image URL for a specific context
 * 
 * @param url - Original image URL
 * @param context - Context for the image (card, detail, fullscreen, thumbnail)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  url: string,
  context: keyof typeof ImageSizes = 'card'
): string {
  if (!url) return url;
  
  const size = ImageSizes[context];
  return optimizeImageUrl(url, size.width, size.height);
}

/**
 * Gets an optimized image URL with custom dimensions
 * 
 * @param url - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized image URL
 */
export function getImageUrlWithSize(
  url: string,
  width: number,
  height: number
): string {
  if (!url) return url;
  return optimizeImageUrl(url, width, height);
}

