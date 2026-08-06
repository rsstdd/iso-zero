# IS0 ZER0 Galleries specification

- **Status:** Draft
- **Route:** `/galleries`
- **Featured gallery:** `venice`
- **Governing documents:** `04_DESIGN_SYSTEM.md` §2, §3, §5, §8, §9; `10_WIREFRAMES.md` §1; `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §3, §6; `07_TESTING_SECURITY_AND_OPERATIONS.md` §7; `ADR 0002`
- **Conflict handling:** `00_DOCUMENTATION_MAP.md` requires that contradictory text be corrected in the same change and forbids writing code against an unresolved contradiction. §14 lists the amendments this document requires; none of them may be deferred past implementation.
- **Design:** `10_WIREFRAMES.md`

## 1. Prerequisites

The following must exist before `src/pages/galleries/index.astro` is written, because this page reads them rather than defines them.

| Prerequisite | Owning artifact | State |
|---|---|---|
| Gallery content schema: `title`, `date`, optional `location`, optional `description`, cover image, ordered `photos` array, `draft` flag | `src/content.config.ts` | Assumed present per `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §1. Not independently verified against the schema file itself — **[UNVERIFIED]** |
| At least one non-draft gallery with a complete cover image and alt text | `src/content/galleries/*.md` | `venice` is the example used throughout this document |
| Flattened design tokens, dark-only profile | `src/styles/design-tokens.css` | Per `04_DESIGN_SYSTEM.md` §"Vendoring, and the Tailwind problem" |
| `DataPlate.astro`, `RuleDatum.astro` | `src/components/` | Per `02_ARCHITECTURE.md` §"Module boundaries" |
| A reusable gallery-card component (image, title, count, data plate) | `src/components/` | The homepage directory already spec's this pattern; this route consumes the same component rather than a route-specific one. If no such component exists yet, it is a shared prerequisite of both routes, not a galleries-only build item |
| `src/lib/originals.ts` cover-image resolution | `src/lib/originals.ts` | Per `02_ARCHITECTURE.md` §"The originals boundary". `README.md` records this file as currently missing from the repository — a blocking prerequisite, not a documentation gap |
| Base layout: header, nav with `aria-current` on "Galleries", footer, skip link | `src/layouts/Base.astro` | Shared across every route |

The originals-resolver gap recorded in `README.md`'s "Known drift" table blocks this route exactly as much as it blocks every other route that renders an image. It is listed here because a prerequisite section that omits a known blocker is misleading, not because this document introduces the finding.

## 2. Product intent

The homepage presents an excerpt: a hero and a small, curated set of featured galleries, sized to fit above and just below the fold. `/galleries` presents the complete, unfiltered catalog — every non-draft gallery, newest first, with no curation and no cap.

The two routes serve the same audience for different intents. Per `01_PRODUCT_AND_ENGINEERING_BRIEF.md` §"Audiences", the viewer arrives for the photographs; the homepage is the front door and `/galleries` is the shelf. A reader who wants to browse everything, rather than sample the front page's selection, lands here. The page adds no interpretation of its own — no grouping, no filtering, no search, consistent with the non-goals recorded in `01_PRODUCT_AND_ENGINEERING_BRIEF.md` §"Non-goals". Ordering by publication date is the entire organizing principle, and it is enough, because the catalog is small by design.

## 3. Locked decisions

| Decision | Statement | Basis |
|---|---|---|
| Sort order | Newest first, by gallery `date` | `02_ARCHITECTURE.md` §"Route inventory", stated verbatim for `/galleries/` |
| Draft handling | Draft galleries are excluded entirely, not shown greyed-out or behind a flag | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"The content contract": a gallery with no photographs is a draft, and `draft: true` is how a draft is expressed |
| No promoted or enlarged card | Every card in the grid is rendered identically. "Featured gallery: `venice`" in this document's header names the gallery used for concrete illustrative examples below, not a distinct UI treatment | `02_ARCHITECTURE.md` describes `/galleries/` only as "newest first"; no wireframe defines a promoted-card pattern for this route. See §14(e) |
| No viewer, no popover | Cards link directly to `/galleries/[slug]/`. This route renders no photograph large enough to need the modal viewer, so it carries none of that component's markup or CSS | `05_INTERACTION_AND_ACCESSIBILITY.md` scopes the popover viewer to the photograph grid inside an individual gallery |
| Card aspect ratio | Every card's cover image renders at one fixed aspect ratio across the grid (3:2), rather than the mixed-ratio treatment used inside a single gallery | `10_WIREFRAMES.md` §1 shows uniform featured cards on the homepage; `04_DESIGN_SYSTEM.md` §"Layout" reserves mixed ratios for the photograph grid specifically. A directory of covers reads as a catalog, not as a curated sequence, and a fixed ratio is what makes the grid predictable at any gallery count |
| No card chrome | Cards carry no background fill, no border, and no radius beyond the image's own `border-radius: 0`. Title, count, and data plate stack directly under the image | `10_WIREFRAMES.md` §1's featured-card diagram shows no card boundary, only image, title line, and data plate |
| Empty state | If zero non-draft galleries exist, the page still builds and renders the header, one sentence of plain body text, and the footer. This is a build-safety floor, not a designed feature — it is out of scope beyond not crashing | `01_PRODUCT_AND_ENGINEERING_BRIEF.md` §"Out of scope for the first release" treats catalog scale beyond one gallery as future work; the reverse case (zero) gets the same minimal treatment |
| Container | `--container-wide` (1400px / 87.5rem) | `04_DESIGN_SYSTEM.md` §"Layout": "Gallery grids" use `container-wide` |

## 4. Page hierarchy

1. Skip link (first focusable element, `#main`)
2. Header: wordmark, nav with "Galleries" carrying `aria-current="page"`
3. `<main>`
   - H1: "Galleries" (Plex Serif, sentence case)
   - One sentence of body copy, authored directly in the page, not sourced from the content collection (no route-level copy field exists in the gallery schema). Sentence case, no exclamation points, per `04_DESIGN_SYSTEM.md` §"Microcopy and voice"
   - Datum tick (`.rule-datum`) dividing the intro from the grid
   - Grid of gallery cards, one per non-draft gallery, newest first
4. Footer: commit/release identity, Colophon, Impressum, Privacy — identical to every other route

No secondary navigation, no pagination, no filter controls. The catalog is small enough that a single flat grid is legible at its current and near-term size; pagination is not addressed by any governing document and is not introduced here.

## 5. Desktop layout

Container: `--container-wide`, 1400px maximum, matching `10_WIREFRAMES.md` §1's stated container for the homepage.

Grid: CSS Grid, three columns at the container's full width, two columns between roughly 640px and 1199px, one column below that. Column count is fixed per breakpoint rather than `auto-fit`/`minmax`, because every card holds the same fixed-ratio image and a variable-width response would produce cards of inconsistent size for no benefit.

Gaps between cards use the "between components" spacing band (24–48px) from `DESIGN_SYSTEM.md` §3, not the 8px figure the same section states for "galleries" grids. That 8px figure describes inter-photograph spacing inside a single gallery's mixed-ratio grid (`/galleries/[slug]/`), not the card grid on this route — see §14(d). This document fixes the card gap at 32px, the nearest value in the documented working subset (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) to the midpoint of the component band.

Page-edge gutters follow the documented breakpoint values: 20px, 32px, 40px, per `DESIGN_SYSTEM.md` §3.

## 6. Narrow-screen layout

Below 640px, the grid collapses to one column at full container width less gutters. Card internal structure (image, title, count, data plate) does not change shape at narrow widths — only the column count changes. No content is hidden or truncated at narrow widths; the location field, when present, remains visible rather than being dropped for space.

## 7. Content contract

Each card consumes, per gallery:

| Field | Source | Rendered as |
|---|---|---|
| `title` | Gallery frontmatter | H2, Plex Serif, inside the card's link |
| `date` | Gallery frontmatter, ISO 8601 | Determines sort order; not necessarily displayed as a separate visible string beyond what the data plate carries |
| Photograph count | `photos.length` at build | "N photographs", tabular numerals per `04_DESIGN_SYSTEM.md` §"Numeric discipline" |
| `location` | Gallery frontmatter, optional | Shown in the data plate when present; omitted, not blanked, when absent |
| Cover image | Gallery frontmatter | `<picture>` with AVIF/WebP/JPEG sources, explicit `width`/`height`/`aspect-ratio` |
| Cover image alt text | Assumed to carry the same non-whitespace requirement as a photograph's `alt` field, per `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Alt text" — **[UNVERIFIED]** against the actual shape of the cover-image field in `src/content.config.ts` |

Description is part of the schema per `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"The content contract" but is not rendered on this route: no wireframe or homepage precedent shows description text on a directory card, and adding it here without evidence would be a design decision this document is not positioned to make.

## 8. Component boundary

```
src/pages/galleries/index.astro
  → components/GalleryCard.astro   (shared with the homepage directory excerpt)
      → components/DataPlate.astro
  → components/RuleDatum.astro
  → layouts/Base.astro
```

The page reads the gallery collection directly (sorted, filtered by `draft`) and passes each entry to the card component. Per `02_ARCHITECTURE.md` §"Module boundaries", nothing here imports from `lib` directly except through the card component's own use of `src/lib/originals.ts` for cover-image resolution; the page itself holds no image-resolution logic. `src/lib/exif.ts`, `money.ts`, and `schema-org.ts`'s `Product` builder are not consumed by this route — there is no EXIF and no commerce content at this level. `schema-org.ts`'s `ImageObject`/`CollectionPage` builder, if one exists for collection-level structured data, is a candidate consumer; this is not asserted as a requirement in the absence of a spec covering it.

## 9. Image delivery

Cover images follow the standard derivative pipeline in `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Derivative generation": AVIF, WebP, JPEG fallback in one `<picture>`, sRGB, 2048px long-edge ceiling, widths drawn from {640, 960, 1280, 1600, 2048} subject to the source and the ceiling.

`sizes` is derived from the grid defined in §5, not authored as a flat guess: at the container's full 1400px width with three columns and 32px gaps, each card is approximately 445px wide; at two columns, approximately 50vw minus gutter and half-gap; at one column, approximately 100vw minus gutters. The exact `sizes` string is computed from these breakpoints rather than copied from the homepage's two-card `sizes` value, because the column counts differ.

Every card's `<figure>` carries explicit `width`, `height`, and `aspect-ratio` derived from the processed asset at the locked 3:2 ratio (§3), per `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Zero layout shift". Embedded-metadata handling (GPS stripped, IPTC creator and copyright re-embedded) applies identically to cover-image derivatives, per §"Embedded metadata" — there is no metadata exemption for images used as thumbnails.

## 10. Visual system

| Concern | Application |
|---|---|
| Colour | `--bg` canvas, `--text` for title, `--text-muted` for count and data plate. No accent orange on this route beyond the header's persistent `aria-current` cue and the datum tick's origin mark — a page carrying orange in more than two places has diluted it, per `04_DESIGN_SYSTEM.md` §"The accent rule" |
| Typography | Plex Serif for gallery titles (explicitly listed as a Display use in `04_DESIGN_SYSTEM.md` §"Typography"); Plex Mono for the data plate, tabular numerals and slashed zeros already applied |
| Geometry | Cover images at `border-radius: 0`, no exceptions. No shadow on any card — elevation is not used because cards carry no surface to elevate from the canvas |
| Motifs | One datum tick, dividing intro copy from the grid. One data plate per card |
| Motion | None beyond the inherited link-hover underline strengthening (1px to 2px) on the card title. No scale, no opacity fade, no lift — `04_DESIGN_SYSTEM.md` §"Motion" reserves motion for focus, hover, and popover state, and this route has no popover |

## 11. Accessibility

Each card is a single compound link wrapping the image and title, per `04_DESIGN_SYSTEM.md` §"Link contract": the outer anchor's decoration is removed only because the title text inside retains a persistent underline, which is the visible link affordance the rule requires. The cover image alone, or a hover-only change, never serves as the sole affordance.

Per `05_INTERACTION_AND_ACCESSIBILITY.md` §"Keyboard model", cards are plain anchors in document order — Tab moves through them, Enter follows the link, and there is no custom keyboard behavior to specify because there is no popover on this route. Target size (WCAG 2.5.8) is met trivially, since each card's clickable region is far larger than 44×44px.

Screen-reader behavior: each card announces as a link with the gallery title as its accessible name; the photograph count and location, if read as part of the same link versus as adjacent text, is a component-level decision inherited from wherever `GalleryCard.astro` is specified, not redefined here. Alt text on the cover image remains required and non-whitespace, per §7.

WCAG 2.2 AA applies site-wide per `05_INTERACTION_AND_ACCESSIBILITY.md` §"Conformance target"; this route introduces no exception to that table. The skip link, focus-visible outline, and `aria-current` navigation cue all apply unchanged.

## 12. Acceptance criteria

| # | Criterion |
|---|---|
| 1 | `/galleries/` renders every non-draft gallery and no draft gallery |
| 2 | Cards are ordered newest first by `date` |
| 3 | Zero `<script>` bytes in the emitted route |
| 4 | Every card image has non-whitespace alt text |
| 5 | Every card's `<figure>` has explicit `width`, `height`, `aspect-ratio` and produces zero measured layout shift |
| 6 | No GPS coordinates and correct IPTC creator/copyright in delivered cover-image derivatives |
| 7 | Zero axe-core violations at WCAG 2.2 AA over the built route |
| 8 | Keyboard-only traversal reaches every card and the footer in document order, with no trap |
| 9 | The "Galleries" nav item carries `aria-current="page"` when this route is active |
| 10 | Grid renders one, two, or three columns correctly at the breakpoints in §5 |
| 11 | Build succeeds and renders the empty-state sentence when the gallery collection contains zero non-draft entries |

## 13. Verification

| Criterion (§12) | Status | Evidence |
|---|---|---|
| 1, 2 | Enforced | Build-time query filter and sort assertion, or a Vitest contract test against the collection query |
| 3 | Enforced | `scripts/check-no-script.mjs` over `dist/galleries/index.html`, per `07_TESTING_SECURITY_AND_OPERATIONS.md` §"The verification matrix" |
| 4 | Enforced | Schema refinement, per `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Alt text" — contingent on §7's unverified assumption about the cover-image field shape |
| 5 | Measured | Field CLS measurement, recorded per release, per `07_TESTING_SECURITY_AND_OPERATIONS.md` §"The verification matrix" |
| 6 | Enforced | `scripts/check-metadata.mjs` |
| 7 | Enforced | Playwright plus axe-core over every built route, including this one |
| 8 | Measured | Manual keyboard script per browser, recorded per release |
| 9 | **[UNVERIFIED]** | No automated check for `aria-current` correctness is recorded in `07_TESTING_SECURITY_AND_OPERATIONS.md`; this criterion needs either an axe-core rule extension or a manual check added to the matrix |
| 10 | **[UNVERIFIED]** | No visual-regression tooling is named in `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Test strategy"; breakpoint correctness is presently a manual review item |
| 11 | **[UNVERIFIED]** | No content-collection fixture for a zero-gallery state is described anywhere in the governing documents |

Server logs, per `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Monitoring", separately answer which galleries are visited from this index — relevant operational signal, not a launch-blocking criterion.

## 14. Amendments required in the same change

| # | Document | Defect | Required amendment |
|---|---|---|---|
| a | `04_DESIGN_SYSTEM.md` | This document's own header cites "§2, §3, §5, §8, §9," but `04_DESIGN_SYSTEM.md` has no numbered sections. Under the closest available numbering (the vendored `DESIGN_SYSTEM.md`, sections 0–8), §9 does not exist either way | Number `04_DESIGN_SYSTEM.md`'s headings, matching `10_WIREFRAMES.md`'s convention, or change this document's citation style to heading names site-wide. This document uses heading names throughout (Colour, Typography, Geometry, The motifs, Layout) pending that fix |
| b | `04_DESIGN_SYSTEM.md` | `00_DOCUMENTATION_MAP.md` assigns "colour tokens, typography, spacing, geometry" to `04_DESIGN_SYSTEM.md` as sole source of truth, but the file has no spacing section. The 4px base scale, working subset, and component/section gap bands exist only in the non-authoritative vendored `DESIGN_SYSTEM.md` §3 | Port a Spacing section into `04_DESIGN_SYSTEM.md`. §5 and §6 of this document cite the vendored file's numbers pending that port and flag the source explicitly |
| c | `12_REQUIREMENTS_TRACEABILITY.md` / ADR 0002 | The traceability table records ADR 0002 as replacing the bounded-frontmatter-key EXIF design with "a sidecar generated manifest." `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Generated data lives in the authored file, bounded to one key" argues for the opposite: the frontmatter-key design as implemented, with the sidecar manifest named as the alternative not taken. No ADR 0002 document exists in the repository to adjudicate. Per the documentation map, `03` is the assigned owner of "EXIF extraction and generated regions," so this document treats the frontmatter-key design as authoritative | Correct the traceability row, or reconcile it with `03`, and add ADR 0002 as an actual document rather than a one-line disposition. This is the most consequential open contradiction of the five, because it concerns a content-schema shape rather than a citation format |
| d | `DESIGN_SYSTEM.md` | §3's note "galleries 2/3-column with 8px gaps" is ambiguous between the photo grid inside `/galleries/[slug]/` and the directory grid at `/galleries/`. This document assumes the former | Disambiguate the term at the source, naming the specific route or component each spacing rule governs |
| e | `10_WIREFRAMES.md` | This document's header cites "§1" (Homepage) as its design reference, because no wireframe exists for `/galleries/` specifically. §2 documents a different route (`/galleries/[slug]/`) | Add a dedicated `/galleries/` wireframe. Until it exists, §3–§6 of this document extend the Homepage's featured-card diagram, which is an inference rather than a specification |

Per this document's own header, none of these five may be deferred past implementation of this route.

## 15. Correction log

| Correction | Reason |
|---|---|
| Citations for `04_DESIGN_SYSTEM.md` given as heading names, not the header's numeric §N | §N does not resolve to any location in the document; see §14(a) |
| Spacing values (32px card gap, 20/32/40px gutters) sourced from `DESIGN_SYSTEM.md` §3 with the source flagged inline, rather than asserted as if `04_DESIGN_SYSTEM.md` defined them | `04_DESIGN_SYSTEM.md` currently has no spacing section; see §14(b) |
| EXIF/content-contract language in §7 follows `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`'s current text, not ADR 0002's summarized disposition in `12_REQUIREMENTS_TRACEABILITY.md` | The two sources disagree and no ADR document exists to settle it; `03` is the documented owner of this concern; see §14(c) |
| "Featured gallery: `venice`" treated as this document's illustrative example, not as a distinct promoted-card UI pattern | No wireframe or architecture text defines a featured treatment for `/galleries/`; inventing one would be an undocumented design decision |
| Directory-grid pattern derived from `10_WIREFRAMES.md` §1 (Homepage) rather than §2 (Gallery), because §2 documents `/galleries/[slug]/`, a different route | See §14(e) |
| Card gap distinguished from the "8px" photo-grid gap in `DESIGN_SYSTEM.md` §3 | The two grids are different components; conflating them would under-space the directory |

## 16. Downstream asset impact

| Asset | Impact |
|---|---|
| `src/layouts/Base.astro` nav | "Galleries" item requires `aria-current="page"` logic keyed to the active route, shared with `/galleries/[slug]/` |
| Homepage directory excerpt | Should link to `/galleries/` as its "view all" destination, if such a link exists on the homepage; not introducing one here, since the homepage's own spec owns that decision |
| `GalleryCard.astro` | Becomes a two-consumer component (homepage excerpt and this route) rather than homepage-only. Any homepage-specific assumption baked into it (for example, a hardcoded two-item layout) must be generalized before this route can reuse it |
| Sitemap | `/galleries/` is a real, indexable route and belongs in any generated sitemap; not separately specified here because no sitemap generation is described in the governing documents — **[UNVERIFIED]** |
| `robots.txt` | No exclusion. The AI-crawler entries in `07_TESTING_SECURITY_AND_OPERATIONS.md` §"Image protection" apply to this route's images identically to every other gallery-bearing route |
| Structured data | If a `CollectionPage` or `ItemList` JSON-LD builder is added to `schema-org.ts`, this route is its first consumer. Not required by any governing document today, so not treated as a prerequisite in §1 |
| Content authoring workflow | No change to `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §"Adding a photograph" — publishing a gallery already surfaces it here automatically, since this route derives entirely from the collection query rather than from any manually maintained index |
