# 02 — Architecture

## Rendering model

Astro, static output only. Every route is HTML written to disk at build time and served as a file.

```js
// astro.config.mjs — target state
export default defineConfig({
  output: "static",
  integrations: [],
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
```

The integrations array is empty and stays empty. A framework integration is the mechanism by which a hydration directive becomes possible, so removing the mechanism is more reliable than forbidding its use. The current `astro.config.mjs` registers `@astrojs/react` and the Tailwind Vite plugin; both are scaffold residue and their removal is the first item in [`08_IMPLEMENTATION_PLAN.md`](08_IMPLEMENTATION_PLAN.md).

Sharp is named explicitly even though it is the default image service, because an explicit entry documents the choice at no cost and survives a default changing underneath the project.

## Why Astro

The framework question has a narrow answer here. Astro is used for its build-time image pipeline and its content collections, and for nothing else.

| Alternative | Rejected because |
|---|---|
| A React single-page application | Shipping a React runtime to render a static image grid inverts the cost of the page. The images are the payload; the framework would be overhead against them |
| Next.js | Correct for applications with server state, and this has none. The App Router's value is data fetching and streaming, neither of which a build-time archive requires |
| Eleventy or Hugo | Both would serve the templating need. Neither offers a typed content schema plus a Sharp-backed asset pipeline in one tool, which is the specific combination this project needs |
| Hand-written HTML | Viable for twelve photographs and unviable for a hundred, because responsive derivative generation is the part that does not scale by hand |

Build collections are used rather than live collections, because live collections do not support the `image()` schema helper and build-time image processing is the reason this project uses Astro at all.

## Route inventory

| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Landing. Links to galleries and to the case study |
| `/galleries/` | `src/pages/galleries/index.astro` | Index of non-draft galleries, newest first |
| `/galleries/[slug]/` | `src/pages/galleries/[slug].astro` | The grid, plus one popover per photograph |
| `/prints/[sku]/` | `src/pages/prints/[sku].astro` | Generated only for photographs carrying a `print` object |
| `/about/` | `src/pages/about.astro` | Author, equipment, process |
| `/impressum/` | `src/pages/impressum.astro` | Trader Impressum. See [`06_COMMERCE_AND_LEGAL.md`](06_COMMERCE_AND_LEGAL.md) |
| `/datenschutz/` | `src/pages/datenschutz.astro` | Privacy notice, German |
| `/agb/` | `src/pages/agb.astro` | Terms and withdrawal instructions |
| `/case-study/` | `src/pages/case-study.astro` | Renders [`09_PORTFOLIO_CASE_STUDY.md`](09_PORTFOLIO_CASE_STUDY.md) |
| `/404` | `src/pages/404.astro` | |

There is deliberately no `/photos/[id]` route. A per-photograph permalink is the artifact that makes uncoordinated redistribution convenient, so the archive has no addressable image page and nothing to link to. The exception is a print, which must have a shareable URL to be sellable, and that exception is exactly why `/prints/[sku]` exists.

## Why the viewer avoids `:target`

The conventional zero-JavaScript lightbox uses `:target`, and `:target` is rejected here.

A `:target` lightbox works by putting the photograph's identifier in the URL fragment, which produces a permalink for every image in the archive as a side effect. That side effect is the precise thing the route inventory is designed to avoid. The Popover API achieves the same interaction without touching the URL, so the fragment stays free and the archive stays unaddressable.

The cost is browser support, which is the reason this is a decision rather than an obvious choice. The Popover API is available across current Chrome, Edge, Firefox, and Safari; a browser without it renders the grid correctly and the trigger buttons do nothing. That degradation is acceptable because the grid itself already shows the photographs at a usable size. **[UNVERIFIED]** — support figures are to be measured against the site's own analytics before launch rather than asserted from a compatibility table.

## Module boundaries

```
src/
  content/
    galleries/*.md          authored content; the exif key is generated
  content.config.ts         the schema; the boundary everything else reads
  lib/
    originals.ts            resolves an originalKey to a readable source
    exif.ts                 formatExif; measured values in, display strings out
    money.ts                integer minor units in, localised gross price out
    schema-org.ts           ImageObject and Product JSON-LD builders
  components/
    PhotoGrid.astro         the grid; renders figures and popover triggers
    PhotoPopover.astro      one popover per photograph, rendered at build
    DataPlate.astro         the hairline-and-mono metadata block
    RuleDatum.astro         the section divider
  layouts/
    Base.astro              document shell, head metadata, skip link
  styles/
    design-tokens.css       Datum, vendored. See 04_DESIGN_SYSTEM.md
    global.css              element defaults and layout primitives
  pages/                    the route inventory above
scripts/
  extract-exif.mjs          originals in, measured data into content files
  check-skus.mjs            SKU uniqueness across all galleries
  check-no-script.mjs       asserts zero script bytes in build output
  check-metadata.mjs        asserts GPS absent and IPTC present in derivatives
```

Dependency direction runs one way: pages depend on components, components depend on `lib`, and `lib` depends on the schema. Nothing in `lib` imports a component, and nothing imports from `pages`. The schema imports nothing from the project at all, which is what makes it usable as the contract that scripts and pages both read.

## The originals boundary

Originals are stored in a private S3-compatible bucket and never enter the repository or the build output. Every access goes through `src/lib/originals.ts`, which resolves an opaque `originalKey` to a readable stream.

```ts
// src/lib/originals.ts — the boundary, not the implementation
export interface OriginalsAdapter {
  read(key: string): Promise<Readable>;
  exists(key: string): Promise<boolean>;
}
```

Two adapters implement it. The object-storage adapter is used in production builds and reads with credentials supplied by the environment. The filesystem adapter is used in development and in tests, and reads from a local directory that is git-ignored. Selection is by environment variable, resolved once at module load, because an adapter that can change mid-run is a source of tests that pass for the wrong reason.

Object storage was chosen over Git LFS deliberately. Git LFS is simpler below roughly 500 MB and its cost curve is worse above that, and more importantly a photographic archive only grows. The decisive argument is that LFS puts originals in clone scope, so anyone who obtains repository access obtains the full-resolution archive; object storage keeps that access separate from source access, which is the correct separation for the most valuable asset in the project.

The interface exists regardless of which adapter is chosen, because the storage decision then costs one file rather than a migration.

## Build sequence

1. `astro check` typechecks, and content collections validate. A malformed gallery file fails here.
2. `check-skus.mjs` asserts SKU uniqueness across all galleries, because two prints sharing a SKU collide on `/prints/[sku]` and the losing route disappears silently.
3. `extract-exif.mjs --check` asserts that regenerating EXIF would change nothing, which converts a forgotten extraction run from silent drift into a failed build.
4. Astro builds. Sharp generates derivatives, and routes are written to `dist/`.
5. `check-no-script.mjs` asserts the emitted HTML contains no `<script>` element and no script asset.
6. `check-metadata.mjs` asserts GPS absent and IPTC creator and copyright present across delivered derivatives.

Steps 2, 3, 5, and 6 are the mechanism by which this document's claims stay true after the person who wrote them has stopped thinking about them.

## Build identity

Each page carries the commit SHA and a content version in a meta tag. Neither is a wall-clock timestamp, because injecting build time into every page changes every byte of every route on every build, which destroys cache reuse and makes output diffs unreadable for no benefit.
