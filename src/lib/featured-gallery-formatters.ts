const publicationFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

export function formatFeaturedGalleryPublicationDate(value: Date): string {
	if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
		throw new TypeError(
			"Featured gallery publicationDate must be a valid Date.",
		);
	}

	return publicationFormatter.format(value);
}

export function formatFeaturedGalleryImageCount(value: number): string {
	if (!Number.isInteger(value) || value < 1) {
		throw new RangeError(
			"Featured gallery imageCount must be a positive integer.",
		);
	}

	return `${value} ${value === 1 ? "image" : "images"}`;
}
