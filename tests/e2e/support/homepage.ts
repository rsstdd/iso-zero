import { readdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

export const HOME = {
	title: "ISO Null — Photography by Ross Todd",
	identity: "ISO Null",
	byline: "Photography by Ross Todd",
	featured: {
		title: "Venice",
		location: "Venice, Italy",
		publication: "August 2026",
		publicationDateTime: "2026-08",
		count: "12 images",
		alt: "Receding stone arches and hanging lanterns along an arcade in Venice.",
		action: "Enter gallery",
		href: "/galleries/venice/",
		width: 2048,
		height: 1155,
	},
	directory: {
		heading: "Available galleries",
		title: "Venice",
		year: "2026",
		count: "12 images",
		href: "/galleries/venice/",
	},
	headerLinks: [
		{ label: "ISO Null", href: "/" },
		{ label: "Galleries", href: "/galleries/" },
	],
	footerLinks: [
		{ label: "About", href: "/about/" },
		{ label: "Engineering case study", href: "/case-study/" },
		{ label: "Impressum", href: "/impressum/" },
		{ label: "Datenschutz", href: "/datenschutz/" },
		{ label: "AGB", href: "/agb/" },
	],
} as const;

export const HOME_VIEWPORTS = [
	{ name: "320 portrait", width: 320, height: 900 },
	{ name: "390 portrait", width: 390, height: 844 },
	{ name: "768 tablet", width: 768, height: 1024 },
	{ name: "1024 desktop", width: 1024, height: 768 },
	{ name: "1440 desktop", width: 1440, height: 900 },
	{ name: "short landscape", width: 1024, height: 500 },
] as const;

export async function gotoHomepage(page: Page): Promise<void> {
	const response = await page.goto("/", { waitUntil: "networkidle" });
	expect(response, "Expected / to produce a document response").not.toBeNull();
	expect(response?.ok(), "Expected / to resolve successfully").toBe(true);
}

export const skipLink = (page: Page): Locator => page.locator("a.skip-link");
export const siteHeader = (page: Page): Locator =>
	page.locator("header.site-header");
export const main = (page: Page): Locator => page.locator("main#main");
export const identity = (page: Page): Locator =>
	main(page).locator(":scope > section.homepage-identity");
export const featured = (page: Page): Locator =>
	main(page).locator(":scope > a.featured-gallery");
export const featuredImage = (page: Page): Locator =>
	featured(page).locator("picture img");
export const directory = (page: Page): Locator =>
	main(page).locator(
		":scope > section.rule-datum:has(#gallery-directory-title)",
	);
export const directoryRows = (page: Page): Locator =>
	directory(page).locator("ul.gallery-directory > li");
export const siteFooter = (page: Page): Locator =>
	page.locator("footer.site-footer");

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
	const measurements = await page.evaluate(() => ({
		clientWidth: document.documentElement.clientWidth,
		scrollWidth: document.documentElement.scrollWidth,
	}));

	expect(measurements.scrollWidth).toBeLessThanOrEqual(
		measurements.clientWidth + 1,
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
			const visuallyHidden =
				style.position === "absolute" && rect.width <= 1 && rect.height <= 1;
			const visible =
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				!visuallyHidden;

			if (!text || !visible) return [];

			const clips = [style.overflow, style.overflowX, style.overflowY].some(
				(value) => value === "hidden" || value === "clip",
			);
			const truncated =
				style.textOverflow === "ellipsis" ||
				style.whiteSpace === "nowrap" ||
				style.getPropertyValue("-webkit-line-clamp") !== "none" ||
				rect.height === 0 ||
				(clips && candidate.scrollWidth > candidate.clientWidth + 1);

			return truncated
				? [{ tag: candidate.tagName, text: text.slice(0, 80) }]
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

export async function expectSharedInlineOrigin(page: Page): Promise<void> {
	const boxes = await Promise.all(
		[
			siteHeader(page),
			identity(page),
			featured(page),
			directory(page),
			siteFooter(page).locator(":scope > .site-footer__inner"),
		].map((locator) => locator.boundingBox()),
	);

	for (const box of boxes) expect(box).not.toBeNull();
	const origin = boxes[0]?.x ?? 0;
	for (const box of boxes) {
		expect(Math.abs((box?.x ?? 0) - origin)).toBeLessThanOrEqual(1);
	}
}

export async function persistentAccentMarks(page: Page): Promise<
	readonly {
		readonly element: string;
		readonly pseudo: "::before" | "::after";
	}[]
> {
	return page.evaluate(() => {
		const probe = document.createElement("span");
		probe.style.color = "var(--accent)";
		document.body.append(probe);
		const accent = getComputedStyle(probe).color;
		probe.remove();

		const marks: { element: string; pseudo: "::before" | "::after" }[] = [];
		for (const element of document.querySelectorAll<HTMLElement>("body *")) {
			for (const pseudo of ["::before", "::after"] as const) {
				const style = getComputedStyle(element, pseudo);
				const width = Number.parseFloat(style.width);
				const height = Number.parseFloat(style.height);
				const visible =
					style.content !== "none" &&
					style.display !== "none" &&
					width > 0 &&
					height > 0;
				if (visible && style.backgroundColor === accent) {
					marks.push({
						element: element.id
							? `#${element.id}`
							: `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
						pseudo,
					});
				}
			}
		}
		return marks;
	});
}

export async function discoverBuiltRoutes(
	distRoot = resolve(process.cwd(), "dist"),
): Promise<string[]> {
	const htmlFiles = await walkHtmlFiles(distRoot);
	if (htmlFiles.length === 0) {
		throw new Error(`No built HTML found under ${distRoot}.`);
	}

	return htmlFiles
		.map((filePath) => htmlFileToRoute(distRoot, filePath))
		.sort((left, right) => left.localeCompare(right));
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

async function walkHtmlFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = resolve(directory, entry.name);
			if (entry.isDirectory()) return walkHtmlFiles(entryPath);
			if (entry.isFile() && entry.name.endsWith(".html")) return [entryPath];
			return [];
		}),
	);
	return nested.flat();
}

function htmlFileToRoute(distRoot: string, filePath: string): string {
	const portable = relative(distRoot, filePath).split(sep).join("/");
	if (portable === "index.html") return "/";
	if (portable.endsWith("/index.html")) {
		return `/${portable.slice(0, -"index.html".length)}`;
	}
	return `/${portable.slice(0, -".html".length)}`;
}
