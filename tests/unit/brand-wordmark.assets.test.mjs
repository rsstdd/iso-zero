import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const brandRoot = resolve(root, "public/brand");

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("publishes a complete, checksummed export set", async () => {
	const manifest = JSON.parse(await readFile(resolve(brandRoot, "manifest.json"), "utf8"));

	assert.equal(manifest.schemaVersion, 1);
	assert.equal(manifest.name, "ISO Null instrument-index wordmark");
	assert.deepEqual(manifest.palette, {
		background: "#191611",
		foreground: "#ede7db",
	});
	assert.equal(manifest.assets.length, 4);

	for (const asset of manifest.assets) {
		const path = resolve(brandRoot, asset.file);
		const bytes = await readFile(path);
		assert.equal((await stat(path)).size, asset.size);
		assert.equal(digest(bytes), asset.sha256);
	}
});

test("SVG masters use outlined glyphs and the exact Datum palette", async () => {
	for (const variant of ["compact", "display"]) {
		const svg = await readFile(
			resolve(brandRoot, `iso-zero-wordmark-${variant}.svg`),
			"utf8",
		);

		assert.match(svg, /<title id="title">ISO Null<\/title>/);
		assert.match(svg, /<rect[^>]+fill="#191611"/);
		assert.match(svg, /<g fill="#ede7db"/);
		assert.match(svg, /<path d="[^"]+"/);
		assert.doesNotMatch(svg, /<text\b|<script\b|<image\b|\bhref=/i);
		assert.deepEqual(
			[...svg.matchAll(/#[\da-f]{6}/gi)].map(([value]) => value.toLowerCase()).sort(),
			["#191611", "#ede7db"],
		);
	}
});

test("PNG exports are two-times raster assets", async () => {
	for (const [variant, expected] of [
		["compact", [480, 192]],
		["display", [960, 480]],
	]) {
		const bytes = await readFile(
			resolve(brandRoot, `iso-zero-wordmark-${variant}@2x.png`),
		);
		assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
		assert.equal(bytes.readUInt32BE(16), expected[0]);
		assert.equal(bytes.readUInt32BE(20), expected[1]);
	}
});
