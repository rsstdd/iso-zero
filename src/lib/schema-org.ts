import type { ImageMetadata } from "astro";
import { AUTHOR_NAME, COPYRIGHT_YEAR, SITE_ORIGIN } from "./site-identity";

/**
 * `schema.org/ImageObject` JSON-LD, one per photograph.
 *
 * Required by `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Image protection"
 * under "Ownership in markup": "`schema.org/ImageObject` with `creator`,
 * `copyrightNotice`, and `license` on every gallery page." This is a
 * provenance control, not an access control — it lets ownership be asserted
 * and found, and does nothing to prevent copying, which is consistent with
 * that same document's stance that this project does not treat its
 * audience as suspects.
 *
 * `license` points at `/impressum/` for now. No dedicated licence or terms
 * page exists in the route inventory (`06_COMMERCE_AND_LEGAL.md` covers
 * commerce terms, not image-copyright terms), and `schema.org/license`
 * expects a URL to licensing terms rather than a bare copyright statement.
 * The Impressum is the closest real, existing page rather than a fabricated
 * link — flagged here as a placeholder pending Ross's call on whether a
 * dedicated page is worth adding.
 */

export interface ImageObjectInput {
  readonly contentUrl: string;
  readonly image: Pick<ImageMetadata, "width" | "height">;
  readonly description: string;
  readonly caption?: string;
}

export interface ImageObjectJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "ImageObject";
  readonly contentUrl: string;
  readonly width: number;
  readonly height: number;
  readonly description: string;
  readonly caption?: string;
  readonly creator: {
    readonly "@type": "Person";
    readonly name: string;
  };
  readonly copyrightNotice: string;
  readonly license: string;
  readonly acquireLicensePage: string;
}

export function buildImageObject(input: ImageObjectInput): ImageObjectJsonLd {
  if (!input.contentUrl || input.contentUrl.trim().length === 0) {
    throw new TypeError("ImageObject requires a non-blank contentUrl.");
  }
  if (!Number.isInteger(input.image.width) || input.image.width <= 0) {
    throw new RangeError("ImageObject requires a positive integer width.");
  }
  if (!Number.isInteger(input.image.height) || input.image.height <= 0) {
    throw new RangeError("ImageObject requires a positive integer height.");
  }
  if (!input.description || input.description.trim().length === 0) {
    throw new TypeError("ImageObject requires non-blank description (alt text).");
  }

  const licenseUrl = new URL("/impressum/", SITE_ORIGIN).toString();

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: input.contentUrl,
    width: input.image.width,
    height: input.image.height,
    description: input.description,
    ...(input.caption ? { caption: input.caption } : {}),
    creator: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    copyrightNotice: `© ${COPYRIGHT_YEAR} ${AUTHOR_NAME}`,
    license: licenseUrl,
    acquireLicensePage: licenseUrl,
  };
}
