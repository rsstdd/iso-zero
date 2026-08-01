# photography: next steps

## Decide this before the first commit

Where do originals live? Under roughly 500MB, Git LFS is simplest. Above that,
put originals in S3 or R2 and commit a manifest only. Migrating later is tedious,
so decide now.

## Build order

1. One gallery in src/content/galleries, three photos, prove the pipeline works.
2. Astro <Image /> in the grid: responsive srcset, AVIF and WebP, correct aspect ratio.
3. Lightbox island with client:visible. Keyboard navigation is not optional.
4. EXIF at build: node scripts/extract-exif.mjs > src/data/exif.json, wire into captions.
5. Convert to sRGB at build. Photographers notice mangled colour, and so will you.

## The thing to keep checking

Run a production build and look at the JavaScript payload for a gallery page.
If it is more than a few KB before the lightbox hydrates, an island boundary is
in the wrong place. That number is the whole point of choosing Astro.
