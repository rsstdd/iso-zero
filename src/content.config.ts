import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

/**
 * Content contracts for the photography site.
 *
 * Build collections, not live collections. Live collections are stable in
 * Astro 6 but do not support the `image()` schema helper, and build-time image
 * processing is the reason this site uses Astro at all.
 *
 * Every schema here fails the build rather than degrading at runtime. A
 * malformed gallery file is a setup mistake, and a site that silently renders a
 * photograph without alt text is worse than one that refuses to compile.
 */

/**
 * Camera metadata, written by `scripts/extract-exif.mjs` from the original
 * files and never by hand.
 *
 * It is nested under one key rather than flattened into the photo object so the
 * generated region of each content file is visually bounded. The script owns
 * `exif` and nothing else, which is what makes a hand edit to a neighbouring
 * field safe from the next run.
 *
 * Values are stored as they are measured, not as they are displayed. Aperture
 * is a number, not "f/8"; exposure is seconds, not "1/250". Formatting is a
 * presentation concern and belongs in `formatExif`, because storing a rendered
 * string means the data plate and any future sort or filter disagree about what
 * the value is.
 */
const exifSchema = z.object({
  /** Make and model joined, as reported by the file. Example: "FUJIFILM X-T4". */
  camera: z.string().min(1),
  /** Lens model as reported. Absent on adapted or manual glass, which reports nothing. */
  lens: z.string().min(1).nullable(),
  /** Physical focal length in millimetres. Not converted to full-frame equivalent. */
  focalLengthMm: z.number().positive(),
  /** f-number. 2.8, not "f/2.8". */
  fNumber: z.number().positive(),
  /** Exposure time in seconds. 0.004, not "1/250". */
  exposureTimeSec: z.number().positive(),
  /** ISO sensitivity. */
  iso: z.number().int().positive(),
  /** Capture time from the file, in UTC. Distinct from the gallery's publication date. */
  shotAt: z.coerce.date(),
});

/**
 * Print offer.
 *
 * Modelled as an optional object rather than as a `printAvailable` boolean
 * beside five optional siblings, because that shape permits
 * `printAvailable: true` with no price, no SKU, and no dimensions. That state
 * passes validation and is commercially broken. Presence of this object is
 * availability, and its required fields are what availability means.
 *
 * SKU uniqueness across the site cannot be expressed per entry in Zod. It is
 * enforced by a build-time check, because two prints sharing a SKU would
 * collide on `/prints/[sku]` and the losing route would vanish silently.
 */
const printSchema = z.object({
  /** Route segment for `/prints/[sku]`. Lowercase, because URLs are. */
  sku: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "sku must be lowercase alphanumeric with hyphens"),
  /**
   * Gross price in the smallest currency unit, inclusive of VAT.
   *
   * Integer cents rather than a float, because floating-point money is a
   * rounding bug waiting for a large enough order. Gross rather than net
   * because German price-indication rules require the total a consumer pays to
   * be the displayed figure.
   */
  priceCents: z.number().int().positive(),
  currency: z.literal("EUR"),
  /** Paper dimensions as sold. Example: "420 × 297 mm". */
  dimensions: z.string().min(1),
  /** Edition size, or null for an open edition. Null is a claim; absent is an omission. */
  editionSize: z.number().int().positive().nullable(),
});

/**
 * Alt text.
 *
 * Required, and whitespace does not satisfy it. `z.string().min(1)` accepts a
 * single space, which is how empty alt text reaches production while passing a
 * schema that claims to require it.
 */
const altText = z
  .string()
  .refine((value) => value.trim().length > 0, "alt text is required and cannot be whitespace");

export type Exif = z.infer<typeof exifSchema>;
export type Print = z.infer<typeof printSchema>;

const galleries = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/galleries" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** Publication date. Not capture date, which lives per photo in `exif.shotAt`. */
      date: z.coerce.date(),
      location: z.string().min(1).optional(),
      /** One-line description used in metadata and link unfurls. */
      description: z.string().max(200).optional(),
      cover: image(),
      /**
       * Ordered. Array position is display order, so reordering a gallery is a
       * content edit rather than a code change.
       */
      photos: z
        .array(
          z.object({
            /**
             * The delivery asset, processed by Astro at build. This is the
             * capped variant committed to the repository, not the original.
             */
            src: image(),
            /**
             * Opaque handle for the original file, resolved by
             * `src/lib/originals.ts`. Kept indirect because the storage
             * decision is open: a repository path under Git LFS and an object
             * storage key are the same string to everything except the
             * resolver.
             */
            originalKey: z.string().min(1),
            alt: altText,
            /** Human caption. The technical data plate is generated from `exif`. */
            caption: z.string().optional(),
            exif: exifSchema,
            /** Present only where a print is offered. See `printSchema`. */
            print: printSchema.optional(),
          }),
        )
        .min(1, "a gallery with no photographs is a draft, not a gallery"),
      /** Excluded from builds. Draft galleries do not render and are not linked. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { galleries };
