# Interaction and accessibility

## 1. Conformance target

ISO Zero targets WCAG 2.2 AA. Selected stronger rules are adopted where they materially improve the interface:

- A focus indicator equivalent to a two-pixel perimeter with at least 3:1 state contrast.
- Viewer controls with a preferred 44 by 44 CSS pixel target.
- Focus never obscured by sticky headers, dialogs, or other authored content.

Automated tools support this target but do not establish conformance by themselves.

## 2. Semantic page structure

Every page must contain:

- One `<main>`.
- A labeled primary `<nav>`.
- Correct heading order.
- `<article>` for self-contained editorial or product content where appropriate.
- `<figure>` and `<figcaption>` for photographs with captions or technical metadata.
- Native links for navigation and native buttons for actions.

Do not use clickable `<div>` elements.

## 3. Alternative text

Alternative text is editorial content, not generated EXIF.

Rules:

- Describe the photograph’s relevant visual content and purpose.
- Avoid camera settings unless they are essential to understanding the image.
- Do not begin with “Image of” or “Photo of” unless the medium itself matters.
- Reject whitespace-only text in schema validation.
- Decorative images use `alt=""` and are omitted from the accessibility tree.
- A thumbnail and its full-size rendering use the same authored alternative text unless their purpose differs.

## 4. Gallery grid interaction

Each photograph uses an anchor with a real derivative URL:

```html
<a
  class="gallery-trigger"
  href="/media/yard-014-2048.avif"
  data-photo-id="yard-014"
>
  <picture>...</picture>
</a>
```

This provides a functional no-JavaScript fallback. The enhancement intercepts the link only when the dialog controller initializes successfully.

The accessible name comes from the image alternative text and optional visible caption. Avoid duplicating the same text through conflicting ARIA attributes.

## 5. Modal viewer

### Element

Use one `<dialog>` opened with `showModal()`.

Rationale:

- A photograph viewer is modal: background interaction should pause while the image is open.
- Native modal dialog behavior provides top-layer rendering and background inertness.
- A single dialog avoids per-photo duplicate markup.

The Popover API remains suitable for non-modal teaching UI, menus, and transient panels. It is not the production modal viewer.

### Required controls

- Close.
- Previous.
- Next.
- Image.
- Caption and EXIF.
- Optional `View image file` link.
- Optional `View print` link where a print offer exists.

### Keyboard contract

| Input | Result |
|---|---|
| Enter or Space on thumbnail | Open selected photograph |
| Escape | Close viewer |
| Arrow Left | Previous photograph |
| Arrow Right | Next photograph |
| Tab / Shift+Tab | Move through viewer controls without escaping into the background |
| Enter / Space on controls | Activate control |

At gallery boundaries, either wrap consistently or disable the unavailable direction. The initial decision is **no wrap** so the beginning and end remain explicit.

### Focus contract

1. Record the invoking thumbnail.
2. Open the dialog.
3. Place focus on the close button or dialog heading according to screen-reader test results.
4. Keep focus within the dialog while open.
5. Restore focus to the invoking thumbnail on close.
6. If navigation changes the active image, retain focus on the activated previous or next control.

The focus indicator must remain fully visible.

### Accessible naming

The dialog requires:

- `aria-labelledby` referencing a concise viewer title or photograph caption.
- `aria-describedby` referencing caption and EXIF where useful.
- A close control labeled `Close image viewer`.
- Previous and next controls labeled with direction and, optionally, the target photograph caption.

Do not use a CSS background as the sole semantic image in the production viewer. The dynamically populated `<img>` carries real `alt`, `width`, and `height` attributes.

## 6. Loading behavior

The viewer image source is assigned only when opening or preloading an adjacent image under a measured policy.

Initial policy:

- Load the selected full-size derivative on open.
- Do not preload all images.
- After open, optionally preload only the next image after the selected image completes and the browser is not in a reduced-data mode.
- Treat preloading as an optimization requiring network tests.

The previous native-popover experiment found browser-specific behavior for images inside closed popovers. The production dialog design does not rely on that behavior, but a cross-browser regression test still verifies that the large derivative is absent before open.

## 7. Responsive behavior

The viewer must work at:

- 320 CSS px width.
- Mobile landscape with limited height.
- 200% browser zoom.
- Desktop ultrawide layouts.

Controls must remain reachable without covering essential image content. The image is constrained by available viewport space after accounting for controls and metadata.

Recommended structure:

```css
.image-dialog__image {
  max-width: min(92vw, 2048px);
  max-height: calc(100dvh - var(--viewer-chrome-height));
  object-fit: contain;
}
```

Use dynamic viewport units with fallbacks where required.

## 8. Motion and preferences

- Honor `prefers-reduced-motion`.
- Honor `prefers-reduced-data` where supported as an enhancement, not a sole control.
- Do not auto-advance photographs.
- Do not animate large spatial movement.
- Do not require dragging; previous and next buttons remain available.

## 9. Screen-reader test matrix

Before launch, test at minimum:

| Platform | Browser | Screen reader |
|---|---|---|
| Windows | Chrome or Edge | NVDA |
| macOS | Safari | VoiceOver |
| iOS | Safari | VoiceOver |
| Android | Chrome | TalkBack |

Record:

- Thumbnail announcement.
- Dialog opening announcement.
- Active photograph name and description.
- Previous, next, and close names.
- Focus return after close.
- Print-link context.

## 10. Automated and manual checks

### Automated

- Axe or equivalent on homepage, gallery, viewer-open state, product page, and legal pages.
- Heading-order checks.
- Duplicate ID checks.
- Missing `alt` checks.
- Dialog control accessible-name checks.
- Color contrast checks for token pairs.

### Manual

- Keyboard-only pass.
- Screen-reader pass.
- 200% zoom.
- Forced-colors mode.
- Reduced motion.
- Touch input.
- Mobile orientation changes.
- Long translated or expanded content where relevant.

## 11. Browser support

The static gallery remains usable without dialog enhancement. The enhancement must support the project’s declared browser matrix and fail open to normal links.

The browser matrix is reviewed at each major release. Platform behavior that is not guaranteed by a standard is recorded as an expiring observation with browser version and test date.
