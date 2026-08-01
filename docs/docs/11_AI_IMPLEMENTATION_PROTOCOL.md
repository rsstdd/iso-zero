# AI implementation protocol

Use this document when an AI system generates or modifies project code. It is subordinate to the architecture, domain, design, accessibility, commerce, and quality documents.

## 1. Required reading order

Before changing code, read the authoritative document for the affected concern:

1. `00_DOCUMENTATION_MAP.md`
2. Applicable architecture or domain document.
3. Applicable ADR.
4. Existing tests and implementation files.

Do not infer a rule from a historical file when an authoritative replacement exists.

## 2. Execution rules

### Work incrementally

- Change the smallest coherent set of files.
- Provide complete production-grade files or precise diffs.
- Preserve strict TypeScript types.
- Add or update tests in the same change.
- Keep generated files machine-generated; do not hand-edit them.

### Surface contradictions first

When a request conflicts with an invariant, budget, or accepted ADR:

1. Name the conflict.
2. Identify the authoritative source.
3. Propose the smallest viable resolution.
4. Amend the ADR when the decision changes.
5. Do not generate discarded implementation against both sides.

### Measure claims

A statement about payload, browser behavior, metadata, accessibility, or protection requires:

- An automated assertion,
- A reproducible command and recorded result, or
- The label `unverified`.

Do not convert an intended budget into a claimed result.

## 3. Technical constraints

- Astro 6 static output for public pages.
- No React dependency unless an accepted ADR introduces a React island.
- Gallery content renders without client JavaScript.
- The dialog enhancement is framework-free and no more than 3 KB Brotli.
- Authored content and generated metadata remain separate.
- All original access passes through `OriginalsRepository`.
- Money uses integer minor units.
- Print availability is the presence of a complete print object.
- Cross-entry invariants run as build checks.
- Large viewer images load only after open.
- Explicit image dimensions are required.
- GPS is absent from delivered files.
- Checkout price and availability are loaded server-side.
- Webhooks are signed and idempotent.

## 4. Code quality

Generated code must:

- Pass Biome formatting and linting.
- Pass `astro check`.
- Avoid `any` unless isolated at a validated external boundary and justified.
- Avoid non-null assertions where a checked branch can establish safety.
- Avoid manual memoization because no React runtime is present.
- Use exhaustive state handling for order transitions.
- Return actionable errors with identifiers and corrective context.
- Avoid silent catch blocks.
- Keep external provider data behind adapters.

## 5. HTML and accessibility

- Use semantic elements.
- Use links for navigation and buttons for actions.
- Do not add ARIA where native semantics are sufficient.
- Preserve authored alternative text.
- Maintain dialog focus behavior and accessible names.
- Keep pointer targets and focus indicators within project requirements.
- Test JavaScript-disabled fallback when changing gallery triggers.

## 6. Styling

- Use CSS custom properties and semantic component classes.
- Preserve the orange allowlist.
- Preserve zero-radius photographs.
- Use sentence case except for the defined overline and machine-data contexts.
- Do not introduce utility frameworks, animation libraries, textures, grain, soft card radii, or decorative gradients without an accepted design change.
- Honor reduced motion and forced colors.

## 7. Dependency changes

A new dependency proposal must state:

- Problem solved.
- Why a local or platform implementation is insufficient.
- Runtime and build cost.
- Security and maintenance implications.
- Removal condition.
- Tests proving integration behavior.

Do not add a dependency for a hypothetical future feature.

## 8. Required response format for implementation work

1. **Conflict or decision note**, only when needed.
2. **Files changed**.
3. **Implementation** as diffs or complete files.
4. **Tests added or changed**.
5. **Verification commands**.
6. **Known unverified behavior**.

Communication remains direct, technical, and free of filler.
