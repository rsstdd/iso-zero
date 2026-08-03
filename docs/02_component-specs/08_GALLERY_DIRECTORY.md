# Component specification — `GalleryDirectory.astro`

Status: implementation-ready  
Implementation: `src/components/GalleryDirectory.astro`

## 1. Responsibility

The gallery directory exposes every real, non-draft gallery as a compact textual index. It remains visible with one gallery so future galleries can be added without changing page structure.

It does not load content collections, filter drafts, sort entries, show placeholder galleries, render image cards, or duplicate the featured hero's complete metadata.

## 2. Dependencies

- `RuleDatum.astro`
- Deterministic year and count formatters from `src/lib/`
- Datum display, data, link, and spacing tokens

Collection filtering and sorting occur in the page module before props reach this component.

## 3. Public contract

```ts
interface GallerySummary {
  readonly slug: string;
  readonly title: string;
  readonly publicationDate: Date;
  readonly imageCount: number;
}

interface Props {
  readonly galleries: readonly GallerySummary[];
  readonly heading?: "Available galleries";
  readonly headingId?: "gallery-directory-title";
}
```

Default heading and ID use the literal values above. `galleries` arrives sorted newest publication date first, with slug ascending as tie-breaker.

## 4. Required output

```astro
<RuleDatum as="section" labelledBy="gallery-directory-title">
  <h2 id="gallery-directory-title">Available galleries</h2>
  <ul class="gallery-directory">
    <li>
      <a href="/galleries/venice/">
        <h3>Venice</h3>
        <span class="gallery-directory__meta">
          <time datetime="2026">2026</time>
          <span>12 images</span>
          <span aria-hidden="true">→</span>
        </span>
      </a>
    </li>
  </ul>
</RuleDatum>
```

The list retains native `ul`/`li` semantics. CSS removes markers visually without removing list semantics.

## 5. Content rules

- Heading: `Available galleries`.
- Row fields: title, four-digit publication year, image count.
- Omit location, publication month, description, cover, EXIF, print state, and capture date.
- Count formatter handles `1 image` and plural values.
- Title remains untruncated.
- Decorative arrow is hidden from assistive technology.
- Each slug occurs once.
- Featured Venice intentionally appears in both hero and directory because one is a primary entrance and the other is the archive index.

Launch output is exactly `Venice`, `2026`, and `12 images`.

## 6. Datum mapping

- Section origin: `RuleDatum`, owning the homepage's persistent orange tick.
- Section heading and gallery titles: IBM Plex Serif, `var(--text)`.
- Year and count: IBM Plex Mono, tabular figures, `var(--text-muted)`.
- Rows: decorative block-start/end `var(--border-c)` hairlines.
- Link recognition: persistent underline on the title or another text cue; the low-contrast hairline and arrow are not sufficient affordances.
- Focus: global accent outline around the complete row link.
- No image, surface fill, radius, shadow, orange text, badge, or filled hover state.

## 7. Layout and responsive behavior

- Wide: title aligns inline-start; metadata aligns inline-end when space permits.
- Narrow/zoomed: row wraps in source order, with title first and metadata following.
- Use flex or grid without CSS `order`.
- Rows have no fixed block size; long titles and enlarged text grow the row.
- No ellipsis, line clamp, overflow clipping, horizontal scrolling, or breakpoint copy substitution.
- Complete row is the link hit area and reaches at least 44 px block size.

One content-driven enhancement breakpoint may align rows horizontally, initially matching the featured plate's `48rem` threshold. Intrinsic wrapping handles intermediate cases.

## 8. States

- Zero entries: invalid for homepage composition; no empty-state marketing copy.
- One entry: full section and one row render.
- Multiple entries: one row per supplied summary, same structure.
- Hover: title underline strengthens; optional arrow movement follows reduced-motion rules.
- Focus-visible: one accent outline around the row.
- Visited: normal Datum palette.
- Forced colours: underline, heading, and focus remain recognizable.

## 9. Accessibility contract

- Labelled `section` with an `h2`.
- List semantics announce entry count and grouping.
- Each gallery title is an `h3` under the directory `h2`.
- Row accessible name derives from visible title, year, and count.
- Decorative arrow is not announced.
- Link purpose remains clear without colour or hairlines.
- Focus order equals supplied array order.
- 44 × 44 px project target applies to each row link.

## 10. Failure behavior

The component rejects an empty array, duplicate slugs, blank title/slug, invalid date, or image count below one. These are programmer/content-pipeline failures, not user-facing empty states.

Draft filtering and sorting are caller responsibilities; contract tests build the supplied view model from non-draft collection entries and prove those invariants before rendering.

## 11. Verification

| Concern | Check |
| --- | --- |
| Launch content | One row: Venice, 2026, 12 images |
| Excluded fields | No location, month, cover, description, EXIF, print data |
| List semantics | Labelled section, h2, ul/li, row h3 |
| Ordering | Newest date then slug; DOM/focus order matches |
| Filtering | Render count equals non-draft input count |
| Destinations | Every `/galleries/[slug]/` route resolves |
| Grammar | Singular/plural count unit tests |
| Reflow | Long titles, 320 px, 200% text, 400% zoom |
| Target size | Link bounding box at least 44 px block size |
| Affordance | Recognizable in grayscale and forced colours |
| Datum | One tick, correct font voices, no image/card/shadow/accent text |
| Accessibility | Axe-core and keyboard traversal |

## 12. Change rules

Adding row fields, images, filters, sorting controls, pagination, or empty states changes the component's information architecture and requires this document and relevant page specifications to change first.
