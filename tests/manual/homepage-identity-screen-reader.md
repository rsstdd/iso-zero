# Homepage Identity manual accessibility record

Component: `src/components/HomepageIdentity.astro`
Owning specification: `component-specs/04_HOMEPAGE_IDENTITY.md`
Status: **[UNVERIFIED]** until both required browser/screen-reader runs are recorded.

Automated Playwright and axe-core checks establish native markup, heading order, and accessible
relationships but do not prove announcement quality. Complete this record for every release that
changes the identity copy, heading, section labelling, or position in the homepage composition.

## Required environments

| Screen reader | Browser | Platform | Result |
| --- | --- | --- | --- |
| VoiceOver | Safari | Current supported macOS | Pending |
| NVDA | Firefox | Current supported Windows | Pending |

Record exact operating-system, browser, and screen-reader versions in the execution record.

## Procedure

1. Build and open the isolated Homepage Identity fixture.
2. Navigate by level-one heading and confirm exactly one result: `ISO Null`.
3. Navigate by region/section and confirm the Identity section is named `ISO Null` through its
   visible heading.
4. Confirm the section does not announce a duplicated name or a redundant explicitly authored
   region role.
5. Read continuously from the heading through the byline and confirm the order is `ISO Null`, then
   `Photography by Ross Todd`.
6. Continue through the page and confirm the next headings are `Featured gallery` and `Available
   galleries`, both at level two.
7. Confirm `Ross Todd` remains plain text and creates no link or keyboard focus stop.
8. Confirm the component announces no decorative line, datum tick, logo image, action, metadata,
   pseudo-content, or hidden alternative copy.
9. Apply 200% text enlargement and confirm the same text and heading relationships remain
   available.
10. At a 320 CSS px equivalent viewport, confirm both strings remain complete and reading order is
    unchanged.

## Acceptance criteria

- The homepage exposes one level-one heading, `ISO Null`.
- The section's accessible name resolves to the visible heading without duplicate announcement.
- The byline follows the heading as ordinary text.
- Featured-gallery and directory level-two headings follow the Identity in source and reading
  order.
- No Identity descendant creates a Tab stop, link, control, image alternative, or extra landmark.
- Enlarged, wrapped, and fallback-font text remains complete and intelligible.

## Execution record

| Field | VoiceOver/Safari | NVDA/Firefox |
| --- | --- | --- |
| Date | | |
| Tester | | |
| Operating system | | |
| Browser version | | |
| Screen-reader version | | |
| H1 navigation result | | |
| Section naming result | | |
| Reading-order result | | |
| Focus-order result | | |
| Enlargement/reflow result | | |
| Defects or notes | | |

## Sign-off

Remove **[UNVERIFIED]** only after both environment columns contain passing results or linked defect
records with an explicit release decision.
