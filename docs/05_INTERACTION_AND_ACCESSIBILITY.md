# 05 — Interaction and accessibility

## The viewer

Each photograph in a gallery grid is a `<button>` with a `popovertarget` attribute pointing at a popover element rendered at build time in the same document.

```html
<figure>
  <button popovertarget="p-0007" aria-label="Open larger view: ice on the Isar at dawn">
    <picture>…</picture>
  </button>
  <figcaption>…</figcaption>
</figure>

<div popover id="p-0007" role="dialog" aria-label="Ice on the Isar at dawn">
  <picture>…</picture>
  <div class="data-plate">…</div>
  <button popovertarget="p-0006" popovertargetaction="show">Previous</button>
  <button popovertarget="p-0008" popovertargetaction="show">Next</button>
  <button popovertarget="p-0007" popovertargetaction="hide">Close</button>
</div>
```

The browser supplies open, close, Escape, light dismiss, and the top layer. Navigation between photographs is a pair of buttons targeting neighbouring popovers, so advancing through a gallery is markup rather than state. Nothing here is scripted, and nothing here needs to be.

Every popover for a gallery is present in the document at build. That is the cost of the approach and the reason galleries are capped at 40 photographs: document weight grows linearly with the number of photographs, and the cap is a placeholder until a measurement replaces it. **[UNVERIFIED]** — the document-weight curve is to be measured against a full gallery before the cap is either confirmed or moved.

## Keyboard model

| Key | Behaviour | Supplied by |
|---|---|---|
| Tab | Moves through grid triggers in document order | Browser |
| Enter or Space on a trigger | Opens that photograph's popover | Browser |
| Escape | Closes the open popover | Browser, via `popover="auto"` |
| Tab inside an open popover | Moves through previous, next, and close | Browser |
| Enter on previous or next | Closes the current popover and opens the neighbour | Browser |
| Arrow keys | **Not implemented** | Nothing |

Focus returns to the invoking trigger when a popover is dismissed, which the Popover API handles for light dismiss and for Escape. Focus behaviour when moving between neighbouring popovers is the case the specification does not settle, and it is verified manually per browser rather than assumed. **[UNVERIFIED]**

## The focus-trap cost

This is the sharpest accessibility consequence of the zero-JavaScript budget, and it is stated plainly rather than buried.

`popover="auto"` is not a modal dialog. It places content in the top layer, supplies Escape and light dismiss, and closes other auto popovers in the same stack — however, it does not trap focus and it does not make the rest of the document inert. A keyboard or screen-reader user who continues tabbing past the close button will move into the page behind the open popover, where the grid triggers remain reachable.

The alternative is `<dialog>` with `showModal()`, which does trap focus and does apply inertness, and `showModal()` is a script call. That single method is the entire distance between the current design and full modal semantics, and paying for it means a runtime, a hydration boundary, and the end of the zero-JavaScript claim.

The mitigations, none of which fully substitute for a trap:

- Popovers are rendered after the grid in document order, so tabbing past the close button reaches the end of the document rather than looping back through the gallery.
- Each popover carries `role="dialog"` and an `aria-label` derived from the photograph's alt text, so its role and name are announced.
- The close button is the last focusable element inside the popover, making "tab to the end, then Escape" a coherent pattern.
- The page behind remains fully usable, so leaving the popover by tabbing is disorienting rather than trapping.

The honest summary: this is a non-modal viewer presented in a modal-looking way. It is announced correctly and operable by keyboard, and it does not meet the focus containment a screen-reader user may expect from a dialog. If usability testing shows this to be a genuine barrier rather than a theoretical one, the correct response is to remove the viewer and link to a larger derivative, not to add a script.

## Conformance target

WCAG 2.2 AA, with three AAA criteria adopted as project rules.

| Criterion | Level | Approach |
|---|---|---|
| 1.1.1 Non-text content | A | Alt text required by schema; whitespace rejected |
| 1.3.1 Info and relationships | A | `<figure>` and `<figcaption>` for every photograph |
| 1.4.3 Contrast (minimum) | AA | Datum ratios verified 2026-07-29 |
| 1.4.6 Contrast (enhanced) | AAA | Adopted for body prose. Not met by `--text-muted` on `--bg`, which is a knowing exception scoped to metadata |
| 1.4.11 Non-text contrast | AA | The focus ring and `--border-essential` clear 3:1. `--border-c` hairlines are decorative and never carry essential boundaries or state |
| 2.1.1 Keyboard | A | Every control is a native button |
| 2.1.2 No keyboard trap | A | Met, and met trivially, because nothing traps focus |
| 2.4.3 Focus order | A | Document order; popovers follow the grid |
| 2.4.7 Focus visible | AA | Global `:focus-visible` outline, 2 px accent, 2 px offset |
| 2.4.11 Focus not obscured | AA | Verified against the open popover, which is the only overlay |
| 2.5.8 Target size (minimum) | AA | Grid triggers are the figures themselves; viewer controls are at least 44 × 44 px |
| 3.2.3 Consistent navigation | AA | One header, one footer, identical across routes |
| 4.1.2 Name, role, value | A | Native elements throughout; `role="dialog"` on popovers |

Criterion 2.1.2 deserves a note. Passing it is normally an achievement and here it is a side effect, since a viewer with no focus trap cannot produce a keyboard trap. The criterion is satisfied and the underlying user need is only partly served, which is the distinction the focus-trap section above exists to make.

## Screen-reader expectations

The gallery reads as a list of figures, each with a caption and a button that opens a larger view. The button's accessible name is composed rather than duplicated: the alt text serves the image, and the button carries "Open larger view: " prefixed to it, so a screen-reader user encounters the description once as content and once as an action.

Data plates are read after their figure. EXIF is presented as a definition-style list so that "Aperture, f slash 2.8" is announced as a pair rather than as a fragment, and `formatExif` produces strings intended to be spoken as well as seen.

Manual verification is performed against VoiceOver with Safari and NVDA with Firefox, with the results recorded per release. **[UNVERIFIED]**

## Reduced motion

The base layer collapses all transition and animation durations under `prefers-reduced-motion: reduce`. Popover appearance is the only animated state change on the site, so honouring the query removes essentially all motion and costs nothing.

## Skip link

A skip link to `#main` is the first focusable element on every page. On a gallery route it matters more than on a text page, because without it a keyboard user reaching the footer traverses every grid trigger in the gallery.

## What is deliberately absent

No focus-visible polyfill, no roving tabindex, no `aria-live` announcements, no custom keyboard shortcut layer. Each requires a script, and each would be reimplementing behaviour that native elements already provide or that this design has decided not to offer.
