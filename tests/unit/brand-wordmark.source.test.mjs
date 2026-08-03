import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const read = (path) => readFile(resolve(root, path), "utf8");

test("uses one governed component for compact and display identity", async () => {
	const [component, header, identity] = await Promise.all([
		read("src/components/BrandWordmark.astro"),
		read("src/components/SiteHeader.astro"),
		read("src/components/HomepageIdentity.astro"),
	]);

	assert.match(component, /readonly label: "ISO Null"/);
	assert.match(component, /readonly variant: "compact" \| "display"/);
	assert.match(header, /<BrandWordmark label="ISO Null" variant="compact" \/>/);
	assert.match(identity, /<BrandWordmark label=\{title\} variant="display" \/>/);
	assert.equal((header.match(/<BrandWordmark\b/g) ?? []).length, 1);
	assert.equal((identity.match(/<BrandWordmark\b/g) ?? []).length, 1);
});

test("preserves canonical text and semantic ownership", async () => {
	const [component, header, identity] = await Promise.all([
		read("src/components/BrandWordmark.astro"),
		read("src/components/SiteHeader.astro"),
		read("src/components/HomepageIdentity.astro"),
	]);

	assert.match(component, />ISO<\/span>/);
	assert.match(component, /> Zero<\/span>/);
	assert.doesNotMatch(component, /<h1|<a\b/);
	assert.match(header, /<a class="site-wordmark" href="\/"/);
	assert.match(identity, /<h1 id=\{headingId\}>/);
});

test("uses semantic Datum tokens without decorative logo effects", async () => {
	const component = await read("src/components/BrandWordmark.astro");

	assert.match(component, /color: inherit/);
	assert.match(component, /background: transparent/);
	assert.match(component, /font-family: var\(--font-display\)/);
	assert.doesNotMatch(component, /#[\da-f]{3,8}\b/i);
	assert.doesNotMatch(component, /box-shadow|border-radius|filter:|::before|::after/);
	assert.doesNotMatch(component, /var\(--accent\)|position:\s*(?:absolute|fixed)/);
});

test("self-hosts every wordmark weight used above the fold", async () => {
	const [layout, tokens] = await Promise.all([
		read("src/layouts/Base.astro"),
		read("src/styles/design-tokens.css"),
	]);

	assert.match(layout, /ibm-plex-serif\/latin-500\.css/);
	assert.match(layout, /ibm-plex-serif\/latin-600\.css/);
	assert.match(tokens, /--brand-index-weight: 500/);
	assert.match(tokens, /--brand-maker-weight: 600/);
});
