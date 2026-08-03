# Verification suites

The root project contains the production-route suite and the isolated contracts for the reusable homepage components.

| Suite | Configuration | Scope |
| --- | --- | --- |
| Homepage | `playwright.homepage.config.ts` | Composition, metadata, routes, reflow, accessibility, zero script |
| Header | `playwright.header.config.ts` | Navigation contract and current-route behavior across built routes |
| Footer | `playwright.footer.config.ts` | Navigation, build identity, route resolution, reflow, accessibility |
| Homepage Identity | `playwright.homepage-identity.config.ts` | Literal copy, heading ownership, Datum, reflow, accessibility |
| Data Plate | `playwright.data-plate.config.ts` | Semantic roots, styling, failure paths, reflow, accessibility |
| Featured Gallery | `playwright.featured-gallery.config.ts` | Image pipeline, compound link, formatters, model failures, reflow, accessibility |

`npm run verify:static` runs diagnostics, type/prop/failure checks, unit tests, the production build, route checks, and zero-script assertions. `npm run verify` adds every Chromium browser suite. Firefox, WebKit, and the manual records under `tests/manual/` remain release-environment checks.
