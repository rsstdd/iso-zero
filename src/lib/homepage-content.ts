import type { ImageMetadata } from "astro";
import hero from "../assets/venice/_DSF0140.JPG";

interface HomepageFeatureSource {
  readonly featured: true;
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
}

const gallerySources: readonly HomepageGallerySource[] = [
  {
    slug: "venice",
    title: "Venice",
    publicationDate: new Date("2026-08-01T00:00:00.000Z"),
    location: "Venice, Italy",
    draft: false,
    imageCount: 12,
    homepage: {
      featured: true,
      heroPhotoId: "venice-arcade",
    },
    photos: [
      {
        id: "venice-arcade",
        src: hero,
        alt: "Receding stone arches and hanging lanterns along an arcade in Venice.",
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

  const selected = featured[0];
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
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      publicationDate: entry.publicationDate,
      imageCount: entry.imageCount,
    }));

  return {
    featuredGalleryModel,
    gallerySummaries,
    heroSocialImage: heroPhoto.src,
  };
}

export const { featuredGalleryModel, gallerySummaries, heroSocialImage } =
  selectHomepageContent(gallerySources);
