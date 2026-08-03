# Component specification — `SkipLink.astro`

Status: implementation-ready  
Implementation: `src/components/SkipLink.astro`

## 1. Responsibility

The skip link bypasses repeated header navigation and moves the user's sequential navigation position to the main landmark.

It does not manage focus with JavaScript, create a second main landmark, or provide route-specific destinations.

## 2. Public contract

```ts
interface Props {
  readonly href?: "#main";
  readonly label?: "Skip to content";
}
```

Defaults are `#main` and `Skip to content`. The narrow literal contract prevents a page from silently targeting an absent landmark.

## 3. Required output

```astro
<a class="skip-link" href="#main">Skip to content</a>
```

The link is rendered by `Base.astro` before the site header and is the document's first focusable element.

## 4. Datum mapping

- Surface: `var(--surface)`.
- Text: `var(--text)` in IBM Plex Sans.
- Border: a visible Datum border token.
- Focus: global 2 px `var(--accent)` outline and 2 px offset.
- Geometry: square container or the permitted `--radius-xs`; no shadow.
- Orange is not a fill.

## 5. Hidden and focused states

Default state:

- Positioned outside the visible viewport without using `display: none`, `visibility: hidden`, `hidden`, zero dimensions, or clipping that also clips focus.
- Remains in the accessibility tree and tab order.

Focused state:

- Appears at the viewport's block-start and inline-start edge.
- Sits above page content with the documented overlay layer.
- Uses fixed or absolute positioning so reveal causes no layout shift.
- Keeps the complete outline inside the viewport.

No hover-only behavior or animation is required.

## 6. Responsive behavior

- The full label remains visible at 320 CSS px.
- At 200% text zoom, the box grows with text instead of clipping.
- Logical positioning works under RTL test direction even though the production document is English LTR.
- Safe-area insets are respected on notched displays when the link is fixed to the viewport.

## 7. Accessibility contract

- Satisfies the route-level bypass-block requirement.
- Visible focused text matches the accessible name exactly.
- Activation through Enter moves navigation to `main#main` without script.
- Focus indication does not rely on colour alone; outline geometry remains visible.
- Forced-colour mode uses system focus colours if the authored accent is replaced.

## 8. Failure behavior

`Base.astro` guarantees `main#main`. A component or integration test fails if the target is absent, duplicated, or precedes the skip link incorrectly.

## 9. Verification

| Scenario | Expected result |
| --- | --- |
| First Tab from browser chrome | Skip link receives focus and becomes visible |
| Enter | URL fragment becomes `#main`; repeated header links are bypassed |
| 200% text zoom | Label remains complete and on-screen |
| 400% page zoom | Link remains usable without horizontal scrolling |
| Forced colours | Focus outline remains visible |
| Screenshot before/after focus | Header and main positions do not shift |
| Safari/VoiceOver | Link is announced first and target navigation works |
| Firefox/NVDA | Link is announced first and target navigation works |

## 10. Change rules

Any change to destination, label, visibility technique, or focus behavior requires this specification and the cross-browser keyboard script to change together.
