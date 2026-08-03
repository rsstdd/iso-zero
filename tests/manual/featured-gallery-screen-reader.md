# Featured Gallery screen-reader verification

Automated accessibility checks do not establish whether a linked image, `aria-labelledby`, and
`aria-describedby` composition produces concise announcements in a specific screen reader. Complete
this record after any change to the featured link, image alt text, metadata, action copy, or ID
relationships.

## Expected contract

- The compound link is announced as `Enter gallery Venice`.
- Its description exposes the arcade description, `Venice, Italy`, `August 2026`, and `12 images`,
  in that order.
- The photograph remains discoverable with the authored non-empty alt text.
- The arrow is not announced.
- Link purpose does not repeat incoherently.
- One focus stop covers the image and metadata plate.

If the hidden image-description reference repeats the image description in a way that impedes
understanding, revise the `aria-describedby` composition while preserving the four requirements in
`component-specs/05_FEATURED_GALLERY.md`. Record the resulting pattern before removing the
specification's **[UNVERIFIED]** marker.

## Release record

| Combination | Date | Build SHA | Tester | Result | Exact announcement and notes |
| --- | --- | --- | --- | --- | --- |
| VoiceOver / Safari | — | — | — | Not run | — |
| NVDA / Firefox | — | — | — | Not run | — |

## Keyboard observations

| Check | VoiceOver / Safari | NVDA / Firefox |
| --- | --- | --- |
| Tab reaches one compound link | Not run | Not run |
| Enter opens `/galleries/venice/` | Not run | Not run |
| Image description remains discoverable | Not run | Not run |
| Metadata order is intelligible | Not run | Not run |
| Decorative arrow remains silent | Not run | Not run |
