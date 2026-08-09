# Component specification — `PhotoPopover.astro`

Status: implementation-ready, written retroactively against the current implementation. Known conformance gaps are listed in §10 rather than hidden, per `AGENTS.md`'s evidence rule.
Implementation: `src/components/PhotoPopover.astro`

## 1. Responsibility

`PhotoPopover` renders one gallery photograph's enlarged view as a native HTML [`popover`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) element: the larger image, its data plate (caption plus EXIF), a print link where one exists, and Previous/Next/Close controls wired entirely through `popovertarget`/`popovertargetaction` attributes. One instance renders per photograph; `src/pages/galleries/[slug].astro` renders the full set immediately after `PhotoGrid.astro`'s grid, matching the markup contract owned by [`05_INTERACTION_AND_ACCESSIBILITY.md`](../05_INTERACTION_AND_ACCESSIBILITY.md) "The viewer" — that document owns the `popover`/`popovertarget` contract, the keyboard model, the focus-trap tradeoff, and the WCAG conformance target. This document does not restate any of them; it only maps them onto this component.

It does not: decide gallery ordering or derive trigger ids (owned by `PhotoGrid.astro`'s `triggerId`), fetch or transform image assets (owned by `astro:assets` and `src/content.config.ts`), format EXIF (owned by `src/lib/exif.ts`), decide print pricing or SKU rules (owned by [`06_COMMERCE_AND_LEGAL.md`](../06_COMMERCE_AND_LEGAL.md)), or run any client-side script. Every open/close/navigate/dismiss behavior is native browser behavior driven by the `popover` attribute, `popovertarget`, and the `:popover-open` CSS pseudo-class — there is no JavaScript anywhere in this component's contract.

## 2. Dependencies

- `astro:assets` `Picture`, for responsive avif/webp/jpeg output.
- `src/lib/exif.ts` `formatExif`, for the recorded-data summary line.
- The `.data-plate` Datum motif defined in `src/styles/global.css` (not the `DataPlate.astro` component — this component, like `PhotoGrid.astro`, applies the `.data-plate` class directly to a `div` rather than composing `<DataPlate>`; the two produce different output, and `DataPlate.astro`'s own richer prop surface is unused here).
- `05_INTERACTION_AND_ACCESSIBILITY.md`'s `popover`/`popovertarget` contract and keyboard model — browser-native; this component emits attributes, not behavior.
- An id-space contract with `PhotoGrid.astro`: `id`, `previousId`, and `nextId` must exactly match the ids `PhotoGrid.astro`'s `triggerId(gallerySlug, index)` assigns to grid trigger buttons. Neither component computes the other's ids directly — `src/pages/galleries/[slug].astro` is the only caller responsible for deriving matching ids for both from the same `photos` array and index, and it currently does so correctly by construction (adjacent-index lookups against the same array). No automated check guards this invariant directly; see §10.
- `src/content.config.ts`'s print schema, for the `sku` used to build the print link's `/prints/${sku}/` href.

## 3. Public contract

```ts
interface PhotoExif {
  readonly camera: string;
  readonly lens: string | null;
  readonly focalLengthMm: number;
  readonly fNumber: number;
  readonly exposureTimeSec: number;
  readonly iso: number;
  readonly shotAt: Date;
}

interface PhotoPrint {
  readonly sku: string;
}

interface PopoverPhoto {
  readonly src: ImageMetadata;
  readonly alt: string;
  readonly caption?: string;
  readonly exif: PhotoExif;
  readonly print?: PhotoPrint;
}

interface Props {
  readonly id: string;
  readonly photo: PopoverPhoto;
  readonly previousId?: string | null;
  readonly nextId?: string | null;
}
```

`id` must be non-blank; the component throws a `TypeError` at build time otherwise. `previousId`/`nextId` are `null` at a gallery's first/last photograph, which omits the corresponding button rather than rendering a dead one (see §5). There is no `open` prop: visibility is entirely owned by the browser through the `popover` attribute and the `:popover-open` pseudo-class, not by an author-set boolean (see §11 for why an unconditional CSS `display` once broke exactly this).

## 4. Required semantic output

```html
<div popover id="p-<slug>-<n>" role="dialog" aria-label="<photo.alt>" class="photo-popover">
  <picture><!-- avif/webp/jpeg, widths capped to photo.src.width --></picture>
  <div class="data-plate photo-popover__plate">
    <p class="photo-popover__caption"><!-- photo.caption, when present --></p>
    <p><!-- formatExif(photo.exif).summary --></p>
  </div>
  <div class="photo-popover__controls">
    <button type="button" popovertarget="<previousId>" popovertargetaction="show">Previous</button>
    <a href="/prints/<sku>/" class="standalone photo-popover__print">View print</a>
    <button type="button" popovertarget="<nextId>" popovertargetaction="show">Next</button>
  </div>
  <button type="button" popovertarget="p-<slug>-<n>" popovertargetaction="hide" aria-label="Close image viewer" class="photo-popover__close">Close</button>
</div>
```

The Close button is last in document order deliberately, even though it is positioned visually at the top-left. `05_INTERACTION_AND_ACCESSIBILITY.md` documents this as making "tab to the end, then Escape" a coherent pattern; this document does not repeat that rationale beyond pointing to it.

## 5. Content rules

- Caption is plain text, never markup. `src/content.config.ts` types it `z.string().optional()`, and Astro's `{photo.caption}` interpolation auto-escapes it — there is no caption-HTML acceptance path in this component to sanitize (see §13, Developer API).
- The EXIF summary line always renders; it has no presence condition, unlike the caption.
- Previous/Next buttons render only when the corresponding id is non-null. A gallery boundary omits the button rather than rendering one that points nowhere or wraps — there is no loop behavior (see §13, Navigation).
- The print link renders only when `photo.print` is present, and its full label is "View print", not an icon-only control.
- `alt` is required, non-blank, and enforced by `src/content.config.ts`'s `altText` schema refinement at content-validation time — a blank or whitespace-only alt fails the build before this component ever renders, so this component does not itself re-validate it.

## 6. Datum mapping

- Panel: 1 px `--border-c` border, `--bg` background, no radius. **`box-shadow: var(--shadow-lg)` is applied — this contradicts `00_COMPONENT_SPECIFICATIONS.md` §5's "Shadows are prohibited" and is a known gap, not a documented exception. See §10.**
- `::backdrop`: `rgb(25 22 17 / 0.8)`, which is `--bg` (`#191611`) at 80% opacity, hardcoded rather than derived from the token. See §10.
- Caption paragraph: `--text` colour, `--font-interface` (Sans) — prose, styled independently of the surrounding data plate.
- EXIF summary paragraph: inherits `.data-plate`'s `--font-data` (Mono), `--text-muted`, tabular numerals, and `"zero"` feature settings — recorded data, per `04_DESIGN_SYSTEM.md`'s "Mono carries recorded data" rule. This inheritance is implicit (the paragraph carries no class of its own); it is stated here because it is not obvious from the markup alone.
- Controls and Close button: `--target-min` (44 px) minimum box, `--border-c` border, `--surface` background, `--font-interface`.
- Focus: `--focus-ring` (`--accent`) 2 px outline, 2 px offset, matching the global `:focus-visible` convention.

## 7. Responsive behavior

The panel's `max-inline-size` and `max-block-size` are computed from the viewport and `--page-gutter`, not a fixed breakpoint. The image itself is bounded to `max-inline-size: 100%; max-block-size: 70svh` with `inline-size/block-size: auto`, and the `Picture` `widths` array is filtered to values at or below the source's native width — it never asks the browser to request or display a raster wider than the original, matching the "no pixelation beyond native dimensions" requirement in §13 by construction. No dedicated `*.reflow.spec.ts` exists for this component, unlike its sibling components (`homepage`, `site-header`, `site-footer`, `featured-gallery`, `data-plate`); this is a coverage gap, not a known defect (see §12).

## 8. Interaction states

| State | Trigger | Result |
| --- | --- | --- |
| Closed (default) | Page load | `display: none` from the UA stylesheet's `[popover]:not(:popover-open)` rule; nothing renders |
| Open | Grid trigger button click, or a neighbouring popover's Previous/Next button | `:popover-open` matches; `.photo-popover:popover-open { display: flex }` takes over |
| Close via button | Close button click | `popovertargetaction="hide"`; native `hidePopover()` |
| Close via Escape | `Escape` key while open | Native default for `popover="auto"` |
| Close via light dismiss | Click outside the panel (on `::backdrop` or the page) | Native default for `popover="auto"` |
| Navigate | Previous/Next button click | Native "auto" popover stacking closes the current popover and opens the neighbour — see `05_INTERACTION_AND_ACCESSIBILITY.md`'s keyboard table, not restated here |

All of the above is native `popover="auto"` behavior; the component supplies no event listeners.

## 9. Accessibility contract

- `role="dialog"` is set. `aria-modal="true"` is deliberately **not** set: nothing about this component provides real modality (no focus trap, no background inertness — see `05_INTERACTION_AND_ACCESSIBILITY.md` "The focus-trap cost"), and asserting `aria-modal="true"` without it would be a false claim to assistive technology. Do not add it without first closing the focus-trap gap that document describes.
- The dialog's accessible name is `aria-label={photo.alt}` — the same string also used as the enlarged image's own `alt`. This is one layer more duplication than the pattern `05_INTERACTION_AND_ACCESSIBILITY.md` explicitly defends (which covers the grid trigger button's label plus the image's alt, not the dialog's label plus the image's alt inside it). Not a failure, but not an addressed case either; flagged for awareness.
- The caption is not wired to the dialog via `aria-describedby`, and the dialog has no `aria-labelledby` pointing at rendered caption text — the label comes solely from the `aria-label` attribute. See §13 (Accessibility).
- Focus returns to the invoking trigger on close, for light dismiss, Escape, and the Close button — native Popover API behavior, now covered by `tests/e2e/photo-popover.spec.ts`.
- No `aria-hidden` is applied to background content when the popover is open, and none can be with `popover="auto"` alone. Same rationale and same owning document as the `aria-modal` point above.

## 10. Known conformance gaps

Findings from auditing this component against the project's own already-accepted rules, distinct from the disposition of the newly-submitted lightbox brief in §13:

1. **`box-shadow: var(--shadow-lg)`** on `.photo-popover` contradicts the global "Shadows are prohibited" rule in `00_COMPONENT_SPECIFICATIONS.md` §5. `--shadow-lg` is a real shadow (`0 8px 32px rgb(0 0 0 / 0.48)`), not a `none` placeholder.
2. **`.photo-popover::backdrop`** hardcodes `rgb(25 22 17 / 0.8)` instead of deriving it from `--bg`. The two values are identical today by coincidence of authoring, not by reference, so a future change to `--bg` silently desyncs the backdrop tint.
3. **No `PhotoGrid`/`PhotoPopover` row exists in `00_COMPONENT_SPECIFICATIONS.md` §2's ownership table** prior to this change adding `PhotoPopover`'s row. `PhotoGrid.astro` still has no owning document; it is out of scope for this change and is called out here so it isn't lost.
4. **The `previousId`/`nextId` id-space invariant with `PhotoGrid.astro`** (§2) has no automated check of its own. It happens to hold by construction today.

None of these are the defect this document's companion code change fixes (§11 below); they are pre-existing and are recorded here rather than silently carried forward as if the component were fully conformant.

## 11. The always-open defect (fixed alongside this document)

`.photo-popover` previously set `display: flex` unconditionally. The Popover API's UA stylesheet hides a closed `[popover]` element with a non-`!important` `display: none` rule; author-origin CSS beats UA-origin CSS regardless of selector specificity, so an unconditional author `display: flex` permanently defeated the browser's own open/closed toggle. The popover rendered fixed and full-viewport at all times, and neither the Close button, `Escape`, nor backdrop light dismiss had any visible effect, because none of them change `display` — they only change whether `:popover-open` matches.

The fix moves `display: flex` into a `.photo-popover:popover-open` rule, so the UA's default-hidden rule governs the closed state and this component's CSS only takes over once the browser has actually opened it. See the comment at `src/components/PhotoPopover.astro`'s `<style>` block and `tests/e2e/photo-popover.spec.ts` for the regression test.

## 12. Verification

| Concern | Check | Status |
| --- | --- | --- |
| Closed by default, opens/closes via trigger, Close button, Escape, and backdrop light dismiss | `tests/e2e/photo-popover.spec.ts` (`photo-popover` Playwright target) | Added with this document; not yet run against a real browser in every CI-supported engine — this sandbox's browsers cannot launch (missing `libasound.so.2`, no passwordless `sudo`). **[UNVERIFIED]** pending a CI run |
| Zero emitted client JavaScript | `scripts/check-no-script.mjs` against a fresh `dist/` | Existing, unrelated to this component specifically, covers it by construction |
| `id` non-blank | Build-time `TypeError` in `PhotoPopover.astro` | Existing |
| `alt` non-blank | `src/content.config.ts` `altText` schema refinement | Existing |
| Shadow prohibition (§10.1) | None | **[UNVERIFIED]** — known violation, no check exists to catch a repeat |
| Backdrop token drift (§10.2) | None | **[UNVERIFIED]** — known coupling, no check exists |
| Reflow at 320px/4K | None | **[UNVERIFIED]** — no `photo-popover.reflow.spec.ts` exists, unlike sibling components |
| Cross-browser Escape/light-dismiss/focus-return | Manual, per `05_INTERACTION_AND_ACCESSIBILITY.md`'s own **[UNVERIFIED]** marker on adjacent-popover focus behaviour | **[UNVERIFIED]** |

## 13. Disposition of the submitted lightbox brief

A full "Lightbox Web Component" functional/non-functional brief was submitted alongside the always-open defect report, with the instruction that this component "should act like a lightbox and follow" it. Large parts of that brief describe a distributable, JavaScript-driven custom element (`CustomElementRegistry`, Shadow DOM, custom event dispatch, pinch/swipe gesture handling), which conflicts directly with `AGENTS.md`'s zero-client-JavaScript budget. Per `AGENTS.md`: "If a requested feature appears to require client JavaScript, first look for a native HTML/CSS solution... If none exists, surface the architectural conflict rather than silently spending the budget." This section is that surfacing: every requirement from the brief is recorded here with a disposition, rather than silently implemented, silently dropped, or claimed as met when it isn't.

**Met** — already true today. **Native equivalent** — the zero-JS architecture satisfies the underlying need through a different, browser-native mechanism. **Deferred** — achievable without client JavaScript, but not built in this change; a real backlog item. **Rejected** — requires client JavaScript (or Shadow DOM, or a distributable-package architecture) with no native substitute; out of reach without first amending the architecture decision itself.

### Core visual & media display

- Modal overlay with customizable backdrop tint/opacity — **Native equivalent, partial.** CSS `::backdrop` exists; per-instance customization does not (§10.2's hardcoded value is the current fixed tint).
- Images, SVG, optional video, natural aspect ratio preserved — **Met** for images. SVG/video — **Deferred**; `PopoverPhoto` only accepts `astro:assets` `ImageMetadata` today.
- Responsive scaling without upscaling past native size — **Met**, by construction (§7). **[UNVERIFIED]** by automated check.
- Titles, descriptions, credits, "N of M" counters — **Partial.** Caption and EXIF summary render; no item counter exists. **Deferred** — index/total are known at build time and this is buildable natively.
- Loading spinner / broken-image icon — **Rejected** as literally an async loading-state spinner (implies script-driven state). A CSS-only broken-image affordance is a smaller, **Deferred** native possibility, not implemented.

### User interaction & navigation

- Next/Previous — **Met** (native `popovertarget`).
- Close via button, backdrop click, Escape — **Met** (native `popover="auto"`; this is exactly what §11's fix restored).
- Arrow-key navigation — **Rejected**, and already documented as such: `05_INTERACTION_AND_ACCESSIBILITY.md`'s keyboard table states "Arrow keys | Not implemented | Nothing."
- Touch gestures (swipe left/right/down-to-close) — **Rejected**; requires touch event listeners.
- Zoom/pan (double-tap, wheel, pinch) — **Rejected**; requires script-driven gesture handling. The browser's own native pinch-zoom of the whole page is available for free but is not a component feature.
- Infinite looping — **Deferred**; wrap-around `previousId`/`nextId` at gallery boundaries is computable at build time and would need no script, just isn't implemented.

### Developer API & customization

- `src`, `alt`, `caption` — **Met**, as build-time props rather than runtime-settable HTML attributes (there is no client to re-set them after render).
- `open` boolean attribute — **Native equivalent.** Visibility is the browser's `:popover-open` state, not an author-set boolean; functionally equivalent, structurally different.
- `loop` — **Deferred**, see Navigation above.
- `caption`/`controls`/`close-icon` slots — **Deferred.** Astro `<slot>` is zero-JS and could support this; the component simply has no named slots today.
- Custom events (`lightbox-open`, `-opened`, `-close`, `-change`, `-error`) — **Rejected**, unconditionally. Dispatching `CustomEvent`s requires `element.dispatchEvent(...)`, i.e., a script. There is no native-HTML substitute for arbitrary custom event dispatch.

### Accessibility (a11y)

- Strict Tab focus trap — **Rejected**, already documented and accepted as a tradeoff in `05_INTERACTION_AND_ACCESSIBILITY.md` "The focus-trap cost." The only fix (`<dialog>` + `showModal()`) is itself a script call.
- Focus restored to the invoking element on close — **Met** (§9), now regression-tested.
- `role="dialog"`/`aria-modal="true"` — `role="dialog"` **Met**; `aria-modal="true"` **Rejected by design** (§9) — setting it without real modality would misrepresent the component to assistive technology.
- Captions via `aria-labelledby`/`aria-describedby` — **Deferred** (§9); a real, addressable gap, not implemented in this change.
- `aria-hidden="true"` on background content when open — **Rejected**, same rationale and owning document as the focus trap.

### Non-functional: Web Component standards & architecture

- Custom element, `CustomElementRegistry`, Shadow DOM v1 — **Rejected**, the hardest conflict in the brief. This is a build-time Astro partial compiled to static HTML, not a runtime-defined custom element.
- Shadow DOM style encapsulation — **Rejected**, same reason. Encapsulation instead comes from BEM-style class naming (`.photo-popover__*`) plus the `@layer components` cascade layer, weaker than Shadow DOM but consistent with every other component in this codebase.
- Framework-agnostic, wrapper-free distributable — **Not applicable.** This component is not distributed outside this Astro codebase.

### Non-functional: performance & footprint

- <10 KB minified+gzipped, zero dependencies — **Met, exceeded**: 0 KB of JavaScript ships, enforced by the existing `scripts/check-no-script.mjs` against `dist/`.
- 60fps backdrop/image transitions via `transform`/`opacity` — **Partial.** The open/close transition uses `opacity` and a discrete `display` transition (`allow-discrete`), gated under `prefers-reduced-motion`; no `transform`-based motion exists. **[UNVERIFIED]** frame-rate measurement.
- Preload adjacent images "on demand" — **Rejected as stated / different tradeoff.** Every popover in a gallery is already present in the built document (`05_INTERACTION_AND_ACCESSIBILITY.md`), so there is no runtime "on demand" fetch to speak of; the tradeoff is upfront document weight, which is why galleries are capped at 40 photographs (itself **[UNVERIFIED]** pending measurement, per that document).

### Non-functional: compatibility & responsiveness

- Modern evergreen browser support — **Met by construction**; Popover API, `:popover-open`, and `::backdrop` are Baseline-supported. **[UNVERIFIED]** — no per-browser manual verification is recorded for this component specifically.
- 320px–4K responsive — **Met by construction** (§7). **[UNVERIFIED]** — no dedicated reflow test exists yet (§12).

### Non-functional: accessibility & security

- WCAG 2.1 AA — the project's actual conformance target, owned by `05_INTERACTION_AND_ACCESSIBILITY.md`, is WCAG 2.2 AA plus three adopted AAA criteria: a strictly equal-or-stricter target. Not restated here.
- Caption sanitization against XSS — **Met, more strongly than requested.** Captions are schema-typed as plain strings with no HTML acceptance path, and Astro's default text interpolation auto-escapes them — injection is structurally impossible rather than filtered after the fact.

## 14. Change rules

A component API, semantic structure, behavior, or invariant changes only when this document changes in the same commit, per `00_COMPONENT_SPECIFICATIONS.md` §8. Closing any item marked **Deferred** or **[UNVERIFIED]** in §11–§13 requires updating the corresponding row/bullet in the same change that implements or measures it, not a separate follow-up. Reversing a **Rejected** item requires first amending the zero-client-JavaScript decision in `AGENTS.md`/`docs/02_ARCHITECTURE.md` — this document cannot accept a JavaScript-dependent feature on its own authority.
