# ADR 0006: Use source identity instead of wall-clock timestamps

- **Status:** Accepted
- **Date:** 2026-07-31
- **Revisit trigger:** A regulatory or operational requirement needs a public build timestamp.

## Context

The original footer wireframes displayed an ISO 8601 “last build” timestamp generated at build time. This causes identical source inputs to produce different HTML bytes on every build, reducing cache reuse and making artifact comparison noisy.

The timestamp does not help most visitors determine content freshness because build time and editorial update time are different facts.

## Decision

Public data plates use stable source identity:

- Commit SHA.
- Release or content version.
- Authored publication or updated date where relevant.

A wall-clock deployment time may appear in operational diagnostics or the colophon if it serves a defined purpose and is labeled as deployment metadata. It is not injected into every page.

## Consequences

- Identical source inputs can produce identical public output.
- Cache behavior and artifact comparison improve.
- Footer metadata becomes meaningful rather than mechanically current.
- Deployment time remains available through hosting logs and release evidence.

## Verification

- Two builds from identical inputs produce identical output hashes, excluding explicitly documented non-deterministic platform artifacts.
- Footer tests assert commit or release identity rather than current time.
