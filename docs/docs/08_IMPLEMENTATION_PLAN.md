# Implementation plan

## 1. Delivery strategy

Build one complete vertical slice before expanding the archive. The first slice contains at least twelve real photographs rather than three synthetic examples because realistic content is required to expose HTML size, DOM cost, responsive loading, mixed aspect ratios, and navigation behavior.

Do not add another planning document when a gate fails. Correct the implementation or amend the governing ADR.

## 2. Phase 0: repository baseline

### Deliverables

- Astro 6 static project.
- pnpm and Node versions pinned.
- Biome configuration.
- Strict TypeScript with `noUncheckedIndexedAccess`.
- Vitest through Astro’s Vite configuration.
- Playwright projects for Chromium, Firefox, and WebKit.
- `pnpm verify` command skeleton.
- Documentation package committed.
- React and unused integrations absent.

### Gate

- Empty site builds and deploys.
- Formatting, lint, typecheck, unit, and browser test commands run in CI.

## 3. Phase 1: content and originals boundary

### Deliverables

- Authored gallery schema.
- `OriginalsRepository` interface.
- Filesystem adapter for development and tests.
- Private object-storage adapter for production.
- Stable `photoId`, `gallerySlug`, and `sku` rules.
- Negative fixtures for missing originals and duplicate IDs.

### Gate

- Schema accepts valid real content.
- Every negative fixture fails with a targeted error.
- No component directly accesses source paths.

## 4. Phase 2: generated image manifest

### Deliverables

- Source hashing.
- EXIF extraction.
- Orientation normalization.
- Sidecar manifest.
- `--check` mode.
- Deterministic serialization.
- Cache key including transform and metadata-policy versions.

### Gate

- Running generation twice changes no bytes.
- `--check` fails after intentional source or configuration drift.
- Authored content remains byte-identical.

## 5. Phase 3: derivative pipeline

### Deliverables

- AVIF, WebP, and JPEG variants.
- Width set justified by layout.
- 2048 px maximum long edge.
- sRGB conversion.
- GPS removal.
- Creator and copyright re-embedding where supported.
- Output inspection and manifest verification.

### Gate

- Metadata tests pass against real output files.
- Originals are absent from `dist`.
- Cache restores unchanged derivatives.

## 6. Phase 4: first real gallery grid

### Deliverables

- One gallery with twelve or more photographs.
- Mixed landscape, portrait, square, and panoramic aspect ratios.
- Responsive `<picture>` markup.
- Explicit dimensions and `sizes`.
- Gallery title, summary, captions, and data plates.
- No-JavaScript thumbnail links.

### Measurements

Record production-build values for:

- HTML Brotli size.
- CSS Brotli size.
- JavaScript bytes, expected zero before viewer enhancement.
- DOM node count.
- Initial image transfer at representative mobile and desktop widths.
- LCP and CLS.

### Gate

- Base route functions with JavaScript disabled.
- CLS remains within target.
- Route budgets pass.

## 7. Phase 5: modal viewer enhancement

### Deliverables

- One reusable `<dialog>`.
- Framework-free TypeScript controller.
- Dynamic image source assignment.
- Previous, next, close, Arrow Left, Arrow Right, Escape.
- Focus placement and restoration.
- Caption, EXIF, and optional print link.
- Reduced-motion behavior.

### Gate

- Script is no more than 3 KB Brotli.
- No large derivative request occurs before open.
- Browser tests pass in Chromium, Firefox, and WebKit.
- Keyboard-only and initial screen-reader checks pass.

## 8. Phase 6: design system and core pages

### Deliverables

- Token implementation.
- Homepage.
- Gallery index.
- Gallery page.
- Colophon.
- Impressum and privacy shells populated with actual reviewed business data before launch.
- Updated wireframes reflected in production.

### Gate

- Visual regression baselines approved.
- Contrast checks pass.
- 200% zoom and forced-colors checks pass.

## 9. Phase 7: print product page

### Deliverables

- `/prints/[sku]` generation from active print offers.
- Sticky image layout where appropriate.
- Material, size, edition, fulfillment, price, shipping, and returns information.
- Structured product and image data.
- Route uniqueness checks.

### Gate

- Exactly one page exists per active print offer.
- No page exists for a non-print photograph.
- Displayed gross price matches source content and formatting rules.

## 10. Phase 8: checkout and order service

### Deliverables

- Order data store.
- Concurrency-safe inventory reservation.
- Stripe Checkout session endpoint.
- Signed webhook endpoint.
- Idempotent fulfillment state machine.
- Checkout expiry and failure handling.
- Order confirmation and operator fulfillment record.

### Gate

- End-to-end test purchase succeeds.
- Replayed webhook does not duplicate fulfillment.
- Concurrent final-unit test does not oversell.
- Customer-facing browser redirect is not treated as payment authority.

## 11. Phase 9: quality and operational hardening

### Deliverables

- Full `pnpm verify` pipeline.
- Security headers.
- Broken-link and structured-data validation.
- Post-deploy smoke checks.
- Field performance collection or a documented plan if traffic is insufficient.
- Release evidence template.

### Gate

- All launch checklist items pass.
- No unverified claim appears on the public colophon.

## 12. Phase 10: portfolio publication

### Deliverables

- Public case study.
- Architecture diagram.
- Three to five ADR summaries.
- Production metrics table.
- Failure-and-redesign narrative for the popover experiment.
- Live demo and source links.
- Reproducible local setup.

### Gate

A reviewer can verify every major claim through code, tests, deployment behavior, or recorded evidence.

## 13. Launch checklist

### Content and assets

- [ ] At least one twelve-photo gallery uses real sources.
- [ ] Every photo has reviewed alternative text.
- [ ] Every original resolves.
- [ ] Generated manifest is current.
- [ ] Derivatives remain within resolution and format policies.
- [ ] GPS is absent.
- [ ] Authorship metadata is verified where supported.

### Interaction and accessibility

- [ ] Base gallery works without JavaScript.
- [ ] Viewer works with keyboard and pointer.
- [ ] Focus returns after close.
- [ ] Screen-reader matrix completed.
- [ ] 200% zoom completed.
- [ ] Reduced-motion and forced-colors checks completed.

### Performance

- [ ] JavaScript budget passes.
- [ ] CSS and HTML budgets pass.
- [ ] No viewer asset loads before open.
- [ ] LCP, INP, and CLS evidence recorded.
- [ ] Cold and warm build times recorded.

### Commerce

- [ ] Product content complete.
- [ ] Signed webhook verified.
- [ ] Idempotency test passes.
- [ ] Inventory race test passes.
- [ ] Shipping and tax behavior verified.
- [ ] Legal review gate completed.

### Operations

- [ ] Security headers verified at public origin.
- [ ] Secrets are scoped and absent from static output.
- [ ] Post-deploy smoke passes.
- [ ] Rollback process tested or documented.
- [ ] Release evidence attached.

## 14. Deliberately deferred

### C2PA

Revisit after the asset pipeline is stable and a clear provenance objective exists. Adoption must justify the dependency and signing-key operation.

### Visible watermarking

Revisit only after observed misuse or a concrete commercial requirement. Treat it as a presentation and deterrence choice, not security.

### Search, tags, and filtering

Revisit when gallery count and visitor behavior create a demonstrated discovery problem.

### Multiple checkout items

Revisit after the single-product purchase flow is operational and order support is stable.
