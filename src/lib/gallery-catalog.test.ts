import { describe, expect, it } from "vitest";
import { sortNewestFirst, toGallerySummary } from "./gallery-catalog";

/**
 * These two functions are the entire logic behind "every non-draft gallery,
 * newest first" — the one contract `02_ARCHITECTURE.md`'s route inventory
 * makes for `/galleries/`. A wrong comparator or a miscounted photo array is
 * exactly the kind of wrong-but-plausible answer
 * `07_TESTING_SECURITY_AND_OPERATIONS.md` says is worth a unit test: nothing
 * here throws or looks broken if it silently sorts backward or reports the
 * wrong count.
 *
 * `getPublishedGalleryEntries` itself is not tested here because it calls
 * `astro:content`'s `getCollection`, which validates every gallery file
 * against the full schema (including `exif`) on load — exercising it
 * requires a complete, valid content fixture, not a unit test of pure
 * sorting logic.
 */

function makeEntry(overrides: {
  id: string;
  date: string;
  photoCount?: number;
  location?: string;
}) {
  const photoCount = overrides.photoCount ?? 1;
  return {
    id: overrides.id,
    data: {
      title: overrides.id,
      date: new Date(overrides.date),
      location: overrides.location,
      cover: { src: `/${overrides.id}.jpg`, width: 2048, height: 1155, format: "jpg" },
      coverAlt: `Cover for ${overrides.id}`,
      photos: Array.from({ length: photoCount }, (_, index) => ({
        src: { src: `/${overrides.id}-${index}.jpg`, width: 2048, height: 1155, format: "jpg" },
        alt: `Photo ${index} for ${overrides.id}`,
      })),
      draft: false,
    },
    // biome-ignore lint: test fixtures duck-type CollectionEntry<"galleries">
  } as any;
}

describe("sortNewestFirst", () => {
  it("orders newest publication date first", () => {
    const entries = [
      makeEntry({ id: "oldest", date: "2026-01-01" }),
      makeEntry({ id: "newest", date: "2026-08-01" }),
      makeEntry({ id: "middle", date: "2026-04-01" }),
    ];

    expect(sortNewestFirst(entries).map((entry) => entry.id)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
  });

  it("breaks ties on the same date by slug, ascending", () => {
    const entries = [
      makeEntry({ id: "verona", date: "2026-08-01" }),
      makeEntry({ id: "germany", date: "2026-08-01" }),
      makeEntry({ id: "venice", date: "2026-08-01" }),
    ];

    expect(sortNewestFirst(entries).map((entry) => entry.id)).toEqual([
      "germany",
      "venice",
      "verona",
    ]);
  });

  it("does not mutate the input array", () => {
    const entries = [
      makeEntry({ id: "oldest", date: "2026-01-01" }),
      makeEntry({ id: "newest", date: "2026-08-01" }),
    ];
    const original = [...entries];

    sortNewestFirst(entries);

    expect(entries.map((entry) => entry.id)).toEqual(
      original.map((entry) => entry.id),
    );
  });
});

describe("toGallerySummary", () => {
  it("derives imageCount from the photos array rather than an authored number", () => {
    const entry = makeEntry({ id: "venice", date: "2026-08-01", photoCount: 4 });
    expect(toGallerySummary(entry).imageCount).toBe(4);
  });

  it("carries location through when present", () => {
    const entry = makeEntry({
      id: "venice",
      date: "2026-08-01",
      location: "Venice, Italy",
    });
    expect(toGallerySummary(entry).location).toBe("Venice, Italy");
  });

  it("leaves location undefined, not blank, when absent", () => {
    const entry = makeEntry({ id: "venice", date: "2026-08-01" });
    expect(toGallerySummary(entry).location).toBeUndefined();
  });

  it("uses the collection entry id as the slug", () => {
    const entry = makeEntry({ id: "germany", date: "2026-08-01" });
    expect(toGallerySummary(entry).slug).toBe("germany");
  });
});
