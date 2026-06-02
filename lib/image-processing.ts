/**
 * Image Processing Service
 *
 * Resizes and re-encodes uploaded images so the public site downloads small,
 * web-optimized files instead of full-resolution originals. Photos uploaded
 * straight from a phone/camera can be several megabytes and thousands of pixels
 * wide; this caps the dimensions and converts to WebP, which typically reduces
 * file size by 70-90% with no visible quality loss.
 *
 * Each image is emitted as a SET of responsive variants at fixed widths
 * (see VARIANT_WIDTHS) so the frontend can serve a small file to a small slot
 * via <img srcset>. The variants share a base name and differ only by a
 * `-<width>w.webp` suffix, which lets the frontend reconstruct every variant URL
 * from the canonical URL alone (it has no media object at most render sites).
 */

import sharp from 'sharp';

// Longest edge (px) any stored image is allowed to have. Larger images are
// scaled down proportionally; smaller images are left at their original size.
const MAX_DIMENSION = parseInt(process.env.IMAGE_MAX_DIMENSION || '2000', 10);

// WebP quality (1-100). 80 is a good balance of size vs. visual fidelity.
const WEBP_QUALITY = parseInt(process.env.IMAGE_WEBP_QUALITY || '80', 10);

/**
 * Responsive width ladder (px). The backend generates a variant at each of these
 * widths that is smaller than the source, plus one at the source's capped width.
 * MUST be kept in sync with the frontend's copy in OptimizedImage so the two
 * agree on which `-<width>w.webp` files exist.
 */
export const VARIANT_WIDTHS = [400, 800, 1600];

export interface ImageVariant {
  width: number;
  buffer: Buffer;
  size: number;
}

export interface ProcessedImageSet {
  /** Ascending by width; the last entry is the canonical (largest) variant. */
  variants: ImageVariant[];
  canonical: ImageVariant;
  contentType: 'image/webp';
  extension: 'webp';
}

/**
 * Resize an image into a set of responsive WebP variants.
 *
 * Returns `null` for inputs that should be stored as-is — currently animated
 * GIFs (converting them would either flatten the animation or balloon the size)
 * and anything sharp cannot decode. Callers should fall back to the original
 * file when `null` is returned.
 */
export async function processImageSet(
  input: Buffer,
  mimeType: string
): Promise<ProcessedImageSet | null> {
  // Preserve GIFs untouched to keep animation intact.
  if (mimeType === 'image/gif') {
    return null;
  }

  try {
    // Honour EXIF orientation up front so width/height reflect what we'll store.
    const metadata = await sharp(input, { failOn: 'none' }).rotate().metadata();
    const sourceWidth = metadata.width ?? MAX_DIMENSION;

    // Largest width we will produce: never exceed the source or MAX_DIMENSION.
    const maxWidth = Math.min(sourceWidth, MAX_DIMENSION);

    // Ladder widths smaller than the cap, plus the cap itself. De-duped + sorted
    // so e.g. a 1600px source yields [400, 800, 1600] and a 500px source [400, 500].
    const targetWidths = Array.from(
      new Set([...VARIANT_WIDTHS.filter((w) => w < maxWidth), maxWidth])
    ).sort((a, b) => a - b);

    const variants: ImageVariant[] = [];
    for (const width of targetWidths) {
      const buffer = await sharp(input, { failOn: 'none' })
        .rotate()
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      variants.push({ width, buffer, size: buffer.length });
    }

    return {
      variants,
      canonical: variants[variants.length - 1],
      contentType: 'image/webp',
      extension: 'webp',
    };
  } catch (error) {
    // Corrupt or unsupported file — let the caller store the original.
    console.error('[Image Processing] Failed to process image:', error);
    return null;
  }
}
