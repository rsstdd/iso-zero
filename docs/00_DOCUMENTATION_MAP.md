# 00 — Documentation map

Documentation drifts when two files describe the same rule and only one of them is updated. This map exists to prevent that: every concern in ISO Zero has exactly one owning document, and every other mention of that concern is a link rather than a restatement.

## The rule

State a rule once, in its owning document. Everywhere else, link to it. A pull request that restates a rule instead of linking to it is rejected on that basis alone, because the second copy is the one that will go stale.

## Ownership

| Concern | Source of truth | Notes |
|---|---|---|
| Product scope, objectives, non-goals | [`01_PRODUCT_AND_ENGINEERING_BRIEF.md`](01_PRODUCT_AND_ENGINEERING_BRIEF.md) | |
| Rendering model and output mode | [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md) | |
| Route inventory | [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md) | |
| Module boundaries and dependency direction | [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md) | |
| Originals storage and the resolver | [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md) | Implementation lives in `src/lib/originals.ts` |
| Content schema | `src/content.config.ts` | Code is the source of truth. [`03`](03_CONTENT_ASSET_AND_METADATA_PIPELINE.md) explains it and must not contradict it |
| EXIF extraction and generated regions | [`03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`](03_CONTENT_ASSET_AND_METADATA_PIPELINE.md) | |
| Derivative formats, sizes, colour | [`03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`](03_CONTENT_ASSET_AND_METADATA_PIPELINE.md) | |
| Embedded metadata policy | [`03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`](03_CONTENT_ASSET_AND_METADATA_PIPELINE.md) | Rationale for the policy sits in [`07`](07_TESTING_SECURITY_AND_OPERATIONS.md) under image protection |
| Colour tokens, typography, spacing, geometry | [`04_DESIGN_SYSTEM.md`](04_DESIGN_SYSTEM.md) | Values are in `src/styles/design-tokens.css` |
| Datum tick and data plate motifs | [`04_DESIGN_SYSTEM.md`](04_DESIGN_SYSTEM.md) | |
| Microcopy and voice | [`04_DESIGN_SYSTEM.md`](04_DESIGN_SYSTEM.md) | |
| Viewer interaction model | [`05_INTERACTION_AND_ACCESSIBILITY.md`](05_INTERACTION_AND_ACCESSIBILITY.md) | |
| Keyboard model and focus order | [`05_INTERACTION_AND_ACCESSIBILITY.md`](05_INTERACTION_AND_ACCESSIBILITY.md) | |
| WCAG conformance and stated costs | [`05_INTERACTION_AND_ACCESSIBILITY.md`](05_INTERACTION_AND_ACCESSIBILITY.md) | |
| Print offer model | [`06_COMMERCE_AND_LEGAL.md`](06_COMMERCE_AND_LEGAL.md) | Schema shape is owned by `src/content.config.ts` |
| Checkout and fulfilment | [`06_COMMERCE_AND_LEGAL.md`](06_COMMERCE_AND_LEGAL.md) | |
| German trader obligations | [`06_COMMERCE_AND_LEGAL.md`](06_COMMERCE_AND_LEGAL.md) | |
| Verification matrix | [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md) | The register of every claim and its evidence |
| Test strategy and tooling | [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md) | |
| Image protection layers | [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md) | |
| CI gates and deployment | [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md) | |
| Milestones and exit criteria | [`08_IMPLEMENTATION_PLAN.md`](08_IMPLEMENTATION_PLAN.md) | |
| Narrative for external readers | [`09_PORTFOLIO_CASE_STUDY.md`](09_PORTFOLIO_CASE_STUDY.md) | May restate decisions in prose, because its audience is different. It may not introduce new ones |
| Agent and contributor operating rules | `AGENTS.md` | Root of the repository. `CLAUDE.md` is a pointer to it |

## Where code outranks prose

Three artifacts are authoritative over any document that describes them, because they execute and documents do not.

| Artifact | Authoritative for |
|---|---|
| `src/content.config.ts` | The shape and validation of every gallery and print offer |
| `src/styles/design-tokens.css` | Every colour, type scale, radius, and motif value |
| `package.json` | Dependency versions and the composition of `pnpm verify` |

Where a document and one of these artifacts disagree, the artifact is correct and the document is a defect. The reverse is true for decisions and rationale, which live only in documentation because code cannot record why an alternative was rejected.

## Conventions

Documents are numbered, and the number is part of the filename because ordering communicates reading sequence. Numbers are not reused after a document is retired.

Claims that are neither enforced by a check nor backed by a recorded measurement carry **[UNVERIFIED]** inline. The marker is removed in the same commit that adds the check or records the measurement, never earlier.

Dates in documentation are ISO 8601. Currency in documentation is written as it is stored, in integer minor units, with the human rendering shown alongside where it aids reading.

## Change protocol

Amending a decision requires editing the owning document and the decision table in [`README.md`](README.md) in the same commit, because a decision table that lags its source is worse than no table. Adding a new concern requires adding a row to this map before the concern is documented anywhere, because a concern with no recorded owner acquires two.
