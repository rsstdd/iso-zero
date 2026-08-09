# AGENTS.md

ISO Zero is an Astro 7 static photography portfolio and print storefront whose hard constraints are zero client JavaScript, private originals, accessible native interaction, and evidence-backed engineering claims.

## Start here

* Read `docs/00_DOCUMENTATION_MAP.md` before substantial work, then read only the owning document and authoritative code/config for the concern being changed.
* Do not treat the entire documentation set as startup context. Route to the smallest relevant source set.
* Distinguish current repository state from target state. The repository currently contains documented React/Tailwind scaffold drift; `docs/08_IMPLEMENTATION_PLAN.md` owns its removal. Do not copy scaffold residue as an example or describe the target invariant as already satisfied.

## Repository rules

* Respect source-of-truth precedence. `src/content.config.ts` owns content shape, `src/styles/design-tokens.css` owns design values, and `package.json` owns dependencies and runnable scripts. Documentation owns decisions and rationale.
* Do not duplicate rules across documents. Amend the owning document. If an authoritative decision changes, update the decision table in `README.md` in the same change.
* Preserve static output and the zero-client-JavaScript budget. Do not add hydration directives, framework islands, inline scripts, React, or Tailwind under the current architecture. Any emitted client JavaScript is a defect unless the architecture decision is explicitly changed first.
* If a requested feature appears to require client JavaScript, first look for a native HTML/CSS solution consistent with the documented interaction model. If none exists, surface the architectural conflict rather than silently spending the budget.
* Originals never enter `public/` or `dist/`. Access them only through the originals boundary described in `docs/02_ARCHITECTURE.md`.
* Keep invalid states loud. Malformed galleries, unresolved originals, duplicate SKUs, EXIF drift, metadata violations, or incomplete print offers must fail validation or verification rather than degrade silently.
* Never upgrade an assertion into a fact without evidence. A claim about performance, protection, accessibility, compatibility, security, or correctness must be enforced automatically, measured and recorded, or marked `**[UNVERIFIED]**`.
* Remove an `**[UNVERIFIED]**` marker only in the same change that adds its check or records its measurement.
* Treat commerce, privacy, security headers, metadata handling, and accessibility semantics as high-risk surfaces. Preserve documented manual or qualified-review requirements; agent self-review is not evidence.
* Keep changes narrow. Do not opportunistically refactor unrelated code, rewrite non-owning documentation, or add dependencies for convenience.
* Do not encode formatter or linter rules here when Biome or `.editorconfig` can enforce them. Use this file for repository-specific judgment, invariants, workflows, and routing.

## Agent-legible code

* For a behavior change, write or update a test. For a bug, capture the failure with the smallest useful automated test or reproducible check when practical before fixing it.
* Document non-obvious invariants, cross-file coupling, protocol assumptions, and rejected-looking alternatives at the point of use. Comments should explain why; do not narrate obvious code.
* Before creating a new component, utility, script, or test, identify the best current example in the same layer and follow its contract. Do not imitate known scaffold residue.
* Prefer explicit contracts and build-time checks over conventions that exist only in prose or chat history.

## Agentic working loop

1. Read the task, `docs/00_DOCUMENTATION_MAP.md`, the owning document, and the authoritative code/config for the concern.
2. For substantial multi-file work, define concrete acceptance criteria and a verification plan before implementation. Use the milestone/exit-criterion model in `docs/08_IMPLEMENTATION_PLAN.md`; do not create a competing source of truth for project decisions.
3. Establish the baseline or reproduce the failure before changing behavior.
4. Implement the smallest change that satisfies the contract.
5. Run the fastest relevant check first. Run independent checks in parallel when the tooling permits it.
6. Exercise user-visible behavior in a real browser. Compilation and unit tests do not prove layout, interaction, keyboard behavior, accessibility, or cross-browser behavior.
7. Run the repository verification gate before declaring completion. Inspect `package.json` first because it is authoritative. `docs/07_TESTING_SECURITY_AND_OPERATIONS.md` currently defines `pnpm verify` as lint + typecheck + test + build; CI additionally runs build assertions and the end-to-end suite.
8. Audit the diff against the acceptance criteria, the zero-JavaScript budget, documentation ownership, and the verification matrix.
9. Report only checks actually executed. List remaining `**[UNVERIFIED]**`, manual release checks, or environmental blockers explicitly.

## Code review rules

These are consequential invariants that may look reasonable in a local diff and still violate the system.

* **No hidden runtime:** flag any hydration directive, client framework integration, inline event handler, emitted script asset, or dependency that creates a client-runtime path. Safe path: use native HTML/CSS, or explicitly amend the architecture and verification contracts first.
* **No duplicated authority:** flag a rule copied into a second document instead of linked to its owner. Safe path: edit the owner and update references; update `README.md` when an authoritative decision changes.
* **No unsupported claim:** flag new or strengthened claims without an automated check or recorded measurement. Safe path: add evidence in the same change or retain `**[UNVERIFIED]**`.
* **No silent invalid state:** flag fallback behavior that hides schema, asset, SKU, EXIF, metadata, or print-offer errors. Safe path: fail at build/verification with a specific error.
* **Test-driven development**. A written test is implicit documentation of intended behavior, and it lets an agent validate its own change without a human in the loop for every step.
* **A one-sentence doc comment on every class and method**. Cheap, and it is additional grounding context the agent reads before touching nearby code — repetition over abstraction, for an agent-legible codebase.
* **Document non-trivial cross-file coupling directly in the code, on both sides**. An agent's practical tool for finding related code is grep. Anything only implied by git history or convention is invisible to it unless written down at the point of coupling.
* **State naming and UI conventions explicitly**. A consistent product is close to free once these are written down, because the agent applies them by default on every change.
* **Point to the best existing example when asking for something new**. Without that pointer, an agent has no signal for which part of the codebase to imitate, and may draw from mediocre code as easily as excellent code.
* **Require end-to-end verification after implementing a feature.** Signing in and exercising it in a real browser, not trusting that code which compiles and passes unit tests actually works end to end.
* **State the quality bar explicitly**: response-time targets, dark-mode support, auth on every protected route. An unstated quality requirement does not get enforced by default. A stated one does.

## Routing table

## Routing table

Route to the smallest relevant source set. Prefer executable authority over prose when one exists. Specifications define contracts; ADRs explain accepted architectural decisions; implementation shows current state.

| Concern                                                            | Read / inspect first                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Documentation ownership, authority, and reading order              | `docs/00_DOCUMENTATION_MAP.md`, then `docs/README.md`                |
| Product scope, objectives, non-goals, audiences, release criteria  | `docs/01_PRODUCT_AND_ENGINEERING_BRIEF.md`                           |
| Rendering model, routes, module boundaries, dependency direction   | `docs/02_ARCHITECTURE.md`                                            |
| Architectural rationale or proposal to change an accepted decision | Matching record in `docs/03_adr/`, then the owning numbered document |
| Current implementation sequencing and milestone exit criteria      | `docs/08_IMPLEMENTATION_PLAN.md`                                     |
| AI-agent execution and implementation protocol                     | `docs/11_AI_IMPLEMENTATION_PROTOCOL.md`                              |
| Requirement ownership, coverage, and evidence traceability         | `docs/12_REQUIREMENTS_TRACEABILITY.md`                               |
| Portfolio-facing engineering narrative                             | `docs/09_PORTFOLIO_CASE_STUDY.md`                                    |

### Pages and components

| Concern                                        | Read / inspect first                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Homepage composition or behavior               | `docs/01_page-specs/HOMEPAGE_SPECIFICATION.md`, then `src/pages/index.astro`                                                               |
| Gallery-directory page                         | `docs/01_page-specs/GALLERIES_SPECIFICATION.md`, then `src/pages/galleries/index.astro`                                                    |
| Individual gallery page                        | `docs/01_page-specs/GALLERY_SPECIFICATION.md`, then `src/pages/galleries/[slug].astro`                                                     |
| Page-level visual composition or layout intent | Relevant page specification, then `docs/10_WIREFRAMES.md`                                                                                  |
| Shared component behavior or contract          | `docs/02_component-specs/00_COMPONENT_SPECIFICATIONS.md`, then the matching component specification and `src/components/<Component>.astro` |
| Base document shell                            | `docs/02_component-specs/01_BASE_LAYOUT.md`, then `src/layouts/Base.astro`                                                                 |
| Wordmark or generated brand assets             | `docs/02_component-specs/10_WORDMARK.md`, `src/components/BrandWordmark.astro`, then brand scripts under `scripts/`                        |

### Content, assets, and data

| Concern                                                      | Read / inspect first                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Gallery schema or content validation                         | `src/content.config.ts`, then `docs/03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`                                |
| Authored gallery content                                     | `src/content/galleries/`, then `src/content.config.ts`                                                        |
| Gallery discovery, ordering, or catalog behavior             | `src/lib/gallery-catalog.ts`, then the applicable page specification                                          |
| Homepage content selection                                   | `src/lib/homepage-content.ts`, then `docs/01_page-specs/HOMEPAGE_SPECIFICATION.md`                            |
| Original-image access                                        | `src/lib/originals.ts`, `docs/03_adr/0003-originals-storage.md`, then `docs/02_ARCHITECTURE.md`               |
| EXIF extraction or formatting                                | `scripts/extract-exif.mjs`, `src/lib/exif.ts`, then `docs/03_CONTENT_ASSET_AND_METADATA_PIPELINE.md`          |
| Image delivery, privacy, metadata, or reuse controls         | `docs/03_adr/0004-image-delivery-privacy-and-reuse.md`, then `docs/03_CONTENT_ASSET_AND_METADATA_PIPELINE.md` |
| Committed photographic assets                                | `src/assets/` and the owning gallery content file                                                             |
| Structured metadata / Schema.org                             | `src/lib/schema-org.ts`, then the owning content or commerce contract                                         |
| Static icons, favicons, manifest imagery, default OG imagery | `public/`                                                                                                     |

### Site configuration and navigation

| Concern                                                       | Read / inspect first                                                                   |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Site-wide identity or site configuration                      | `src/config/site.ts`, then `src/lib/site-identity.ts`                                  |
| Footer navigation data                                        | `src/config/footer-navigation.json`, then `src/lib/nav/footer-navigation.ts`           |
| Header current-route behavior                                 | `src/lib/nav/header-current-path.ts`, then `docs/02_component-specs/03_SITE_HEADER.md` |
| Build identity and deterministic build metadata               | `src/lib/build-identity.ts`, `docs/03_adr/0006-build-identity-and-determinism.md`      |
| Astro output mode, integrations, Vite behavior, image service | `astro.config.mjs`, then `docs/02_ARCHITECTURE.md`                                     |

### Design system and CSS

| Concern                                       | Read / inspect first                                                                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Executable design tokens                      | `src/styles/design-tokens.css`                                                                                                                             |
| ISO Zero design-system rules and rationale    | `docs/04_DESIGN_SYSTEM.md`, then `src/styles/design-tokens.css`                                                                                            |
| Global element defaults and layout primitives | `src/styles/global.css`, then `docs/04_DESIGN_SYSTEM.md`                                                                                                   |
| Shared or upstream Datum documentation        | Follow the ownership relationship recorded in `docs/00_DOCUMENTATION_MAP.md`; do not treat `docs/DESIGN_SYSTEM.md` as co-equal authority by filename alone |

### Interaction, accessibility, commerce, and security

| Concern                                                               | Read / inspect first                                                                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Viewer interaction, keyboard behavior, focus, screen readers          | `docs/05_INTERACTION_AND_ACCESSIBILITY.md`, then `src/components/PhotoGrid.astro` and `src/components/PhotoPopover.astro` |
| Commerce model, print offers, checkout, fulfilment, legal constraints | `docs/06_COMMERCE_AND_LEGAL.md`, then the relevant schema/library implementation                                          |
| Verification matrix, security headers, CI, deployment, monitoring     | `docs/07_TESTING_SECURITY_AND_OPERATIONS.md`                                                                              |
| Supporting research or external-source provenance                     | `docs/05_references/REFERENCES.md`                                                                                        |

### Testing and verification

| Concern                                                      | Read / inspect first                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Test architecture and repository testing conventions         | `tests/README.md`, `package.json`, then the relevant test configuration                                 |
| Unit tests                                                   | `vitest.config.ts`, colocated `src/**/*.test.ts`, and `tests/unit/`                                     |
| Browser smoke tests                                          | `playwright.config.ts`, then `tests/browser/`                                                           |
| Page/component end-to-end, accessibility, or reflow tests    | `tests/e2e/` and its `support/` utilities; inspect `package.json` to determine how the suite is invoked |
| Compile-time/type contract tests                             | `tests/type-fixtures/`, `tsconfig.test.json`, then the matching check script                            |
| Expected-build-failure tests                                 | `tests/build-fixtures/` and the matching `scripts/check-*.mjs`                                          |
| Isolated component/browser fixtures                          | `tests/component-fixtures/`                                                                             |
| Manual accessibility and release evidence                    | `tests/manual/`, then `docs/07_TESTING_SECURITY_AND_OPERATIONS.md`                                      |
| Build assertions and repository-specific verification guards | `scripts/`, `package.json`, then `docs/07_TESTING_SECURITY_AND_OPERATIONS.md`                           |
| Zero-client-JavaScript verification                          | `scripts/check-no-script.mjs`, then a freshly generated `dist/`                                         |
| Homepage source/output invariants                            | `scripts/check-homepage-source.mjs` and `scripts/check-homepage-output.mjs`                             |
| Brand asset generation and integrity                         | `scripts/build-brand-assets.py` and `scripts/verify-brand-assets.mjs`                                   |

### Tooling and generated output

| Concern                                                | Read / inspect first                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Runnable commands and dependency truth                 | `package.json`                                                                   |
| Dependency resolution                                  | `pnpm-lock.yaml`                                                                 |
| Workspace/package topology                             | `pnpm-workspace.yaml`                                                            |
| Formatting and linting                                 | `package.json`, then `biome.json` and `eslint.config.mjs`                        |
| TypeScript compilation                                 | `tsconfig.json` and `tsconfig.test.json`                                         |
| Test runner configuration                              | `vitest.config.ts` and `playwright.config.ts`                                    |
| Generated production output or emitted-asset diagnosis | Fresh `dist/`, read-only; trace the result back to source or build configuration |

### Historical material

| Concern                                    | Read / inspect first                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Superseded designs or historical rationale | `docs/04_archive/README.md`, then the relevant file under `docs/04_archive/original/` |

Files under `docs/04_archive/` and `dist/` are never implementation authority. Do not edit `dist/` to fix a generated result, and do not restore an archived decision merely because it conflicts with current code, specifications, ADRs, or owning documentation.


## Environment facts

* Node major version: `.nvmrc` (currently 22).
* Package manager: pnpm. Keep the pnpm lockfile; do not switch package managers.
* `package.json` is authoritative for commands. If a documented command is absent or differs, report documentation drift rather than inventing a script.
