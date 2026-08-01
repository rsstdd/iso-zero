# ISO Zero portfolio case study

This document defines the public case study. Replace bracketed evidence fields only after measurements exist. Do not publish projected numbers as results.

## Summary

ISO Zero is a static photography portfolio and limited-edition print storefront built with Astro 6. The project treats image delivery, metadata privacy, accessible viewing, and commercial correctness as one system rather than separate frontend concerns.

The implementation renders the complete gallery as static HTML, generates responsive derivatives from private originals, removes GPS while preserving authorship metadata, and adds a keyboard-complete modal viewer through a framework-free script bounded to 3 KB Brotli. Print pages derive from validated product objects, and a hosted checkout completes payment through signed, idempotent webhook processing.

## Problem

Image-forward portfolio sites frequently optimize one dimension at the expense of another:

- Large images degrade loading performance.
- Client-side galleries ship framework runtimes for limited interaction.
- Source metadata leaks location or loses authorship during transformation.
- Modal viewers work with a pointer but fail keyboard or screen-reader users.
- Product pages imply commerce without reliable payment and fulfillment behavior.
- “Image protection” claims describe controls that do not prevent access to browser-delivered assets.

ISO Zero addresses these concerns through explicit boundaries and measurable gates.

## Constraints

- Images remain visually primary.
- Originals remain private.
- Delivered images are capped at 2048 px on the long edge.
- Gallery content renders without client JavaScript.
- Viewer interaction must support modal semantics and arrow-key navigation.
- Runtime JavaScript on gallery routes remains at or below 3 KB Brotli.
- Authored content cannot be overwritten by metadata generation.
- Every print route requires a complete commercial object.
- Payment fulfillment must be signed, idempotent, and inventory-safe.
- Public claims require evidence.

## Architecture

```text
Private originals → hash and metadata pipeline → generated manifest
        │                                        │
        └──────── responsive derivatives ────────┤
                                                 ▼
Authored gallery content ───────────────→ Astro static build
                                                 │
                       ┌─────────────────────────┴──────────────────────┐
                       ▼                                                ▼
             Static gallery and PDP                          Server commerce boundary
                       │                                                │
        framework-free modal enhancement                    hosted checkout + webhook
```

## Key decision 1: user experience over literal zero JavaScript

The initial architecture used one native popover per photograph to preserve a literal zero-byte JavaScript route. Browser testing showed that image loading inside closed popovers did not behave as expected:

- A normal `<img>` could fetch while closed.
- A lazy `<img>` could fail to fetch after opening.
- A CSS background deferred correctly in the tested browser.

The workaround required duplicate popover markup, CSS backgrounds instead of semantic images, non-modal behavior, and no arrow-key navigation.

The production architecture changed to one modal `<dialog>` populated by a small framework-free script. The static grid remains zero-JavaScript, while the enhancement budget stays explicit and measurable.

**Result:** [insert compressed script size], complete keyboard navigation, one dialog in the DOM, and no full-size request before open.

## Key decision 2: generated metadata does not mutate authored content

The first design wrote EXIF into gallery frontmatter. Ownership was bounded to one key and guarded by `--check`, but the file remained partly authored and partly generated.

The final design writes a deterministic sidecar manifest keyed by stable photo ID. Authored captions, alternative text, order, and print data remain separate from dimensions, hashes, EXIF, and derivatives.

**Result:** generation is idempotent, content diffs remain editorial, and transformed assets can be cached by source and configuration hash.

## Key decision 3: private originals and content-addressed derivatives

Production originals live in private object storage behind one resolver interface. The build hashes each source and generates only the derivative widths required by layout policy.

The cache key includes source hash, transform version, format, width, quality, and metadata policy. Unchanged sources avoid repeated processing.

**Result:** [insert cold build time], [insert warm build time], and [insert derivative cache hit rate].

## Key decision 4: protection claims match the threat model

The project distinguishes privacy, attribution, resolution limiting, hotlink control, and indexing policy.

- GPS removal protects location privacy.
- Private originals prevent accidental source publication.
- Resolution limits reduce delivered fidelity.
- IPTC metadata preserves authorship where supported.
- Hotlink controls reduce casual bandwidth abuse.
- Crawler rules express policy.

None prevents a visitor from copying an image already delivered to the browser. The public colophon states that limitation directly.

## Key decision 5: product pages are not the commerce boundary

A print page exists only for a photograph with a complete `print` object. Checkout creation reloads the authoritative offer server-side, creates a pending order, reserves inventory, and redirects to hosted checkout. Signed webhook events, not browser redirects, advance payment and fulfillment state.

**Result:** replayed webhooks remain idempotent and concurrent final-unit tests do not oversell.

## Measured results

Do not publish this table until every value is measured on a production build or public deployment.

| Metric | Result | Gate |
|---|---:|---:|
| Gallery JavaScript | `[x.xx KB Brotli]` | ≤3 KB |
| Gallery CSS | `[xx KB Brotli]` | ≤20 KB |
| Gallery HTML, twelve images | `[xx KB Brotli]` | ≤60 KB |
| DOM nodes | `[count]` | ≤1,500 |
| Mobile LCP | `[x.xx s]` | ≤2.5 s |
| INP | `[xxx ms]` | ≤200 ms |
| CLS | `[0.xxx]` | ≤0.1 |
| Large image requested before open | `[no]` | no |
| Cold build | `[duration]` | recorded |
| Warm build | `[duration]` | recorded |
| Derivative cache hit rate | `[percent]` | recorded |
| Accessibility violations | `[0 critical/serious]` | no blocking defects |
| Browser matrix | `[Chromium/Firefox/WebKit versions]` | all pass |

## Failure that changed the design

The most useful result was not a successful benchmark. It was a failed assumption about lazy image loading inside a closed top-layer element. That failure invalidated the original implementation and forced a choice between literal zero JavaScript and a better semantic, modal, keyboard-complete viewer.

The project treats this as evidence of sound engineering rather than an embarrassment: the architecture changed because measurement contradicted the plan.

## Testing and operations

The CI pipeline verifies:

- Content and route uniqueness.
- Original resolution.
- Manifest determinism.
- Asset dimensions, hashes, color space, GPS absence, and authorship metadata.
- Viewer behavior in Chromium, Firefox, and WebKit.
- Accessibility scans and keyboard behavior.
- Resource budgets.
- Signed and idempotent webhook fulfillment.
- Inventory concurrency.
- Security headers and post-deploy behavior.

## Trade-offs

- A small client module replaces literal zero JavaScript to obtain modal semantics and complete keyboard navigation.
- The 2048 px cap limits print-detail inspection but reduces delivered source value and bandwidth.
- Private object storage adds operational complexity but keeps raw files out of source control and deployment output.
- Hosted checkout reduces payment surface area but creates an external provider dependency.
- Search and filtering remain absent until archive size establishes a real discovery problem.

## What remains deliberately unbuilt

- User accounts.
- Multi-item cart.
- Social interaction.
- Visible watermarking.
- C2PA signing.
- Search and faceted filtering.

Each deferred capability has a revisit trigger rather than an open-ended aspiration.

## Evidence links

- Live deployment: `[URL]`
- Source repository: `[URL]`
- Architecture document: `docs/02_ARCHITECTURE.md`
- Decision records: `docs/adr/`
- Release evidence: `[path or URL]`
