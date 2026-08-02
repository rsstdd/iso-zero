# 04 — Design system

The design system is **Datum**, shared across several of the author's projects and vendored into this one at `src/styles/design-tokens.css`. Its reference point is engineering instrumentation: measured, monochrome, and legible, with a single accent that means something wherever it appears.

Values are owned by the stylesheet. This document explains the values and the rules governing their use, and it does not restate numbers that the stylesheet already defines except where the number is itself the decision.

## Vendoring, and the Tailwind problem

The shared Datum source is authored for projects that use Tailwind. It defines semantic custom properties on `:root`, then maps them into Tailwind through `@theme inline` blocks so that utilities such as `bg-surface` resolve correctly.

ISO Zero does not use Tailwind. That creates a concrete problem rather than a stylistic one: values declared inside `@theme` — the type scale, the font stacks, `--radius-xs`, the shadow and motion tokens, the container widths — are only defined if a Tailwind build processes the file. Without Tailwind, a browser treats `@theme` as an unknown at-rule and discards its contents, and roughly half the design system silently evaporates.

The vendored copy is therefore flattened. Every declaration inside `@theme` and `@theme inline` is lifted into `:root`, the Tailwind colour mappings are dropped because nothing consumes them, and the `@layer base` and `@layer components` blocks are kept as written. Synchronisation with the shared source is manual and rare, and a comment at the head of the file records the upstream revision it was flattened from.

## Colour

The site runs in the dark theme. The light primitives remain in the vendored file because the shared source defines them and diverging would complicate resynchronisation, but no route selects them.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#191611` | Page canvas |
| `--surface` | `#221e18` | Raised surfaces: popovers, cards, placards |
| `--well` | `#26221b` | Recessed surfaces |
| `--border-c` | `#3a352c` | Hairlines and dividers |
| `--text` | `#ede7db` | Primary text |
| `--text-muted` | `#a39b8c` | Metadata, captions, secondary text |
| `--accent` | `#e8632c` | International orange |

Contrast ratios were verified 2026-07-29 and are recorded in the stylesheet header. The dark accent is lifted one step from the light-theme value specifically so it is safe at body size, at 5.37:1 against the canvas.

### The accent rule

International orange marks state, focus, navigation position, and verified system metadata. It marks nothing else.

Orange is never a solid fill behind text. The reason is contrast: `#e8632c` against `#191611` is comfortable, and text placed on top of an orange fill has to be either near-white or near-black, both of which read as a warning label rather than as an instrument. The outlined `.placard` exists to satisfy the impulse toward a filled tag without paying that cost.

A page carrying orange in three places has diluted it. Two is usually correct: the focus ring, and one indicator.

## Typography

One superfamily, three voices.

| Voice | Family | Applied to |
|---|---|---|
| Display | IBM Plex Serif | Headings, gallery titles, the site wordmark |
| Prose | IBM Plex Sans | Body text, navigation, buttons |
| Data | IBM Plex Mono | EXIF, SKU specifications, currency, overlines |

The serif is the only warm element in an otherwise instrumental system, and it is what keeps the pages from reading as a dashboard. It is reserved for headings; a serif paragraph would undo the distinction.

### Numeric discipline

Two rules, both non-negotiable, both enforced in the base layer of the stylesheet.

```css
table, time, [data-numeric] { font-variant-numeric: tabular-nums; }
code, kbd, samp, pre, .font-mono { font-feature-settings: "zero"; }
```

Tabular figures wherever numbers align or change, because proportional digits in a column of exposure values make the column look broken. The slashed zero wherever data appears, because O and 0 are different characters and an ISO value is the place that distinction earns its keep.

Fonts are self-hosted, subset to Latin, and preloaded for the two faces used above the fold. A design system built on a specific superfamily cannot depend on a third-party CDN, because the fallback stack is not the design.

## Geometry

Photographs and containers have `border-radius: 0`. Buttons and placards may use `--radius-xs`, which is 2 px, and that is the only curve in the system.

The rule is stated in the stylesheet as a base declaration rather than left to component discipline:

```css
figure img { border-radius: 0; }
```

Rounding a photograph crops the composition its author chose. The prohibition is absolute for that reason rather than for a stylistic one.

Shadows are banned. Elevation is expressed by a 1 px border against a lighter surface, which is how instrumentation panels distinguish planes and is cheaper besides. The single exception is the viewer popover, which uses `--shadow-lg` with the warm-tinted shadow colour, because a popover floating over a full-bleed photograph needs separation that a hairline cannot provide against arbitrary image content.

## The motifs

Two recurring elements carry the system's identity. Both are plain CSS classes in `@layer components` rather than components, because the shared stylesheet serves several projects and one implementation is correct for all of them.

### The datum tick

```css
.rule-datum {
  position: relative;
  border-top: 1px solid var(--border-c);
  padding-top: 24px;
}
.rule-datum::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  width: 24px;
  height: 2px;
  background: var(--accent);
}
```

A 1 px hairline anchored at its left origin by a 24 px by 2 px orange tick. It is the primary section divider, and it is the one place orange appears without indicating state, because it indicates origin, which is close enough to be consistent.

### The data plate

A 1 px hairline, 8 px of space, then mono metadata at 13 px in `--text-muted`, with tabular figures and slashed zeros already applied. Every technical block on the site is a data plate: EXIF beneath a photograph, print specifications on a product page, build identity in the footer.

The plate is what makes generated data read as generated. A viewer should be able to tell at a glance which text a person wrote and which text a camera reported, and the typographic shift does that without a label.

## Layout

| Container | Width | Use |
|---|---|---|
| `--container-prose` | 65ch | Body text: about, case study, legal pages |
| `--container-content` | 70rem | Standard page width |
| `--container-wide` | 87.5rem | Gallery grids |

The gallery grid is CSS Grid with `grid-auto-flow: dense`, sized in columns that adapt by viewport rather than by breakpoint list. Mixed aspect ratios are the normal case, and each figure occupies its natural ratio rather than being cropped to a uniform tile, because cropping to a grid is the site editing the photographs.

## Motion

Transitions use `--ease-standard` and one of three durations. Motion is limited to opacity and transform on focus, hover, and popover state, and the reduced-motion query in the base layer collapses all of it to effectively zero.

There is no scroll-linked animation, no parallax, and no entrance animation on the grid. Each would require either a script or a scroll-driven animation with uneven support, and none of them makes a photograph easier to look at.

## Microcopy and voice

Interface text reads like an engineering notebook or an archival catalogue: precise, unhedged, and documented.

| Rule | Example |
|---|---|
| Sentence case universally, except mono overlines, which are uppercase | "Purchase print", "Available galleries" |
| Buttons are action-first verbs | "Purchase print", not "Get yours" |
| No exclamation points, in any context | |
| No contractions | "does not" and "cannot" are written in full |
| State the constraint rather than apologising for it | "Open edition. No edition number." |
| Numbers are specific | "420 × 297 mm", not "roughly A3" |

Alt text is descriptive rather than technical, because the EXIF is already published in the data plate and a screen-reader user asking what a photograph shows is not asking for the shutter speed.
