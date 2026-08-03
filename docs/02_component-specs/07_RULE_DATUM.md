# Component specification — `RuleDatum.astro`

Status: implementation-ready  
Implementation: `src/components/RuleDatum.astro`

## 1. Responsibility

`RuleDatum` marks the origin of a section with Datum's primary structural motif: a hairline anchored by one International Orange tick.

It does not create headings, choose section copy, indicate errors or selection, or act as an interactive control.

## 2. Dependencies

- Datum `.rule-datum` motif and tokens
- No page, content, image, or runtime dependency

## 3. Public contract

```ts
interface Props {
  readonly as?: "section" | "div";
  readonly labelledBy?: string;
  readonly class?: string;
}
```

One default slot contains the section content.

Rules:

- `as="section"` requires `labelledBy`.
- `as="div"` omits `aria-labelledby` unless the supplied content and caller establish a valid relationship.
- `class` may extend layout only; it does not override motif colour or geometry.

## 4. Required output

Conceptual implementation:

```astro
<Component
  class:list={["rule-datum", className]}
  aria-labelledby={labelledBy}
>
  <slot />
</Component>
```

The component adds no role. A generated pseudo-element supplies the tick.

## 5. Datum mapping

- 1 px block-start rule using `var(--border-c)`.
- 24 px block-start content padding.
- 24 × 2 px `var(--accent)` tick at block-start/inline-start.
- Relative positioning only to anchor the tick.
- No background, radius, shadow, animation, label, or second accent.

Logical inline positioning is preferred. Production English remains left-to-right, so the visual origin appears at the left edge.

## 6. Content rules

- A section instance begins with a visible heading.
- The heading owns its own type and spacing through the consuming component.
- The motif appears once at the start of a logical section, not between every row.
- The homepage Gallery Directory owns the route's one persistent datum tick.
- Nested RuleDatum instances require explicit design review because repeated orange origins dilute the system.

## 7. Responsive behavior

- Rule and tick span/anchor to the component's actual inline size.
- The tick does not scale with viewport or type size.
- Slotted content wraps naturally.
- No breakpoint-specific markup or orientation changes.

## 8. Accessibility contract

- Rule and tick are decorative CSS with no accessibility-tree nodes.
- A `section` receives its accessible name from the visible heading referenced by `aria-labelledby`.
- The low-contrast hairline carries no essential relationship or state.
- Section semantics and heading hierarchy remain sufficient if forced-colour mode recolours or suppresses the motif.
- Accent is not paired with hidden text that would imply status.

## 9. Failure behavior

Development/build tests fail when `as="section"` lacks `labelledBy`, the referenced ID is absent, or more than one element in the same document uses the referenced ID.

An empty RuleDatum is omitted by the caller.

## 10. Verification

| Concern | Check |
| --- | --- |
| Element API | Only section/div accepted |
| Labelling | Section references an existing visible heading |
| Motif geometry | 1 px rule, 24 px padding, 24 × 2 px tick |
| Colour | Rule uses border token; tick uses accent token |
| Prohibitions | No radius, shadow, animation, or extra generated copy |
| Responsive | Origin and width remain correct at all viewport sizes |
| Forced colours | Structure remains understandable without motif colour |
| Accent budget | Homepage has one persistent datum tick |

## 11. Change rules

Motif colour, dimensions, or spacing are Datum decisions and must change in `04_DESIGN_SYSTEM.md` and the token stylesheet before this mapping changes. Adding variants requires a demonstrated semantic distinction, not visual preference.
