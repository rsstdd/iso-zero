import type { ImageMetadata } from "astro";
import heroSource from "../../../../src/assets/venice/_DSF0140.JPG";

export const FEATURED_ALT =
	"Receding stone arches and hanging lanterns along an arcade in Venice.";

interface FixtureOverrides {
	readonly slug?: string;
	readonly title?: string;
	readonly location?: string;
	readonly publicationDate?: Date;
	readonly imageCount?: number;
	readonly hero?: {
		readonly id: string;
		readonly src: ImageMetadata;
		readonly alt: string;
		readonly width: number;
		readonly height: number;
	};
}

export function makeFeaturedGallery(overrides: FixtureOverrides = {}) {
	return {
		slug: overrides.slug ?? "venice",
		title: overrides.title ?? "Venice",
		location: overrides.location ?? "Venice, Italy",
		publicationDate:
			overrides.publicationDate ?? new Date("2026-08-01T00:00:00.000Z"),
		imageCount: overrides.imageCount ?? 12,
		hero: overrides.hero ?? {
			id: "venice-arcade",
			src: heroSource,
			alt: FEATURED_ALT,
			width: 2048,
			height: 1155,
		},
	};
}
