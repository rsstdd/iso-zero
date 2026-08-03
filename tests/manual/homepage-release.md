# Homepage release verification

Automated checks do not establish screen-reader announcement quality, photographic rendering quality,
field performance, or device-specific zoom behavior. Complete this record for each release that changes
homepage semantics, interaction, image delivery, typography, or above-the-fold layout.

## Release identity

- Commit SHA:
- Content version:
- Deployment URL:
- Date (UTC):
- Tester:

## VoiceOver with Safari

- [ ] The first announced focusable element is “Skip to content”.
- [ ] Activating the skip link bypasses the site header and reaches the main landmark.
- [ ] Landmark navigation exposes one banner, one main, and one content information landmark.
- [ ] Heading navigation announces ISO Null, Venice, Available galleries, then Venice at levels 1, 2, 2, and 3.
- [ ] The feature link has a concise action-oriented name and a useful description without confusing repetition.
- [ ] The directory announces one-item list semantics and a clear Venice link purpose.
- [ ] Project and Legal navigation groups remain distinguishable.
- Result: PASS / FAIL
- Notes:

## NVDA with Firefox

- [ ] Repeat every VoiceOver/Safari check above.
- [ ] Confirm the linked image alt text does not create harmful repetition with `aria-describedby`.
- Result: PASS / FAIL
- Notes:

## Keyboard and zoom

- [ ] Tab order is skip link, wordmark, Galleries, featured Venice link, directory Venice link, Project links, then Legal links.
- [ ] Every focus indicator remains completely visible.
- [ ] At browser zoom 200% and 400% from a 1280 CSS-pixel viewport, no content or focus indicator clips and no two-dimensional scrolling appears.
- [ ] A 320 CSS-pixel viewport and short landscape viewport preserve the complete photograph composition.
- Result: PASS / FAIL
- Notes:

## Image and performance evidence

- [ ] Editorial approval recorded for the hero alt text.
- [ ] AVIF, WebP, and JPEG derivatives reviewed at every governed candidate width.
- [ ] The complete 2048 × 1155 composition remains visible; no crop or colour-profile defect appears.
- [ ] Network inspection shows exactly one high-priority hero candidate and no duplicate preload.
- [ ] Field CLS is recorded as 0, with device, browser, cache state, and connection conditions.
- [ ] Field LCP is below 2.0 seconds, with device, browser, cache state, and connection conditions.
- CLS result and conditions:
- LCP result and conditions:
- Result: PASS / FAIL

## Forced colours and font failure

- [ ] Homepage hierarchy and link recognition remain clear in Windows High Contrast mode.
- [ ] Blocking all custom font files leaves every string legible and every region distinct.
- Result: PASS / FAIL
- Notes:

## Release decision

- Overall: PASS / FAIL
- Open defects:
- Sign-off:
