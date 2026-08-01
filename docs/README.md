# ISO Zero

ISO Zero is an image-first photography portfolio and limited-edition print storefront built as a technical portfolio project. The system combines static rendering, a build-time image and metadata pipeline, a deliberately small client runtime, accessible interaction, and a restrained design system derived from engineering instrumentation.

The project is intended to prove delivery, not merely architecture. Every performance, privacy, accessibility, and asset-integrity claim must be backed by an automated check or a recorded production measurement.

## Status

**Current state:** architecture and documentation baseline.

**First releasable milestone:** one deployed gallery containing at least twelve photographs with mixed aspect ratios, real EXIF extraction, responsive derivatives, a keyboard-complete viewer, cross-browser tests, recorded performance measurements, and one purchasable print.

A project does not become portfolio-ready when the design is complete. It becomes portfolio-ready when the deployed system demonstrates the claims made here.

## Product objectives

ISO Zero must:

- Present photography without interface chrome competing with the images.
- Deliver responsive, color-consistent assets without exposing originals.
- Preserve authorship metadata while removing GPS and other unnecessary source metadata.
- Render the gallery and its complete content without a client framework.
- Add a modal image viewer through a framework-free progressive enhancement bounded to **3 KB Brotli**.
- Provide a complete, accessible keyboard and screen-reader interaction model.
- Generate product pages only for photographs that carry a complete print offer.
- Complete at least one real purchase path through a hosted checkout provider.
- Fail builds when content, routes, assets, metadata, or generated manifests drift from their contracts.

## Authoritative decisions

| Concern | Decision |
|---|---|
| Framework | Astro 6, static output |
| Gallery baseline | Static HTML and CSS; zero client JavaScript required to view the grid |
| Viewer | One reusable modal `<dialog>` enhanced by framework-free TypeScript |
| JavaScript budget | At most 3 KB Brotli on gallery routes; no React runtime |
| No-JS behavior | Thumbnail links open the bounded web derivative directly |
| Photo routes | No per-photo HTML route unless a print is offered |
| Originals | Private object storage in production; filesystem adapter for development and tests |
| Generated metadata | Sidecar manifest; generated data does not mutate authored gallery files |
| Image delivery | AVIF, WebP, and JPEG derivatives; sRGB; maximum 2048 px long edge |
| Privacy | GPS removed and verified; originals never enter deployment output |
| Authorship | Creator and copyright metadata re-embedded where the output format supports it |
| Commerce | Stripe Checkout behind a provider boundary; signed and idempotent webhook fulfillment |
| Money | Gross integer minor units and ISO 4217 currency codes |
| Accessibility target | WCAG 2.2 AA, with selected AAA focus requirements adopted as project rules |
| Build identity | Commit SHA and content version; no wall-clock timestamp injected into every page |

## Repository documentation

Start with [`docs/00_DOCUMENTATION_MAP.md`](docs/00_DOCUMENTATION_MAP.md). It identifies the source of truth for each concern and prevents duplicated rules from drifting.

The most important documents are:

- [`docs/01_PRODUCT_AND_ENGINEERING_BRIEF.md`](docs/01_PRODUCT_AND_ENGINEERING_BRIEF.md)
- [`docs/02_ARCHITECTURE.md`](docs/02_ARCHITECTURE.md)
- [`docs/03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`](docs/03_CONTENT_ASSET_AND_METADATA_PIPELINE.md)
- [`docs/04_DESIGN_SYSTEM.md`](docs/04_DESIGN_SYSTEM.md)
- [`docs/05_INTERACTION_AND_ACCESSIBILITY.md`](docs/05_INTERACTION_AND_ACCESSIBILITY.md)
- [`docs/07_TESTING_SECURITY_AND_OPERATIONS.md`](docs/07_TESTING_SECURITY_AND_OPERATIONS.md)
- [`docs/08_IMPLEMENTATION_PLAN.md`](docs/08_IMPLEMENTATION_PLAN.md)
- [`docs/09_PORTFOLIO_CASE_STUDY.md`](docs/09_PORTFOLIO_CASE_STUDY.md)

## Core engineering principle

A claim about performance, protection, accessibility, compatibility, or correctness is either:

1. enforced automatically,
2. measured and recorded, or
3. explicitly marked unverified.

There is no implicit verified state.
