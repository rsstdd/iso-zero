# Data Plate manual accessibility record

Component: `src/components/DataPlate.astro`  
Owning specification: `component-specs/06_DATA_PLATE.md`  
Status: **[UNVERIFIED]** until both required browser/screen-reader runs are recorded.

Automated Playwright and axe-core checks establish native markup and relationships but do not prove
how definition pairs, labelled plates, or numeric strings are announced. Complete this record for
every release that changes Data Plate roots, labelling, definition-list structure, or numeric
formatting.

## Required environments

| Screen reader | Browser | Platform | Result |
| --- | --- | --- | --- |
| VoiceOver | Safari | Current supported macOS | Pending |
| NVDA | Firefox | Current supported Windows | Pending |

Record exact operating-system, browser, and screen-reader versions in the execution record.

## Procedure

1. Build and open the isolated Data Plate fixture.
2. Navigate to the `Exposure record` section in reading mode.
3. Confirm the default plate does not announce an invented region, group, or interactive role.
4. Traverse its definition list and confirm each term remains associated intelligibly with its
   value: `ISO` / `100`, `Exposure` / `1/250 s`, and `Aperture` / `f/2.8`.
5. Navigate to the figure and confirm the caption follows the figure content in reading order.
6. Confirm `Venice, Italy`, `August 2026`, and `12 images` are announced as ordinary sequential
   metadata without a false control or landmark.
7. Navigate to `Build record` and confirm the nested `footer` does not appear as the site's root
   content-information landmark.
8. Confirm its `Build` and `Content` terms remain associated with `0a1b2c3` and `2026.08`.
9. Confirm hexadecimal and numeric strings remain distinguishable; record ambiguous pronunciation
   rather than changing visible content solely for a speech-engine quirk.
10. Confirm no Data Plate creates a Tab stop.
11. Apply 200% text enlargement and confirm reading order and announcement remain unchanged.
12. Confirm the decorative hairline creates no accessible object, announcement, or state.

## Acceptance criteria

- Data Plate adds no role or landmark beyond the selected native root's contextual semantics.
- `dl`, `dt`, and `dd` relationships remain intelligible in both screen-reader combinations.
- The figure caption follows its figure content and remains discoverable.
- The section-level `footer` does not masquerade as the site footer landmark.
- `aria-labelledby` does not duplicate the visible heading or cause repeated metadata.
- Sequential metadata remains readable in authored source order.
- Numeric and hexadecimal values remain available as DOM text.
- No empty plate, unlabeled object, generated pseudo-content, or keyboard focus stop appears.
- The decorative boundary remains absent from the accessibility tree.

## Execution record

| Field | VoiceOver/Safari | NVDA/Firefox |
| --- | --- | --- |
| Date | | |
| Tester | | |
| Operating system | | |
| Browser version | | |
| Screen-reader version | | |
| Definition-pair result | | |
| Figure-caption result | | |
| Section-footer result | | |
| Numeric speech result | | |
| Focus-order result | | |
| Defects or notes | | |

## Sign-off

Remove **[UNVERIFIED]** only after both environment columns contain passing results or linked defect
records with an explicit release decision.
