#!/usr/bin/env node
/**
 * Verify the committed brand assets.
 *
 * Brand assets are content, not build output. They change on the order of
 * once a year, so regenerating them inside `pnpm verify` would put a second
 * language runtime in CI to reproduce bytes that are already in the tree. The
 * generator therefore runs offline and this checks its output.
 *
 * Two failures matter and both are caught here: an asset silently replaced or
 * corrupted, which the hash manifest catches, and an asset that no longer
 * satisfies the contract the markup assumes, which the structural assertions
 * catch. A hash alone would only prove the file is unchanged, not that it is
 * correct.
 *
 * No dependencies. Node's standard library reads every format involved,
 * because PNG dimensions live at a fixed offset and an ICO directory is six
 * bytes of header and sixteen bytes per entry.
 *
 *   node scripts/verify-brand-assets.mjs
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";

const DIR = process.env.ISO_ZERO_ASSET_DIR ?? "public";
const MANIFEST = join(DIR, "brand-assets.sha256");

/** Contract each asset must satisfy, independent of its bytes. */
const CONTRACT = {
 "favicon.ico": { kind: "ico", sizes: [ 16, 32, 48 ] },
 "og-default.png": { kind: "png", width: 1200, height: 630 },
 "icon-512.png": { kind: "png", width: 512, height: 512 },
 "icon-192.png": { kind: "png", width: 192, height: 192 },
 "apple-touch-icon.png": { kind: "png", width: 180, height: 180 },
 "favicon.svg": { kind: "svg", viewBox: "0 0 128 128" },
 "mark.svg": { kind: "svg", viewBox: "0 0 128 128" },
};

const failures = [];
const fail = (file, invariant, detail) =>
 failures.push({ file, invariant, detail });

/** PNG: IHDR width and height are big-endian at fixed offsets 16 and 20. */
function pngSize(buf) {
 const signature = Buffer.from([ 137, 80, 78, 71, 13, 10, 26, 10 ]);
 if (!buf.subarray(0, 8).equals(signature)) return null;
 return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** ICO: reserved, type 1, count, then 16-byte entries. A 0 dimension means 256. */
function icoSizes(buf) {
 if (buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) return null;
 const count = buf.readUInt16LE(4);
 const sizes = [];
 for (let i = 0; i < count; i += 1) {
  const at = 6 + i * 16;
  sizes.push(buf[ at ] === 0 ? 256 : buf[ at ]);
 }
 return sizes.sort((a, b) => a - b);
}

function checkStructure(name, buf) {
 const spec = CONTRACT[ name ];
 if (!spec) return;

 if (spec.kind === "png") {
  const size = pngSize(buf);
  if (!size) return fail(name, "PNG_SIGNATURE", "file is not a PNG");
  if (size.width !== spec.width || size.height !== spec.height) {
   fail(
    name,
    "PNG_DIMENSIONS",
    `expected ${spec.width}x${spec.height}, found ${size.width}x${size.height}`,
   );
  }
 }

 if (spec.kind === "ico") {
  const sizes = icoSizes(buf);
  if (!sizes) return fail(name, "ICO_HEADER", "file is not an ICO");
  const found = sizes.join(",");
  const want = [ ...spec.sizes ].sort((a, b) => a - b).join(",");
  if (found !== want) {
   fail(name, "ICO_SIZES", `expected [${want}], found [${found}]`);
  }
 }

 if (spec.kind === "svg") {
  const text = buf.toString("utf8");
  if (!text.includes(`viewBox="${spec.viewBox}"`)) {
   fail(name, "SVG_VIEWBOX", `expected viewBox "${spec.viewBox}"`);
  }
  // The mark ships as outlines. A <text> element would render in whatever
  // face the client happens to have, so the mark would change per machine.
  if (/<text[\s>]/.test(text)) {
   fail(name, "SVG_TEXT_ELEMENT", "mark must be outlines, not <text>");
  }
 }
}

let manifest;
try {
 manifest = readFileSync(MANIFEST, "utf8");
} catch {
 console.error(`MANIFEST_MISSING: ${MANIFEST} does not exist.`);
 console.error("Regenerate it with: sha256sum <assets> > " + MANIFEST);
 process.exit(1);
}

const entries = manifest
 .split("\n")
 .map((line) => line.trim())
 .filter(Boolean)
 .map((line) => {
  const [ digest, ...rest ] = line.split(/\s+/);
  return { digest, name: basename(rest.join(" ")) };
 });

const rows = [];
for (const { digest, name } of entries) {
 let buf;
 try {
  buf = readFileSync(join(DIR, name));
 } catch {
  fail(name, "ASSET_MISSING", `${join(DIR, name)} cannot be read`);
  continue;
 }
 const actual = createHash("sha256").update(buf).digest("hex");
 if (actual !== digest) {
  fail(name, "ASSET_DRIFT", `expected ${digest.slice(0, 12)}, found ${actual.slice(0, 12)}`);
 }
 checkStructure(name, buf);
 rows.push([ name, String(buf.length), actual.slice(0, 12) ]);
}

const width = Math.max(...rows.map(([ n ]) => n.length), 4);
for (const [ name, bytes, digest ] of rows) {
 console.log(`${name.padEnd(width)}  ${bytes.padStart(8)} B  ${digest}`);
}

if (failures.length > 0) {
 console.error("");
 for (const { file, invariant, detail } of failures) {
  console.error(`${invariant}: ${file} — ${detail}`);
 }
 console.error("");
 console.error(
  "Corrective action: restore the asset from source control, or regenerate " +
  "it with scripts/build-brand-assets.py and update " +
  `${MANIFEST}.`,
 );
 process.exit(1);
}

console.log(`\n${rows.length} assets verified against ${MANIFEST}.`);
