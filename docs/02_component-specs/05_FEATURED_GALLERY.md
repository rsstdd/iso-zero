# Component specification — `FeaturedGallery.astro`

Status: implementation-ready  
Implementation: `src/components/FeaturedGallery.astro`

## 1. Responsibility

The featured gallery component renders the homepage's primary action as one linked figure: a fixed, uncropped signature photograph followed by a compound metadata plate.

It does not select the featured gallery, load collections, expose EXIF, open the gallery viewer, offer a print, crop the image, or contain nested controls.

## 2. Dependencies

- Astro `Picture` or the project image helper backed by Astro/Sharp
- `DataPlate.astro`
- Deterministic date and count formatters from `src/lib/`
- Datum tokens and wide-container utility

The component receives a resolved presentation model and does not import authored gallery files directly.

## 3. Public contract

```ts
interface FeaturedGalleryModel {
  readonly slug: string;
  readonly title: string;
  readonly location: string;
  readonly publicationDate: Date;
  readonly imageCount: number;
  readonly hero: {
    readonly id: string;
    readonly src: ImageMetadata;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
  };
}

interface Props {
  readonly gallery: FeaturedGalleryModel;
}
```

Launch values:

| Field | Value |
| --- | --- |
| Slug | `venice` |
| Title | `Venice` |
| Location | `Venice, Italy` |
| Publication | `2026-08-01` rendered as `August 2026` |
| Count | `12 images` |
| Hero ID | `venice-arcade` |
| Source | `_DSF0140.JPG` |
| Dimensions | 2048 × 1155 |

## 4. Required semantic output

```astro
<a
  class="featured-gallery"
  href="/galleries/venice/"
  aria-labelledby="featured-action featured-title"
  aria-describedby="featured-image-description featured-meta"
>
  <figure>
    <Picture>
      <img
        width="2048"
        height="1155"
        alt="Receding stone arches and hanging lanterns along an arcade in Venice."
      />
    </Picture>
    <DataPlate as="figcaption" class="featured-gallery__plate">
      <h2 id="featured-title">Venice</h2>
      <span id="featured-image-description" class="visually-hidden">
        Receding stone arches and hanging lanterns along an arcade in Venice.
      </span>
      <span id="featured-meta" class="featured-gallery__meta">
        <span>Venice, Italy</span>
        <time datetime="2026-08">August 2026</time>
        <span>12 images</span>
      </span>
      <span id="featured-action" class="featured-gallery__action">
        Enter gallery <span aria-hidden="true">→</span>
      </span>
    </DataPlate>
  </figure>
</a>
```

This example defines relationships, not the literal `Picture` API.

The complete figure is one native link. No link or button may appear inside it.

## 5. Accessible name and description

- Accessible name: `Enter gallery Venice`, assembled by `aria-labelledby` in action-first order.
- Accessible description: the photograph description followed by visible location, publication month/year, and image count.
- The `img` retains non-empty editorial alt text.
- The decorative arrow is hidden from assistive technology.

Some screen readers may announce linked-image descendants differently. VoiceOver/Safari and NVDA/Firefox tests decide whether the hidden image-description reference produces repetition. If repetition occurs, change the `aria-describedby` composition while preserving:

1. a concise action-oriented link name,
2. discoverable visual description of the photograph,
3. discoverable gallery metadata, and
4. non-empty authored image alt text unless the final semantic pattern documents why the image is redundant.

The screen-reader result remains **[UNVERIFIED]** until recorded.

## 6. Content rules

- All visible fields derive from the resolved gallery model.
- Displayed date is publication, never photograph capture time.
- Date formatter uses English long month, four-digit year, and UTC to avoid host-timezone drift.
- Mobile and desktop both display `August 2026`; copy does not change at a breakpoint.
- Counts use correct singular/plural grammar.
- Alt text is trimmed, non-empty, descriptive, and non-technical.
- EXIF, camera, lens, SKU, price, and capture date are absent.
- `Enter gallery` is the only action phrase.

The proposed alt text must receive editorial approval before publication.

## 7. Image delivery contract

- Final production source: 2048 × 1155 JPEG derivative; private original remains outside source and build output.
- Output formats: AVIF, WebP, JPEG fallback.
- Candidate widths: 640, 960, 1280, 1600, 2048, subject to source ceiling.
- Explicit intrinsic width and height reserve layout space.
- Aspect ratio: 2048 / 1155.
- sRGB conversion and the project's metadata strip/re-embed policy apply.
- `loading="eager"`, `fetchpriority="high"`, and `decoding="async"` identify the LCP image.
- No other homepage image receives high fetch priority.
- Use either verified preload or high fetch priority alone until network inspection proves no duplicate request.
- `sizes` matches actual container and gutter calculations. A contract test compares representative viewport layout widths with the emitted `sizes` selection.
- No candidate exceeds 2048 px on either source dimension.

## 8. Geometry and responsive behavior

- Component uses the wide container.
- The photograph's complete composition remains visible at every size.
- `object-fit: cover`, fixed crop boxes, overflow clipping, `clip-path`, and art-directed crops are prohibited.
- Media wrapper centres the image when viewport height limits width.
- Apply `max-block-size: 72vh` as fallback, followed by `max-block-size: 72svh`; preserve automatic block size and maximum 100% inline size.
- Exposed area around a height-limited image uses `var(--bg)`, not a panel.
- Metadata may continue below the first viewport.
- Image, figure, and plate remain square and shadowless.

Plate layout:

- Wide: serif title in the first column; mono metadata and Sans action in a compact second group.
- Narrow: title occupies the first row; metadata and action wrap below.
- Source order remains title, metadata, action.
- Use one content-driven enhancement breakpoint, initially `48rem`, and adjust only after real-font collision testing.

## 9. Datum mapping

- Gallery title: IBM Plex Serif, `var(--text)`.
- Location/date/count: IBM Plex Mono, tabular figures, `var(--text-muted)`.
- Action: IBM Plex Sans, `var(--text)`, persistent underline.
- Plate: `DataPlate` decorative hairline and spacing.
- Focus: global accent outline around the complete link.
- No accent text, orange fill, overlay, gradient, radius, shadow, watermark, or image filter.

## 10. Interaction states

- Default: image unchanged; action visibly underlined.
- Hover: action underline may strengthen; decorative arrow may move at most 2 px inline with Datum motion tokens.
- Focus-visible: one outline around the complete anchor; descendants do not add focus rings.
- Active: no scaling or layout movement.
- Visited: normal Datum palette.
- Reduced motion: arrow translation is removed.
- Forced colours: link, underline, and focus outline remain distinguishable using system colours.

## 11. Failure behavior

The build fails if:

- slug, title, location, or alt text is blank;
- publication date is invalid;
- image count is less than one;
- dimensions are unknown or differ from image metadata;
- hero ID does not resolve in the selected gallery;
- source exceeds or bypasses the project delivery policy.

The component never falls back silently to gallery cover, newest photo, placeholder copy, missing location, or broken image.

## 12. Verification

| Concern | Check |
| --- | --- |
| Destination | `/galleries/venice/` resolves |
| Full hit area | Pointer on image and plate activates same link |
| Keyboard | Enter activates; Space retains native-link scrolling behavior |
| Name/description | Accessibility-tree assertion plus two SR/browser combinations |
| Alt text | Schema and DOM non-whitespace assertion |
| Date/count | UTC date snapshot; singular/plural unit tests |
| Sources | Expected formats and widths; none above 2048 |
| Priority | One high-priority LCP request; no duplicate preload |
| Layout shift | Explicit dimensions; field CLS recorded as 0 |
| Crop | Visual checks at 320, 390, 768, 1024, 1440 and short landscape |
| Plate reflow | Title-first DOM remains unchanged across breakpoint |
| Datum | Fonts, tokens, square geometry, no shadow/filter/overlay |
| Accessibility | Axe-core, forced colours, zoom, text spacing |

## 13. Change rules

Changing hero interaction, crop policy, metadata fields, accessible naming, priority, source widths, or plate structure requires this specification, the homepage specification, and relevant automated/manual checks to change together.
