# Featured Gallery release verification

Record checks that require real photographic judgment, production delivery, or field data. A blank
row is not evidence; keep the corresponding claim measured or **[UNVERIFIED]** until completed.

## Visual composition

Confirm that `_DSF0140.JPG` remains completely visible, centred, uncropped, unfiltered, square, and
free of overlays at each viewport.

| Viewport | Date | Build SHA | Result | Notes |
| --- | --- | --- | --- | --- |
| 320 × 900 | — | — | Not run | — |
| 390 × 844 | — | — | Not run | — |
| 768 × 1024 | — | — | Not run | — |
| 1024 × 768 | — | — | Not run | — |
| 1440 × 900 | — | — | Not run | — |
| 1024 × 500 short landscape | — | — | Not run | — |

## Production delivery and performance

| Check | Date | Build SHA | Result or value | Conditions and evidence |
| --- | --- | --- | --- | --- |
| Editorial approval of launch alt text | — | — | Not approved | — |
| No duplicate preload/current-source request | — | — | Not run | Production network trace |
| Hero is the only high-priority homepage image | — | — | Not run | Production network trace |
| CLS | — | — | Not measured | Field conditions required; target 0 |
| LCP | — | — | Not measured | Record device, network, cache, route, and percentile |
| AVIF/WebP/JPEG visual quality | — | — | Not reviewed | Inspect production derivatives |
| sRGB rendering | — | — | Not reviewed | Compare on governed displays |
