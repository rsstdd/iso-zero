# IS0 ZER0 Gallery page specification

- **Status:** Draft
- **Route:** `/galleries/[slug]`
- **Example gallery:** `venice`
- **Governing documents:** `02_ARCHITECTURE.md` (Route inventory, Module boundaries, "Why the viewer avoids `:target`"); `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` (The content contract, EXIF, Derivative generation, Zero layout shift); `04_DESIGN_SYSTEM.md` (Colour, Typography, Geometry, The motifs, Layout); `05_INTERACTION_AND_ACCESSIBILITY.md` (in full — this is the owning document for the viewer this page renders); `06_COMMERCE_AND_LEGAL.md` (The print offer); `07_TESTING_SECURITY_AND_OPERATIONS.md` (The verification matrix, Image protection); `10_WIREFRAMES.md` §2, §3; `ADR 0001`
- **Conflict handling:** `00_DOCUMENTATION_MAP.md` requires that contradictory text be corrected in the same change and forbids writing code against an unresolved contradiction. §14 lists the amendments this document requires; none of them may be deferred past implementation.
- **Design:** `10_WIREFRAMES.md` §2 (grid), §3 (viewer)

## 1. Prerequisites

| Prerequisite | Owning artifact | State |
|---|---|---|
| Gallery content schema: `photos[]` with `src`, `originalKey`, `alt`, optional `caption`, required `exif`, optional `print` | `src/content.config.ts` | Present |
| At least one non-draft gallery with real, complete EXIF on every photo | `src/content/galleries/*.md` | `germany` and `verona` now validate; `venice` is mid-repair as of this session |
| `src/lib/originals.ts` | `src/lib/originals.ts` | Present |
| `RuleDatum.astro` | `src/components/RuleDatum.astro` | Present |
| A photo-grid component rendering figures and popover trigger buttons | `src/components/PhotoGrid.astro` | **Missing.** Named in `02_ARCHITECTURE.md`'s module boundaries; does not exist in the repository |
| A per-photograph popover component | `src/components/PhotoPopover.astro` | **Missing.** Same module list, same gap |
| `formatExif`: measured values in, display strings out | `src/lib/exif.ts` | **Missing** |
| `schema.org/ImageObject` JSON-LD builder | `src/lib/schema-org.ts` | **Missing**. Required by `07_TESTING_SECURITY_AND_OPERATIONS.md`'s Image protection §"Ownership in markup" |
| The dynamic route itself | `src/pages/galleries/[slug].astro` | **Missing.** See §14(a) — the repository currently has a hardcoded `src/pages/galleries/venice/index.astro` stub instead |
| Build-time script-emission assertion | `scripts/check-no-script.mjs` | Present |
| Build-time metadata assertion | `scripts/check-metadata.mjs` | Present |

Four of the five missing prerequisites are components or libraries this page cannot render without; the fifth is the route file itself. This page is greenfield work, unlike `/galleries/`, where most of the supporting infrastructure already existed.

## 2. Product intent

`/galleries/` is the catalog of catalogs. `/galleries/[slug]/` is the payload: the page whose entire content is photographs, which `01_PRODUCT_AND_ENGINEERING_BRIEF.md` §"What this is" names as the whole reason the zero-JavaScript budget is affordable ("if the interface is not carrying an image, it is competing with one"). Every other route on the site exists to get a viewer here.

The page has one job beyond display: let a viewer examine a photograph larger than its grid cell, with its technical circumstances attached, without leaving the page and without shipping a script to do it.

## 3. Locked decisions

| Decision | Statement | Basis |
|---|---|---|
| Draft galleries produce no route | `getStaticPaths` filters to non-draft galleries; a draft's slug 404s rather than rendering a preview | Consistent with `/galleries/`'s exclusion rule; `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`: draft galleries "do not render and are not linked" |
| No per-photograph URL | Trigger elements are `<button popovertarget>`, never `<a href>`. There is no larger-image page to link to | `02_ARCHITECTURE.md` §"Route inventory": "no `/photos/[id]` route... the archive has no addressable image page" |
| The viewer is zero bytes of script, not a small budget | The Popover API achieves the full interaction — open, close, Escape, light dismiss, focus restoration on dismiss — natively | `05_INTERACTION_AND_ACCESSIBILITY.md`: "Nothing here is scripted, and nothing here needs to be." See §14(c) for the contradicting figures this resolves |
| Grid uses mixed aspect ratios, not a fixed ratio | Each figure renders at its photograph's natural ratio; `grid-auto-flow: dense` packs around the variation | `04_DESIGN_SYSTEM.md` §"Layout": "Mixed aspect ratios are the normal case... cropping to a grid is the site editing the photographs." Contrast with `/galleries/`'s locked fixed 3:2 card ratio, which is a deliberate difference between the two routes, not an oversight |
| Photograph cap of 40 per gallery | Every popover for a gallery renders at build; document weight grows linearly with photo count | `05_INTERACTION_AND_ACCESSIBILITY.md` §"The viewer", carried as **[UNVERIFIED]** pending a measured document-weight curve, exactly as that document states it |
| No arrow-key navigation | Previous/Next are buttons, reachable by Tab, operable by Enter/Space | `05_INTERACTION_AND_ACCESSIBILITY.md` §"Keyboard model": "Arrow keys — Not implemented — Nothing." Accepted cost per `01_PRODUCT_AND_ENGINEERING_BRIEF.md` §"The budget, and what it costs" |
| No focus trap in the popover | `popover="auto"` does not trap focus or make the rest of the document inert; this is accepted, not treated as a defect | `05_INTERACTION_AND_ACCESSIBILITY.md` §"The focus-trap cost" — see §11 for the mitigations this page must carry |
| Popovers render after the grid, in one block, in document order | Every `PhotoPopover` instance is rendered by the page after the closing tag of `PhotoGrid`, not interleaved trigger-then-popover-then-trigger | This is what makes "tabbing past a popover's close button reaches the end of the document" true. Interleaving would mean tabbing out of photo *N*'s popover lands back inside the grid at photo *N+1*, which is a worse disorientation than the one `05_INTERACTION_AND_ACCESSIBILITY.md` already accepts |
| Print CTA is conditional, not a disabled state | A photo's popover includes a "View print" action only when `photo.print` is present; the button does not render at all otherwise — never a disabled or greyed-out button | `04_DESIGN_SYSTEM.md` §"Microcopy and voice": "State the constraint rather than apologising for it" |
| The gallery-level `cover` field is not rendered on this page | `cover`/`coverAlt` are consumed by `/galleries/` and the homepage directory only. This page renders every entry in `photos[]`, independent of whatever `cover` points to | Nothing in the schema or `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` requires `cover` to duplicate `photos[0]`; treating it as unrelated avoids assuming a constraint the schema does not enforce |

## 4. Page hierarchy

1. Skip link (`#main`, first focusable element — more consequential here than on any other route; see §11)
2. Header, with the "Galleries" nav item carrying `aria-current="location"` (already correct: `getHeaderCurrentState` matches `/^\/galleries\/[^/]+\/$/`, no change needed)
3. `<main>`
   - H1: gallery title (Plex Serif)
   - Body-lg description, max 65ch, rendered only if the gallery's `description` field is present
   - Datum tick, dividing the intro from the grid
   - The photo grid: one `<figure>` per photograph, each containing a trigger `<button popovertarget>` wrapping a `<picture>`, and a `<figcaption>` data plate
   - Every popover for the gallery, rendered as a single block immediately after the grid, each `<div popover id="p-NNNN" role="dialog">` containing the full-size `<picture>`, its data plate, and Previous/Next/Close buttons
4. Footer, identical to every other route

## 5. Desktop layout

Container: `--container-wide` (1400px / 87.5rem), consistent with every other gallery-bearing route.

Grid: CSS Grid with `grid-auto-flow: dense`, column count adapting by viewport rather than a fixed breakpoint list, per `04_DESIGN_SYSTEM.md` §"Layout". This is the route `DESIGN_SYSTEM.md` §3's "galleries 2/3-column with 8px gaps" note actually describes — unlike `/galleries/`'s directory grid, which borrowed that figure ambiguously (flagged in `GALLERIES_SPECIFICATION.md` §14(d)). Here, 8px is the inter-photograph gap; 2 or 3 columns is the approximate shape the dense algorithm produces at common viewport widths, not a hard rule this page enforces directly — see §14(e).

Each figure is sized from its own `aspect-ratio`, derived from the processed asset. No figure is cropped to fit a uniform cell.

## 6. Narrow-screen layout

Below the grid's first collapse point, columns reduce toward one; aspect ratios and data plates are preserved unchanged — nothing is cropped, truncated, or hidden for space, consistent with `/galleries/`'s narrow-screen rule.

## 7. Content contract

Per photograph, consumed from `photos[]`:

| Field | Rendered as |
|---|---|
| `src` | `<picture>` derivatives, both in the grid trigger and at full size inside the popover |
| `alt` | Composed into the trigger button's accessible name ("Open larger view: " + `alt`) and used directly as the popover's `<picture>` alt text |
| `caption` | Shown in the popover's data plate when present; a human-authored line, distinct from the generated EXIF block |
| `exif` | The data plate: camera, lens (or its absence — a manual/adapted lens reports nothing, per `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Nullability follows the equipment"), focal length, aperture, shutter, ISO, formatted by `formatExif` |
| `print` | Gates the popover's "View print" action, linking to `/prints/[sku]/`. Absent by default; nothing renders when it is absent |

At the gallery level: `title` (H1), `description` (optional intro paragraph), `location` (not necessarily rendered on this page directly — no wireframe evidence places it here beyond the intro copy; not asserted as a requirement). `date`, `cover`, `coverAlt`, and `draft` are consumed elsewhere (routing and the directory listings), not by this page's body.

## 8. Component boundary

```
src/pages/galleries/[slug].astro
  → components/PhotoGrid.astro       (figures + popovertarget triggers, one call)
  → components/PhotoPopover.astro    (one call per photo, rendered after PhotoGrid)
      → components/RuleDatum.astro   (data-plate hairline, shared motif)
  → lib/exif.ts                      (formatExif: measured values → display strings)
  → lib/schema-org.ts                (ImageObject JSON-LD, one per photo)
```

Per `02_ARCHITECTURE.md` §"Module boundaries", the page depends on components, components depend on `lib`, and `lib` imports nothing from either. `lib/originals.ts` is not read by this page at request time — it is consumed by Astro's build-time image pipeline through `image()` and by `scripts/extract-exif.mjs`, not by page code.

This document does not reuse the existing `DataPlate.astro` component for per-photo captions, for the reason recorded in `GALLERIES_SPECIFICATION.md` §14(f): that component renders a bordered spec-sheet box with a header/status/leader-dot layout, not the plain top-hairline pattern `04_DESIGN_SYSTEM.md` defines for the data-plate motif. This is the second route this applies to; see §14(f) below.

## 9. Image delivery

Grid trigger derivatives follow the standard pipeline (`03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Derivative generation"): AVIF, WebP, JPEG fallback, sRGB, widths drawn from {640, 960, 1280, 1600, 2048}. `sizes` is derived from the dense grid's approximate column behavior (§5), not copied from `/galleries/`'s fixed three-column `sizes` string, because the two grids size differently.

Popover (full-size) derivatives are capped at the same 2048px long-edge ceiling as every other delivered image — per `10_WIREFRAMES.md` §3's own diagram ("RESPONSIVE FULL-SIZE IMAGE, max 2048px long edge") and `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Image protection": "Derivatives capped at 2048px... Originals never enter `public/` or `dist/`." There is no larger, "true-original" tier ever served to a browser, in the popover or anywhere else.

"No large derivative loads before opening," per `10_WIREFRAMES.md` §3's Rules, is a claim about a `<picture>` sitting inside a closed `[popover]` element — whether every target browser actually defers that fetch until the popover opens is a real technical question this document does not resolve by assertion. It is carried as **[UNVERIFIED]**, alongside the popover-support question `07_TESTING_SECURITY_AND_OPERATIONS.md`'s verification matrix already tracks.

## 10. Visual system

| Concern | Application |
|---|---|
| Colour | `--bg`/`--text`/`--text-muted` throughout. No accent beyond the focus ring — this page has no "current location" indicator to spend a second accent moment on, so the two-places rule (`04_DESIGN_SYSTEM.md` §"The accent rule") resolves to one |
| Typography | Plex Serif for the H1; Plex Sans for the description; Plex Mono for every data plate, tabular numerals and slashed zeros applied throughout |
| Geometry | Every image at `border-radius: 0`, no exceptions. No shadow anywhere in the grid. The popover is the one documented exception to the no-shadow rule sitewide: `--shadow-lg`, warm-tinted, because "a popover floating over a full-bleed photograph needs separation that a hairline cannot provide against arbitrary image content" (`04_DESIGN_SYSTEM.md` §"Geometry") |
| Motifs | One datum tick, dividing the intro from the grid. One data plate per figure in the grid, and one (with `caption` and a "View print" action when present) inside each popover |
| Motion | The popover's appearance is the only animated state change on this page, per `05_INTERACTION_AND_ACCESSIBILITY.md` §"Reduced motion" — and it is native `popover` top-layer behavior, not a CSS transition this page authors. `prefers-reduced-motion` collapses whatever transition the browser supplies |

## 11. Accessibility

The full keyboard model, reproduced from `05_INTERACTION_AND_ACCESSIBILITY.md` §"Keyboard model" because this page is where it applies, not summarized or restated in different words:

| Key | Behaviour |
|---|---|
| Tab | Moves through grid triggers in document order |
| Enter or Space on a trigger | Opens that photograph's popover |
| Escape | Closes the open popover |
| Tab inside an open popover | Moves through previous, next, and close |
| Enter on previous or next | Closes the current popover, opens the neighbour |
| Arrow keys | Not implemented |

The focus-trap cost applies in full and is not softened here: `popover="auto"` does not trap focus and does not make the page behind it inert. A keyboard or screen-reader user who keeps tabbing past Close moves into the page behind the open popover, where the grid remains reachable. The mitigations this page must carry, per §3's locked rendering order: popovers block-rendered after the grid (tabbing past Close reaches the end of the document, not a loop back through the gallery), `role="dialog"` plus an `aria-label` derived from the photograph's alt text on every popover, Close as the last focusable element inside it.

Trigger buttons compose their accessible name rather than duplicate it: the photograph's `alt` serves the image inside the button, and the button itself carries "Open larger view: " prefixed to the same text, so a screen-reader user hears the description once as content and once as an action.

Data plates are read as definition-style lists (`<dl>`), so "Aperture, f slash 2.8" announces as a pair, not a fragment. `formatExif` output is written to be spoken as well as read.

Target size: grid triggers are the figures themselves, well over the 44×44px minimum; popover controls (Previous, Next, Close, View print) are each at least 44×44px, per WCAG 2.5.8.

Conformance target is WCAG 2.2 AA plus the three AAA criteria the project adopts as rules sitewide (`05_INTERACTION_AND_ACCESSIBILITY.md` §"Conformance target") — this page introduces no exception to that table. Reduced motion, skip link, and focus-visible behavior are inherited unchanged from the base layer.

## 12. Acceptance criteria

| # | Criterion |
|---|---|
| 1 | A route exists for every non-draft gallery and for none of the draft ones |
| 2 | The grid renders every photo in `photos[]`, in array order |
| 3 | Every trigger button's accessible name is "Open larger view: " followed by that photo's `alt` |
| 4 | Every popover carries `role="dialog"` and an `aria-label` matching its photo's `alt` |
| 5 | Escape and light dismiss close the open popover; focus returns to the invoking trigger |
| 6 | Previous/Next close the current popover and open the neighbouring one |
| 7 | Tabbing past a popover's Close button reaches the end of the document, not back into the grid |
| 8 | "View print" appears only on photos carrying a `print` object, and links to `/prints/[sku]/` |
| 9 | Zero `<script>` bytes in the emitted route |
| 10 | Every image has explicit `width`, `height`, `aspect-ratio` and produces zero measured layout shift |
| 11 | No GPS and correct IPTC creator/copyright in every delivered derivative, popover-size included |
| 12 | Zero axe-core violations at WCAG 2.2 AA |
| 13 | A gallery exceeding 40 photographs is rejected at build, not silently accepted |

## 13. Verification

| Criterion (§12) | Status | Evidence |
|---|---|---|
| 1, 2 | Enforced | `getStaticPaths` filter plus a build-time or contract-test assertion over rendered photo order |
| 3, 4 | **[UNVERIFIED]** | No automated check for accessible-name composition or `aria-label` correctness is recorded in `07_TESTING_SECURITY_AND_OPERATIONS.md`; axe-core covers name/role/value generally but not this specific composition rule |
| 5, 6, 7 | Measured | Manual keyboard script per browser, recorded per release, per `07_TESTING_SECURITY_AND_OPERATIONS.md` §"The verification matrix" row "Keyboard traversal of gallery and viewer" |
| 8 | Enforced | Schema: `print` presence is a build-time fact, not a runtime guess; a contract test can assert the CTA's conditional rendering directly |
| 9 | Enforced | `scripts/check-no-script.mjs` |
| 10 | Measured | Field CLS measurement, recorded per release |
| 11 | Enforced | `scripts/check-metadata.mjs` |
| 12 | Enforced | Playwright plus axe-core over every built route |
| 13 | **[UNVERIFIED]** | No build assertion for the 40-photo cap exists yet. `05_INTERACTION_AND_ACCESSIBILITY.md` states the cap as a placeholder pending a document-weight measurement, not yet as an enforced rule — this document does not overstate that gap |

`07_TESTING_SECURITY_AND_OPERATIONS.md`'s **[UNVERIFIED]** rows "Popover support covers the actual audience" and "Document weight scales acceptably with gallery size" apply directly to this page and are not restated as new findings — they are the same open questions, on the route they are actually about.

## 14. Amendments required in the same change

| # | Document | Defect | Required amendment |
|---|---|---|---|
| a | `02_ARCHITECTURE.md` / repository | The route inventory names `src/pages/galleries/[slug].astro` as this route's source. The repository has no such file — only a hardcoded `src/pages/galleries/venice/index.astro` stub, which does not scale to a second gallery without manually duplicating folders | Replace the stub with the documented dynamic route before this page is implemented for real. This is a prerequisite (§1), not just a documentation fix |
| b | `10_WIREFRAMES.md` | §2's "No-JavaScript behavior" note states each image becomes "a normal link to its bounded large derivative." This contradicts `02_ARCHITECTURE.md`'s "no per-photograph permalink... nothing to link to," contradicts the button-based (not anchor-based) trigger model in `05_INTERACTION_AND_ACCESSIBILITY.md`, and contradicts `02_ARCHITECTURE.md`'s own stated degradation for browsers without Popover API support: "the trigger buttons do nothing," not "become links" | Correct or remove the note. This document treats inert (non-functional) buttons as the correct degraded state, per `02` and `05`'s ownership of rendering model and viewer interaction respectively |
| c | `10_WIREFRAMES.md` / `12_REQUIREMENTS_TRACEABILITY.md` | §3's Rules state "The script remains at or below 3 KB Brotli," and `12`'s disposition table separately describes "viewer enhancement ≤3KB Brotli." Both contradict `05_INTERACTION_AND_ACCESSIBILITY.md`'s explicit "Nothing here is scripted, and nothing here needs to be," and both contradict the build-enforced zero-script assertion (`scripts/check-no-script.mjs`, CSP `script-src 'none'`) | Correct both to state zero bytes. These read as residue from the rejected custom-lightbox alternative `12` records under ADR 0001 ("Native popover per image — Retained as rejected production alternative") — the budget figure for the alternative appears to have survived past the point the alternative itself was rejected |
| d | `12_REQUIREMENTS_TRACEABILITY.md` (ADR 0001) | ADR 0001 is cited as authoritative for the popover-versus-custom-lightbox decision, but no such document exists in the repository — only a one-line disposition. This is the same defect as ADR 0002 in `GALLERIES_SPECIFICATION.md` §14(c), now found a second time | Write ADR 0001 as an actual document. Two missing ADRs cited as governing documents is no longer a one-off gap |
| e | `DESIGN_SYSTEM.md` (vendored, non-authoritative) | §3's "galleries 2/3-column with 8px gaps" describes a fixed column count, while `04_DESIGN_SYSTEM.md` (authoritative) describes an adaptive `grid-auto-flow: dense` model with no fixed breakpoint list. These are two different layout mechanisms, not a units mismatch | This document follows `04_DESIGN_SYSTEM.md` per its documentation-map ownership and treats "2/3-column" as an approximate, non-binding description of the dense algorithm's typical output, not a rule this page implements directly |
| f | `DataPlate.astro` (component) | Renders a bordered spec-sheet box with header/status/leader-dot rows, not the plain top-hairline pattern `04_DESIGN_SYSTEM.md` §"The data plate" defines. `GALLERIES_SPECIFICATION.md` §14(f) flagged this once already for the directory-card route; this document is the second route it blocks | Resolve in the component itself — either add a plain hairline variant or split the spec-sheet layout into a differently named component — rather than a third route routing around it independently |

Per this document's own header, none of these six may be deferred past implementation of this route.

## 15. Correction log

| Correction | Reason |
|---|---|
| Degraded (no-Popover-API) state described as inert buttons, not links to a larger derivative | The wireframe's note contradicts the architecture and accessibility documents' explicit rules; see §14(b) |
| Viewer script budget stated as zero bytes, not "≤3KB Brotli" | Contradicts `05_INTERACTION_AND_ACCESSIBILITY.md` and the build-enforced assertion; see §14(c) |
| `DataPlate.astro` not reused for per-photo captions; the plain `.data-plate` motif class used directly instead | Same reasoning as `GALLERIES_SPECIFICATION.md` §14(f), now applied a second time; see §14(f) |
| Grid layout follows `04_DESIGN_SYSTEM.md`'s adaptive dense model, not the vendored fixed "2/3-column" note | `04_DESIGN_SYSTEM.md` is the authoritative document per `00_DOCUMENTATION_MAP.md`; see §14(e) |
| All citations in this document use heading names, not numbered `§N` references, except for `10_WIREFRAMES.md`, which genuinely has numbered sections | Learned from `GALLERIES_SPECIFICATION.md` §14(a) — `02`, `03`, `04`, `05`, `06`, `07` have no numbered headings, so a `§N` citation for any of them does not resolve to anything |
| "Example gallery: `venice`" named for concrete illustrative examples only, not a distinct feature of this route | Consistent with the same call made in `GALLERIES_SPECIFICATION.md` §15 for "Featured gallery" |

## 16. Downstream asset impact

| Asset | Impact |
|---|---|
| `src/layouts/Base.astro` / `SiteHeader.astro` | No change needed — `aria-current="location"` for `/galleries/[slug]/` is already handled by the existing `getHeaderCurrentState` pattern (`/^\/galleries\/[^/]+\/$/`) |
| `/prints/[sku]/` | Becomes reachable for the first time through a real "View print" link. That route's own spec is a separate, not-yet-written document |
| `schema-org.ts` | This page is its first real consumer, for the `ImageObject` JSON-LD `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Image protection" requires ("Ownership in markup") |
| `exif.ts` | This page is its first real consumer. `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Test strategy" names `formatExif`'s exposure-time reciprocal rounding as exactly the kind of function worth a unit test — building it here should not skip that |
| Social/OG image | Should plausibly use the gallery's `cover` image for link unfurls, matching the homepage's `heroSocialImage` pattern — not required by any governing document today, so not added to §1 as a prerequisite |
| Sitemap | Every non-draft gallery's route belongs in any generated sitemap, same **[UNVERIFIED]** status as `GALLERIES_SPECIFICATION.md` §16 already recorded — no sitemap generation is described anywhere in the governing documents |
| `robots.txt` | No exclusion; the AI-crawler entries apply identically to this route's images |
