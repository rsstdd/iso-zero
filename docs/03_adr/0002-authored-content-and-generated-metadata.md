# ADR 0002: Separate authored content from generated metadata

- **Status:** Accepted
- **Date:** 2026-07-31
- **Revisit trigger:** The content layer cannot join the manifest without unacceptable build complexity or performance cost.

## Context

The original pipeline wrote generated EXIF into gallery frontmatter. The generator owned exactly one `exif` key, remained idempotent, and provided `--check`. That approach was defensible because rendering required no join and the schema could validate EXIF directly.

The file nevertheless had two owners:

- Humans owned captions, alternative text, order, and print data.
- The generator owned EXIF.

This creates predictable costs:

- Generated churn in editorial diffs.
- Risk of accidental hand edits to machine data.
- Coupling between source processing and content-file serialization.
- Difficulty adding hashes, derivatives, and verification results without expanding the generated region.

## Decision

Keep authored gallery files fully human-owned. Write dimensions, hashes, EXIF, derivatives, and metadata verification to a deterministic sidecar manifest keyed by stable photo ID.

Astro joins authored entries and manifest records at build time through a build-time content loader or a validated library boundary.

The generator retains:

- Idempotency.
- Atomic writes.
- `--check` mode.
- Measured EXIF values.
- Actionable failures.

## Alternatives

### A. Generated `exif` frontmatter key

**Advantages**

- No runtime or build join.
- One schema validates a complete entry.

**Rejected because**

- Mixed ownership remains visible in source files.
- The generated domain is already broader than EXIF.
- Source hashes and derivatives belong in machine data, not editorial documents.

### B. Fully generated gallery files

**Rejected because**

- Captions, ordering, alternative text, and print details require durable editorial ownership.

### C. Database-backed content

**Rejected for initial release because**

- The archive is static and source-controlled editorial content is sufficient.
- A database increases operational surface without a current authoring requirement.

## Consequences

### Positive

- Editorial diffs remain readable.
- Generated state can expand without polluting content.
- Asset cache and verification data have a natural home.
- The generator can change serialization independently of editorial format.

### Negative

- Build logic must join and validate two sources.
- Missing or stale manifest records require explicit failures.
- Photo ID stability becomes critical.

## Verification

- Generator run does not modify authored files.
- `--check` fails on manifest drift.
- Build fails when a photo lacks a manifest record.
- Build fails when a manifest record lacks authored content unless explicitly allowed for unpublished sources.
