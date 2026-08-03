import { describe, expect, it } from "vitest";
import {
	formatFeaturedGalleryImageCount,
	formatFeaturedGalleryPublicationDate,
} from "../../src/lib/featured-gallery-formatters";

describe("featured gallery formatters", () => {
	it("formats publication month and year in English using UTC", () => {
		const value = new Date("2026-08-01T00:00:00.000Z");

		expect(formatFeaturedGalleryPublicationDate(value)).toMatchInlineSnapshot(
			`"August 2026"`,
		);
	});

	it("does not drift into the previous month in a negative host timezone", () => {
		const value = new Date("2026-08-01T00:00:00.000Z");

		expect(formatFeaturedGalleryPublicationDate(value)).toBe("August 2026");
	});

	it("rejects an invalid publication date", () => {
		expect(() =>
			formatFeaturedGalleryPublicationDate(new Date(Number.NaN)),
		).toThrow();
	});

	it.each([
		[1, "1 image"],
		[2, "2 images"],
		[12, "12 images"],
	])("formats %i with correct count grammar", (count, expected) => {
		expect(formatFeaturedGalleryImageCount(count)).toBe(expected);
	});

	it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
		"rejects invalid image count %s",
		(count) => {
			expect(() => formatFeaturedGalleryImageCount(count)).toThrow();
		},
	);
});
