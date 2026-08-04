# IS0 ZER0 homepage specification

- **Status:** implementation-ready
- **Route:** `/`
- **Featured gallery:** `venice`
- **Governing documents:** `04_DESIGN_SYSTEM.md` §2, §3, §5, §8, §9; `10_WIREFRAMES.md` §1; `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` §3, §6; `07_TESTING_SECURITY_AND_OPERATIONS.md` §7; `ADR 0002`
- **Conflict handling:** `00_DOCUMENTATION_MAP.md` requires that contradictory text be corrected in the same change and forbids writing code against an unresolved contradiction. §14 lists the amendments this document requires; none of them may be deferred past implementation.

## 1. Prerequisites

Four repository-level decisions block implementation. The homepage is the first styled route, so it is the point at which each becomes unavoidable.

| Prerequisite | Conflict | Required action |
|---|---|---|
| Content schema migration | `src/content.config.ts` still nests generated `exif` in authored frontmatter; `ADR 0002` moved it to a sidecar manifest keyed by photo ID | Migrate before adopting §7, because §7 assumes the post-ADR shape |
| Styling toolchain | `astro.config.mjs` loads `@tailwindcss/vite` and `design-tokens.css` is written around `@theme`, while `11_AI_IMPLEMENTATION_PROTOCOL.md` §6 forbids utility frameworks | Resolve explicitly; record the outcome as an ADR |
| React dependency | `02_ARCHITECTURE.md` §7 permits no React dependency until an island exists with accepted justification. This page has no island | Remove `react`, `react-dom`, `@astrojs/react` |
| Font delivery | `04_DESIGN_SYSTEM.md` §3 requires self-hosted subsets with `font-display: swap` | Subsets must retain `zero.alt01`, which is reached through the `zero` feature rather than a codepoint and is dropped by a naive subset. Declare metric-compatible fallbacks with `size-adjust`, because `swap` without them reflows every plate on this page |

## 2. Product intent

The homepage is an entrance to the photography, not a marketing page. Its primary action is entering the featured Venice gallery. The gallery directory remains present even with one gallery so the structure expands without redesign.

## 3. Locked decisions

| Concern | Decision |
| --- | --- |
| Wordmark | `IS0 ZER0` in the sticky header, linking `/`. Not a heading |
| Page title | `display-xl` `h1` placed after the datum rule, per `04 §8` and `10 §1` |
| Authorship | `Photographs by Ross Todd` appears in the `body-lg` lead and in the footer copyright. It is not a second heading |
| Primary navigation | `Galleries` only. `Index`, `Prints`, and `About` are removed because the wordmark serves the index and no prints index or About route exists in `01 §4` |
| Secondary navigation | Colophon, Impressum, and Privacy in the footer, per `10 §1` |
| Hero | Fixed signature photograph `_DSF0140.JPG`, 2048 × 1155, spanning `container-wide` |
| Image treatment | Full composition at every width. Never cropped. `object-fit: contain` |
| Hero height | Uncapped. Intrinsic ratio at the available inline size. See §9 for the reason the previous `72svh` cap was removed |
| Hero interaction | Photograph and metadata plate form one link |
| Entry cue | `Enter gallery`, rendered as non-interactive text inside that link |
| Directory | Responsive grid with a data plate on every item, per `04 §8` |
| Dates in plates | ISO 8601. `2026-08-01` in the hero plate, `2026` in the directory plate |
| Gallery title | `Venice` |
| Displayed location | `Venice, Italy` |
| Photograph count | `12 photographs` |

## 4. Page hierarchy

1. Skip link to `#main`, first focusable element.
2. Sticky `SiteHeader`: wordmark linking `/`, and `Galleries`.
3. `<main id="main">`.
4. Featured hero: linked `<figure>` containing the photograph and its data plate.
5. `.rule-datum`.
6. `h1` in `display-xl`, the only `h1` on the page.
7. `body-lg` lead, capped at 65ch.
8. Gallery directory grid.
9. `SiteFooter` with Colophon, Impressum, Privacy, copyright, and build identity.

This order restores `04 §8` ("Datum rule separates the hero from the title") and `10 §1`. The previous draft placed the identity block above the hero and used the datum rule to introduce the directory, which inverted both.

Launch copy:

```text
h1        Photographs, field notes, and limited prints.
body-lg   An archive of structures, coastlines, machines, and working
          landscapes. Photographs by Ross Todd.
```

## 5. Desktop layout

- `container-wide`, 87.5rem maximum, with page gutters of `--space-12` (48 px) at `md` and above.
- Sticky header on an opaque or lightly translucent `--bg` surface with a bottom hairline in `--border-c`. Backdrop blur is optional and must not reduce text contrast or scrolling performance.
- `Galleries` sits at the opposite inline edge from the wordmark.
- The photograph renders at its intrinsic 2048:1155 ratio with `width: 100%`, `height: auto`, and `object-fit: contain`.
- The hero data plate sits directly beneath the photograph: title and location together, then publication date, photograph count, and the entry cue as a compact secondary group where space permits.
- The directory uses `repeat(auto-fill, minmax(300px, 1fr))` with 8 px gaps, resolving to two or three columns at desktop widths. A single gallery occupies one cell.
- Directory items use the gallery `cover` image, which must differ from the hero photograph. Hover applies `filter: brightness(0.85)` or `opacity: 0.9` only. No transform, no radius transition.

Vertical rhythm, all values from the `04 §5` four-pixel scale:

| Break | ≥ `md` | < `md` |
|---|---:|---:|
| Header hairline to hero | `--space-16` 64 | `--space-8` 32 |
| Hero block to datum rule | `--space-24` 96 | `--space-16` 64 |
| `h1` to lead | `--space-6` 24 | `--space-6` 24 |
| Lead to directory | `--space-24` 96 | `--space-16` 64 |
| Directory to footer | `--space-32` 128 | `--space-24` 96 |

The datum rule supplies its own 24 px `padding-top` before the `h1`; the data plate supplies its own 8 px. Neither is duplicated in layout spacing.

## 6. Narrow-screen layout

- Semantic and keyboard order are unchanged.
- Page gutters reduce to `--space-6` (24 px).
- Wordmark and `Galleries` share one wrapping header row. No menu control is introduced for a single navigation item.
- The photograph follows the viewport gutter and preserves the full composition.
- The hero plate stacks `Venice` above a wrapping row carrying location, publication date, photograph count, and the entry cue.
- Directory items and footer links wrap without truncation or horizontal scrolling.

## 7. Content contract

The homepage selects a stable photograph without duplicating gallery metadata. Assumes the `ADR 0002` migration in §1: authored files carry editorial fields only, and dimensions, hashes, EXIF, and derivatives join from the generated manifest at build time.

```ts
const photoSchema = z.object({
  /** Stable identifier. This is the key ADR 0002 uses for the manifest join,
   *  so it must not change after publication. */
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  src: image(),
  originalKey: z.string().min(1),
  alt: altText,
  caption: z.string().optional(),
  print: printSchema.optional(),
});

const gallerySchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  /** min(1) retained: z.string().optional() admits the empty string, which is
   *  the same defect the project documents for alt text. */
  location: z.string().min(1).optional(),
  /** Retained. Source for og:description and link unfurls. */
  description: z.string().max(200).optional(),
  cover: image(),
  photos: z
    .array(photoSchema)
    .min(1, "a gallery with no photographs is a draft, not a gallery"),
  draft: z.boolean().default(false),
  /** Presence is the feature, matching the print-object rationale. */
  homepage: z
    .object({
      featured: z.literal(true),
      /** Named to avoid collision with the gallery-level heroPhotoId already
       *  reserved in 03 §3. */
      featuredPhotoId: z.string().min(1),
    })
    .optional(),
});
```

Collection-level validation runs in `content:check`, because Zod validates one entry at a time and cannot see across entries. Add to the module that already enforces SKU uniqueness, with negative fixtures per `03 §3`:

- Exactly one non-draft gallery declares `homepage.featured`.
- `featuredPhotoId` resolves to a photograph inside that gallery.
- `cover` is not the same asset as the featured photograph.

Failures name the identifier, the invariant, and the corrective action, per `03 §10`:

```text
HOMEPAGE_FEATURE_MISSING: no non-draft gallery declares homepage.featured. Route "/" requires exactly one.
HOMEPAGE_FEATURE_AMBIGUOUS: galleries "venice" and "yard" both declare homepage.featured. Exactly one is permitted.
HOMEPAGE_HERO_UNRESOLVED: gallery "venice" sets homepage.featuredPhotoId "venice-arcade", which no photograph in that gallery declares.
```

The homepage derives title, location, publication date, and `photos.length` from the featured gallery. No homepage copy restates those fields.

Launch content, complete against the schema above:

```yaml
title: Venice
date: 2026-08-01
location: Venice, Italy
description: Arcades, water, and working stone in the Venetian lagoon.
cover: ../../assets/venice/_DSF0158.JPG
draft: false
homepage:
  featured: true
  featuredPhotoId: venice-arcade
photos:
  - id: venice-arcade
    src: ../../assets/venice/_DSF0140.JPG
    originalKey: originals/venice/_DSF0140.RAF
    alt: Receding stone arches and hanging lanterns along an arcade in Venice.
```

The alt text and description are proposed editorial values requiring confirmation before publication. `cover` is a placeholder and must name a photograph other than `_DSF0140.JPG`.

## 8. Component boundary

`src/pages/index.astro` remains composition. No component takes a hydration directive.

| Component | State |
|---|---|
| `SiteHeader.astro` | New |
| `FeaturedHero.astro` | New |
| `GalleryDirectory.astro` | New |
| `SiteFooter.astro` | New |
| `DataPlate.astro` | Planned in `02 §8`, not yet written |

`.rule-datum` is applied as a CSS class, not a component. `design-tokens.css` states that the datum motifs are plain classes specifically so Astro templates need not import anything, and `02 §8` lists no `RuleDatum.astro`. The previous draft described both `RuleDatum.astro` and `DataPlate.astro` as existing; the repository currently holds `content.config.ts`, `design-tokens.css`, and the default starter `index.astro`.

## 9. Image delivery

- `_DSF0140.JPG` is the capped production source, 2048 × 1155.
- AVIF, WebP, and JPEG through Astro `<Picture />`.
- Widths `480`, `768`, `1024`, `1440`, `2048`, the documented set in `03 §6`, subject to source limits.
- Explicit intrinsic `width="2048"` and `height="1155"`, or the generated equivalents.
- Eager loading. Priority and preload behaviour are decided by measurement against LCP, not chosen in advance, per `03 §6` and `05 §6`.
- sRGB conversion, GPS removal, IPTC creator and copyright re-embedding, and the 2048 px cap apply unchanged.

Declared `sizes` policy:

```text
sizes="(min-width: 93.5rem) 1400px,
       (min-width: 48rem) calc(100vw - 6rem),
       calc(100vw - 3rem)"
```

Derivation, required by `03 §6` because only widths a declared policy uses may be generated: the content box reaches the 1400 px container cap once the viewport exceeds 1496 px, which is 93.5rem. Below that it is the viewport less two gutters. The largest layout width is therefore 1400 CSS px, which at DPR 2 would request 2800 px and is bounded by the 2048 px delivery cap. The smallest is 320 − 48 = 272 CSS px, which at DPR 2 requests 544 px and selects the 768 px derivative.

**The `72svh` height cap is removed.** With `object-fit: contain`, a height cap makes rendered width a function of viewport height, which a width-based `sizes` attribute cannot express. At 1440 × 900 the cap binds at roughly 1149 px while a width-based policy requests 1248 px, so the browser fetches a derivative the layout never uses and the policy contradicts `03 §6`. Expressing the cap as `calc(72svh * 1.7732)` inside `min()` is possible but depends on `svh` and math functions inside `sizes`, neither of which is verified in this project's browser matrix.

The trade-off is recorded rather than hidden: on a viewport 800 px tall the hero occupies the full fold and the plate falls below it. Revisit if measurement shows entry-rate harm, and treat any reinstated cap as an expiring observation with browser version and test date.

## 10. Visual system

- Canvas `--bg`; primary text `--text`; metadata `--text-muted`; hairlines `--border-c`.
- `h1` and gallery titles in IBM Plex Serif. Serif never renders below 1.25rem.
- Navigation, lead copy, and action text in IBM Plex Sans, per `04 §3`.
- Dates, counts, location, build identity, and every data plate in IBM Plex Mono with `font-variant-numeric: tabular-nums` **and** `font-feature-settings: "zero"`. The slashed zero is not optional: `2026` and `2026-08-01` both contain one.
- International Orange appears only at the datum tick origin and in focus indication. This is a subset of the `04 §2` allowlist, which is a ceiling rather than a floor. With one navigation item there is no active-state underline on this route.
- Photographs have square corners. The page uses no shadows.
- Sentence case throughout, except data-plate machine registers.

## 11. Accessibility

The hero link takes its accessible name from visible nodes via `aria-labelledby`, referencing the cue, title, date, and count in that order:

```text
Enter gallery — Venice, 2026-08-01, 12 photographs
```

The visible cue `Enter gallery` appears as a contiguous leading substring, satisfying WCAG 2.5.3 Label in Name. The previous draft proposed `Enter Venice gallery, published August 2026, 12 images`, which does not contain the visible label and fails 2.5.3.

`aria-labelledby` is used rather than `aria-label` because `11 §5` requires preserving authored alternative text and discourages ARIA where native semantics suffice. The `<img>` retains its authored `alt`; the label is assembled from text already on screen, so nothing is invented and nothing is hidden.

`Enter gallery` is styled text. It must not be a button or a link, because interactive content nested inside an anchor is invalid.

Focus uses `outline: 2px solid var(--focus-ring)` with `outline-offset: 2px` and must remain visible in forced-colors mode.

## 12. Acceptance criteria

- The photograph and its metadata activate one gallery destination by keyboard or pointer.
- The rendered photograph is uncropped at 320, 390, 768, 1024, and 1440 px.
- The hero plate changes from desktop alignment to title-above-details on narrow screens without changing source order.
- One `h1`, one `main`, header and footer landmarks, and a skip link as first focusable element.
- Focus is visible at every interactive element, including under forced colors.
- Images reserve intrinsic space.
- CLS ≤ 0.1 at the 75th percentile per `07 §7`. A laboratory value of 0 is the target and is achievable only with metric-compatible fallback fonts declaring `size-adjust`; without them, `font-display: swap` reflows the plates and 0 is not attainable.
- LCP ≤ 2.5 seconds at the 75th percentile per `07 §7`, with the hero as the LCP candidate. Laboratory thresholds may be stricter and are tracked as a trend. The previous draft cited a "documented under-2.0-second target" that appears in no governing document.
- The emitted homepage contains no `<script>` element and no JavaScript asset. The ≤3 KB Brotli allowance in `ADR 0001` is a gallery-route budget and does not apply here.
- CSS ≤ 20 KB Brotli, initial HTML ≤ 60 KB Brotli, DOM ≤ 1,500 nodes, per `07 §7`.
- Colophon, Impressum, and Privacy appear in the footer. No navigation item links to a route absent from `01 §4`.
- The directory shows `Venice`, `2026`, and `12 photographs` on a data plate beneath a cover image distinct from the hero photograph.

## 13. Verification

Run `pnpm verify`, which per `07 §2` covers `format:check`, `lint`, `typecheck`, `unit`, `content:check`, `assets:check`, `build`, `browser`, `accessibility`, `links`, `structured-data`, and `budgets`.

Then complete manually, per `05 §10` and the `08` launch checklist:

- Layout inspection at 320, 390, 768, 1024, and 1440 px.
- Keyboard-only traversal.
- 200 % zoom.
- Forced-colors mode.
- Reduced-motion check.
- Screen-reader pass across the `05 §9` matrix.
- Emitted-script assertion, responsive-image assertion, broken-route check, LCP and CLS measurement under recorded conditions.

## 14. Amendments required in the same change

`00_DOCUMENTATION_MAP.md` requires contradictory text be corrected alongside the change rather than left standing.

| Document | Amendment |
|---|---|
| `04 §8` | Hero ratio reads "16:9 or 3:2". The source is 2048 × 1155, which is 1.773:1. Restate as "approximately 16:9 or 3:2, source ratio preserved, never cropped" |
| `04 §5` | Add a `--page-gutter` token: `--space-6` below `md`, `--space-12` at `md` and above. §5 and §6 above depend on it |
| `10 §1` | Homepage header shows `Index Galleries Prints About`. Reduce to the wordmark and `Galleries` until a prints index and an About route exist in `01 §4` |
| `02 §8` | Add `SiteHeader.astro`, `FeaturedHero.astro`, `GalleryDirectory.astro`, `SiteFooter.astro`. Record that `.rule-datum` is a class with no component |
| `03 §3` | Add the three homepage-feature invariants from §7 to the validation list |
| `12` | Record the above dispositions |
| `docs/MANIFEST.txt` | Rehash after the edits |

**Proposed, not applied.** `04 §8` requires a two- or three-column directory grid with a plate on every item. With one gallery this shows the same gallery twice. This document adheres to the rule and mitigates it by requiring `cover` to differ from the hero photograph. If the duplication is judged unacceptable in review, amend `04 §8` to permit a single-item directory rendered as a metadata row, with the grid restored at two or more galleries. That is a design change requiring acceptance, not an implementation choice.

## 15. Correction log

| # | Previous draft | Correction | Authority |
|---|---|---|---|
| 1 | Identity block above the hero; datum rule introducing the directory; lead paragraph absent | Hero → datum rule → `display-xl` `h1` → `body-lg` lead → directory | `04 §8`, `10 §1` |
| 2 | Directory as a single metadata row | Responsive grid, data plate on every item, cover image distinct from the hero | `04 §8` |
| 3 | Header described only as compact | Sticky, opaque or lightly translucent, bottom hairline | `04 §8` |
| 4 | "Existing `RuleDatum.astro`" and "Existing `DataPlate.astro`" | `.rule-datum` is a class; `DataPlate.astro` is planned, not written; neither exists today | `02 §8`, `design-tokens.css` |
| 5 | `August 2026` in Mono plates | `2026-08-01` in the hero plate, `2026` in the directory plate | ISO 8601 rule for machine data |
| 6 | `location: z.string().optional()` | `.min(1)` restored | Empty string otherwise validates |
| 7 | `description` dropped from the schema | Restored with `max(200)` | Source for `og:description` |
| 8 | Launch YAML missing `cover`, `originalKey` | Completed; would not have validated | §7 schema |
| 9 | `heroPhotoId` | Renamed `featuredPhotoId` | Collides with the identifier reserved in `03 §3` |
| 10 | Schema retained inline `exif` | Authored fields only; EXIF joins from the manifest | `ADR 0002` |
| 11 | Accessible name `Enter Venice gallery, published August 2026, 12 images` | `Enter gallery — Venice, 2026-08-01, 12 photographs` via `aria-labelledby` | WCAG 2.5.3; `11 §5` |
| 12 | Entry cue unspecified as to element | Stated as non-interactive text | Nested interactive content is invalid |
| 13 | "documented under-2.0-second target" | LCP ≤ 2.5 s at p75 | `07 §7`; the 2.0 s figure appears nowhere |
| 14 | "CLS remains 0" | ≤ 0.1 at p75; laboratory 0 conditional on `size-adjust` fallbacks | `07 §7`; `04 §3` mandates `swap` |
| 15 | "Preload or assign `fetchpriority`" | Decided by measurement | `03 §6`, `05 §6` |
| 16 | `max-height: 72svh` | Removed; height cap makes `sizes` inexpressible and contradicts the width set | `03 §6` |
| 17 | Widths `640/960/1280/1600/2048` | Documented set `480/768/1024/1440/2048` with the derivation recorded | `03 §6` |
| 18 | "Deliberate vertical space", "standard page gutters" | Token values in a table | `04 §5` |
| 19 | "Engineering case study" in the footer | `Colophon`, the documented route | `01 §4` |
| 20 | About in the footer | Removed; no About route exists in scope | `01 §4`; `links` check would fail |
| 21 | "Tabular figures" | Tabular figures and `font-feature-settings: "zero"` | `04 §6` |
| 22 | Verification list | 200 % zoom, forced colors, reduced motion, screen-reader matrix added | `05 §10`, `08` |

Two items in the previous draft were already correct and are retained unchanged: navigation set in IBM Plex Sans, which `04 §3` assigns to navigation and which supersedes the archived architecture document, and narrowing orange to the datum origin and focus, which is permitted because the `04 §2` allowlist is a ceiling.

## 16. Downstream asset impact

`public/og-default.png` renders the display line "Photographs, field notes, and limited prints." and header chrome reading `Index / Galleries / Prints / About`. The display line survives this revision as the `h1`. The navigation set does not. Regenerate the card against the reduced navigation and refresh `public/brand-assets.sha256`; this is a copy change in `scripts/build-brand-assets.py`, not new work.
