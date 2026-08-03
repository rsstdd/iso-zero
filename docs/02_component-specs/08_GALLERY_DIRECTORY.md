# Component specification — `GalleryDirectory.astro`

Status: implementation-ready
Implementation: `src/components/GalleryDirectory.astro`

---

## 1. Responsibility

The gallery directory exposes every real, non-draft gallery as a highly visual grid index. It showcases a cover image for each gallery to provide immediate visual context for the photography portfolio.

It does not load content collections, filter drafts, sort entries, or duplicate the featured hero's complete metadata.

## 2. Dependencies

* `RuleDatum.astro`
* Deterministic year and count formatters from `src/lib/`
* Datum display, data, link, and spacing tokens
* (Optional but recommended) Astro's native `<Image/>` component for asset optimization.

## 3. Public contract

```ts
interface GallerySummary {
  readonly slug: string;
  readonly title: string;
  readonly publicationDate: Date;
  readonly imageCount: number;
  readonly coverSrc: string;
  readonly coverAlt: string;
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
  <ul class="gallery-grid">
    <li class="gallery-grid__item">
      <a href="/galleries/venice/" class="gallery-card">
        <div class="gallery-card__media">
           <img src="/assets/venice-cover.jpg" alt="Gondolas on the Grand Canal" loading="lazy" />
        </div>
        <div class="gallery-card__content">
          <h3>Venice</h3>
          <span class="gallery-card__meta">
            <time datetime="2026">2026</time>
            <span>12 images</span>
          </span>
        </div>
      </a>
    </li>
  </ul>
</RuleDatum>

```

## 5. Content rules

* Heading: `Available galleries`.
* Card fields: Cover image, title, four-digit publication year, image count.
* Cover Images must be cropped/styled to a `3:2` aspect ratio.
* The entire card (image + text) acts as a single hit area for the link.

## 6. Layout and responsive behavior

* Grid: Auto-filling CSS grid (`minmax(18rem, 1fr)`).
* Scaling: Images scale dynamically to fill their grid track while maintaining their aspect ratio.
* Wrapping: Handles intrinsic wrapping at any viewport size without specific media-query breakpoints.
* Hover: The image scales up slightly (`scale(1.03)`) inside a hidden-overflow container, and the title receives an underline.

## 7. Accessibility contract

* Labelled `section` with an `h2`.
* List semantics (`ul`/`li`) announce the total number of available galleries.
* Images include descriptive `alt` text. If the image is purely decorative and repeats the title, `alt=""` is permitted, though descriptive is preferred for a visual portfolio.
* Focus order matches DOM order (left-to-right, top-to-bottom).
* `focus-visible` creates a single, unbroken outline around the entire card structure, not just the text.

---

## 3. Test Documentation

Testing the new visual component requires ensuring the grid behaves correctly and the new image invariants hold.

### Data Validation Tests

* **Rejects empty array:** Throws a `TypeError` if `galleries` is empty.
* **Validates image properties:** Throws a `TypeError` if `coverSrc` is missing or not a string.
* **Validates existing invariants:** Ensures duplicates slugs, blank titles, invalid dates, and negative image counts still throw standard `TypeError`s.

### DOM & Accessibility Tests

* **Semantic Structure:** Asserts the presence of `<section>`, `<h2>`, `<ul>`, and `<li>`.
* **Image Rendering:** Asserts an `<img>` tag exists for each card with the correct `src` and `alt` attributes. Asserts `loading="lazy"` is present to prevent homepage performance regressions.
* **Single Hit Area:** Verifies that the `<a>` tag wraps both the `gallery-card__media` and `gallery-card__content` so mouse/touch users have a large click target.
* **Axe-Core:** Passes standard automated accessibility audits (colour contrast, ARIA landmarks, valid alt text).

### Visual Regression / Layout Tests (Playwright/Cypress)

* **Grid Reflow:** Validates that at a viewport width of `320px`, the grid collapses to a single column. At `1200px`, it expands to 3 or 4 columns based on the `18rem` minimum.
* **Aspect Ratio Preservation:** Asserts the `.gallery-card__media` container maintains a `3:2` bounding box regardless of viewport width.
* **Hover States:** Validates that hovering the `<a>` triggers the `1.03` scale transform on the image and applies the underline to the `<h3>`.
