# Photography cookbook

**Written:** 30 July 2026.
**Scope:** the decisions this project is built on, and why each one holds. Sequenced work lives in `NEXT_STEPS.md`; the public description lives in `README.md`. This file is the record a future reader consults before changing something that looks arbitrary.

---

## 0. How to use this

Read §1 and §2 once. They contain three constraint conflicts that were resolved by decision rather than by compromise, and one browser behaviour that was measured rather than assumed and which dictates the entire lightbox implementation. Everything after that is contract detail you can look up when you touch the relevant file.

The standing rule for this project: a claim about performance or protection is either measured or marked unmeasured. There is no third state.

---

## 1. Three conflicts in the original brief

The brief was internally inconsistent in three places. Writing code against it would have produced work to throw away.

### 1.1 Per-photo permalinks were both forbidden and required

| Constraint | Source |
|---|---|
| No deep-linking URLs, hash fragments, or query parameters for individual photographs | Image protection |
| Routing architected so an individual photograph can render a product detail page | Commerce readiness |

A product detail page is a per-photo URL. These are the same object.

**Resolution:** permalinks exist only where a print is sold. `/prints/[sku]` is generated for photographs carrying a `print` object; the rest of the archive has no addressable per-photo URL. The anti-distribution constraint holds across everything not for sale, and a print being sold needs a shareable link, because a purchase link is exactly that.

### 1.2 The zero-JavaScript gallery was not achievable as specified

The original design put the lightbox in a React island hydrated with `client:visible`. On a gallery page the grid is the page, so that directive fires on load and the route ships the React runtime immediately. "The static grid ships no JavaScript at all" was false as written.

The brief also ruled out the conventional zero-JavaScript lightbox, because `:target` requires hash fragments and hash fragments are permalinks.

| Option | JavaScript on a gallery route | Keyboard | Permalink risk |
|---|---|---|---|
| A. Island wraps the grid, `client:visible` | React runtime, roughly 45KB compressed | Full, including arrow keys | None |
| B. Native popover per photograph | **Zero** | Tab, Enter, Escape | None |
| C. B, plus an island hydrated on first open | Zero until opened | Full | None |

**Resolution: B.** Each photograph is a `<button popovertarget>`. Previous and next are buttons inside each popover targeting neighbouring popovers, so advancing is markup. Open, close, Escape, and light dismiss come from the browser.

**Cost, stated rather than hidden:** no arrow-key navigation, and no transitions beyond CSS. Tab and Enter reach every control, so this is keyboard-accessible but not keyboard-fast.

### 1.3 The EXIF script mutating content files has a specific failure mode

Writing generated data into `src/content/galleries/*.md` makes those files partially authored and partially generated. A hand edit to a generated field is clobbered on the next run, and every run produces git churn. The benefit is equally real: the schema can require EXIF fields, and rendering needs no join.

**Resolution:** keep the approach, and add two things that make it safe. The script owns exactly one key, `exif`, so the generated region is bounded. And a `--check` mode exits non-zero when regeneration would change any file, which runs in CI and converts a forgotten script run from silent drift into a failed build.

---

## 2. The lightbox, and what the browser actually does

Option B rests on one assumption: that a full-size image inside a closed popover does not download until the popover opens. If that is false, a gallery page fetches every full-size image on load, which is worse than shipping React.

That assumption was measured in Chrome on 30 July 2026 rather than assumed.

| Construct inside a closed popover | Fetches while closed | Fetches on open |
|---|---|---|
| `<img>` with no `loading` attribute | **Yes** | n/a |
| `<img loading="lazy">` | No | **No** |
| CSS `background-image` | No | **Yes** |

Two of the three obvious implementations are unusable, and neither failure is obvious from documentation.

An `<img>` without `loading="lazy"` downloads immediately even though the popover is `display: none`, so the naive implementation ships every full-size photograph on page load. An `<img loading="lazy">` never downloads at all, including while the popover is open and the image fills the viewport; flipping `loading` to `eager` at that point fetches it instantly, which shows the deferral decision is made once and not re-evaluated for top-layer content.

**Therefore:** the full-size image inside a popover is a CSS background, not an `<img>`.

Three consequences follow, and none is optional:

1. **Responsive selection moves to `image-set()`.** There is no `srcset` on a background. Compose the candidate set at build from `getImage()` results, including the AVIF and WebP variants.
2. **Alt text moves to ARIA.** A background carries no alt attribute, so the element takes `role="img"` and `aria-label` set from the schema's required `alt`. The grid thumbnail remains a real `<img>` with a real alt attribute, so the accessible name exists in both places and comes from one field.
3. **The grid and the popover use different mechanisms for the same photograph.** That is a genuine wart. It is accepted because the alternative is either a 45KB runtime or every full-size image on load.

Re-run the measurement before trusting it on a browser that is not Chrome, and before any upgrade that touches lazy loading or the top layer.

---

## 3. The content contract

`src/content.config.ts` is the boundary. The EXIF script writes into it, routing reads from it, and the commerce fields live in it. Four decisions there are not obvious.

| Decision | Reasoning |
|---|---|
| `exif` is a nested key, not flattened fields | The script owns one key, so the generated region of a content file is bounded and a hand edit to `caption` or `alt` provably survives the next run. Flattened fields put generated and authored values on adjacent lines with nothing marking the boundary. |
| EXIF stored measured, not formatted | `fNumber: 2.8`, not `"f/2.8"`. `exposureTimeSec: 0.004`, not `"1/250"`. A pre-rendered string means the data plate and any later sort or filter disagree about what the value is, and Datum requires tabular numerals here, which cannot be aligned reliably in a baked string. Formatting belongs in `formatExif`. |
| `print` is an optional object, not a `printAvailable` boolean | A boolean beside five optional siblings validates `printAvailable: true` with no price, no SKU, and no dimensions. That state passes the schema and is commercially broken. Presence of the object is availability, and its required fields are what availability means. It is also what makes `/prints/[sku]` safe, because a route can only exist where a price does. |
| `alt` refines rather than using `min(1)` | `z.string().min(1)` accepts a single space, which is how empty alt text reaches production while passing a schema that claims to require it. |

### 3.1 What the schema cannot enforce

Zod validates one entry at a time against values available at parse time. Two constraints fall outside that and need build-time checks.

| Check | Why Zod cannot do it | Consequence if skipped |
|---|---|---|
| SKU uniqueness across all galleries | Per-entry validation has no cross-entry view | Two prints collide on `/prints/[sku]` and one route disappears silently |
| Every `originalKey` resolves to a readable source | Depends on the storage backend, which is not available at schema time | Extraction fails later and less obviously |

---

## 4. The EXIF script contract

`scripts/extract-exif.mjs` reads originals with `exifr` and writes into gallery frontmatter.

- It owns the `exif` key and writes nothing else. Any field outside that key is authored by a human and must survive a run untouched.
- It is idempotent. Running twice with no new photographs changes no bytes.
- `--check` performs the same work, writes nothing, and exits non-zero if output would differ. CI runs this.
- It reads through `src/lib/originals.ts` rather than opening paths directly, because the storage decision is open.
- Values are written as measured. Conversion to display strings is not its job.

---

## 5. The originals boundary

Delivered assets live in the repository and are processed by Astro. Originals may live under Git LFS or in object storage, and that decision is deliberately unmade.

`originalKey` in the schema is an opaque string. `src/lib/originals.ts` is the only file that knows what it means. A repository path and an object key are the same string to everything else, so choosing later costs one file rather than a migration.

The cost of that indirection is one hop and one more thing to explain. It is worth it only while the decision is genuinely open, so make the decision and consider collapsing the abstraction afterward.

---

## 6. Datum on this site

Per `DESIGN_SYSTEM.md` §7, photography runs dark by default. The relevant differences from the portfolio:

| Concern | This site |
|---|---|
| Theme | Dark, `#191611`, set by `data-theme="dark"` on the root element |
| Accent | `#e8632c`, the lifted orange, which is body-safe on dark at 5.37:1 |
| Orange budget | Focus and active states only. Photographs carry the colour on this site, so the interface does not compete |
| Type | IBM Plex Serif for gallery titles, Sans for interface, Mono for EXIF plates |
| Numerals | Tabular with slashed zeros, which is not decoration here because focal lengths and apertures appear in columns |
| Radii | Zero on photographs in every theme. Rounding a composition is vandalism |
| Captions | The EXIF line is a `.data-plate`: hairline, then mono metadata |

---

## 7. Tooling baseline

Identical to the other two projects, because the rendering model is the variable under study and the tooling is not. Biome for format and lint, strict TypeScript with `noUncheckedIndexedAccess`, `astro check` for typechecking because `tsc` does not understand `.astro` files, Vitest through `getViteConfig` so tests inherit the Astro pipeline, one Playwright smoke spec, and pnpm.

React 19 is a dependency for the compiler and for any future island, and currently no island exists. If that stays true through launch, say so on the site and remove the dependency.

---

## 8. Honest risk list

- **The lightbox measurement is one browser on one date.** Chrome behaviour here is not specified anywhere I can cite, so treat it as an observation with an expiry rather than as a guarantee.
- **The grid and popover use different image mechanisms.** Two paths for one photograph is a maintenance cost and a place for the two to drift visually.
- **No arrow keys.** If that turns out to matter more than the budget, option C is the fallback and it is a contained change: the popover markup stays and an island hydrates on first open.
- **Selling from Germany is a content obligation, not an architectural one.** A print offer converts the site's Impressum into a trader Impressum and brings withdrawal rights and shipping-cost disclosure. The schema already carries gross integer pricing and currency, which is what the price-indication rules constrain.
- **Originals storage is unmade.** The resolver defers it, and deferral is not a decision.
