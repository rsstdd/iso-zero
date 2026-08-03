# Component specification — `DataPlate.astro`

Status: implementation-ready  
Implementation: `src/components/DataPlate.astro`

## 1. Responsibility

`DataPlate` supplies Datum's boundary and default typography for recorded or generated data. It lets a viewer distinguish measured/system data from editorial prose.

It does not format EXIF, money, dates, or counts; choose semantic relationships; render a card surface; or make content interactive.

## 2. Dependencies

- Datum `.data-plate` motif and tokens
- No content, page, image, or runtime dependency

## 3. Public contract

```ts
interface Props {
  readonly as?: "div" | "figcaption" | "footer";
  readonly labelledBy?: string;
  readonly class?: string;
}
```

The component exposes one default slot. Restricting `as` prevents arbitrary or invalid output.

`class` accepts one project-owned class string for layout extension. It is not an escape hatch for overriding colour, type family, border, radius, or shadow.

## 4. Required output

Conceptual implementation:

```astro
<Component
  class:list={["data-plate", className]}
  aria-labelledby={labelledBy}
>
  <slot />
</Component>
```

`aria-labelledby` is omitted when absent. The component adds no role.

## 5. Semantic rules

- `as="figcaption"` is used only as a direct child of `figure`.
- `as="footer"` is used only for a section/article footer, not the site's root footer landmark unless explicitly intended.
- Label-value metadata uses `dl`, `dt`, and `dd` in the slot.
- Sequential metadata without labels may use spans when the surrounding component supplies clear context.
- Navigation, prose sections, forms, and action groups do not become plates merely for appearance.
- Interactive descendants are permitted only when the owning component specification explicitly defines them, as the homepage featured link does with its action text inside an already interactive ancestor.

## 6. Datum mapping

- 1 px block-start hairline using `var(--border-c)`.
- Datum's documented 8 px separation between hairline and data content.
- Default data size: Datum 13 px data token.
- Default family: IBM Plex Mono.
- Default colour: `var(--text-muted)`.
- Tabular figures and slashed zero.
- Transparent background.
- No radius, shadow, accent, filled label, or badge treatment.

The component does not restate raw token values in CSS when a flattened Datum variable exists.

## 7. Contrast classification

The documented values `--border-c: #3a352c` and `--bg: #191611` produce approximately 1.48:1 contrast. The hairline is therefore decorative. It cannot be the sole visual mechanism for:

- identifying an interactive component,
- separating controls whose boundaries are necessary,
- communicating selection, focus, error, or current state.

Essential state uses text, underline, semantics, and the accent focus outline. A future plate that requires an essential boundary must use a token meeting at least 3:1 or revise Datum globally.

## 8. Responsive behavior

The plate itself supplies boundary and base spacing only. The owning component supplies grid or flex layout. Slotted data must wrap without clipping or horizontal scrolling.

The component does not truncate, line-clamp, or change source order.

## 9. Accessibility contract

- No role is added to native semantics.
- Hairline is CSS-only and absent from the accessibility tree.
- Data remains DOM text and participates in zoom and text-spacing overrides.
- Muted text is reserved for compact metadata, not long body prose.
- Numeric presentation remains readable when custom fonts fail.
- Forced-colour mode may recolour or omit the decorative hairline without losing meaning.

## 10. Failure behavior

Development/build checks reject unsupported `as` values. Misuse such as a `figcaption` outside `figure` fails HTML validation or component tests.

Empty plates should not render; the caller conditionally omits the component when it has no content.

## 11. Verification

| Concern | Check |
| --- | --- |
| Element API | Type tests allow only div/figcaption/footer |
| Native semantics | HTML validation for each supported element |
| Datum | Computed border, spacing, font, size, colour, numeric features |
| Prohibitions | No background, radius, shadow, or accent |
| Contrast use | No interactive component relies only on hairline |
| Reflow | Long metadata wraps at 320 px and custom text spacing |
| Forced colours | Meaning survives hairline suppression |
| Empty state | Caller omits plate rather than rendering empty boundary |

## 12. Change rules

Adding a semantic element, slot, visual variant, or interactive behavior requires this document and every consuming component audit to change together. Raw colour or spacing overrides are Datum changes and belong in the design system first.
