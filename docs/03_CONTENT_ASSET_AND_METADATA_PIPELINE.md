# 03 — Content, asset, and metadata pipeline

This document explains `src/content.config.ts` and the scripts that write into the files it validates. The schema is the source of truth; where this document and the schema disagree, the schema is correct and this document is a defect.

## The content contract

A gallery is a Markdown file under `src/content/galleries/`. Its frontmatter carries a title, a publication date, an optional location and description, a cover image, and an ordered array of photographs.

```
src/content/galleries/
  bavarian-alps-winter.md
  munich-nocturnes.md
```

Photograph order is array position, so reordering a gallery is a content edit rather than a code change. A gallery with an empty photo array fails validation, because a gallery with no photographs is a draft rather than a gallery, and `draft: true` is how a draft is expressed.

Every schema in this project fails the build rather than degrading at runtime. A malformed gallery file is a setup mistake, and a site that silently renders a photograph without alt text is worse than one that refuses to compile.

## Alt text

Alt text is required, and whitespace does not satisfy it.

```ts
const altText = z
  .string()
  .refine((value) => value.trim().length > 0, "alt text is required and cannot be whitespace");
```

`z.string().min(1)` accepts a single space. That is precisely how empty alt text reaches production while passing a schema that claims to require it, which makes the plain `min(1)` worse than no validation: it produces the appearance of a guarantee. The refinement closes it.

## EXIF

### Values are stored as measured, not as displayed

`fNumber: 2.8`, not `"f/2.8"`. `exposureTimeSec: 0.004`, not `"1/250"`. `focalLengthMm: 24`, not `"24mm"`.

A pre-rendered string means the data plate and any later sort, filter, or comparison disagree about what the value is, and the disagreement surfaces the first time somebody wants photographs ordered by aperture. Formatting is a presentation concern and belongs in `src/lib/exif.ts`, which takes measured values and returns display strings.

This is the sharpest correction the current `scripts/extract-exif.mjs` requires: it emits `aperture: "f/2.8"`, `shutter: "1/250s"`, and `focalLength: "24mm"`, none of which the schema accepts.

### Generated data lives in the authored file, bounded to one key

The extraction script writes into the `exif` key of each photograph and touches nothing else. Nesting under a single key rather than flattening into the photo object is what makes the generated region visually bounded, and a bounded region is what makes a hand edit to a neighbouring field survive the next run.

Writing generated data into hand-authored files is normally a mistake, and it is only safe here because of `--check`:

```bash
node scripts/extract-exif.mjs           # regenerate
node scripts/extract-exif.mjs --check   # exit non-zero if regeneration would change a file
```

`--check` runs in CI. It converts "someone forgot to run the extraction script" from silent drift into a failed build, and that check is the entire justification for the approach. Without it, the sidecar manifest would be the correct design.

### Nullability follows the equipment

`lens` is nullable because adapted and fully manual glass reports nothing, and a schema that requires a lens name would reject the photographs most worth talking about. `camera`, `focalLengthMm`, `fNumber`, `exposureTimeSec`, `iso`, and `shotAt` are all required, because a file that reports none of them is not a photograph from a camera this project publishes, and the extraction failing loudly is the desired outcome.

`shotAt` is the capture time from the file, in UTC. It is distinct from the gallery's `date`, which is publication.

## Originals

Each photograph carries an `originalKey`, an opaque handle resolved by `src/lib/originals.ts`. The delivered `src` is a separate, capped asset committed to the repository and processed by Astro at build.

Originals never enter `public/` and never enter `dist/`. That is the single highest-value protection control in the project, because every other measure in [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md) mitigates the consequences of delivering an image, while this one declines to deliver the valuable version at all.

A build asserts that every `originalKey` resolves to a readable source. Without that check, extraction fails later and less obviously, at which point the failure is attributed to the script rather than to the missing file.

## Derivative generation

| Property | Value |
|---|---|
| Formats | AVIF, WebP, JPEG, emitted as a `<picture>` with the JPEG as `<img>` fallback |
| Long-edge ceiling | 2048 px |
| Widths | 640, 960, 1280, 1600, 2048, subject to the ceiling and the source |
| Colour | Converted to sRGB at build |
| Quality | Tuned per format against visual inspection, recorded once chosen **[UNVERIFIED]** |

The resolution ceiling is a commercial decision rather than a technical one. A 2048 px web derivative is ample for viewing and inadequate for printing at any size a buyer would pay for, which keeps the delivered file useful to the viewer and useless to a competitor.

Colour conversion is not optional. Photographers notice mangled colour, and an untagged Adobe RGB file rendered as sRGB is the most common way a photography site quietly desaturates its own work.

## Embedded metadata

Sharp strips metadata by default. That default removes GPS coordinates, which is wanted, and it also removes authorship, which is not.

The pipeline therefore strips everything and then re-embeds a specific set:

| Field | Action |
|---|---|
| GPS coordinates | Removed, and the removal is asserted by `check-metadata.mjs` |
| Camera serial, owner name, software | Removed |
| IPTC `Creator` | Re-embedded |
| IPTC `CopyrightNotice` | Re-embedded |
| IPTC `WebStatement` | Re-embedded, pointing at the licence page |
| ICC profile | sRGB, retained |

Embedded attribution survives a right-click save, which is the reason it is worth the bytes. AVIF and WebP metadata support is less uniform than JPEG's, so the assertion is scoped to the format that reliably carries it and the gap is recorded rather than assumed away.

## Zero layout shift

Every `<img>` carries explicit `width` and `height`, from which the browser derives the intrinsic aspect ratio before any styling or image data is applied — the UA stylesheet's default `aspect-ratio: attr(width) / attr(height)` for replaced elements, not an `aspect-ratio` declaration this project authors. Astro supplies the `width`/`height` values from the processed asset, so they are derived rather than authored, and a photograph whose dimensions cannot be determined fails the build.

The grid reserves space from the aspect ratio before any byte of image data arrives, because every grid `<img>` is in normal document flow from first paint. That is what makes Cumulative Layout Shift 0 an enforceable target rather than an aspiration for the grid, and it matters more here than on a text site because a mixed-ratio photographic grid is the layout most prone to reflow.

The enlarged photograph inside `PhotoPopover.astro` (`docs/02_component-specs/11_PHOTO_POPOVER.md`) gets the same `width`/`height` treatment and the same reserved-box guarantee once its popover opens, because those attributes are already present in the DOM before the visitor ever interacts with the trigger. What it did *not* get for free was an early fetch: the popover is `display: none` until opened (`docs/02_component-specs/11_PHOTO_POPOVER.md` §11), and `loading="lazy"` — correct for the grid's off-screen thumbnails — defers a `display: none` image's network request until its ancestor stops being `display: none`, per the HTML lazy-loading eligibility algorithm. That fetch would not begin until the moment the popover opened, which is a load-time delay, not a reserved-space failure; the two are easy to conflate because both present as "the image wasn't there yet." `docs/02_component-specs/11_PHOTO_POPOVER.md` §14 records the fix: the popover's `Picture` now loads eagerly, at low fetch priority, so this delay no longer applies.

## Adding a photograph

1. Place the original in the originals bucket and note its key.
2. Export a capped web derivative into `src/assets/` and commit it.
3. Add the photograph to the gallery's `photos` array with `src`, `originalKey`, `alt`, and an optional `caption`.
4. Run `node scripts/extract-exif.mjs` to populate `exif`.
5. Run `pnpm verify`.
6. Commit and push.

Publishing is adding files and pushing. One author does not need a CMS, and the six steps above are the entire editorial workflow.
