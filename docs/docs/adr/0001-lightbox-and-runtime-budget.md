# ADR 0001: Lightbox architecture and runtime budget

- **Status:** Accepted
- **Date:** 2026-07-31
- **Decision owners:** Project maintainer
- **Revisit trigger:** The viewer enhancement exceeds 3 KB Brotli, fails the browser matrix, or field data shows a material interaction or loading regression.

## Context

The original brief required a gallery route with zero JavaScript and a full-size lightbox. It also rejected hash fragments, query parameters, and per-photo routes for unsold photographs.

A native popover per photograph appeared to satisfy those requirements. A browser experiment on Chrome on 2026-07-30 produced the following observation:

| Full-size construct in a closed popover | Fetch while closed | Fetch on open |
|---|---|---|
| `<img>` without `loading` | yes | not applicable |
| `<img loading="lazy">` | no | no in the tested case |
| CSS `background-image` | no | yes |

The zero-JavaScript implementation therefore required CSS backgrounds with `image-set()`, ARIA image semantics, and one complete popover per photograph.

That design preserved a literal zero-byte script number but introduced:

- Duplicate top-layer markup.
- Larger HTML and DOM.
- Different rendering mechanisms for thumbnails and full-size images.
- Non-modal behavior.
- No Arrow Left or Arrow Right navigation.
- Dependence on an observed browser loading behavior rather than a stable product requirement.

## Decision

Use a zero-JavaScript static gallery baseline and one framework-free modal `<dialog>` enhancement.

- The grid renders as static HTML.
- Each thumbnail is a real anchor to the bounded large derivative.
- JavaScript intercepts the link only after successful initialization.
- One dialog receives the active image, alternative text, dimensions, caption, EXIF, and print link.
- The large image `src` and `srcset` are assigned on open.
- The script supports previous, next, Arrow Left, Arrow Right, Escape, explicit close, focus placement, and focus restoration.
- The gallery JavaScript budget is at most **3 KB Brotli**.
- No React runtime or framework integration is allowed for this feature.

## Alternatives

### A. One native popover per photograph

**Advantages**

- Literal zero JavaScript.
- Declarative open, close, Escape, light dismiss, and invoker relationship.

**Rejected because**

- The viewer is non-modal.
- Arrow-key navigation is absent.
- Full-size loading required a CSS-background workaround in the measured browser.
- Markup and DOM scale with photograph count.
- Two image-rendering paths increase maintenance risk.

The experiment remains valuable and should remain reproducible as a benchmark branch or test fixture.

### B. React island

**Advantages**

- Familiar component state and ecosystem.
- Straightforward keyboard behavior.

**Rejected because**

- The feature does not justify a framework runtime.
- React and compiler dependencies would exist solely for one simple interaction.
- A local TypeScript controller is smaller and easier to audit.

### C. No full-size viewer

**Advantages**

- Simplest runtime and accessibility model.

**Rejected because**

- A full-size inspection experience is a core photography-portfolio requirement.

## Consequences

### Positive

- Modal semantics match the interaction.
- Complete keyboard navigation.
- One semantic `<img>` in the viewer.
- One dialog in the DOM.
- Large assets load only after activation.
- No framework dependency.
- No-JavaScript fallback remains functional.

### Negative

- The route no longer ships literally zero JavaScript when the enhancement is enabled.
- The project must maintain and test a small client module.
- Direct derivative URLs remain available through fallback links.

## Verification

- Production bundle report enforces ≤3 KB Brotli.
- Browser test verifies no large derivative request before open.
- Chromium, Firefox, and WebKit tests cover open, close, navigation, and focus restoration.
- JavaScript-disabled test verifies normal derivative links.
