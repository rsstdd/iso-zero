# ADR 0003: Store production originals in private object storage

- **Status:** Accepted
- **Date:** 2026-07-31
- **Revisit trigger:** Object-storage access materially blocks local authoring or CI reliability after caching is implemented.

## Context

The original design deferred the choice between Git LFS and object storage and proposed an approximate 500 MB decision threshold. Repository size alone does not capture the relevant operational factors:

- Clone and checkout time.
- CI cache behavior.
- Raw-file count and size.
- Backup and retention.
- Access control.
- Public repository exposure.
- Incremental transform workflow.
- Egress and deployment cost.

The project expects private raw originals and public generated derivatives. These have different lifecycle and access requirements.

## Decision

Use private object storage for production originals. Keep `originalKey` opaque and resolve it only through `OriginalsRepository`.

Provide a filesystem adapter for development and tests.

Use source hashes and transform configuration to avoid unnecessary downloads and transformations. Public derivatives may be stored on the deployment CDN or a separate public asset origin.

## Alternatives

### A. Git LFS

**Advantages**

- Simple source-control mental model.
- Easy historical association between content and source.

**Rejected because**

- Raw files increase clone and CI complexity.
- Public repository configuration and LFS access can expose or complicate originals.
- Every build environment may need LFS hydration even when nothing changed.

### B. Originals committed directly to Git

Rejected because repository growth, exposure, and binary history are unacceptable.

### C. Local-only originals

Rejected because builds become non-reproducible and dependent on one workstation.

## Consequences

### Positive

- Private access policy.
- Independent backup and retention.
- Incremental source retrieval.
- Smaller repository.
- Clear separation between source and delivery assets.

### Negative

- Credentials and network access are required for uncached processing.
- Local authoring requires a sync or filesystem path.
- Egress and storage costs require monitoring.

## Verification

- CI can resolve required sources with scoped credentials.
- Public deployment cannot list or retrieve originals.
- Unchanged sources use cached manifest and derivatives.
- Development adapter passes the same contract tests as object storage.
