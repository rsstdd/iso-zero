import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourcePath = resolve(process.argv[2] ?? "src/pages/index.astro");
const source = await readFile(sourcePath, "utf8");
const template = extractTemplate(source);

const componentFiles = [
	"Base.astro",
	"HomepageIdentity.astro",
	"FeaturedGallery.astro",
	"GalleryDirectory.astro",
];

for (const file of componentFiles) {
	requireMatch(
		source,
		new RegExp(`from\\s+["'][^"']*${escapeRegExp(file)}["']`),
		`Homepage must import ${file}.`,
	);
}

const components = [
	"Base",
	"HomepageIdentity",
	"FeaturedGallery",
	"GalleryDirectory",
];
for (const component of components) {
	const occurrences =
		template.match(new RegExp(`<${component}(?:\\s|>|/)`, "g")) ?? [];
	if (occurrences.length !== 1) {
		throw new Error(
			`Homepage must render ${component} exactly once; found ${occurrences.length}.`,
		);
	}
}

const orderedComponents = [
	"<HomepageIdentity",
	"<FeaturedGallery",
	"<GalleryDirectory",
];
let previousIndex = -1;
for (const component of orderedComponents) {
	const index = template.indexOf(component);
	if (index <= previousIndex) {
		throw new Error(
			"Homepage component order must be HomepageIdentity, FeaturedGallery, GalleryDirectory.",
		);
	}
	previousIndex = index;
}

const forbiddenNativeMarkup = [
	"html",
	"head",
	"body",
	"header",
	"nav",
	"main",
	"footer",
	"picture",
	"img",
	"figure",
	"figcaption",
	"ul",
	"ol",
	"li",
	"h1",
	"h2",
	"h3",
];
for (const tag of forbiddenNativeMarkup) {
	if (new RegExp(`<\\/?${tag}(?:\\s|>)`, "i").test(template)) {
		throw new Error(
			`src/pages/index.astro must compose components instead of rendering <${tag}> directly.`,
		);
	}
}

const duplicatedGalleryData = [
	/venice/i,
	/August\s+2026/i,
	/12\s+images/i,
	/_DSF0140\.JPG/i,
	/Receding stone arches and hanging lanterns/i,
];
for (const pattern of duplicatedGalleryData) {
	if (pattern.test(source)) {
		throw new Error(
			`Homepage source duplicates gallery-owned launch data matching ${pattern}.`,
		);
	}
}

if (/Date\.now\s*\(|new\s+Date\s*\(\s*\)/.test(source)) {
	throw new Error(
		"Homepage build identity must not depend on wall-clock time.",
	);
}

if (/<script(?:\s|>)/i.test(template) || /client:[a-z-]+/i.test(template)) {
	throw new Error("Homepage source must not introduce client JavaScript.");
}

console.log(`Homepage source contract passed: ${sourcePath}`);

/**
 * @param {string} value
 * @returns {string}
 */
function extractTemplate(value) {
	if (!value.startsWith("---")) return value;
	const closing = value.indexOf("\n---", 3);
	if (closing === -1) throw new Error("Unterminated Astro frontmatter.");
	return value.slice(closing + 4);
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 * @param {string} message
 */
function requireMatch(value, pattern, message) {
	if (!pattern.test(value)) throw new Error(message);
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
