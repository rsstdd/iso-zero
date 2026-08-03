Because ISO Null demands a strict, machined aesthetic stripped of unnecessary decorative elements, these wireframes are rendered in structural ASCII. This format mirrors the zero-JavaScript, plain-text engineering notebook philosophy the site is built upon.

Here are the structural diagrams for all four primary views defined in the architectural layout.

### 1. The Index (Homepage)

**Container:** `container-wide` (1400px)
**Notes:** The hero image dominates the viewport. The Datum Tick (`|--`) separates the visual from the typography. The footer anchors the page with the Data Plate.

Here is the formatted content, structured as a definitive addendum that you can drop directly into your `WIRE_DIAGRAM` specification document.

---

## Implementation Notes & Constraints

* **Hero Image Architecture:** The site is a legitimate photography portfolio, requiring the hero image to be a single, high-impact photograph. It must be constrained to an `aspect-ratio: 16/9` or `3/2` and fill the entire width of the container. The site title is set in `display-xl` (IBM Plex Serif) and separated from the hero image by a `.rule-datum` hairline featuring a 24px orange tick.
* **Image Pipeline Enforcement:** Despite its size, the hero image must adhere to the site's protective architecture. Resolution is strictly capped at `2048px` on the long edge. It must be processed through Astro's build-time pipeline to generate AVIF and WebP variants, and strictly converted to the sRGB color space to prevent color mangling across displays.
* **Content Tone & Microcopy:** Text content focuses on the photography, the archive, and the artist. The tone must read as an engineering notebook—precise, highly documented, and devoid of generic creative-agency fluff. Microcopy rules are strictly enforced: universally apply sentence case, state limits directly without hedging, and use zero exclamation points or inflated superlatives.
* **Directory Grid & Hover Interactions:** The directory grid utilizes a 2 or 3-column layout of hard-edged (`radius-none`) images. Hover effects are restricted to CSS-only filters, specifically `filter: brightness(0.85)` or `opacity: 0.9`. Scale/zoom transforms, border-radius transitions, and JavaScript-driven animations are entirely prohibited to respect the zero-JavaScript budget and reduced-motion standards.
* **Grid Metadata Anchors:** Directory grid items must not float as bare images. Every featured gallery or print thumbnail must be anchored by a `.data-plate` caption positioned directly beneath it. Set in IBM Plex Mono, this plate outputs either the gallery title and photo count or the primary EXIF summary, reinforcing the system's instrumentation aesthetic.


```text
+-------------------------------------------------------------------------+
|  ISO Null                                         INDEX   [GALLERIES]   |
|-------------------------------------------------------------------------|
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                                                                   |  |
|  |                                                                   |  |
|  |                                                                   |  |
|  |                      HERO IMAGE (16:9 or 3:2)                     |  |
|  |                                                                   |  |
|  |                                                                   |  |
|  |                                                                   |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  |-- (Datum Tick: 24px orange line on 1px dark border)                  |
|                                                                         |
|  [Display-XL | Plex Serif]                                              |
|  SENSORS FIRST. THEN PRODUCTS. THEN PLATFORMS.                          |
|                                                                         |
|                                                                         |
|  +-------------------------------+   +-------------------------------+  |
|  |                               |   |                               |  |
|  |                               |   |                               |  |
|  |       FEATURED DIRECTORY      |   |       FEATURED DIRECTORY      |  |
|  |          (Image Link)         |   |          (Image Link)         |  |
|  |                               |   |                               |  |
|  +-------------------------------+   +-------------------------------+  |
|  [H3 | Plex Sans]                    [H3 | Plex Sans]                   |
|                                                                         |
|-------------------------------------------------------------------------|
|  (Data Plate) © 2026 ISO Null · LAST BUILD: 2026-07-31T12:00:00Z        |
+-------------------------------------------------------------------------+

```

### 2. The Gallery View (with Native HTML Popover)

**Container:** `container-wide` (1400px)
**Notes:** Masonry or CSS Grid layout. Thumbnails act as `<button popovertarget="id">`. No JS is required to open the lightbox overlay.

```text
+-------------------------------------------------------------------------+
|  ISO Null                                         [INDEX]   GALLERIES   |
|-------------------------------------------------------------------------|
|                                                                         |
|  [Display | Plex Serif]                                                 |
|  INDUSTRIAL DECAY & INFRASTRUCTURE                                      |
|                                                                         |
|  [Body-LG | Plex Sans | Max-width 65ch]                                 |
|  A study of structural elements and industrial decay in high-contrast   |
|  environments. Captured on medium format digital and 35mm film.         |
|                                                                         |
|                                                                         |
|  +---------------------+  +---------------------+  +-----------------+  |
|  | [BTN: popover-01]   |  | [BTN: popover-02]   |  | [popover-03]    |  |
|  | ASPECT 3:2          |  | ASPECT 4:5          |  |                 |  |
|  +---------------------+  |                     |  |                 |  |
|  +---------------------+  |                     |  |                 |  |
|  | [BTN: popover-04]   |  +---------------------+  +-----------------+  |
|  | ASPECT 16:9         |  +---------------------+  +-----------------+  |
|  |                     |  | [BTN: popover-05]   |  | [popover-06]    |  |
|  +---------------------+  +---------------------+  +-----------------+  |
|                                                                         |
|-------------------------------------------------------------------------|
|  (Data Plate) © 2026 ISO Null · LAST BUILD: 2026-07-31T12:00:00Z        |
+-------------------------------------------------------------------------+

===========================================================================
[ OVERLAY: NATIVE HTML POPOVER LIGHTBOX ]
===========================================================================
::                                                                       ::
::          +---------------------------------------------------+        ::
::          |                                                   |        ::
::          |                                                   |        ::
::          |                                                   |        ::
::          |               FULL RESOLUTION AVIF                |        ::
::          |              (Constrained to 90vh/vw)             |        ::
::          |                                                   |        ::
::          |                                                   |        ::
::          +---------------------------------------------------+        ::
::          |-- (Data Plate bottom border)                               ::
::          | [Caption | Plex Mono]                                      ::
::          | FUJIFILM X-T4 · 35mm · f/2.8 · 1/500s · ISO 160            ::
::                                                                       ::
::              [ < PREV ]                         [ NEXT > ]            ::
::                                                                       ::
===========================================================================

```

### 3. Print Storefront (PDP)

**Container:** `container-content` (1120px)
**Notes:** A two-column split layout. The image sits sticky on the left while the technical and financial specifications scroll on the right.

```text
+-------------------------------------------------------------------------+
|  ISO Null                                         [INDEX]   GALLERIES   |
|-------------------------------------------------------------------------|
|                                                                         |
|  [CSS GRID: 2 Columns]                                                  |
|                                                                         |
|  +--------------------------------+   [H2 | Plex Serif]                 |
|  |                                |   THE DATUM PRINT                   |
|  |                                |                                     |
|  |                                |   [Placard | 1px Orange Border]     |
|  |                                |   | EDITION OF 10 |                 |
|  |                                |                                     |
|  |                                |   [Tabular Nums | Plex Mono]        |
|  |                                |   450.00 EUR                        |
|  |          PRINT IMAGE           |                                     |
|  |        (position: sticky)      |   |-- (Datum Tick)                  |
|  |                                |                                     |
|  |                                |   [Body | Plex Sans]                |
|  |                                |   Archival pigment on Hahnemühle    |
|  |                                |   Photo Rag. Includes certificate   |
|  |                                |   of authenticity.                  |
|  |                                |                                     |
|  |                                |   [Primary Button | Ink Fill]       |
|  +--------------------------------+   [ PURCHASE PRINT ]                |
|                                                                         |
|                                                                         |
|-------------------------------------------------------------------------|
|  (Data Plate) © 2026 ISO Null · LAST BUILD: 2026-07-31T12:00:00Z        |
+-------------------------------------------------------------------------+

```

### 4. The Colophon / Engineering Notebook

**Container:** `container-prose` (65ch limit)
**Notes:** Strictly constrained width for long-form reading. Overlines (Plex Mono) dictate the section hierarchy. Datum Ticks define structural breaks.

```text
+-------------------------------------------------------------------------+
|  ISO Null                                         [INDEX]   GALLERIES   |
|-------------------------------------------------------------------------|
|                                                                         |
|         [H1 | Plex Serif]                                               |
|         COLOPHON                                                        |
|                                                                         |
|         [Body-LG | Plex Sans]                                           |
|         This site is an engineering notebook and archival catalog.      |
|         It refuses client-side JavaScript runtimes for presentation.    |
|                                                                         |
|         |-- (Datum Tick: 24px orange line on 1px dark border)           |
|                                                                         |
|         [Overline | Plex Mono | Uppercase]                              |
|         01 — ARCHITECTURE & BUILD PIPELINE                              |
|                                                                         |
|         [Body | Plex Sans]                                              |
|         Images are processed via Sharp during the static build          |
|         step to generate AVIF and WebP variants. Aspect ratios          |
|         are calculated server-side and injected as inline CSS           |
|         variables to guarantee zero Cumulative Layout Shift.            |
|                                                                         |
|         |-- (Datum Tick: 24px orange line on 1px dark border)           |
|                                                                         |
|         [Overline | Plex Mono | Uppercase]                              |
|         02 — TYPOGRAPHY & NUMERIC DISCIPLINE                            |
|                                                                         |
|         [Code Block | Plex Mono | Slashed Zero Enforced]                |
|         font-family: 'IBM Plex Mono', monospace;                        |
|         font-feature-settings: "zero";                                  |
|         font-variant-numeric: tabular-nums;                             |
|                                                                         |
|-------------------------------------------------------------------------|
|  (Data Plate) © 2026 ISO Null · LAST BUILD: 2026-07-31T12:00:00Z        |
+-------------------------------------------------------------------------+

```
