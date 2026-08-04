# 01 — Product and engineering brief

## What this is

IS0 ZER0 is a photography portfolio and print storefront for a single author. It presents a small, curated archive of photographs, publishes the technical circumstances under which each was made, and sells prints of the subset that is offered for sale.

A photography site is images and almost nothing else. That observation is the whole design: if the interface is not carrying an image, it is competing with one, and the correct client JavaScript payload for a page whose entire content is pictures is zero bytes.

## Objectives

The system must:

- Present photography without interface chrome competing with the images.
- Deliver responsive, colour-consistent derivatives without exposing originals.
- Preserve authorship metadata while removing GPS and other unnecessary source metadata.
- Render every route, including the image viewer, with no client JavaScript.
- Provide a complete and accessible keyboard and screen-reader interaction model, with its limitations stated rather than concealed.
- Generate product pages only for photographs that carry a complete print offer.
- Complete at least one real purchase through a hosted checkout provider.
- Fail the build when content, routes, assets, metadata, or generated data drift from their contracts.

## Non-goals

Naming what the project refuses is more useful than naming what it wants, because the refusals are what make the budget holdable.

| Non-goal | Reason |
|---|---|
| A content management system | One author adding files and pushing does not need an editing surface, and building one would be the largest component in the system by a wide margin |
| Client-side search, filtering, or sorting | Each requires a runtime, and an archive small enough to browse does not need any of them |
| Comments, likes, or accounts | None of them serve the reader, and each drags in a database, moderation, and personal data |
| Animation beyond CSS transitions | Motion that requires a script is motion that requires a runtime |
| A visible watermark | A presentation cost paid against a threat that screenshots defeat regardless. Reconsidered only if unauthorised reuse is actually observed |
| Right-click blocking and devtools detection | Bypassed in seconds through the network panel, and each treats the audience as suspects |
| Internationalisation | The audience is English-reading. German-language legal pages are an obligation rather than a localisation feature, and are handled as content |

## The budget, and what it costs

Zero client JavaScript is a constraint rather than an aspiration, and constraints are only real when their costs are named.

| Consequence | Assessment |
|---|---|
| No arrow-key navigation in the viewer | Accepted. Previous and next are buttons, reachable by Tab and operable by Enter, which is keyboard-accessible but not keyboard-fast |
| No focus trap inside the viewer | Accepted with mitigation. See [`05_INTERACTION_AND_ACCESSIBILITY.md`](05_INTERACTION_AND_ACCESSIBILITY.md), because this is the sharpest cost of the budget |
| No client-side analytics | Accepted, and welcomed. Server log analysis answers the questions that matter for a portfolio |
| No dynamic inventory for limited editions | Accepted for the first release. Edition counts are authored, and the mitigation is in [`06_COMMERCE_AND_LEGAL.md`](06_COMMERCE_AND_LEGAL.md) |
| Every popover is rendered at build | Accepted with a ceiling. Document weight grows linearly with gallery size, so galleries are capped at 40 photographs until a measurement justifies otherwise |

If a gallery route ever ships a byte of JavaScript, an island has appeared where none was justified, and that is a defect rather than a preference. The check that enforces this is described in [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md).

## Audiences

Two readers matter, and they want different things from the same pages.

**The viewer** arrives for the photographs. Success is that the images load quickly, appear at the intended colour, do not shift while loading, and can be examined at a useful size without the interface asking anything of them.

**The hiring reader** arrives from a CV. Success is that the technical claims on the case-study page are demonstrably true of the deployed site, verifiable from the network panel in under a minute. This audience is the reason for the core engineering principle: a portfolio project that asserts a performance property it has not measured is worse than one that asserts nothing.

## Success criteria

The first release is complete when all of the following hold on the deployed site, each recorded in the verification matrix.

| Criterion | Evidence |
|---|---|
| Zero script bytes on every gallery route | Build-time assertion over the emitted HTML |
| Cumulative Layout Shift of 0 on gallery routes | Field measurement, recorded with date and device class |
| Largest Contentful Paint under 2.0 s on a mid-tier mobile connection | Field measurement, recorded with conditions |
| No axe-core violations at WCAG 2.2 AA | Automated scan in CI over every built route |
| Keyboard-only traversal of a gallery and its viewer | Manual script, recorded per browser |
| No GPS coordinates in any delivered derivative | Automated metadata scan over build output |
| IPTC creator and copyright present in every delivered JPEG | Automated metadata scan over build output |
| One completed purchase, fulfilled and shipped | Manual record |

Twelve photographs of mixed aspect ratio is the minimum content bar, because a grid that has only been exercised against uniform 3:2 frames has not been exercised.

## Out of scope for the first release

C2PA Content Credentials, a second gallery, print inventory enforcement, and any analytics beyond server logs. Each is recorded in [`08_IMPLEMENTATION_PLAN.md`](08_IMPLEMENTATION_PLAN.md) rather than discarded, because the difference between deferred and forgotten is whether it is written down.
