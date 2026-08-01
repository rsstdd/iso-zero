# Architecture

## 1. System context

ISO Zero separates authored content, private originals, generated metadata, responsive derivatives, static presentation, and transactional commerce.

```text
Private original storage
        │
        ▼
Resolver → checksum → EXIF/IPTC extraction → privacy validation
        │                                  │
        │                                  └─ fail on unreadable source or invalid metadata
        ▼
Generated image manifest ───────────────┐
                                        │
Authored gallery content ───────────────┤
                                        ▼
                              Astro content layer
                                        │
                    ┌───────────────────┴────────────────────┐
                    ▼                                        ▼
          Static gallery and PDP HTML              Build-time route checks
                    │
                    ▼
      CDN-hosted responsive derivatives
                    │
                    ├─ zero-JS gallery baseline
                    └─ ≤3 KB Brotli dialog enhancement

Print purchase
        │
        ▼
Server endpoint → hosted Stripe Checkout → signed webhook → order state
```

## 2. Architectural boundaries

### Authored content boundary

Contains editorial intent:

- Gallery title and description.
- Photograph ordering.
- Alternative text.
- Caption.
- Optional print offer.
- Featured and publication state.

Authored files do not contain generated EXIF, dimensions, hashes, derivative URLs, or transform state.

### Originals boundary

`src/lib/originals.ts` is the sole module that interprets `originalKey`.

Production uses private object storage. Development and tests may use a filesystem adapter implementing the same interface.

```ts
export interface OriginalSource {
  readonly key: string;
  readonly byteLength: number;
  readonly contentType: string;
  readonly lastModified?: Date;
  open(): Promise<ReadableStream<Uint8Array>>;
}

export interface OriginalsRepository {
  resolve(key: string): Promise<OriginalSource>;
  exists(key: string): Promise<boolean>;
}
```

No component, content loader, or script opens originals directly.

### Generated manifest boundary

The manifest is the machine-owned join between source media and authored content. It is reproducible and contains no editorial prose.

The manifest may be committed or restored from CI artifacts, but CI always verifies that it matches the current sources and transformation version.

### Rendering boundary

Astro joins authored content and the generated manifest at build time. Public pages receive only bounded derivatives and required metadata.

### Transaction boundary

Static product pages may call server endpoints for checkout-session creation. Payment secrets, webhook processing, order state, and inventory remain outside static assets.

## 3. Runtime model

### Gallery baseline

The gallery route renders:

- Header and navigation.
- Gallery title and description.
- Responsive `<picture>` thumbnails.
- `<figure>` and `<figcaption>` elements.
- Thumbnail anchors targeting the bounded large derivative.
- One empty `<dialog>` used by progressive enhancement.

Without JavaScript, a thumbnail opens the 2048 px derivative. All gallery content remains readable and navigable.

### Viewer enhancement

A single framework-free module intercepts eligible thumbnail links, populates one modal `<dialog>`, and provides:

- Previous and next navigation.
- Arrow Left and Arrow Right.
- Escape and explicit close.
- Focus placement and restoration.
- Dynamic image source assignment so large assets load only on open.
- Caption and EXIF updates.
- URL-neutral navigation; opening an image does not create a per-photo HTML permalink.

The module must remain at or below 3 KB Brotli. If the budget is exceeded, the change requires an ADR.

### Why the production viewer is not one popover per photograph

The original design used a native popover for each image to achieve literal zero JavaScript. Browser measurement showed that full-size `<img>` elements inside closed popovers behaved unexpectedly, which led to a CSS-background workaround. That design remains technically interesting but creates material costs:

- Duplicate viewer markup for every photograph.
- Larger HTML and DOM.
- Two rendering paths for the same image.
- Non-modal semantics.
- No arrow-key navigation.
- A brittle dependence on browser-specific loading behavior.

The production design accepts a small script to improve the complete user experience. ADR 0001 records the alternatives and measurement.

## 4. Routing

| Route | Generation | Purpose |
|---|---|---|
| `/` | Static | Homepage and featured directories |
| `/galleries` | Static | Gallery index |
| `/galleries/[slug]` | Static | Gallery view |
| `/prints/[sku]` | Static | Product page only for a complete print offer |
| `/colophon` | Static | Architecture and measured results |
| `/impressum` | Static | Provider information |
| `/privacy` | Static | Privacy information |
| `/shipping-returns` | Static | Shipping, returns, withdrawal information |
| `/api/checkout/session` | Server | Create hosted checkout session |
| `/api/webhooks/stripe` | Server | Verify and process payment events |
| `/order/[publicId]` | Server or protected static response | Customer-facing order status without exposing internal IDs |

There is no per-photo HTML route for a photograph that lacks a print offer. This reduces indexing and convenient deep linking but does not prevent access to delivered asset URLs.

## 5. Deployment topology

### Static application

- Astro static output deployed to a CDN-backed host.
- Immutable derivative assets with content hashes and long cache lifetimes.
- HTML with short cache lifetime or deployment-level invalidation.
- Security headers applied at the edge.

### Originals and generated assets

- Private object bucket for originals.
- Separate public derivative origin or deployment asset store.
- Build identity includes source hash, transform version, and configuration hash.
- CI cache restores derivatives when the full key matches.

### Transaction service

A small serverless or container endpoint provides checkout creation and webhook processing. It owns:

- Secrets.
- Order database access.
- Inventory reservation and release.
- Provider API calls.
- Structured logs and alerts.

The static application never receives a payment secret.

## 6. Determinism and build identity

Identical source content, source media, dependency lockfile, and transform configuration must produce identical public output.

The footer data plate uses:

- Commit SHA.
- Content version or release identifier.
- Optional source capture date where editorially relevant.

It must not inject the current wall-clock build time into every page. A build timestamp may appear in deployment diagnostics or the colophon if explicitly labeled operational metadata.

## 7. Dependency policy

- No React dependency until a React island exists and has an accepted justification.
- No state-management library.
- No animation library.
- Prefer platform APIs and small local modules.
- Every runtime dependency requires a purpose, owner, and removal condition.
- Build-only dependencies remain allowed where they materially improve validation, transforms, or tests.

## 8. Expected repository structure

```text
src/
  content/
    galleries/
    pages/
  components/
    GalleryGrid.astro
    GalleryFigure.astro
    ImageDialog.astro
    DataPlate.astro
    Placard.astro
    PrintProduct.astro
  layouts/
  lib/
    content/
    images/
    originals.ts
    commerce/
  pages/
    galleries/
    prints/
    api/
  scripts/
    image-dialog.ts
scripts/
  build-image-manifest.mjs
  verify-content.mjs
  verify-assets.mjs
generated/
  image-manifest.json
docs/
tests/
  unit/
  integration/
  browser/
```
