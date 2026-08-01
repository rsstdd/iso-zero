# ISO Zero: Architectural Layout & Implementation Specification

This document bridges the **Datum Design System** with the spatial and structural inspiration drawn from high-end, image-forward portfolios (e.g., Rob Schanz, Hazel Eckert, Will Kutscher). It is formatted as a definitive blueprint for an LLM or a junior software engineering intern to execute.

The core directive: **Take the unadorned, image-first minimalism of the reference sites, but execute it through Datum’s dark-themed, engineering-notebook rigor with a strict zero-JavaScript runtime.**

---

## 1. Global Spatial Directives

The reference sites succeed because they let the images breathe. ISO Zero achieves this same high-end gallery feel, but rather than relying on massive white space, it uses the deep space of the `--bg` (`#191611`) canvas, delineated only by 1px hairlines (`#3a352c`).

* **The Grid over the Freeform:** Unlike some reference sites that use floating, overlapping images, ISO Zero enforces strict structural boundaries. Every container aligns to a predictable grid.
* **Vertical Rhythm:** Spacing is generous but mathematically rigid (using a 4px base scale). Gaps between discrete sections should be `96px` or `128px`.
* **Edge-to-Edge discipline:** The main `container-wide` (`1400px`) restricts text, but hero images or full-bleed gallery dividers may break out to `100vw`.

---

## 2. Page-by-Page Layout Specifications

### 2.1 The Index (Homepage)

The homepage acts as a stark, high-impact directory. It borrows the immediate, image-forward impact of the inspirations but wraps it in technical precision.

* **Header (Sticky):** A translucent `#191611` background (85% opacity, backdrop-blur) with a bottom hairline. The site title is on the left; navigation is on the right. Links are set in `overline` (IBM Plex Mono, uppercase). Active pages get the International Orange (`#e8632c`) underline.
* **Hero Section:** A single, massive photograph spanning the `container-wide` width. Set at `aspect-ratio: 16/9` or `3/2`. Below the image, a `.rule-datum` (1px hairline with the 24px orange tick) separates the image from the site title (set in `display-xl` Plex Serif).
* **Directory Grid:** A 2-column or 3-column CSS Grid of featured galleries/prints. Each item is a hard-edged (`radius-none`) image. Hovering the container slightly dims the image via CSS filter, but no JS animations are permitted.
* **Data Plate Footer:** At the bottom of the page, a `.data-plate` hairline containing copyright, last-build ISO 8601 timestamp, and a link to the colophon.

### 2.2 The Gallery View

This is the core of the portfolio, drawing heavily on the masonry or strict-grid layouts of the reference sites, but optimized for zero layout shift (CLS).

* **Gallery Header:** The title is set in `display` (Plex Serif). Below it, an introductory paragraph set in `body-lg` (Plex Sans), capped at `65ch` wide.
* **The Photo Grid:** A CSS Grid layout (`display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 8px;`).
* **Image Enforcement:** Every `<figure>` must have an explicit `aspect-ratio` inline style matching the source image to prevent CLS.
* **The Lightbox (Native HTML):**
* Clicking a thumbnail does not trigger a JS modal. Instead, the thumbnail is a `<button popovertarget="photo-id">`.
* The target `<dialog popover>` or `<div popover>` covers the screen.
* Inside the popover, the image is constrained by `max-height: 90vh` and `max-width: 90vw`.
* Directly beneath the image, a `.data-plate` element renders the EXIF data in Plex Mono (e.g., `FUJIFILM X-T4 · 35mm · f/2.8 · 1/500s · ISO 160`).



### 2.3 The Print Storefront (PDP)

A product detail page that reads like an industrial spec sheet rather than a consumer e-commerce site.

* **Layout:** A 2-column layout on desktop (`lg` breakpoint).
* **Left Column (Sticky):** The primary print image, taking up the full width of its column.
* **Right Column (Scrolling):** The technical and financial data.


* **Typography:** The print title is `h2` (Plex Serif). The price is strictly tabular Mono (`font-variant-numeric: tabular-nums`), formatted explicitly (e.g., `450.00 EUR`).
* **Metadata Tags:** Edition sizes (e.g., `[EDITION OF 10]`) are rendered as `.placard` components (1px orange border, orange text, no fill).
* **Action:** A primary button (Ink background `#ede7db`, dark text `#191611`). The microcopy must be a direct verb: "Purchase print".

### 2.4 The Colophon / Engineering Notebook

A text-heavy page detailing the tech stack, build pipeline, and design philosophy.

* **Layout:** Constrained strictly to `container-prose` (`65ch`).
* **Typography:** `h1` (Plex Serif) for the page title. Sections are divided by `.rule-datum` hairlines with the orange tick. Section headers are `h2` (Plex Serif), and sub-headers are `overline` (Plex Mono).
* **Content:** Standard markdown rendering. Inline code and code blocks must enforce `font-feature-settings: "zero"` (slashed zero).

---

## 3. Implementation Directives (For the Developer/Intern)

Read this section carefully. Architectural drift is not permitted. You are building a static site that relies entirely on HTML APIs and CSS.

1. **Zero-JavaScript Runtime:** You may not write or include any client-side JavaScript.
* *No intersection observers* for fade-ins. Images load via native `loading="lazy"`.
* *No click handlers* for the lightbox. You must use the HTML `popover` attribute and `popovertarget`.
* *No state-management libraries.* Any cart/checkout logic must be handled entirely server-side or via standard HTML `<form>` submissions to a backend endpoint.


2. **CSS Architecture:**
* Use CSS Custom Properties defined in the `:root` for all colors and typography tokens.
* Rely on CSS Grid and Flexbox for all layout constraints.
* Do not use utility classes (like Tailwind) unless a build step is specifically configured to strip unused CSS; semantic class names mapping to Datum components (e.g., `.data-plate`, `.rule-datum`) are preferred for maintainability.


3. **Image Pipeline:**
* You are responsible for writing semantic HTML `<picture>` elements.
* Assume images will be processed at build time (e.g., via Sharp). You must provide `avif` and `webp` sources alongside a fallback `jpeg`.
* Include explicit `width`, `height`, and `aspect-ratio` on all `<img>` tags.


4. **Accessibility (a11y):**
* Every interactive element (buttons, links, popover triggers) must feature the Datum focus state (`outline: 2px solid var(--focus-ring); outline-offset: 2px;`) upon `:focus-visible`.
* All images must have descriptive `alt` text.
* Semantic structure (`<main>`, `<article>`, `<nav>`, `<aside>`) is strictly enforced.
