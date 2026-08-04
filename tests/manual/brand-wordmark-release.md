# IS0 ZER0 wordmark release verification

Record date, browser/assistive-technology version, operator, and result for each release-environment check.

## Visual construction

- [ ] Compact and display variants read as one identity system.
- [ ] `ISO` reads as a calibrated index, not a detached eyebrow or navigation label.
- [ ] `ZERO` remains the dominant maker line without clipping or uneven optical spacing.
- [ ] Header placement remains balanced against the Galleries link at 320, 390, 768, 1280, and 1440 CSS pixels.
- [ ] Homepage placement retains the intended hierarchy above the byline and photograph.
- [ ] No orange, panel, border, tick, radius, shadow, glow, or background change appears inside either mark.
- [ ] SVG and PNG exports match the component's hierarchy and Datum palette.

## Accessibility and resilience

- [ ] VoiceOver/Safari announces the Header home link once as “IS0 ZER0.”
- [ ] VoiceOver/Safari announces the homepage heading once as “IS0 ZER0, heading level 1.”
- [ ] NVDA/Firefox announces the same link and heading names without spelling the two visual lines separately.
- [ ] Keyboard focus remains on the 44 × 44 px minimum Header link target, not on either internal span.
- [ ] Windows forced colors preserves both lines and the home-link focus indication.
- [ ] 200% text enlargement and WCAG text-spacing overrides preserve both lines without overlap.
- [ ] Blocking IBM Plex requests leaves both variants legible in the declared serif fallback stack.

## Export QA

- [ ] Outlined SVGs display without external fonts, images, scripts, or network requests.
- [ ] Compact PNG is 480 × 192; display PNG is 960 × 480.
- [ ] Export background is `#191611`; foreground is `#ede7db`.
- [ ] The receiving system preserves the artwork aspect ratio and required clear space.
