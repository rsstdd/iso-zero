# ISO Zero Design System Specification

This document defines the **Datum** design system instantiation for **ISO Zero**, a zero-JavaScript photography portfolio and commercial print storefront. It translates Datum’s general principles—precision with warmth, an instrumentation sensibility, and strict data formatting—into an authoritative implementation guide for developers and designers.

---

## 0. System Premise & Core Principles

ISO Zero operates as an engineering notebook and archival catalog rather than a marketing brochure. It rejects client-side JavaScript runtimes for presentation, relying instead on static HTML compilation, Sharp image transformations, and native browser APIs.

The visual system is governed by five non-negotiable principles:

1. **Dark by Default.** Photographs require neutral, low-luminance chrome to prevent visual color tinting. ISO Zero defaults strictly to Datum's dark theme.


2. **Monochrome Chrome, One Instrument Color.** Interface boundaries rely on subtle ink lines. The sole accent color is **International Orange**, reserved strictly for state, focus, navigation indicators, and verified system metadata.


3. **Borders Before Shadows.** Structure is established via 1px hairlines (`#3a352c`). Shadows are warm-tinted and reserved exclusively for top-layer elements like the native popover lightbox.


4. **Data Reads as Data.** EXIF metadata, camera settings, print SKUs, timestamps, and currency values are set in monospace with slashed zeros and tabular numerals. Dates strictly enforce ISO 8601 (`YYYY-MM-DD`).


5. **Verified, Not Vibed.** All contrast pairs meet or exceed WCAG 2.x AA standards. Every layout constraint serves visual accuracy or zero-runtime performance.



---

## 1. Color Architecture

ISO Zero implements the **Datum Dark Palette** as its default runtime surface.

```css
[data-theme="dark"] {
  --bg: #191611;          /* Canvas background */
  --surface: #221e18;     /* Popovers, cards, data plates */
  --well: #26221b;        /* Sunken wells, table/grid fills */
  --border-c: #3a352c;    /* Hairlines, datum tick rules */
  --text: #ede7db;        /* Primary body & display ink */
  --text-muted: #a39b8c;  /* EXIF captions, secondary text */
  --brand: #ede7db;        /* Chrome brand token */
  --accent: #e8632c;       /* International Orange (Lifted) */
  --accent-text: #e8632c;  /* Accent text fill */
  --focus-ring: #e8632c;   /* Accessibility focus outline */
  --shadow-tint: 0 0 0;    /* Pure black popover shadows */
}

```

### 1.1 Verified Contrast Ratios (WCAG 2.x)

| Element Pair | Foreground / Background | Ratio | Verdict | Application Rule |
| --- | --- | --- | --- | --- |
| **Primary Text** | `#ede7db` / `#191611` | **14.65:1** | AA + AAA | Main typography, gallery titles, print prices

 |
| **Muted Text** | `#a39b8c` / `#191611` | **6.55:1** | AA Body | EXIF metadata, technical captions, footnotes

 |
| **Accent Marking** | `#e8632c` / `#191611` | **5.37:1** | AA Body | Active states, focus rings, placards, datum ticks

 |
| **Raised Surface** | `#221e18` / `#191611` | N/A | Structural | Popover dialog containers, card fills

 |

### 1.2 The Orange Rule

Raw International Orange (`#e8632c`) is an instrument color, not a decorative paint.

* **Permitted Uses:** Active page underlines, focus outlines, datum tick marks, mono overlines, outlined placard borders, and system status indicators.


* **Forbidden Uses:** Solid orange background fills behind text are strictly prohibited. Badges and tags must use outlined placards (1px orange border, `#e8632c` text on dark background) to maintain strict legibility.



---

## 2. Typography & Numeric Discipline

ISO Zero uses the **IBM Plex Superfamily**. Loading three faces built on a shared skeleton connects display headings, body prose, and machine metadata under a single design language.

```
IBM Plex Serif   ───  Display Headings, Gallery Titles (Serif, 600)
IBM Plex Sans    ───  Body Prose, UI Labels, Storefront Copy (Sans, 400/500/600)
IBM Plex Mono    ───  EXIF Plates, SKUs, Dimensions, Currency, Dates (Mono, 400/600)

```

### 2.1 Typographic Scale

| Token | Size / Line-Height | Font Face & Weight | Usage Boundary |
| --- | --- | --- | --- |
| `display-xl` | `clamp(2.75rem, 5vw + 1rem, 4.5rem)` / 1.05 | IBM Plex Serif, 600 | Site hero title (homepage only)

 |
| `display` | `clamp(2.25rem, 3.5vw + 1rem, 3.25rem)` / 1.1 | IBM Plex Serif, 600 | Gallery collection titles

 |
| `h1` | `2.00rem` (32px) / 1.15 | IBM Plex Serif, 600 | Section headers

 |
| `h2` | `1.50rem` (24px) / 1.25 | IBM Plex Serif, 600 | Subsections, print series headings

 |
| `h3` | `1.25rem` (20px) / 1.30 | IBM Plex Sans, 600 | Product / Print card titles

 |
| `overline` | `0.8125rem` (13px) / 1.20 | **IBM Plex Mono, 600** | Eyebrows, nav links, section indices (`TRACKING 0.08em`, UPPERCASE)

 |
| `body-lg` | `1.125rem` (18px) / 1.60 | IBM Plex Sans, 400 | Lead paragraphs, intro copy

 |
| `body` | `1.00rem` (16px) / 1.65 | IBM Plex Sans, 400 | Default body text (max width 65ch)

 |
| `caption` | `0.8125rem` (13px) / 1.40 | IBM Plex Mono, 400 | EXIF plates, SKU specs, copyright lines

 |

Note: IBM Plex Serif is never rendered below `1.25rem` (20px). All eyebrows and overlines are explicitly set in IBM Plex Mono.

### 2.2 Numeric Discipline & Formatting

* **Tabular Numerals:** All financial figures, dimensions, timestamps, and EXIF parameters enforce `font-variant-numeric: tabular-nums` to eliminate layout jitter.


* **Slashed Zeros:** All code and mono contexts enforce `font-feature-settings: "zero"` to cleanly distinguish `0` from `O`.


* **ISO 8601 Dates:** Technical metadata uses strict `YYYY-MM-DD` formatting (e.g., `2026-07-31`). Prose dates are restricted to narrative body text.



---

## 3. Geometry, Surfaces & Motifs

ISO Zero relies on clean structural boundaries rather than soft radius treatments or visual noise.

### 3.1 Radii Rules

* **Photographs:** `border-radius: 0` in all contexts without exception. Rounding photographic compositions is prohibited.


* **Containers & Cards:** `radius-none` (`0px`) default.


* **Interactive Controls:** `radius-xs` (`2px`) maximum for buttons, inputs, popovers, and placard tags. Soft corners (e.g., 8px or rounded pills) are strictly retired.



### 3.2 The Three Datum Motifs

#### 1. The Datum Tick (`.rule-datum`)

Structural dividers feature a 1px border (`--border-c`) topped with an absolute-positioned 24px wide by 2px high International Orange tick mark at the left origin.

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

#### 2. The Data Plate (`.data-plate`)

Captions, EXIF technical lines, and print metadata render below a 1px hairline in IBM Plex Mono.

```css
.data-plate {
  border-top: 1px solid var(--border-c);
  padding-top: 8px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--text-muted);
  font-feature-settings: "zero";
  font-variant-numeric: tabular-nums;
}

```

#### 3. The Placard Tag (`.placard`)

Status tags (e.g., `[IN STOCK]`, `[LIMITED EDITION 1/10]`) are rendered as outlined containers.

```css
.placard {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-xs);
  color: var(--accent-text);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
}

```

---

## 4. Layout Architecture & Component Rules

ISO Zero uses standard layout breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px). Layout boundaries are constrained to three primary containers:

* `container-prose`: `65ch` max width (legal text, documentation, colophon).


* `container-content`: `1120px` max width (standard content pages).


* `container-wide`: `1400px` max width (galleries, print storefront grids).



### 4.1 Gallery Grid Layout

* **Grid Structure:** 2-column or 3-column responsive flex/grid with 8px gaps.


* **Zero CLS Enforcement:** Every `<figure>` grid item explicitly defines an inline `aspect-ratio` derived from Sharp build metrics, ensuring zero Cumulative Layout Shift during static rendering.
* **Image Variants:** Delivered variants are capped at 2048px on the long edge with sRGB color space conversion.



### 4.2 Native Popover Lightbox (Zero-JS)

The lightbox uses the HTML Popover API (`popovertarget`). Popover dialogs float at Level 3 elevation using heavy warm-tinted/black shadows (`--shadow-lg`) bound by a 1px hairline border (`#3a352c`).

```html
<!-- Grid Trigger Button -->
<button popovertarget="photo-frame-01" class="gallery-trigger">
  <img src="/assets/photo-01-2048w.avif" alt="Fujifilm X-T4 sample" style="aspect-ratio: 3/2;" loading="lazy" />
</button>

<!-- Native Popover Modal Layer -->
<div id="photo-frame-01" popover class="lightbox-dialog">
  <div class="lightbox-wrapper">
    <img src="/assets/photo-01-2048w.avif" alt="Fujifilm X-T4 sample" />

    <footer class="data-plate">
      <span>FUJIFILM X-T4 · XF35mmF1.4 R · 35mm · f/2.8 · 1/500s · ISO 160</span>
      <a href="/prints/SKU-XT4-35MM" class="placard">BUY PRINT [450.00 EUR]</a>
    </footer>

    <nav class="popover-nav">
      <button popovertarget="photo-frame-00" popovertargetaction="show">PREV</button>
      <button popovertarget="photo-frame-02" popovertargetaction="show">NEXT</button>
    </nav>
  </div>
</div>

```

### 4.3 Buttons & Interactive Controls

* **Primary Buttons:** High-contrast solid ink (`#ede7db` background with `#191611` text fill, switching to `#fbf9f5` on hover).


* **Secondary Buttons:** Transparent fill, 1px `#3a352c` border, `#ede7db` text.


* **Link Overlines:** Inline mono links carry a leading tick rather than a trailing arrow.


* **Focus States:** Every interactive control enforces a 2px solid `#e8632c` outline with a 2px offset.



### 4.4 Commercial Print Storefront (PDP)

Print offers require a valid `print` object in frontmatter:

* **Gross Integer Cents:** Stored as integers (`45000`) and rendered formatted (`450.00 EUR`) to avoid floating-point math issues and satisfy EU price display laws.


* **SKU & Edition Tagging:** Displayed inside an inline `.placard` (`[EDITION OF 10]` or `[OPEN EDITION]`).



---

## 5. Voice & Microcopy Standards

ISO Zero's interface text follows strict engineering microcopy standards:

1. **Sentence Case Everywhere:** Apply sentence case across all headings, buttons, and navigation nodes.


2. **Zero Exclamation Points:** Exclamation marks are banned. Direct facts build authority; punctuation fluff undermines it.


3. **Action-First Verbs:** Buttons must start with a direct verb (e.g., "Purchase print", "Download EXIF").


4. **Unhedged Technical Disclosures:** State limits flatly without apology (e.g., "Arrow-key navigation is omitted to enforce a zero-JavaScript performance budget").


5. **No Filler States:** Use concise confirmation tags (e.g., "Order placed", not "Thank you! Your order was successfully processed!").
