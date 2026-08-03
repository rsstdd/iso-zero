# Datum

A design system for aircraft, portfolio, and photography.
**Written:** 29 July 2026. Revised the same day, away from its references and toward its owner.
**Shared implementation:** the upstream Datum source may expose a Tailwind v4 theme. **ISO Null implementation:** the attached `design-tokens.css` is a flattened, dark-only Astro profile and `global.css` owns element and interaction defaults. Visual reference: `design-preview.html`.

The name is from weight-and-balance: the datum is the reference line on an aircraft from which every measurement is taken. A design system is the same object, so the name is a definition rather than a decoration.

---

## 0. Provenance, and what changed

The first draft of this system was derived from [sethring.com](https://sethring.com/) and [infantree.com](https://infantree.com/): warm cream, amber, olive, an eccentric editorial serif. The warmth survives, because it was the right call. The branding-agency fingerprints do not, because the person these sites belong to is not a branding agency.

The revision reads the owner instead. The evidence: a decade of daily engineering notes and runbooks, Rust projects that care about deterministic output and graceful shutdown, sensor and telemetry work, an aircraft obsession deep enough to scrape a spec database, photography with EXIF discipline, and stated writing rules that ban filler and exclamation points. The consistent temperament is **precision with warmth**: an engineering notebook, not a brochure. The system is therefore built on three moves:

1. **Monochrome chrome, one instrument color.** The borrowed olive brand is retired. Interface chrome is ink on paper, and the single accent is **international orange**, the color aviation uses for flight-test livery and the color the Rust ecosystem happens to orbit. Both associations are earned rather than decorative here.
2. **One typographic superfamily.** Fraunces is retired in favor of **IBM Plex**: Serif for display, Sans for body, Mono for data, three faces sharing one skeleton, designed explicitly for the relationship between people and machines. Choosing a coherent system over assembled parts is the same instinct the codebases show.
3. **Machined, not rounded.** Radii drop to near zero, texture is removed entirely, and the signature details are instrument details: datum ticks on section rules, data-plate captions, tabular numerals, slashed zeros, ISO dates.

Principles, in order of priority:

1. **Warm paper, dark ink.** Cream, not white, because white is a default and cream is a decision.
2. **Borders before shadows.** Hairlines carry structure; shadows are reserved for the few things that float.
3. **One accent moment per view.** Orange is an instrument marking, and instrument markings mean something. If everything is marked, nothing is.
4. **Data reads as data.** Numbers are tabular, zeros are slashed, dates are ISO 8601, specifications and EXIF are set in mono. Always.
5. **Verified, not vibed.** Every foreground/background pair below carries a computed WCAG ratio, re-run on 29 July 2026 for the revised palette.

The reasoning behind these five principles, including how they trace back to specific evidence about how you actually work rather than to taste alone, lives in `DESIGN_PHILOSOPHY.md`. This section states the principles; that document argues them.

---

## 1. Color

### 1.1 Primitives

Neutrals are unchanged from the first draft (their ratios were already verified). The accent and feedback families are new.

| Token | Hex | Role |
|---|---|---|
| `paper` | `#f5f2ec` | Page background |
| `paper-raised` | `#fbf9f5` | Cards, inputs, raised surfaces |
| `paper-sunken` | `#ebe6da` | Wells, table hover, placard fills |
| `line` | `#d9d2c2` | Hairlines, dividers, ticks |
| `ink` | `#221f1a` | Primary text, primary buttons |
| `ink-soft` | `#38342c` | Button hover |
| `ink-muted` | `#6b655a` | Secondary text |
| `orange` | `#dd4e12` | International orange. Accent: marks, active states, focus, large text, UI |
| `orange-text` | `#b13f0d` | Accent at body-text size |
| `success` | `#3e6b3a` | Positive feedback |
| `warn` | `#b13f0d` | Caution (shares orange-text) |
| `error` | `#a02c2c` | Errors, destructive actions. Deliberately redder than the accent so the two never blur |

Dark theme (photography default):

| Token | Hex | Role |
|---|---|---|
| `dark-bg` | `#191611` | Page background |
| `dark-surface` | `#221e18` | Cards, chrome |
| `dark-well` | `#26221b` | Recessed surfaces |
| `dark-line` | `#3a352c` | Hairlines |
| `dark-line-essential` | `#746b5d` | Essential control boundaries |
| `dark-text` | `#ede7db` | Primary text |
| `dark-muted` | `#a39b8c` | Secondary text |
| `orange-bright` | `#e8632c` | The accent, lifted one step so it passes body text on dark |
| `dark-success` | `#82b37c` | Positive feedback |
| `dark-warn` | `#f0a35a` | Caution feedback |
| `dark-error` | `#ed7a72` | Error and destructive feedback |

### 1.2 Verified contrast (WCAG 2.x; shared palette 29 July 2026, ISO Null profile reverified 2 August 2026)

| Pair | Ratio | Verdict |
|---|---|---|
| ink / paper | 14.70 | AA + AAA body |
| ink-muted / paper | 5.17 | AA body |
| paper / ink (primary button) | 14.70 | AA body |
| paper / ink-soft (button hover) | 11.08 | AA body |
| orange / paper | 3.63 | AA large text and UI. Not body |
| orange-text / paper | 5.24 | AA body |
| error / paper | 6.50 | AA body |
| success / paper | 5.58 | AA body |
| dark-text / dark-bg | 14.65 | AA + AAA body |
| dark-muted / dark-bg | 6.55 | AA body |
| orange-bright / dark-bg | 5.37 | AA body |
| orange-bright / dark-surface | 4.94 | AA body |
| dark-line / dark-bg | 1.48 | Decorative only; not a control boundary or state |
| dark-line-essential / dark-well | 3.02 | AA non-text contrast |
| dark-success / dark-bg | 7.46 | AA + AAA body |
| dark-warn / dark-bg | 8.67 | AA + AAA body |
| dark-error / dark-bg | 6.55 | AA body |

**The orange rule.** Raw `orange` may mark, underline, outline, fill charts, carry focus rings, and set large text, because 3.63 clears the UI and large-text bar. Body-size accent text uses `orange-text`. On dark, `orange-bright` is body-safe everywhere. This is one tier simpler than the amber system it replaces, which is a point in its favor.

Solid orange fills with text on top are avoided entirely: ink-on-orange measures 4.04, which fails body-size text, so the accent badge is an **outlined placard** (orange border, `orange-text` label on paper) rather than a filled pill. The constraint produced a better component, which is usually what constraints do.

---

## 2. Typography

### 2.1 One superfamily: IBM Plex

| Role | Face | Weights | Why |
|---|---|---|---|
| Display and headings | **IBM Plex Serif** | 400, 600 | Sober, slightly technical serif. Editorial without the whimsy of the reference sites |
| Body and UI | **IBM Plex Sans** | 400, 500, 600 | Shares its skeleton with the serif, so the page reads as one instrument, not a collage |
| Data, code, captions | **IBM Plex Mono** | 400, 600 | The voice of specs, EXIF, and code. Slashed zero enabled |

Self-hosted in production (Fontsource or WOFF2), because a portfolio that leaks visitor IPs to a font CDN for no benefit is making a statement it does not intend.

### 2.2 Scale

Unchanged in structure from the first draft; the faces changed, not the arithmetic. Fluid at display sizes, fixed below. The serif never appears below 1.25rem.

| Token | Size / line-height | Face, weight | Use |
|---|---|---|---|
| `display-xl` | clamp(2.75rem, 5vw + 1rem, 4.5rem) / 1.05 | Plex Serif 600 | Hero statements, one per site |
| `display` | clamp(2.25rem, 3.5vw + 1rem, 3.25rem) / 1.1 | Plex Serif 600 | Page titles |
| `h1` | 2rem / 1.15 | Plex Serif 600 | Section headings |
| `h2` | 1.5rem / 1.25 | Plex Serif 600 | Subsections |
| `h3` | 1.25rem / 1.3 | Plex Sans 600 | Card titles |
| `overline` | 0.8125rem / 1.2, tracking 0.08em, uppercase | **Plex Mono 600** | Eyebrows, nav labels, section indices |
| `body-lg` | 1.125rem / 1.6 | Plex Sans 400 | Lead paragraphs |
| `body` | 1rem / 1.65 | Plex Sans 400 | Default |
| `small` | 0.875rem / 1.5 | Plex Sans 400 | Secondary UI |
| `caption` | 0.8125rem / 1.4 | Plex Mono 400 | Data plates: EXIF, timestamps, footnotes |
| `mono` | 0.875rem / 1.5 | Plex Mono 400 | Spec values, code |

The one deliberate change of voice: **overlines moved from sans to mono.** A mono eyebrow above a serif heading is the system's most recognizable habit, and it is exactly how an engineering document labels a section.

### 2.3 Numerals

`font-variant-numeric: tabular-nums` wherever numbers can appear in columns or change in place: tables, counters, timestamps, optimistic UI. Mono enables the slashed zero (`font-feature-settings: "zero"`), because O and 0 are different characters and an aircraft registration should never make you guess. Dates render as ISO 8601 (`2026-07-29`) in captions and metadata, and prose dates are permitted only in prose.

Measure: body text never exceeds **65ch**.

---

## 3. Spacing & Layout

Unchanged from the first draft, because the spacing was never the borrowed part. Base 4px; working subset **4, 8, 12, 16, 24, 32, 48, 64, 96, 128**; within components 4 to 16, between components 24 to 48, between sections 96 to 128. When in doubt, larger.

| Token | Width | Use |
|---|---|---|
| `container-prose` | 65ch | Running text |
| `container-content` | 1120px | Default page content |
| `container-wide` | 1400px | Galleries, the aircraft table |

Gutters 20/32/40px by breakpoint; Tailwind default breakpoints; 12 columns at `lg`; galleries 2/3-column with 8px gaps.

---

## 4. Elevation & Effects

### 4.1 Elevation

| Level | Treatment | Use |
|---|---|---|
| 0 | Background only | Page |
| 1 | `paper-raised` + 1px `line` border | Cards, inputs, nav |
| 2 | Level 1 + `shadow-md` | Dropdowns, popovers |
| 3 | `shadow-lg`, no border | Modals, lightbox |

Shadows stay warm-tinted and rare: `shadow-sm` 0 1px 2px rgb(34 31 26 / 0.06); `shadow-md` 0 2px 8px / 0.08 + 0 1px 2px / 0.04; `shadow-lg` 0 8px 32px / 0.16.

### 4.2 Radii: machined

| Token | Value | Use |
|---|---|---|
| `radius-none` | 0 | Default. Cards, figures, tables, modals |
| `radius-xs` | 2px | Buttons, inputs, tags, code spans |

The 8px card radius and the pill are retired. Soft corners were the references' temperament; this owner's artifacts are panels and frames. Photographs remain at zero radius in every theme, as before.

### 4.3 The datum motifs

Texture and grain are removed entirely, including the previously permitted marketing-surface grain, because the personality this system serves expresses itself in precision, not patina. In their place, three small motifs that recur everywhere:

1. **Datum ticks.** Section rules are a 1px hairline with a short 2px-thick orange tick at the left end, like the datum mark on a measurement drawing. This is the accent's most common appearance.
2. **Data plates.** Figures, tables, and metadata blocks close with a hairline and a mono caption, the way an instrument carries its placard. EXIF lines, table footnotes, and timestamps all use this pattern.
3. **Section indices.** Long pages may number their sections in the overline (`01 — Catalog`), set in mono. Sparingly, and only where the page genuinely has an order.

### 4.4 Motion

Unchanged: `cubic-bezier(0.2, 0, 0, 1)`, 120/200/320ms, underlines slide, cards lift 2px, modals rise 8px, nothing loops or parallaxes, `prefers-reduced-motion` kills transforms globally. One addition: numeric changes (favourites count, optimistic states) may not animate position, only value, because tabular numerals exist precisely so that changing numbers do not dance.

---

## 5. Components

**Button.** Heights 40/48px, radius-xs, Plex Sans 500, padding 20px. Primary: **ink background, paper text** (14.70), hover `ink-soft` (11.08). Secondary: transparent, 1px line border, ink text, hover border-ink. Ghost: ink text with a persistent underline that strengthens on hover without changing colour. Destructive: error background, paper text. Disabled: 40 percent opacity. There is no orange-filled button, per the orange rule.

**Link.** Text links inherit the normal text colour in unvisited and visited states, retain a 1 px underline, and strengthen it to 2 px on hover without changing colour or geometry. Compound links remove the outer underline only when a visible descendant title or action remains persistently underlined. Focus uses the global orange outline; orange is not a general link-hover colour.

**Card.** Level 1, radius-none, padding 24px. Clickable cards lift; static cards do not move.

**Input.** 44px, paper-raised, 1px line, radius-xs, label in small Plex Sans 500. Error: error border plus a message; never color alone.

**Tag / placard.** Radius-xs, paper-sunken fill with ink-muted text. Accent variant: paper fill, 1px orange border, `orange-text` label. No filled accent, no pills.

**Table (aircraft).** Hairline rows, no verticals, no zebra. Numerics right-aligned, mono, tabular, slashed zero. Sticky header. Hover: paper-sunken. Closes with a data-plate footnote when the data has a source, and the aircraft data does.

**Figure (photography).** Radius zero, no border on light; optional 1px dark-line frame on dark. Caption is a data plate: hairline, then EXIF in mono (`X-T5 · 23mm · f/8 · 1/250 · ISO 160 · 2026-07-29`).

**Navigation.** Datum does not impose sticky positioning, blur, or one font voice across products. Current location always uses `aria-current` plus a non-colour cue. ISO Null uses a static header, a Serif wordmark, Sans labels, and a persistent underline; the Header uses no accent decoration.

**Focus.** 2px solid `orange` outline, 2px offset, both themes, both verified above 3:1. Never removed without an equal replacement.

---

## 6. Guidelines & Standards

**Color usage.** Semantic tokens only in components; primitives only in the token file. The orange rule from 1.2 always applies. One accent moment per view, and the datum tick counts as the moment when present. Feedback colors appear only as feedback.

**Typography.** No serif below 1.25rem. Overlines are mono, always. Numbers in UI are tabular. Dates in metadata are ISO 8601.

**Microcopy.** Interface text follows the owner's writing rules, because a site's voice is part of its design system. Sentence case everywhere, including headings and buttons. No exclamation points. No filler: "Saved", not "Successfully saved!". Buttons start with verbs. Errors state what happened and what to do next, in that order, without apology theater. Empty states say what belongs there and how to add it, in one sentence. The full guide, with the reasoning and a worked example for every content type on the site, is `VOICE.md`; this paragraph is its summary.

**Accessibility floor.** WCAG AA, ratios per the verified table, re-run on any palette change. Touch targets 44px. Focus per Section 5. Alt text enforced by schema in photography. Errors never communicate by color alone. The ordinary hairline is decorative; ISO Null maps essential boundaries to the 3:1 `--border-essential` semantic token.

**Density modes.** Marketing (portfolio, photography chrome): sections 96 to 128, display type permitted. Application (aircraft): sections 24 to 48, no display type below the page title, density wins ties.

**Iconography.** Lucide, 20px, 1.75px stroke, ink-muted default. Filled and outlined variants never mix.

**Don't.** No gradients. No glass. No texture, anywhere, anymore. No pure black or white. No pills. No orange fills behind text. No title case. No animation that communicates nothing. No centered long-form text.

---

## 7. Per-site application

| | portfolio | aircraft | photography |
|---|---|---|---|
| Theme | Light | Light | **Dark by default** |
| Density | Marketing | Application | Marketing chrome, minimal |
| Display type | Hero `display-xl` | Page title only | Gallery titles only |
| Orange budget | Datum ticks + selected navigation where specified | Favourite and optimistic states | Focus plus one persistent origin/state indicator |
| Section indices | Yes | No | Optional per gallery |
| Mono usage | Overlines, code, dates | Overlines, spec values, table numerics | Overlines, EXIF data plates |
| Container | content | wide (table) | wide (galleries) |

Siblings, not triplets, as before. What changed is whose siblings they are.

---

## 8. Implementation

The shared upstream implementation may expose semantic custom properties through Tailwind v4 `@theme` mappings. ISO Null vendors a flattened dark profile: `design-tokens.css` contains semantic values and Datum motifs, while `global.css` contains base element, link, selection, focus, numeric, image, reduced-motion, forced-colour, and container rules. Every CSS entry point declares `@layer reset, base, components, utilities;` before adding rules so Astro's bundle concatenation cannot invert component and base precedence. `design-preview.html` renders that production profile without a theme control or third-party font dependency.
