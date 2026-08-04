# IS0 ZER0 instrument-index wordmark

## Purpose

The wordmark translates IS0 ZER0's instrumentation reference into a restrained identity system. It uses hierarchy, weight, and calibrated spacing rather than an icon, badge, panel, dial, or borrowed aviation graphic. The construction remains recognizable at navigation and display scales while staying inside Datum.

## Construction

The mark contains two stacked lines:

1. `ISO` is the index line. It uses IBM Plex Serif Medium, reduced scale, and wide tracking.
2. `ZERO` is the maker line. It uses IBM Plex Serif Semibold, a dense line height, and restrained tracking.

The semantic string always remains `IS0 ZER0`. CSS supplies the uppercase visual treatment; source text and accessible names retain the product's canonical capitalization.

| Variant | Context | Maker size | Index scale | Use |
| --- | --- | ---: | ---: | --- |
| `compact` | Header/navigation | `--text-wordmark` | `0.44em` | Persistent site identity |
| `display` | Homepage `h1` | `--text-display-xl` | `0.22em` | Primary brand statement |

## Datum alignment

- Foreground: `var(--text)` / `#ede7db`
- Background: `var(--bg)` / `#191611`
- Typeface: IBM Plex Serif only
- Weight: 500 for the index; 600 for the maker line
- Geometry: square, unframed, unshadowed, and free of decorative rules
- Accent: prohibited inside the mark; International Orange remains reserved for state and the route datum
- Runtime: static HTML and CSS; no client JavaScript

The website component consumes semantic tokens and remains transparent. Export assets include the Datum background to prevent accidental placement on an incompatible surface.

## Accessibility contract

- Accessible name: exactly `IS0 ZER0`
- Homepage role: the mark remains inside the page's only `h1`
- Header role: the mark remains the home link and preserves `aria-current`
- Source text: exactly `IS0 ZER0`, even though CSS renders `ZERO` in uppercase
- Forced colors: the mark resolves to `CanvasText`
- Reflow: neither variant uses fixed block height, clipping, absolute positioning, or `white-space` on its semantic parent
- Font failure: the existing `ui-serif, Georgia, serif` fallback remains legible

## Clear space and minimum use

- Compact mark: retain at least one maker-cap-height around exported artwork. Do not render below the project's 20 px wordmark token.
- Display mark: retain at least half a maker-cap-height around exported artwork. Let the responsive type token control scale.
- Do not alter the relationship between the two lines, add a containing plate, skew the mark, or substitute a different typeface.

## Files

- `src/components/BrandWordmark.astro`: canonical semantic implementation
- `public/brand/iso-zero-wordmark-compact.svg`: outlined compact master on Datum background
- `public/brand/iso-zero-wordmark-display.svg`: outlined display master on Datum background
- `public/brand/*@2x.png`: raster exports for fixed-background contexts
- `public/brand/manifest.json`: checksums and asset metadata
- `scripts/generate-wordmark-assets.py`: deterministic export generator

The website should use the Astro component. Export files serve documents, social placements, or systems that cannot consume the component.
