import { expect, type Locator, type Page } from "@playwright/test";

export const FEATURED_GALLERY_CONTRACT = {
	slug: "venice",
	title: "Venice",
	location: "Venice, Italy",
	publication: "August 2026",
	publicationDateTime: "2026-08",
	imageCount: "12 images",
	heroId: "venice-arcade",
	sourceFilename: "_DSF0140.JPG",
	width: 2048,
	height: 1155,
	alt: "Receding stone arches and hanging lanterns along an arcade in Venice.",
	action: "Enter gallery",
	accessibleName: "Enter gallery Venice",
	accessibleDescription:
		"Receding stone arches and hanging lanterns along an arcade in Venice. Venice, Italy August 2026 12 images",
	href: "/galleries/venice/",
	candidateWidths: [640, 960, 1280, 1600, 2048],
} as const;

export const REFLOW_VIEWPORTS = [
	{ name: "320 portrait", width: 320, height: 900 },
	{ name: "390 portrait", width: 390, height: 844 },
	{ name: "768 tablet", width: 768, height: 1024 },
	{ name: "1024 desktop", width: 1024, height: 768 },
	{ name: "1440 desktop", width: 1440, height: 900 },
	{ name: "short landscape", width: 1024, height: 500 },
] as const;

export async function gotoFeaturedGallery(
	page: Page,
	path = "/",
): Promise<void> {
	const response = await page.goto(path, { waitUntil: "networkidle" });
	expect(
		response,
		`Expected ${path} to produce a document response`,
	).not.toBeNull();
	expect(response?.ok(), `Expected ${path} to resolve successfully`).toBe(true);
}

export function featuredGallery(page: Page): Locator {
	return page.locator("a.featured-gallery");
}

export function featuredFigure(page: Page): Locator {
	return featuredGallery(page).locator(":scope > figure");
}

export function featuredPicture(page: Page): Locator {
	return featuredFigure(page).locator("picture");
}

export function featuredImage(page: Page): Locator {
	return featuredPicture(page).locator("img");
}

export function featuredPlate(page: Page): Locator {
	return featuredFigure(page).locator(
		":scope > figcaption.data-plate.featured-gallery__plate",
	);
}

export function featuredTitle(page: Page): Locator {
	return featuredPlate(page).locator("#featured-title");
}

export function featuredMeta(page: Page): Locator {
	return featuredPlate(page).locator("#featured-meta");
}

export function featuredAction(page: Page): Locator {
	return featuredPlate(page).locator("#featured-action");
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
	const dimensions = await page.evaluate(() => ({
		clientWidth: document.documentElement.clientWidth,
		scrollWidth: document.documentElement.scrollWidth,
	}));

	expect(dimensions.scrollWidth).toBeLessThanOrEqual(
		dimensions.clientWidth + 1,
	);
}

export async function expectVisibleTextNotTruncated(
	root: Locator,
): Promise<void> {
	const failures = await root.evaluate((element) => {
		const candidates = [element, ...element.querySelectorAll<HTMLElement>("*")];

		return candidates.flatMap((candidate) => {
			const text = candidate.textContent?.trim();
			const style = getComputedStyle(candidate);
			const rect = candidate.getBoundingClientRect();
			const isVisuallyHidden =
				style.position === "absolute" && rect.width <= 1 && rect.height <= 1;
			const isVisible =
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				!isVisuallyHidden;

			if (!text || !isVisible) return [];

			const clips =
				["hidden", "clip"].includes(style.overflow) ||
				["hidden", "clip"].includes(style.overflowX) ||
				["hidden", "clip"].includes(style.overflowY);
			const truncated =
				style.textOverflow === "ellipsis" ||
				style.whiteSpace === "nowrap" ||
				style.getPropertyValue("-webkit-line-clamp") !== "none" ||
				rect.height === 0 ||
				(clips && candidate.scrollWidth > candidate.clientWidth + 1);

			return truncated
				? [
						{
							tag: candidate.tagName,
							text: text.slice(0, 80),
							style: style.cssText,
						},
					]
				: [];
		});
	});

	expect(failures).toEqual([]);
}

export async function cssTokenAsColor(
	page: Page,
	token: string,
): Promise<string> {
	return page.evaluate((name) => {
		const probe = document.createElement("span");
		probe.style.color = `var(${name})`;
		document.body.append(probe);
		const value = getComputedStyle(probe).color;
		probe.remove();
		return value;
	}, token);
}

export function contrastRatio(foreground: string, background: string): number {
	const foregroundLuminance = relativeLuminance(foreground);
	const backgroundLuminance = relativeLuminance(background);
	const lighter = Math.max(foregroundLuminance, backgroundLuminance);
	const darker = Math.min(foregroundLuminance, backgroundLuminance);
	return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(value: string): number {
	const channels = value
		.match(/[\d.]+/g)
		?.slice(0, 3)
		.map(Number);
	if (!channels || channels.length !== 3) {
		throw new Error(`Unsupported computed colour: ${value}`);
	}

	const [red, green, blue] = channels.map((channel) => {
		const normalized = channel / 255;
		return normalized <= 0.04045
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export interface ResponsiveCandidate {
	readonly absoluteUrl: string;
	readonly format: "avif" | "webp" | "jpeg";
	readonly width: number;
}

export async function responsiveCandidates(
	page: Page,
): Promise<ResponsiveCandidate[]> {
	return featuredPicture(page).evaluate((picture) => {
		const records: ResponsiveCandidate[] = [];
		const parse = (srcset: string, format: ResponsiveCandidate["format"]) => {
			for (const candidate of srcset.split(",")) {
				const match = candidate.trim().match(/^(\S+)\s+(\d+)w$/);
				if (!match) continue;
				records.push({
					absoluteUrl: new URL(match[1], document.baseURI).href,
					format,
					width: Number.parseInt(match[2], 10),
				});
			}
		};

		for (const source of picture.querySelectorAll<HTMLSourceElement>(
			"source",
		)) {
			const type = source.type;
			if (type === "image/avif") parse(source.srcset, "avif");
			if (type === "image/webp") parse(source.srcset, "webp");
		}

		const image = picture.querySelector<HTMLImageElement>("img");
		if (image?.srcset) parse(image.srcset, "jpeg");
		return records;
	});
}

export async function expectBrowserSelectedLayoutCandidate(
	page: Page,
): Promise<void> {
	const image = featuredImage(page);
	await expect(image).toBeVisible();

	const [candidates, selection] = await Promise.all([
		responsiveCandidates(page),
		image.evaluate((element) => ({
			currentSrc: (element as HTMLImageElement).currentSrc,
			cssWidth: element.getBoundingClientRect().width,
			devicePixelRatio: window.devicePixelRatio,
		})),
	]);

	const selected = candidates.find(
		(candidate) => candidate.absoluteUrl === selection.currentSrc,
	);
	expect(
		selected,
		`No srcset candidate matched ${selection.currentSrc}`,
	).toBeDefined();

	const availableWidths = [
		...new Set(
			candidates
				.filter((candidate) => candidate.format === selected?.format)
				.map((candidate) => candidate.width),
		),
	].sort((left, right) => left - right);
	const requiredWidth = selection.cssWidth * selection.devicePixelRatio;
	const expectedWidth =
		availableWidths.find((width) => width + 1 >= requiredWidth) ??
		availableWidths.at(-1);

	expect(selected?.width).toBe(expectedWidth);
}

export async function effectiveBackground(locator: Locator): Promise<string> {
	return locator.evaluate((element) => {
		let candidate: Element | null = element;
		while (candidate) {
			const color = getComputedStyle(candidate).backgroundColor;
			if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;
			candidate = candidate.parentElement;
		}
		return getComputedStyle(document.documentElement).backgroundColor;
	});
}
