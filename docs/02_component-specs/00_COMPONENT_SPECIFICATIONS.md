# IS0 ZER0 component specifications

Status: implementation-ready component contract index

## 1. Purpose

This specification set gives each reusable UI component one owning document. Page specifications may state which components they compose but must link here for component API, semantic output, Datum mapping, accessibility behavior, responsive behavior, failure behavior, and verification.

This separation prevents a homepage decision from silently redefining the shared header, footer, or Datum primitives.

## 2. Ownership

| Component | Owning specification | Implementation |
| --- | --- | --- |
| Document shell | [`01_BASE_LAYOUT.md`](01_BASE_LAYOUT.md) | `src/layouts/Base.astro` |
| Skip link | [`02_SKIP_LINK.md`](02_SKIP_LINK.md) | `src/components/SkipLink.astro` |
| Site header | [`03_SITE_HEADER.md`](03_SITE_HEADER.md) | `src/components/SiteHeader.astro` |
| Homepage identity | [`04_HOMEPAGE_IDENTITY.md`](04_HOMEPAGE_IDENTITY.md) | `src/components/HomepageIdentity.astro` |
| Featured gallery | [`05_FEATURED_GALLERY.md`](05_FEATURED_GALLERY.md) | `src/components/FeaturedGallery.astro` |
| Data plate | [`06_DATA_PLATE.md`](06_DATA_PLATE.md) | `src/components/DataPlate.astro` |
| Datum rule | [`07_RULE_DATUM.md`](07_RULE_DATUM.md) | `src/components/RuleDatum.astro` |
| Gallery directory | [`08_GALLERY_DIRECTORY.md`](08_GALLERY_DIRECTORY.md) | `src/components/GalleryDirectory.astro` |
| Site footer | [`09_SITE_FOOTER.md`](09_SITE_FOOTER.md) | `src/components/SiteFooter.astro` |

The page-level owner is [`../01_page-specs/HOMEPAGE_SPECIFICATION.md`](../01_page-specs/HOMEPAGE_SPECIFICATION.md).

## 3. Normative hierarchy

Component documents specialize, but do not replace, the project sources of truth:

- `../02_ARCHITECTURE.md` owns rendering and dependency direction.
- `../03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` owns content and image delivery.
- `../04_DESIGN_SYSTEM.md` owns Datum tokens and global design rules.
- `../05_INTERACTION_AND_ACCESSIBILITY.md` owns the conformance target and shared interaction model.
- `../07_TESTING_SECURITY_AND_OPERATIONS.md` owns verification claims and tooling.
- `src/content.config.ts`, `src/styles/design-tokens.css`, and `package.json` outrank prose for the executable contracts identified by `../00_DOCUMENTATION_MAP.md`.

Component documents own the mapping of those global rules to one component.

## 4. Shared implementation conventions

- Astro static components only; no hydration directives or framework islands.
- Explicit `Readonly` prop interfaces.
- Narrow presentation view models rather than raw collection entries.
- No imports from `src/pages/` into components or libraries.
- No arbitrary prop spreading onto native elements.
- Stable slug-derived IDs where relationships require IDs.
- Native HTML before ARIA; no redundant roles.
- Logical CSS properties for layout and spacing.
- Source order equals reading and focus order; CSS `order` is prohibited.
- No duplicated desktop/mobile markup.
- No content generated only through CSS.
- Links use real route URLs at build time; `#` placeholders never reach production.

## 5. Shared Datum conventions

Each component specification identifies its token mapping. Across the set:

- IBM Plex Serif carries display identity and gallery titles.
- IBM Plex Sans carries prose and controls.
- IBM Plex Mono carries recorded data.
- International Orange carries the directory origin and focus state on the homepage.
- Photographs and containers remain square.
- Shadows are prohibited.
- Motion remains limited to token-backed opacity or transform feedback and collapses under reduced motion.

Raw token values are not repeated here because `src/styles/design-tokens.css` owns them.

## 6. Shared accessibility conventions

- Target: WCAG 2.2 AA plus the project-specific AAA rules.
- First-focusable skip link on every route.
- Global `:focus-visible`: 2 px accent outline with 2 px offset.
- Unique landmark labels where multiple landmarks share a role.
- 44 × 44 CSS px project target for UI links and controls.
- Reflow without two-dimensional scrolling at 320 CSS px and 400% zoom.
- Text enlargement and custom text spacing must not clip or overlap.
- Reduced-motion and forced-colour modes must remain operable.
- Automated axe-core results supplement, but do not replace, keyboard and screen-reader checks.

Datum's documented `--border-c` value measures approximately 1.48:1 against `--bg`. Component hairlines using that pair are decorative and cannot be the sole way to identify a control, boundary, or state. Essential focus indication uses `--accent`, which exceeds the non-text contrast threshold against the canvas.

## 7. Shared component document template

Every component specification includes:

1. Responsibility and non-responsibilities.
2. Dependencies.
3. Public props or view model.
4. Required semantic output.
5. Content rules.
6. Datum mapping.
7. Responsive behavior.
8. Interaction states.
9. Accessibility contract.
10. Failure behavior.
11. Verification matrix.
12. Change rules.

## 8. Change protocol

- A component API, semantic structure, behavior, or invariant changes only when its owning specification changes in the same commit.
- A global design or accessibility decision changes in its global owning document first; component specs update only their mapping.
- A page-specific composition change updates the page spec without modifying unrelated component contracts.
- A new component receives an owning document and an index row before implementation.
- A component removal retires its document without reusing its number.
- Claims without automated enforcement or recorded measurement carry **[UNVERIFIED]**.

## 9. Definition of done

A component is complete when:

- Its implementation matches its public contract.
- Type, contract, accessibility, and relevant visual tests pass.
- It works without client JavaScript.
- Datum and WCAG mappings have been reviewed.
- The component's documented failure cases fail the build or degrade exactly as specified.
- The owning document and implementation remain linked by filename in this index.
