import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";

/**
 * The one query every gallery-listing route reads through: every non-draft
 * gallery, newest first. Per `02_ARCHITECTURE.md`'s route inventory, this is
 * exactly what `/galleries/` needs, and the homepage's directory excerpt and
 * featured selection are both narrowings of the same set, not a separate
 * query — a second query here would be a second place this can drift.
 */
export interface GallerySummary {
  readonly slug: string;
  readonly title: string;
  readonly publicationDate: Date;
  readonly location?: string;
  readonly imageCount: number;
  readonly coverSrc: ImageMetadata;
  readonly coverAlt: string;
}

export function sortNewestFirst(
  entries: readonly CollectionEntry<"galleries">[],
): CollectionEntry<"galleries">[] {
  return entries.toSorted(
    (left, right) =>
      right.data.date.valueOf() - left.data.date.valueOf() ||
      left.id.localeCompare(right.id),
  );
}

export async function getPublishedGalleryEntries(): Promise<
  CollectionEntry<"galleries">[]
> {
  const entries = await getCollection("galleries", ({ data }) => !data.draft);
  return sortNewestFirst(entries);
}

export function toGallerySummary(
  entry: CollectionEntry<"galleries">,
): GallerySummary {
  return {
    slug: entry.id,
    title: entry.data.title,
    publicationDate: entry.data.date,
    location: entry.data.location,
    imageCount: entry.data.photos.length,
    coverSrc: entry.data.cover,
    coverAlt: entry.data.coverAlt,
  };
}

/**
 * Deliberately not eagerly computed at module scope. A module-load-time
 * query is a hidden side effect: every importer pays for it whether or not
 * they need it, and — as originals.ts's adapter-selection comment notes for
 * a related reason — a value resolved once, implicitly, at import time is a
 * source of tests that pass for the wrong reason. Callers await this
 * directly in their own Astro frontmatter, where Astro supports top-level
 * await natively.
 */
export async function getPublishedGalleries(): Promise<
  readonly GallerySummary[]
> {
  const entries = await getPublishedGalleryEntries();
  return entries.map(toGallerySummary);
}
