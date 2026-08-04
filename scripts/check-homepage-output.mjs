import { readdir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const distRoot = resolve(process.argv[2] ?? "dist");
const files = await walk(distRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
if (htmlFiles.length === 0)
	throw new Error(`No built HTML found under ${distRoot}.`);

/** @type {Map<string, string>} */
const routes = new Map(
	await Promise.all(
		htmlFiles.map(
			/** @returns {Promise<[string, string]>} */
			async (file) => [routeFor(file), await readFile(file, "utf8")],
		),
	),
);

const requiredRoutes = [
	"/",
	"/galleries/",
	"/galleries/venice/",
	"/about/",
	"/case-study/",
	"/impressum/",
	"/datenschutz/",
	"/agb/",
];
for (const route of requiredRoutes) {
	if (!routes.has(route))
		throw new Error(`Required homepage destination is missing: ${route}`);
}

for (const [route, html] of routes) {
	if (/<script(?:\s|>)/i.test(html)) {
		throw new Error(`Script element found on ${route}.`);
	}
	if (/\s(?:on[a-z]+|client:[a-z-]+)\s*=/i.test(html)) {
		throw new Error(`Inline or hydration behavior found on ${route}.`);
	}
	if (/<astro-island(?:\s|>)/i.test(html)) {
		throw new Error(`Astro hydration island found on ${route}.`);
	}
}

const javascriptAssets = files.filter((file) =>
	/\.(?:js|mjs|cjs)$/i.test(file),
);
if (javascriptAssets.length > 0) {
	throw new Error(
		`JavaScript assets found in production output:\n${javascriptAssets.join("\n")}`,
	);
}

const homepage = routes.get("/");
if (!homepage) throw new Error("Homepage output is missing.");

requireCount(homepage, /<main\b[^>]*\bid=["']main["'][^>]*>/gi, 1, "main#main");
requireCount(
	homepage,
	/<header\b[^>]*\bclass=["'][^"']*site-header/gi,
	1,
	"site header",
);
requireCount(
	homepage,
	/<footer\b[^>]*\bclass=["'][^"']*site-footer/gi,
	1,
	"site footer",
);
requireCount(homepage, /<h1(?:\s|>)/gi, 1, "level-one heading");
requireCount(
	homepage,
	/<img\b[^>]*\bfetchpriority=["']high["'][^>]*>/gi,
	1,
	"high-priority image",
);
requireCount(homepage, /<img(?:\s|>)/gi, 1, "homepage image");

requirePattern(
	homepage,
	/<title>IS0 ZER0 — Photography by Ross Todd<\/title>/i,
	"exact homepage title",
);
requirePattern(
	homepage,
	/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+/i,
	"description metadata",
);
requirePattern(
	homepage,
	/<link\b[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/[^"']+\/["']/i,
	"absolute homepage canonical URL",
);
requirePattern(
	homepage,
	/<meta\b[^>]*property=["']og:title["'][^>]*content=["']IS0 ZER0 — Photography by Ross Todd["']/i,
	"Open Graph title",
);
requirePattern(
	homepage,
	/<meta\b[^>]*property=["']og:image["'][^>]*content=["']https:\/\//i,
	"Open Graph image",
);
requirePattern(
	homepage,
	/<meta\b[^>]*name=["']twitter:card["'][^>]*content=["']summary_large_image["']/i,
	"Twitter card",
);
requirePattern(
	homepage,
	/<meta\b[^>]*name=["']iso-zero-build["'][^>]*content=["'][a-f0-9]{40}["']/i,
	"full build SHA metadata",
);
requirePattern(
	homepage,
	/<meta\b[^>]*name=["']iso-zero-content["'][^>]*content=["'][^"']+["']/i,
	"content-version metadata",
);
requirePattern(
	homepage,
	/<a\b[^>]*class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main["'][^>]*>\s*Skip to content\s*<\/a>/i,
	"first skip link",
);
requirePattern(
	homepage,
	/<a\b[^>]*class=["'][^"']*featured-gallery[^"']*["'][^>]*href=["']\/galleries\/venice\/["']/i,
	"featured Venice route",
);
requirePattern(
	homepage,
	/<img\b[^>]*width=["']2048["'][^>]*height=["']1155["']/i,
	"hero intrinsic dimensions",
);
requirePattern(
	homepage,
	/<time\b[^>]*datetime=["']2026-08["'][^>]*>August 2026<\/time>/i,
	"UTC feature publication",
);

if (/<link\b[^>]*rel=["']preload["'][^>]*as=["']image["']/i.test(homepage)) {
	throw new Error(
		"Homepage must use high fetch priority without an unverified image preload.",
	);
}
if (
	/fonts\.(?:googleapis|gstatic)\.com|googletagmanager|google-analytics|plausible\.io/i.test(
		homepage,
	)
) {
	throw new Error(
		"Homepage contains a prohibited third-party font or analytics request.",
	);
}

console.log(
	`Homepage output contract passed: ${routes.size} routes, ${htmlFiles.length} HTML files, zero JavaScript assets.`,
);

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const path = resolve(directory, entry.name);
			return entry.isDirectory() ? walk(path) : [path];
		}),
	);
	return nested.flat();
}

/**
 * @param {string} file
 * @returns {string}
 */
function routeFor(file) {
	const portable = relative(distRoot, file).split(sep).join("/");
	if (portable === "index.html") return "/";
	if (portable.endsWith("/index.html")) {
		return `/${portable.slice(0, -"index.html".length)}`;
	}
	return `/${portable.slice(0, -".html".length)}`;
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 * @param {number} expected
 * @param {string} label
 */
function requireCount(value, pattern, expected, label) {
	const count = value.match(pattern)?.length ?? 0;
	if (count !== expected) {
		throw new Error(`Expected ${expected} ${label}; found ${count}.`);
	}
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 * @param {string} label
 */
function requirePattern(value, pattern, label) {
	if (!pattern.test(value)) throw new Error(`Missing ${label}.`);
}
