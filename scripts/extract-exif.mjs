#!/usr/bin/env node
/**
 * Pull camera, lens, focal length, aperture, and shutter out of the originals
 * at build time. This is the detail that makes a photography site feel made
 * rather than templated.
 *
 *   node scripts/extract-exif.mjs src/assets/photos > src/data/exif.json
 */
import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import exifr from "exifr";

const dir = process.argv[2] ?? "src/assets/photos";
const out = {};

for (const file of await readdir(dir)) {
  if (![".jpg", ".jpeg", ".tif", ".tiff", ".dng"].includes(extname(file).toLowerCase())) continue;
  const d = (await exifr.parse(join(dir, file), ["Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO", "DateTimeOriginal"])) ?? {};
  out[file] = {
    camera: [d.Make, d.Model].filter(Boolean).join(" ") || null,
    lens: d.LensModel ?? null,
    focalLength: d.FocalLength ? `${Math.round(d.FocalLength)}mm` : null,
    aperture: d.FNumber ? `f/${d.FNumber}` : null,
    shutter: d.ExposureTime ? (d.ExposureTime < 1 ? `1/${Math.round(1 / d.ExposureTime)}s` : `${d.ExposureTime}s`) : null,
    iso: d.ISO ?? null,
    shotAt: d.DateTimeOriginal ?? null,
  };
}

process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
