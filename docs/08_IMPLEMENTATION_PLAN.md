# 08 — Implementation plan

Six milestones, each with an exit criterion that is checkable rather than felt. A milestone is complete when its criterion passes, and not when the work feels finished.

## M0 — Scaffold remediation

The repository was created from a general Astro starter and carries five contradictions with the decisions in [`README.md`](README.md). Removing them first is not tidying; a build that can register a React island is a build in which the zero-JavaScript claim is a convention rather than a property.

| Task | Detail |
|---|---|
| Strip the React integration | Remove `@astrojs/react` from `astro.config.mjs` and leave `integrations: []` |
| Strip Tailwind | Remove the `@tailwindcss/vite` plugin and the `tailwindcss` dependency |
| Remove unused dependencies | `react`, `react-dom`, `@types/react`, `@types/react-dom`, `babel-plugin-react-compiler`, `eslint-plugin-react-hooks`, the Testing Library set, and `jsdom` |
| Set output mode explicitly | `output: "static"` in `astro.config.mjs` |
| Flatten the Datum tokens | Lift the declarations IS0 ZER0 consumes into `:root`, remove Tailwind mappings and unused light-theme branches, and preserve the governed motifs per [`04_DESIGN_SYSTEM.md`](04_DESIGN_SYSTEM.md) |
| Correct the root README | It states Astro 6 where `package.json` pins Astro 7 |
| Add the dependency guard | Fails the build if any forbidden package returns |

**Exit criterion:** `pnpm verify` passes with an empty integrations array, and the dependency guard is green.

## M1 — Content and pipeline

| Task | Detail |
|---|---|
| Write `src/lib/originals.ts` | The adapter interface plus filesystem and S3-compatible implementations |
| Rewrite `scripts/extract-exif.mjs` | Measured values written into the `exif` key of each gallery file, replacing the sidecar of pre-formatted strings |
| Add `--check` mode | Exits non-zero if regeneration would change any file |
| Write `scripts/check-skus.mjs` | SKU uniqueness across all galleries |
| Write `src/lib/exif.ts` | `formatExif`, with unit tests covering reciprocal shutter rounding |
| Configure the derivative pipeline | AVIF, WebP, JPEG; sRGB conversion; the 2048 px ceiling |
| Configure metadata handling | Strip everything, re-embed IPTC creator, copyright, and web statement |
| Write `scripts/check-metadata.mjs` | Asserts GPS absent and IPTC present across delivered derivatives |

**Exit criterion:** twelve real photographs validate, extract, and process, with `--check` clean and the metadata assertions passing.

The rewrite of the extraction script is the single largest piece of work in this milestone, because the current version disagrees with the schema on output location, value format, and nullability, which means it is a rewrite rather than an edit.

## M2 — Design system and shell

| Task | Detail |
|---|---|
| Vendor and flatten the tokens | With a header comment recording the upstream revision |
| Self-host IBM Plex | Subset to Latin, preload the two above-the-fold faces |
| Build `Base.astro` | Document shell, head metadata, skip link, footer with build identity |
| Build the motif components | `RuleDatum.astro` and `DataPlate.astro` wrapping the shared classes |
| Build the gallery grid | CSS Grid, dense flow, natural aspect ratios, explicit dimensions on every figure |
| Write `global.css` | Element defaults and layout primitives |

**Exit criterion:** a gallery route renders twelve photographs at mixed aspect ratios with a measured Cumulative Layout Shift of 0.

## M3 — The viewer

| Task | Detail |
|---|---|
| Build `PhotoPopover.astro` | One popover per photograph, rendered at build |
| Wire the triggers | `popovertarget` on each figure's button |
| Wire neighbour navigation | Previous and next buttons targeting adjacent popovers |
| Compose accessible names | "Open larger view: " prefixed to alt text |
| Write `check-no-script.mjs` | Asserts zero script bytes in `dist/` |
| Verify keyboard traversal | Manually, per browser, recorded |
| Verify screen-reader announcement | VoiceOver with Safari, NVDA with Firefox, recorded |
| Measure document weight | Against a full gallery, to confirm or move the 40-photograph cap |

**Exit criterion:** the viewer opens, navigates, and closes by keyboard alone, with no script in the build output.

This is the milestone where the project's central claim is either demonstrated or falsified. If neighbour-to-neighbour focus behaviour proves incoherent across browsers, the fallback is a viewer that opens one photograph at a time with no previous or next control, because a working single-photograph viewer is better than a broken navigable one and both are better than a script.

## M4 — Commerce

| Task | Detail |
|---|---|
| Build `/prints/[sku]` | Generated only where a `print` object exists |
| Write `src/lib/money.ts` | Integer minor units to localised gross strings |
| Write `src/lib/checkout.ts` | The provider boundary; a print offer in, a purchase URL out |
| Create Payment Links | One per SKU, with quantity limits matching edition sizes |
| Write `src/lib/schema-org.ts` | `Product` with `Offer`, and `ImageObject` |
| Write the legal pages | Impressum, Datenschutz, AGB with withdrawal instructions |
| Confirm obligations | With a qualified adviser, before the first sale |

**Exit criterion:** one real purchase completes, is fulfilled, and is shipped.

## M5 — Operations and launch

| Task | Detail |
|---|---|
| Configure headers | Including `script-src 'none'` |
| Configure hotlink protection | Referer rule at the CDN |
| Write `robots.txt` | Including the AI crawler entries |
| Complete the CI pipeline | Every gate in [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md) |
| Write the Playwright suite | Smoke tests per route family, plus axe-core over every route |
| Record field measurements | Cumulative Layout Shift and Largest Contentful Paint, with conditions |
| Publish the case study | At `/case-study/` |

**Exit criterion:** every enforced row in the verification matrix is green, and every measured row has a recorded value with a date.

## Deferred

Recorded rather than discarded, because the difference between deferred and forgotten is whether it is written down.

| Item | Trigger for revisiting |
|---|---|
| C2PA Content Credentials | Broader viewer support, or a specific reuse incident |
| Server-created Checkout Sessions | More than three concurrent limited editions, or any edition larger than 25 |
| Webhook fulfilment | Arrives with server-created sessions |
| A second and third gallery | After the first is deployed and measured |
| Arrow-key viewer navigation | Never, absent a native mechanism. It is the price of the budget |
| Wide-gamut delivery | If measurement shows sRGB conversion is visibly costing the work |
| Print inventory in the site | Only alongside server-created sessions |

## Sequencing note

M0 precedes everything because the guards it installs are what keep the later milestones honest, and M3 precedes M4 because a storefront attached to a viewer that does not work is a storefront nobody reaches. M2 and M1 could run in parallel with a second contributor and will not, because there is one author.
