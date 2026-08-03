# ADR 0004: Describe image controls by actual effect

- **Status:** Accepted
- **Date:** 2026-07-31
- **Revisit trigger:** A new rights-management control is introduced or observed misuse changes the risk model.

## Context

Earlier documents grouped resolution limits, route structure, metadata, hotlink rules, crawler directives, and watermarking under “image protection.” That label implies prevention that a public browser-delivered image cannot receive.

A visitor who can view an image can generally obtain the delivered bytes. Asset URLs remain visible through markup, styles, caches, or network tooling even when no per-photo HTML page exists.

## Decision

Use the category **image delivery, privacy, attribution, and reuse deterrence**.

Document each control by its actual purpose and limitation:

- Private originals prevent source disclosure.
- GPS stripping protects location privacy.
- Maximum dimensions limit delivered resolution.
- IPTC creator and copyright metadata preserve attribution where supported.
- Hotlink controls reduce casual off-origin bandwidth use.
- Crawler rules express indexing policy.
- Absence of unsold per-photo HTML routes reduces convenient deep linking and indexing.
- Visible watermarking remains a deterrence and presentation trade-off, not security.

No right-click, drag, or developer-tools suppression is allowed.

## Structured-data tension

`ImageObject` and licensing metadata can improve machine understanding and discovery. Image exclusion directives reduce discovery. The project must choose the desired policy per asset class:

- Portfolio images may allow indexing for discovery.
- Sensitive or private work must not be deployed.
- Images intentionally excluded from search require appropriate crawler and response controls.

The project must not claim both broad discovery and broad crawler exclusion as simultaneous benefits.

## Consequences

- Public language becomes accurate.
- Security review can distinguish privacy invariants from deterrence.
- Some stakeholders may perceive the policy as less protective because it avoids overstatement.
- Direct derivative links are accepted as inherent to the no-JavaScript fallback.

## Verification

- Metadata inspection proves GPS absence.
- Deployment inspection proves originals absent.
- Hotlink policy is tested from an off-origin page.
- Robots and response directives are tested as policy, not access control.
