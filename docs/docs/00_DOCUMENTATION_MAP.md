# Documentation map

This document defines ownership. A rule belongs in one authoritative document and may be summarized elsewhere only by linking back to that source.

## Source-of-truth matrix

| Concern | Authoritative document |
|---|---|
| Product scope, users, objectives, non-goals | `01_PRODUCT_AND_ENGINEERING_BRIEF.md` |
| Runtime architecture, components, data flow, deployment | `02_ARCHITECTURE.md` |
| Content schemas, EXIF, originals, derivatives, generated manifest | `03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| Color, typography, geometry, motifs, components, voice | `04_DESIGN_SYSTEM.md` |
| Viewer behavior, keyboard model, screen readers, fallbacks | `05_INTERACTION_AND_ACCESSIBILITY.md` |
| Checkout, orders, inventory, price display, legal launch gates | `06_COMMERCE_LEGAL_AND_OPERATIONS.md` |
| CI, tests, budgets, security headers, observability | `07_TESTING_SECURITY_AND_OPERATIONS.md` |
| Sequenced delivery plan and acceptance gates | `08_IMPLEMENTATION_PLAN.md` |
| Public portfolio narrative and evidence requirements | `09_PORTFOLIO_CASE_STUDY.md` |
| Page and system wireframes | `10_WIREFRAMES.md` |
| Rules for AI-assisted implementation | `11_AI_IMPLEMENTATION_PROTOCOL.md` |
| Original requirement disposition | `12_REQUIREMENTS_TRACEABILITY.md` |
| Decision history and rejected alternatives | `adr/*.md` |
| External standards and official references | `references/REFERENCES.md` |

## Decision taxonomy

Every significant rule must be classified as one of the following.

### Invariant

Failure makes the system incorrect or unsafe.

Examples:

- Originals never enter the public deployment.
- SKU and photo identifiers are unique.
- Money uses integer minor units.
- GPS is absent from delivered assets.
- Webhook signatures are verified.

### Budget

A measurable limit with a defined test.

Examples:

- Gallery JavaScript is no more than 3 KB Brotli.
- LCP, INP, and CLS meet the project performance thresholds.
- Delivered images do not exceed 2048 px on the long edge.

### Default

The normal design or implementation choice. A justified exception may exist.

Examples:

- Dark theme.
- IBM Plex typography.
- Zero-radius photographs.
- Static rendering.

### Experiment

A measured observation whose validity may expire.

Examples:

- Browser fetch behavior for images inside a closed popover.
- Comparative payload and accessibility results for popover and dialog viewers.

### Deferred decision

An unresolved choice with a named owner, deadline, and exit criteria. Deferral without those fields is not a decision.

## Conflict rule

When documents conflict:

1. The document listed as authoritative in the matrix wins.
2. An accepted ADR overrides an older decision.
3. The contradictory text must be corrected in the same change.
4. Code must not be written against an unresolved contradiction.

## Historical documents replaced by this package

This package consolidates and replaces the earlier overlapping documents:

- `WIRE_DIAGRAM.md`
- `ARCHITECTURAL_LAYOUT_AND_IMPLEMENTATION_SPEC.md`
- `COOKBOOK.md`
- `DESIGN_DOC.md`
- `INSTRUCTIONS.md`
- `NEXT_STEPS.md`

Valuable reasoning and constraints from those documents remain here. Contradictory examples, duplicated rules, unverified claims, and overbroad mandates have been corrected.
