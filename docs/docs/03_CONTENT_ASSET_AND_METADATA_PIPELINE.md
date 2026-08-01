# Content, asset, and metadata pipeline

## 1. Ownership model

ISO Zero keeps authored and generated data separate.

### Human-owned data

- Gallery titles, summaries, descriptions, and ordering.
- Photograph identifiers and source keys.
- Alternative text and captions.
- Publication status.
- Print offer data.

### Machine-owned data

- Source hashes.
- Width, height, and aspect ratio.
- Measured EXIF values.
- Extracted camera and lens identifiers.
- Generated derivative paths and hashes.
- Color-space and metadata verification results.
- Transformation version.

A generator must never rewrite authored gallery files.

## 2. Authored schema

The exact Zod implementation may vary, but the domain contract is fixed.

```ts
interface GalleryEntry {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  publishedAt: string; // YYYY-MM-DD
  featured: boolean;
  heroPhotoId: string;
  photographs: readonly PhotographEntry[];
}

interface PhotographEntry {
  id: string;
  originalKey: string;
  alt: string;
  caption?: string;
  print?: PrintOffer;
}

interface PrintOffer {
  sku: string;
  title: string;
  priceMinor: number;
  currency: "EUR";
  dimensionsMm: {
    width: number;
    height: number;
  };
  editionSize: number | null;
  fulfillmentClass: string;
  active: boolean;
}
```

### Validation rules

- `slug`, `id`, and `sku` use stable restricted character sets.
- `alt.trim().length > 0` unless the image has been explicitly classified decorative.
- `priceMinor` is a positive safe integer.
- Currency uses ISO 4217 codes.
- Dimensions are positive integers in millimeters.
- `editionSize` is a positive integer or `null` for an open edition.
- Presence of `print` defines print availability. No separate availability boolean exists.
- A print marked inactive keeps its historical data but does not generate a purchase action.

## 3. Cross-entry validation

Zod validates local shapes. A separate build validation step enforces global invariants:

- Gallery slugs are unique.
- Photograph IDs are unique across the archive.
- SKUs are unique.
- Every `heroPhotoId` exists in its gallery.
- Every `originalKey` resolves.
- Every print route maps to exactly one active print offer.
- No route collides with a reserved route.
- Closed editions cannot report sold quantity greater than edition size.

The validator must include negative fixtures proving that duplicate identifiers, missing originals, and invalid route mappings fail.

## 4. Generated manifest

Example shape:

```ts
interface ImageManifest {
  version: 1;
  transformVersion: string;
  generatedFromCommit?: string;
  images: Record<string, ImageManifestEntry>;
}

interface ImageManifestEntry {
  photoId: string;
  originalKey: string;
  sourceSha256: string;
  sourceByteLength: number;
  width: number;
  height: number;
  aspectRatio: number;
  colorSpace: "srgb";
  exif: ExifData;
  derivatives: readonly ImageDerivative[];
  metadataVerification: {
    gpsAbsent: boolean;
    creatorPresent: boolean;
    copyrightPresent: boolean;
  };
}

interface ExifData {
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLengthMm?: number;
  focalLength35mm?: number;
  fNumber?: number;
  exposureTimeSec?: number;
  iso?: number;
  capturedAt?: string;
}

interface ImageDerivative {
  format: "avif" | "webp" | "jpeg";
  width: number;
  height: number;
  byteLength: number;
  sha256: string;
  publicPath: string;
}
```

EXIF is stored as measured values, not display strings. Formatting belongs in `formatExif`.

Examples:

- Store `fNumber: 2.8`, render `f/2.8`.
- Store `exposureTimeSec: 0.004`, render `1/250 s`.
- Store `focalLengthMm: 35`, render `35 mm`.

## 5. Source processing sequence

1. Resolve `originalKey` through `OriginalsRepository`.
2. Stream and hash the source.
3. Extract dimensions and metadata.
4. Normalize orientation.
5. Remove GPS and location-bearing metadata.
6. Convert output color space to sRGB.
7. Generate responsive AVIF, WebP, and JPEG derivatives.
8. Cap every public derivative at 2048 px on the long edge.
9. Re-embed creator and copyright metadata where supported.
10. Inspect outputs to verify privacy and authorship conditions.
11. Write the generated manifest atomically.
12. In `--check` mode, write nothing and exit non-zero when output would change.

## 6. Derivative strategy

The initial width set should be based on actual layout widths rather than arbitrary completeness. A reasonable starting set is:

```text
480, 768, 1024, 1440, 2048
```

Rules:

- Never upscale beyond the source dimensions.
- Generate only widths used by a declared `sizes` policy.
- Preserve the source aspect ratio.
- Use format and quality defaults established through visual comparison, not generic constants.
- Record byte size for every output.
- Include transform options in the cache key.

### HTML delivery

Grid thumbnails use `<picture>` with AVIF and WebP sources plus JPEG fallback. Every `<img>` has explicit `width`, `height`, `sizes`, `loading`, and `decoding` attributes.

The homepage hero must not default to lazy loading. Its priority and preload behavior must be measured against LCP.

## 7. EXIF formatting

`formatExif` returns structured tokens or a display string from measured data. It must handle missing fields without placeholder clutter.

Canonical order:

```text
CAMERA · LENS · FOCAL LENGTH · APERTURE · SHUTTER · ISO
```

Example:

```text
FUJIFILM X-T4 · XF35mmF1.4 R · 35 mm · f/2.8 · 1/500 s · ISO 160
```

Rules:

- Use tabular numerals and slashed zeros.
- Do not fabricate 35 mm equivalent values.
- Prefer rational shutter notation when the reciprocal is sufficiently accurate.
- Preserve measured numeric values for sorting and future filters.
- Keep location absent from public output unless a location is intentionally authored as editorial content.

## 8. Originals storage decision

### Production

Use private object storage.

Reasons:

- Originals do not inflate repository clones.
- Access can be scoped to CI and authorized maintainers.
- Retention and backups can be managed separately from source control.
- Build systems can fetch only changed sources.
- The public repository does not reveal raw files.

### Development

Use a local filesystem adapter or a synchronized private development directory. The content schema still stores opaque `originalKey` values.

### Cache strategy

The derivative cache key includes:

```text
sourceSha256 + transformVersion + outputFormat + width + quality + metadataPolicyVersion
```

A cache hit must avoid downloading and transforming an unchanged original where the hosting platform permits it.

## 9. Structured data

Gallery and print pages may emit `schema.org/ImageObject` and product structured data, but only from verified manifest and authored data.

Structured data improves machine understanding and discovery. It is not a protection mechanism. If image indexing conflicts with the distribution policy, the project must choose explicitly between discovery and exclusion rather than claiming both.

## 10. Failure behavior

Errors must name:

- Photograph ID.
- Gallery slug.
- Original key.
- Failed invariant.
- Corrective action.

Examples:

```text
IMAGE_SOURCE_MISSING: photo "yard-014" references "originals/yard/014.RAF", which the configured originals repository cannot resolve.
```

```text
SKU_DUPLICATE: SKU "ISO-YARD-014-A2" is assigned to photo IDs "yard-014" and "yard-032".
```

Silent omission is prohibited.
