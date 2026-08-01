# Datum design system for ISO Zero

## 1. System premise

ISO Zero presents an engineering notebook and archival catalog rather than a marketing brochure. The visual system follows five principles.

1. **Dark by default.** Neutral low-luminance chrome lets photographs establish the color field.
2. **Monochrome chrome, one instrument color.** International Orange indicates state, focus, and controlled structural emphasis.
3. **Borders before shadows.** One-pixel hairlines establish structure. Shadows are reserved for the modal top layer.
4. **Data reads as data.** EXIF, SKUs, dimensions, dates, build identifiers, and prices use monospace and tabular numerals.
5. **Verified, not vibed.** Contrast, spacing, and performance-sensitive visual behavior require explicit values and checks.

## 2. Color architecture

```css
:root,
[data-theme="dark"] {
  --bg: #191611;
  --surface: #221e18;
  --well: #26221b;
  --border-c: #3a352c;
  --text: #ede7db;
  --text-muted: #a39b8c;
  --brand: #ede7db;
  --accent: #e8632c;
  --accent-text: #e8632c;
  --focus-ring: #e8632c;
  --control-hover: #fbf9f5;
  --shadow-color: rgb(0 0 0 / 60%);
}
```

### Verified contrast pairs

| Pair | Ratio | Rule |
|---|---:|---|
| `#ede7db` on `#191611` | 14.65:1 | Primary text; AAA |
| `#a39b8c` on `#191611` | 6.55:1 | Muted text; AA body |
| `#e8632c` on `#191611` | 5.37:1 | Accent text and focus; AA body |

Contrast must be rechecked when any token changes.

### Orange allowlist

Permitted:

- Focus outlines.
- Active navigation underlines.
- Datum ticks.
- Placard borders and text.
- Verified status indicators.
- Overlines where the color does not compete with the image.

Forbidden:

- Large decorative fields.
- Solid orange backgrounds behind body text.
- Repeated accent marks with no state or structural meaning.
- Orange applied to every metadata item.

The phrase “focus and active states only” is too narrow because Datum ticks and placards are intentional structural uses. The allowlist above is authoritative.

## 3. Typography

ISO Zero uses the IBM Plex superfamily.

```text
IBM Plex Serif — display headings and gallery titles
IBM Plex Sans  — body prose, controls, navigation, product copy
IBM Plex Mono  — EXIF, prices, dimensions, SKUs, dates, overlines
```

### Type scale

| Token | Size and line-height | Face | Use |
|---|---|---|---|
| `display-xl` | `clamp(2.75rem, 5vw + 1rem, 4.5rem)` / 1.05 | Serif 600 | Homepage title only |
| `display` | `clamp(2.25rem, 3.5vw + 1rem, 3.25rem)` / 1.1 | Serif 600 | Gallery titles |
| `h1` | `2rem` / 1.15 | Serif 600 | Page headings |
| `h2` | `1.5rem` / 1.25 | Serif 600 | Major subsections and product titles |
| `h3` | `1.25rem` / 1.3 | Sans 600 | Cards and minor subsections |
| `overline` | `0.8125rem` / 1.2 | Mono 600 | Section index, nav eyebrow, technical label |
| `body-lg` | `1.125rem` / 1.6 | Sans 400 | Lead copy |
| `body` | `1rem` / 1.65 | Sans 400 | Default prose |
| `caption` | `0.8125rem` / 1.4 | Mono 400 | EXIF, SKU, copyright, build identity |

Rules:

- Plex Serif never renders below 1.25rem.
- Body prose is capped at 65ch.
- Technical and financial numerals use `font-variant-numeric: tabular-nums`.
- Mono contexts use `font-feature-settings: "zero"`.
- Font loading must use self-hosted, subset files where licensing permits and `font-display: swap`.
- Font preload is limited to the faces used above the fold and validated against LCP.

## 4. Case and voice

### Sentence case

Ordinary headings, navigation, links, and actions use sentence case:

- `Purchase print`
- `Previous`
- `Next`
- `Gallery archive`

Uppercase is restricted to the `overline` token, machine identifiers, and data-plate labels where the design explicitly calls for an instrumentation register.

### Microcopy rules

- No exclamation points.
- No title case for ordinary UI.
- No enthusiasm filler.
- No vague success language such as “Successfully completed.”
- Buttons start with direct verbs.
- Limitations are stated directly.
- Claims identify the mechanism or measurement.
- Contractions are avoided in formal interface and documentation copy.

Examples:

```text
Order placed
Print unavailable
Open full-size image
Purchase print
Arrow-key navigation requires the viewer enhancement
```

## 5. Geometry

### Radius

- Photographs: `0` without exception.
- Cards and containers: `0` by default.
- Controls, inputs, dialogs, and placards: maximum `2px`.
- Pills and soft eight-pixel card radii do not belong to this system.

### Spacing

Use a four-pixel base scale.

```css
--space-1: 0.25rem;  /* 4 */
--space-2: 0.5rem;   /* 8 */
--space-3: 0.75rem;  /* 12 */
--space-4: 1rem;     /* 16 */
--space-6: 1.5rem;   /* 24 */
--space-8: 2rem;     /* 32 */
--space-12: 3rem;    /* 48 */
--space-16: 4rem;    /* 64 */
--space-24: 6rem;    /* 96 */
--space-32: 8rem;    /* 128 */
```

Major section gaps use 96px or 128px on wide layouts and reduce proportionally on small screens.

## 6. Datum motifs

### Datum tick

```css
.rule-datum {
  position: relative;
  border-top: 1px solid var(--border-c);
  padding-top: 1.5rem;
}

.rule-datum::before {
  position: absolute;
  top: -1px;
  left: 0;
  width: 24px;
  height: 2px;
  background: var(--accent);
  content: "";
}
```

Use for major structural breaks. Do not place it after every paragraph.

### Data plate

```css
.data-plate {
  border-top: 1px solid var(--border-c);
  padding-top: 0.5rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.4;
  font-feature-settings: "zero";
  font-variant-numeric: tabular-nums;
}
```

Use for EXIF, gallery counts, print specifications, copyright, and build identity.

### Placard

```css
.placard {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  color: var(--accent-text);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
}
```

Use for finite edition status, availability, or verified state. It is not a decorative tag system.

## 7. Layout containers

| Container | Maximum width | Use |
|---|---:|---|
| `container-prose` | 65ch | Colophon, legal text, long-form documentation |
| `container-content` | 1120px | Product pages and standard content |
| `container-wide` | 1400px | Homepage, gallery index, gallery grid |

Standard breakpoints:

```text
sm 640px
md 768px
lg 1024px
xl 1280px
```

Breakpoints are implementation defaults, not content requirements. Components should respond to available width rather than device labels where container queries improve isolation.

## 8. Page rules

### Homepage

- Sticky header with an opaque or lightly translucent dark surface.
- Backdrop blur is optional and must not reduce text contrast or scrolling performance.
- One 16:9 or 3:2 hero photograph spanning `container-wide`.
- Hero uses responsive derivatives and explicit dimensions.
- Datum rule separates the hero from the title.
- Featured directory uses a two- or three-column grid.
- Every directory item includes a data plate.

### Gallery

- `display` title and `body-lg` introduction capped at 65ch.
- Grid uses explicit image dimensions and eight-pixel gaps.
- A strict responsive grid is preferred over script-driven masonry.
- Mixed aspect ratios remain visible; crop decisions belong to content, not CSS.
- Hover may use a subtle brightness or opacity change.
- No zoom transform.

### Print product page

- `container-content`.
- Two-column desktop layout and one-column mobile layout.
- Primary image may be sticky where viewport height permits.
- Price uses tabular mono and explicit currency formatting.
- Edition state uses a placard.
- Purchase action is visually primary.
- Product details include material, dimensions, frame status, edition, fulfillment window, shipping restrictions, and return implications.

### Colophon

- `container-prose`.
- Documents architecture, measured budgets, trade-offs, compatibility, and source references.
- Does not repeat the entire internal specification.

## 9. Controls

### Primary button

- Light ink background and dark text.
- Minimum 44px control height preferred.
- Direct action label.

### Secondary button

- Transparent background.
- One-pixel border.
- Primary text color.

### Focus

```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

Focus must remain visible in forced-colors mode. Do not remove native outlines unless the replacement is equivalent or stronger.

## 10. Motion

- Motion is not required for comprehension.
- Viewer transitions remain short and opacity-based if included.
- `prefers-reduced-motion: reduce` disables nonessential transitions.
- No scroll-triggered reveal effects.
- No parallax.
- No continuous animation.
