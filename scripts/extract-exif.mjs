#!/usr/bin/env node
/**
 * Regenerate the `exif` key of every photo in every gallery content file.
 *
 * This replaces the previous implementation, which wrote pre-formatted
 * display strings ("f/2.8", "1/250s", "24mm") to a sidecar JSON file. That
 * contradicted the measured-value contract in `src/content.config.ts` — the
 * schema requires `fNumber: 2.8`, not `aperture: "f/2.8"` — and had no
 * `--check` mode, so a forgotten extraction run drifted silently instead of
 * failing the build. See `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`
 * §"Generated data lives in the authored file, bounded to one key".
 *
 * This script writes numeric, measured values into the `exif` key of each
 * photo entry, inside the gallery's own Markdown frontmatter, and touches no
 * other key. It resolves each photo's `originalKey` through
 * `src/lib/originals.ts`, the same boundary the rest of the build reads
 * through, rather than a hardcoded directory.
 *
 *   node scripts/extract-exif.mjs           # regenerate
 *   node scripts/extract-exif.mjs --check    # exit non-zero if regeneration would change a file
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import exifr from "exifr";
import yaml from "js-yaml";
import { readOriginal } from "../src/lib/originals.ts";

const GALLERIES_DIR = "src/content/galleries";
const CHECK = process.argv.includes("--check");

/** Reads a Node Readable fully into a Buffer, because exifr wants bytes. */
async function readAll(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Splits a Markdown file into its YAML frontmatter and body, preserving the
 * body byte-for-byte. Throws if the file has no `---`-delimited frontmatter,
 * because a gallery file without frontmatter is a setup mistake this script
 * should not paper over.
 */
function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("File has no YAML frontmatter delimited by ---.");
  }
  return { frontmatterText: match[1], body: match[2] };
}

/**
 * Converts a measured exifr result into the schema's required shape.
 *
 * No fallback is applied for a missing value, for `shotAt` or for anything
 * else. A camera-report field that isn't there is not a value this script
 * gets to guess at — that is the entire point of "measured, not vibed."
 * Every failure here is meant to name exactly what is missing, because the
 * alternative is a contributor staring at a stack trace instead of a photo
 * with incomplete EXIF.
 */
function toMeasuredExif(raw) {
  const {
    Make,
    Model,
    ExposureTime: exposureTime,
    FNumber: fNumber,
    ISO: iso,
    DateTimeOriginal: dateTimeOriginal,
    FocalLength: focalLength,
    LensModel: lens,
  } = raw;

  // `${Make} ${Model}` is truthy even when both are undefined — it comes out
  // as the literal string "undefined undefined" — so `!camera` never catches
  // the missing case. Filtering first is what makes the empty check correct.
  const camera = [Make, Model].filter(Boolean).join(" ");
  if (!camera) {
    throw new Error("EXIF carries no Make/Model; refusing to write an empty camera field.");
  }

  // Collected rather than thrown one at a time, so a photo missing two
  // fields reports both in one run instead of stopping at the first.
  const missing = [];
  if (typeof focalLength !== "number") missing.push("FocalLength");
  if (typeof fNumber !== "number") missing.push("FNumber");
  if (typeof exposureTime !== "number") missing.push("ExposureTime");
  if (typeof iso !== "number") missing.push("ISO");
  if (!(dateTimeOriginal instanceof Date) || Number.isNaN(dateTimeOriginal.valueOf())) {
    missing.push("DateTimeOriginal");
  }
  if (missing.length > 0) {
    throw new Error(
      `EXIF is missing ${missing.join(", ")}. The schema requires all five; ` +
        "this script does not invent a value for a field it cannot measure.",
    );
  }

  return {
    camera,
    // Nullable in the schema, not optional — an absent LensModel must
    // serialize as an explicit `null`. Left as `lens` (undefined) here, it
    // would drop out of the YAML entirely on write and fail validation as a
    // missing required key instead.
    lens: lens ?? null,
    focalLengthMm: focalLength,
    fNumber,
    exposureTimeSec: exposureTime,
    iso,
    shotAt: dateTimeOriginal.toISOString(),
  };
}

function exifEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.camera === b.camera &&
    a.lens === b.lens &&
    a.focalLengthMm === b.focalLengthMm &&
    a.fNumber === b.fNumber &&
    a.exposureTimeSec === b.exposureTimeSec &&
    a.iso === b.iso &&
    a.shotAt === b.shotAt
  );
}

async function processGallery(filePath) {
  const raw = await readFile(filePath, "utf8");
  const { frontmatterText, body } = splitFrontmatter(raw);
  const data = yaml.load(frontmatterText);

  if (!data || !Array.isArray(data.photos)) {
    throw new Error(`${filePath}: frontmatter has no photos array.`);
  }

  let changed = false;
  const diffs = [];

  for (const photo of data.photos) {
    if (!photo.originalKey) {
      throw new Error(`${filePath}: a photo is missing originalKey.`);
    }

    let measured;
    try {
      const bytes = await readAll(await readOriginal(photo.originalKey));
      const parsed = await exifr.parse(bytes, [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
      ]);
      measured = toMeasuredExif(parsed ?? {});
    } catch (error) {
      // Re-thrown with file and photo context. Without this, the failure is
      // a bare stack trace pointing into toMeasuredExif with no way to tell
      // which of possibly dozens of photos across every gallery is the one
      // with the problem.
      throw new Error(
        `${filePath} (${photo.originalKey}): ${error instanceof Error ? error.message : error}`,
        { cause: error },
      );
    }

    if (!exifEqual(photo.exif, measured)) {
      changed = true;
      diffs.push({ originalKey: photo.originalKey, before: photo.exif, after: measured });
      photo.exif = measured;
    }
  }

  if (!changed) {
    return { filePath, changed: false, diffs: [] };
  }

  if (!CHECK) {
    const nextFrontmatter = yaml.dump(data, { lineWidth: -1, noRefs: true });
    await writeFile(filePath, `---\n${nextFrontmatter}---\n${body}`, "utf8");
  }

  return { filePath, changed: true, diffs };
}

async function main() {
  let entries;
  try {
    entries = await readdir(GALLERIES_DIR);
  } catch (error) {
    console.error(`Cannot read ${GALLERIES_DIR}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const galleryFiles = entries
    .filter((name) => extname(name) === ".md")
    .map((name) => join(GALLERIES_DIR, name));

  let anyChanged = false;
  let anyFailed = false;

  // Every gallery is attempted, even after a failure, so one bad photo
  // doesn't hide problems in the files that would have been checked after
  // it alphabetically.
  for (const filePath of galleryFiles) {
    try {
      const result = await processGallery(filePath);
      if (result.changed) {
        anyChanged = true;
        const verb = CHECK ? "would change" : "changed";
        console.log(`${filePath}: ${verb}`);
        for (const diff of result.diffs) {
          console.log(`  ${diff.originalKey}: ${JSON.stringify(diff.before)} -> ${JSON.stringify(diff.after)}`);
        }
      }
    } catch (error) {
      anyFailed = true;
      console.error(error instanceof Error ? error.message : error);
    }
  }

  if (anyFailed) {
    console.error("\nextract-exif failed: see the errors above.");
    process.exitCode = 1;
    return;
  }

  if (CHECK && anyChanged) {
    console.error("\nextract-exif --check failed: regenerating would change one or more files.");
    process.exitCode = 1;
    return;
  }

  if (!anyChanged) {
    console.log("Every gallery's exif key already matches its original.");
  }
}

await main();
