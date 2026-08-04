# Site Header manual accessibility record

Component: `src/components/SiteHeader.astro`
Owning specification: `component-specs/03_SITE_HEADER.md`
Status: **[UNVERIFIED]** until both required browser/screen-reader runs are recorded.

Automated Playwright and axe-core checks do not prove announcement quality. Complete this record
for every release that changes Header semantics, labels, link order, route matching, or current-state
behavior.

## Required environments

| Screen reader | Browser | Platform | Result |
| --- | --- | --- | --- |
| VoiceOver | Safari | Current supported macOS | Pending |
| NVDA | Firefox | Current supported Windows | Pending |

Record exact operating-system, browser, and screen-reader versions in the execution record.

## Procedure

1. Open the built homepage with the screen reader enabled.
2. Open the landmark rotor/list.
3. Confirm exactly one site Header/banner landmark.
4. Confirm one navigation landmark named `Primary navigation`.
5. Traverse the Header in reading order.
6. Confirm the first link announces `IS0 ZER0`, its link role, and current page state.
7. Confirm the second link announces `Galleries` and its link role without a redundant or repeated
   accessible label.
8. Activate `Galleries` and confirm `/galleries/` opens.
9. Confirm `Galleries` announces current page state on `/galleries/`.
10. Open one `/galleries/[slug]/` route and confirm `Galleries` announces the current location
    state without claiming that the index itself is the current page.
11. Activate `IS0 ZER0` and confirm `/` opens.
12. Open `/about/` and confirm neither Header link announces a current state.
13. Traverse by Tab and confirm the focus order remains `IS0 ZER0`, then `Galleries`.
14. At 200% text enlargement, repeat navigation and confirm no announcement changes or empty focus
    stops appear.

## Acceptance criteria

- One Header/banner landmark and one `Primary navigation` landmark appear on every checked route.
- The navigation exposes one list containing `Galleries`.
- Link names come only from visible text and are announced once.
- Current-page and current-location states match the owning specification.
- No unrelated route causes either link to announce a current state.
- No menu, Shop, About, case-study, legal, image, or unlabeled control appears in the Header.
- Link activation and focus order remain correct.
- The decorative divider does not enter the accessibility tree.

## Execution record

| Field                  | VoiceOver/Safari | NVDA/Firefox |
| ---------------------- | ---------------- | ------------ |
| Date                   |                  |              |
| Tester                 |                  |              |
| Operating system       |                  |              |
| Browser version        |                  |              |
| Screen-reader version  |                  |              |
| Homepage result        |                  |              |
| Gallery-index result   |                  |              |
| Gallery-detail result  |                  |              |
| Unrelated-route result |                  |              |
| Defects or notes       |                  |              |

## Sign-off

Remove **[UNVERIFIED]** only after both environment columns contain passing results or linked defect
records with an explicit release decision.
