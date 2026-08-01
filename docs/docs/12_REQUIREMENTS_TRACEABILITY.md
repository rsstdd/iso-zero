# Requirements traceability

This matrix records the disposition of material requirements and reasoning from the replaced documents. “Changed” means the original idea remains documented but the authoritative implementation differs.

| Original concern | Disposition | Authoritative location |
|---|---|---|
| Dark image-first gallery | Preserved | `04_DESIGN_SYSTEM.md` |
| Engineering-notebook visual language | Preserved | `01_PRODUCT_AND_ENGINEERING_BRIEF.md`, `04_DESIGN_SYSTEM.md` |
| International Orange instrument color | Preserved with explicit allowlist | `04_DESIGN_SYSTEM.md` |
| IBM Plex Serif, Sans, Mono roles | Preserved | `04_DESIGN_SYSTEM.md` |
| Tabular numerals and slashed zeros | Preserved | `04_DESIGN_SYSTEM.md` |
| One-pixel hairlines and zero-radius photos | Preserved | `04_DESIGN_SYSTEM.md` |
| Datum tick, data plate, placard | Preserved | `04_DESIGN_SYSTEM.md` |
| Verified contrast ratios | Preserved | `04_DESIGN_SYSTEM.md` |
| 65ch, 1120px, and 1400px containers | Preserved | `04_DESIGN_SYSTEM.md` |
| Four-pixel spacing base and 96/128px major gaps | Preserved | `04_DESIGN_SYSTEM.md` |
| Homepage hero at 16:9 or 3:2 | Preserved | `04_DESIGN_SYSTEM.md`, `10_WIREFRAMES.md` |
| Hero and directory data plates | Preserved | `04_DESIGN_SYSTEM.md`, `10_WIREFRAMES.md` |
| CSS brightness or opacity hover; no zoom | Preserved | `04_DESIGN_SYSTEM.md` |
| Masonry or grid | Narrowed to strict responsive grid by default | `04_DESIGN_SYSTEM.md` |
| Sticky translucent header with blur | Preserved as optional default, performance-tested | `04_DESIGN_SYSTEM.md` |
| Print page two-column sticky image | Preserved responsively | `04_DESIGN_SYSTEM.md`, `10_WIREFRAMES.md` |
| Colophon at 65ch | Preserved | `04_DESIGN_SYSTEM.md`, `10_WIREFRAMES.md` |
| Sentence case everywhere | Preserved for ordinary UI; uppercase restricted to overlines and machine data | `04_DESIGN_SYSTEM.md` |
| Zero exclamation points and direct verbs | Preserved | `04_DESIGN_SYSTEM.md` |
| No generic creative-agency copy | Preserved | `01_PRODUCT_AND_ENGINEERING_BRIEF.md` |
| Strict zero JavaScript on gallery route | Changed: grid baseline is zero-JS; viewer enhancement ≤3 KB Brotli | `02_ARCHITECTURE.md`, ADR 0001 |
| Native popover per image | Retained as rejected production alternative and measured experiment | ADR 0001 |
| CSS background full-size viewer image | Replaced by dynamically assigned semantic `<img>` in one dialog | `05_INTERACTION_AND_ACCESSIBILITY.md`, ADR 0001 |
| No arrow-key navigation accepted | Replaced; arrow keys required | `05_INTERACTION_AND_ACCESSIBILITY.md` |
| React 19 retained for hypothetical island/compiler | Removed until a real React use exists | `02_ARCHITECTURE.md` |
| No per-photo URL except prints | Preserved for HTML routes; clarified that asset URLs remain addressable | `02_ARCHITECTURE.md`, ADR 0004 |
| 2048px maximum long edge | Preserved | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| AVIF, WebP, JPEG fallback | Preserved | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| sRGB conversion | Preserved | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| Strip GPS | Preserved and made an automated invariant | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`, `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| Re-embed creator and copyright | Preserved with output-format verification | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| Structured `ImageObject` data | Preserved with discovery trade-off stated | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| CDN referer hotlink control | Preserved as bandwidth-abuse control, not protection | `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| `robots.txt` AI crawler blocks | Preserved as policy expression, not access control | `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| No right-click or drag suppression | Preserved | `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| EXIF script owns one frontmatter key | Replaced by sidecar generated manifest | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`, ADR 0002 |
| EXIF generation is idempotent and has `--check` | Preserved | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| EXIF stored measured, not formatted | Preserved | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| `print` object instead of boolean | Preserved and expanded | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`, `06_COMMERCE_LEGAL_AND_OPERATIONS.md` |
| Alternative text rejects whitespace | Preserved | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| SKU uniqueness and source resolution outside Zod | Preserved and expanded | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| Opaque `originalKey` and one resolver | Preserved | `02_ARCHITECTURE.md`, `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| Originals storage deferred between LFS and object storage | Resolved to private object storage in production | ADR 0003 |
| Git LFS threshold around 500MB | Removed as arbitrary | ADR 0003 |
| Biome, strict TypeScript, Astro check, Vitest, Playwright, pnpm | Preserved and expanded | `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| One Playwright smoke spec | Replaced by risk-based cross-browser suite | `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| Build gates and sequenced delivery | Preserved and expanded | `08_IMPLEMENTATION_PLAN.md` |
| Three-photo proof gallery | Expanded to twelve real photographs for the first deployed slice | `08_IMPLEMENTATION_PLAN.md` |
| Wall-clock last-build timestamp in footer | Replaced by commit/release identity for determinism | ADR 0006 |
| Commerce-ready PDP | Expanded to one complete purchase, webhook, order, and inventory flow | `06_COMMERCE_LEGAL_AND_OPERATIONS.md`, ADR 0005 |
| Gross integer prices | Preserved | `06_COMMERCE_LEGAL_AND_OPERATIONS.md` |
| Germany Impressum and withdrawal obligations | Preserved as launch gates with explicit professional review | `06_COMMERCE_LEGAL_AND_OPERATIONS.md` |
| C2PA deferred | Preserved | `08_IMPLEMENTATION_PLAN.md` |
| Visible watermarking deferred | Preserved | `08_IMPLEMENTATION_PLAN.md` |
| Search, tags, filtering deferred | Preserved | `08_IMPLEMENTATION_PLAN.md` |
| Claim is measured or marked unmeasured | Preserved and expanded to automated enforcement | `README.md`, `07_TESTING_SECURITY_AND_OPERATIONS.md` |
