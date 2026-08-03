# Site Footer manual accessibility record

Component: `src/components/SiteFooter.astro`  
Owning specification: `component-specs/09_SITE_FOOTER.md`  
Status: **[UNVERIFIED]** until both required browser/screen-reader runs are recorded.

Automated Playwright and axe-core checks do not prove screen-reader announcement quality. Complete
this record for every release that changes Footer semantics, labels, destination order, or build
identity.

## Required environments

| Screen reader | Browser | Platform | Result |
| --- | --- | --- | --- |
| VoiceOver | Safari | Current supported macOS | Pending |
| NVDA | Firefox | Current supported Windows | Pending |

Record exact operating-system, browser, and screen-reader versions in the execution record.

## Procedure

1. Open the built homepage with the screen reader enabled.
2. Open the landmark rotor/list.
3. Confirm exactly one site footer/content-info landmark.
4. Confirm two navigation landmarks named `Project` and `Legal`.
5. Move to `Project` navigation and traverse its list.
6. Confirm the list reports two items in this order:
   1. `About`.
   2. `Engineering case study`.
7. Move to `Legal` navigation and traverse its list.
8. Confirm the list reports three items in this order:
   1. `Impressum`.
   2. `Datenschutz`.
   3. `AGB`.
9. Confirm each link announces its label, link role, and no irrelevant surrounding text.
10. Continue reading into the data plate.
11. Confirm the copyright sentence reads naturally, including the year and rights statement.
12. Confirm the definition list announces `Build` with the seven-character SHA and `Content` with
    its deterministic version as label-value relationships.
13. Confirm neither build value enters the Tab sequence.
14. Activate each Footer link and confirm the destination matches its label.
15. Repeat the landmark and link-order checks on one gallery route and one legal route to verify
    consistent navigation.

## Acceptance criteria

- One Footer/content-info landmark appears on every checked route.
- `Project` and `Legal` are distinct and intelligible navigation names.
- List lengths, link labels, and source order match the owning specification.
- Build metadata announces as two label-value pairs, not as disconnected fragments.
- Plain build values never present as controls.
- No duplicated `Galleries` destination appears in the Footer.
- No unexpected punctuation or decorative hairline enters the accessibility tree.
- No unlabeled or empty focus stop occurs.

## Execution record

| Field | VoiceOver/Safari | NVDA/Firefox |
| --- | --- | --- |
| Date |  |  |
| Tester |  |  |
| Operating system |  |  |
| Browser version |  |  |
| Screen-reader version |  |  |
| Homepage result |  |  |
| Gallery-route result |  |  |
| Legal-route result |  |  |
| Defects or notes |  |  |

## Sign-off

Remove **[UNVERIFIED]** only after both environment columns contain passing results or linked defect
records with an explicit release decision.
