import type { ImageMetadata } from "astro";
import { getPublishedGalleryEntries, toGallerySummary } from "./gallery-catalog";
import type { GallerySummary } from "./gallery-catalog";

/**
 * Homepage content, read from the content collection.
 *
 * This replaces a hardcoded array of gallery objects with directly-imported
 * image assets, which bypassed `src/content.config.ts` entirely and
 * contradicted `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`'s "a gallery is a
 * Markdown file under `src/content/galleries/`." Both the homepage and
 * `/galleries/` now read the same collection, so there is one source of
 * truth for gallery data rather than two that can drift apart.
 *
 * "Featured" is a homepage-only concern. It is deliberately not a field on
 * the shared gallery schema in `src/content.config.ts` — the content
 * contract in `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` has no concept of
 * a featured gallery, and adding one there would entangle a general content
 * schema with a single route's presentation choice. The featured slug is
 * named here instead, next to the component that consumes it.
 */
const FEATURED_SLUG = "venice";

interface FeaturedGalleryModel {
  readonly slug: string;
  readonly title: string;
  readonly location: string;
  readonly publicationDate: Date;
  readonly imageCount: number;
  readonly hero: {
    readonly id: string;
    readonly src: ImageMetadata;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
  };
}

const publishedEntries = await getPublishedGalleryEntries();

if (publishedEntries.length === 0) {
  throw new TypeError(
    "Homepage requires at least one published gallery; none were found.",
  );
}

const featuredEntry = publishedEntries.find(
  (entry) => entry.id === FEATURED_SLUG,
);
if (!featuredEntry) {
  throw new TypeError(
    `Homepage featured gallery "${FEATURED_SLUG}" was not found among published galleries.`,
  );
}

if (!featuredEntry.data.location?.trim()) {
  throw new TypeError("The featured homepage gallery requires a location.");
}

const heroPhoto = featuredEntry.data.photos[0];
if (!heroPhoto) {
  throw new TypeError(`Featured gallery "${FEATURED_SLUG}" has no photos.`);
}

export const featuredGalleryModel: FeaturedGalleryModel = {
  slug: featuredEntry.id,
  title: featuredEntry.data.title,
  location: featuredEntry.data.location,
  publicationDate: featuredEntry.data.date,
  imageCount: featuredEntry.data.photos.length,
  hero: {
    id: `${featuredEntry.id}-01`,
    src: heroPhoto.src,
    alt: heroPhoto.alt,
    width: heroPhoto.src.width,
    height: heroPhoto.src.height,
  },
};

export const gallerySummaries: readonly GallerySummary[] =
  publishedEntries.map(toGallerySummary);

export const heroSocialImage: ImageMetadata = heroPhoto.src;
