import type { ImageMetadata } from "astro";
import heroSrc from "../assets/venice/_DSF0140.JPG";
import gallerySrc from "../assets/germany/_DSF8354.JPG";
import veronaSrc from "../assets/verona/_DSF8424.JPG";

interface HomepageFeatureSource {
  readonly featured: boolean;
  readonly heroPhotoId: string;
}

interface HomepagePhotoSource {
  readonly id: string;
  readonly src: ImageMetadata;
  readonly alt: string;
}

interface HomepageGallerySource {
  readonly slug: string;
  readonly title: string;
  readonly publicationDate: Date;
  readonly location?: string;
  readonly draft: boolean;
  readonly imageCount: number;
  readonly coverSrc: ImageMetadata;
  readonly coverAlt: string;
  readonly photos: readonly HomepagePhotoSource[];
  readonly homepage?: HomepageFeatureSource;
}

interface FeaturedGalleryModel {
  readonly slug: string;
  readonly title: string;
  readonly location: string;
  readonly publicationDate: Date;
  readonly imageCount: number;
  readonly hero: HomepagePhotoSource & {
    readonly width: number;
    readonly height: number;
  };
}

interface GallerySummary {
  readonly slug: string;
  readonly title: string;
  readonly publicationDate: Date;
  readonly imageCount: number;
  readonly coverSrc: ImageMetadata;
  readonly coverAlt: string;
}

const gallerySources: readonly HomepageGallerySource[] = [
  {
    slug: "venice",
    title: "Venice",
    publicationDate: new Date("2026-08-01T00:00:00.000Z"),
    location: "Venice, Italy",
    draft: false,
    imageCount: 12,
    coverSrc: heroSrc,
    coverAlt: "Receding stone arches and hanging lanterns along an arcade in Venice.",
    homepage: {
      featured: true,
      heroPhotoId: "venice-arcade",
    },
    photos: [
      {
        id: "venice-arcade",
        src: heroSrc,
        alt: "Receding stone arches and hanging lanterns along an arcade in Venice.",
      },
    ],
  },
  {
    slug: "verona",
    title: "Verona",
    publicationDate: new Date("2026-08-01T00:00:00.000Z"),
    location: "Verona, Italy",
    draft: false,
    imageCount: 12,
    coverSrc: veronaSrc,
    coverAlt: "The chapel in the mountain.",
    homepage: {
      featured: false,
      heroPhotoId: "moutain-chapel",
    },
    photos: [
      {
        id: "mountain-chapel",
        src: veronaSrc,
        alt: "the chapel in the mountain.",
      },
    ],
  },
  {
    slug: "italy",
    title: "Italy",
    publicationDate: new Date("2026-08-01T00:00:00.000Z"),
    location: "Tuscany, Italy",
    draft: false,
    imageCount: 12,
    coverSrc: gallerySrc,
    coverAlt: "The goodest boy in Italy.",
    homepage: {
      featured: false,
      heroPhotoId: "germany-dog",
    },
    photos: [
      {
        id: "germany-dog",
        src: gallerySrc,
        alt: "The goodest boy in Germany.",
      },
    ],
  },
] as const;

export function selectHomepageContent(entries: readonly HomepageGallerySource[]): {
  readonly featuredGalleryModel: FeaturedGalleryModel;
  readonly gallerySummaries: readonly GallerySummary[];
  readonly heroSocialImage: ImageMetadata;
} {
  const published = entries.filter((entry) => !entry.draft);
  const featured = published.filter((entry) => entry.homepage?.featured === true);

  if (featured.length !== 1) {
    throw new TypeError(
      `Homepage requires exactly one published featured gallery; found ${featured.length}.`,
    );
  }

  const selected = featured[0] ?? {} as HomepageGallerySource;

  if (!selected.location?.trim()) {
    throw new TypeError("The featured homepage gallery requires a location.");
  }

  const heroPhoto = selected.photos.find(
    (photo) => photo.id === selected.homepage?.heroPhotoId,
  );
  if (!heroPhoto) {
    throw new TypeError("The featured gallery heroPhotoId must resolve within its photos.");
  }

  if (!Number.isInteger(selected.imageCount) || selected.imageCount < selected.photos.length) {
    throw new TypeError("Gallery imageCount must include every authored photo and be positive.");
  }

  const featuredGalleryModel: FeaturedGalleryModel = {
    slug: selected.slug,
    title: selected.title,
    location: selected.location,
    publicationDate: selected.publicationDate,
    imageCount: selected.imageCount,
    hero: {
      ...heroPhoto,
      width: heroPhoto.src.width,
      height: heroPhoto.src.height,
    },
  };

  const gallerySummaries = published
    .toSorted(
      (left, right) =>
        right.publicationDate.valueOf() - left.publicationDate.valueOf() ||
        left.slug.localeCompare(right.slug),
    )
    .map((entry) => {
      if (!entry.coverSrc || typeof entry.coverAlt !== "string" || !entry.coverAlt.trim()) {
        throw new TypeError(
          `Gallery '${entry.slug}' requires a valid coverSrc asset and non-blank coverAlt.`,
        );
      }

      return {
        slug: entry.slug,
        title: entry.title,
        publicationDate: entry.publicationDate,
        imageCount: entry.imageCount,
        coverSrc: entry.coverSrc,
        coverAlt: entry.coverAlt.trim(),
      };
    });

  return {
    featuredGalleryModel,
    gallerySummaries,
    heroSocialImage: heroPhoto.src,
  };
}

export const { featuredGalleryModel, gallerySummaries, heroSocialImage } =
  selectHomepageContent(gallerySources);
