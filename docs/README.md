# ISO Null — documentation

ISO Null is an image-first photography portfolio and print storefront built as a technical portfolio project. The system combines static compilation, a build-time image and metadata pipeline, an interaction model that ships no client JavaScript at all, and a restrained design system derived from engineering instrumentation.

The project is intended to prove delivery rather than architecture. Every performance, privacy, accessibility, and asset-integrity claim must be backed by an automated check or a recorded production measurement.

## Status

**Current state:** documentation baseline complete.

**First releasable milestone:** one deployed gallery containing at least twelve photographs with mixed aspect ratios, real EXIF extraction, responsive derivatives, a keyboard-operable viewer, cross-browser tests, recorded field measurements, and one purchasable print.

A project does not become portfolio-ready when the design is complete. It becomes portfolio-ready when the deployed system demonstrates the claims made here.

## Reading order

Start with [`00_DOCUMENTATION_MAP.md`](00_DOCUMENTATION_MAP.md). It identifies the source of truth for each concern and is the mechanism that keeps duplicated rules from drifting.

| # | Document | Answers |
|---|---|---|
| 00 | [Documentation map](00_DOCUMENTATION_MAP.md) | Where a given rule lives, and who owns it |
| 01 | [Product and engineering brief](01_PRODUCT_AND_ENGINEERING_BRIEF.md) | What the system is for, and what it refuses to do |
| 02 | [Architecture](02_ARCHITECTURE.md) | Rendering model, routes, module boundaries |
| 03 | [Content, asset, and metadata pipeline](03_CONTENT_ASSET_AND_METADATA_PIPELINE.md) | How an original becomes a delivered derivative |
| 04 | [Design system](04_DESIGN_SYSTEM.md) | Datum tokens, typography, geometry, motifs |
| 05 | [Interaction and accessibility](05_INTERACTION_AND_ACCESSIBILITY.md) | The zero-JavaScript viewer and its conformance |
| 06 | [Commerce and legal](06_COMMERCE_AND_LEGAL.md) | Print offers, checkout, German trader obligations |
| 07 | [Testing, security, and operations](07_TESTING_SECURITY_AND_OPERATIONS.md) | Verification matrix, image protection, CI, deployment |
| 08 | [Implementation plan](08_IMPLEMENTATION_PLAN.md) | Milestones, exit criteria, scaffold remediation |
| 09 | [Portfolio case study](09_PORTFOLIO_CASE_STUDY.md) | The narrative written for a reader who is hiring |

## Authoritative decisions

| Concern | Decision |
|---|---|
| Framework | Astro, static output only. `astro` is pinned `^7.1.6` in `package.json` |
| Client JavaScript | Zero bytes on every route. No islands, no hydration directives, no inline script |
| Viewer | Native Popover API. A `<button popovertarget>` opens a popover rendered at build |
| No-JavaScript behaviour | Not applicable, because there is no JavaScript path to degrade from |
| Styling | Vanilla CSS with custom properties. No Tailwind, no CSS framework |
| Photo routes | No per-photo HTML route unless a print is offered |
| Originals | Private S3-compatible object storage in production, filesystem adapter for development and tests, both behind `src/lib/originals.ts` |
| Generated metadata | Written into the bounded `exif` key of each authored gallery file, with `--check` enforcement in CI |
| Image delivery | AVIF, WebP, and JPEG derivatives; sRGB; maximum 2048 px long edge |
| Privacy | GPS removed and verified; originals never enter build output |
| Authorship | IPTC creator and copyright re-embedded where the output format supports it |
| Commerce | Stripe Payment Links for the first release, because a hosted link is an anchor and an anchor needs no script |
| Money | Gross integer minor units and ISO 4217 currency codes |
| Accessibility target | WCAG 2.2 AA, with selected AAA requirements adopted as project rules |
| Build identity | Commit SHA and content version; no wall-clock timestamp injected into every page |

## Core engineering principle

A claim about performance, protection, accessibility, compatibility, or correctness is either

1. enforced automatically,
2. measured and recorded, or
3. explicitly marked unverified.

There is no implicit verified state. Where a document asserts something the project cannot yet back, the claim carries the marker **[UNVERIFIED]** and appears in the verification matrix in [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md).

## Known drift from the current repository

These documents describe the intended system. The repository currently contradicts them in five places, each tracked as remediation work in [`08_IMPLEMENTATION_PLAN.md`](08_IMPLEMENTATION_PLAN.md).

| Artifact | Drift |
|---|---|
| `astro.config.mjs` | Registers `@astrojs/react` and the Tailwind Vite plugin, both of which the zero-JavaScript and vanilla-CSS decisions forbid |
| `package.json` | Carries `react`, `react-dom`, `@astrojs/react`, `tailwindcss`, and the Testing Library set as scaffold residue |
| `scripts/extract-exif.mjs` | Writes a sidecar JSON of pre-formatted strings, which contradicts the measured-value contract in `src/content.config.ts`, and implements no `--check` mode |
| `src/lib/originals.ts` | Referenced by the schema and by the root README, and does not exist |
| Root `README.md` | States Astro 6 where `package.json` pins Astro 7 |
