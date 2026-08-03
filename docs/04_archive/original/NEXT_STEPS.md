# Photography: next steps

**Written:** 30 July 2026.
**Read first:** `COOKBOOK.md` §1 and §2. They hold three resolved constraint conflicts and one measured browser behaviour that dictates the lightbox implementation. `README.md` is the public description of what this becomes.

Current state: one file exists, `src/content.config.ts`. Everything below is unbuilt.

---

## 1. Decide before the first commit

Two decisions get more expensive the longer they wait.

**Originals storage.** Git LFS is simplest below roughly 500MB and object storage with a committed manifest is correct above it. `src/lib/originals.ts` exists to defer this, and deferral is not a decision. Choose after the first fifty photographs are in hand and before the first hundred are committed, because migrating a populated LFS repository is tedious in a way that choosing is not.

**Whether arrow-key navigation matters.** The zero-JavaScript lightbox cannot have it. If it turns out to matter, the fallback is option C from the cookbook, and the change is contained: the popover markup stays and an island hydrates on first open. Deciding this after building the grid is fine. Deciding it after building three galleries of content is also fine. It is only expensive if it changes the markup contract, so keep the popover structure stable either way.

---

## 2. Build order

Sequenced by dependency. Each step names what it unblocks, because the order is not arbitrary.

**1. `src/lib/originals.ts`**
Resolves an `originalKey` to something readable, and reports whether it resolves at all. Everything that touches an original goes through it. Unblocks the EXIF script, which cannot be written before it knows how to reach a file.

**2. `scripts/extract-exif.mjs`**
Reads originals through the resolver, writes the `exif` key into gallery frontmatter, and supports `--check`. Unblocks authoring real content, because a gallery file cannot validate against the schema until EXIF is populated.

**3. One gallery, three photographs**
Real files, real EXIF, passing `astro check`. This is the first point at which the schema is proven rather than asserted. Do not build the second gallery yet.

**4. Build-time checks**
SKU uniqueness across galleries, and every `originalKey` resolving. Both are listed in `COOKBOOK.md` §3.1 as things Zod cannot express. Write them now, while there is one gallery, because a check written against three photographs is easier to trust than one written against ninety.

**5. The static grid**
Astro `<Image />` per photograph, real `<img>` with real alt, responsive `srcset`, correct aspect ratios so nothing shifts. No popover yet. Measure the payload here: this route should ship zero JavaScript and that number is the baseline every later step is compared against.

**6. The popover lightbox**
`<button popovertarget>` per photograph. Full-size image as a CSS background with `image-set()`, `role="img"`, and `aria-label` from the schema's `alt`, per the measurement in `COOKBOOK.md` §2. Previous and next as buttons targeting neighbouring popovers.

**7. Re-measure**
The gallery route must still ship zero JavaScript, and no full-size image may appear in the network panel until a popover opens. If either is false, stop. That pair of facts is the entire argument for this architecture.

**8. EXIF data plates**
`formatExif` turns measured values into the display line. Mono, tabular, slashed zeros. This is where `fNumber: 2.8` becomes `f/2.8`, and nowhere else.

**9. Image protection pipeline**
Resolution cap at roughly 2048px on the long edge, GPS stripped, IPTC creator and copyright re-embedded, `schema.org/ImageObject` in markup, CDN referer rule, `robots.txt` AI crawler entries. No client-side right-click or drag suppression, per `README.md`.

**10. Prints**
`/prints/[sku]` generated only where a `print` object exists. This is the first route with a per-photo URL and the only one, by design. Checkout integration after the route renders correctly, not alongside it.

---

## 3. Gates

Do not proceed past a step whose gate fails.

| After step | Gate |
|---|---|
| 3 | `astro check` passes against real content with populated EXIF |
| 4 | Both build-time checks fail correctly when fed a duplicate SKU and a missing original |
| 5 | Gallery route ships zero JavaScript, measured on a production build |
| 7 | Still zero JavaScript, and no full-size image fetched before a popover opens |
| 9 | A delivered file carries IPTC creator and copyright and carries no GPS |
| 10 | A print route exists for every photograph with a `print` object and for no others |

The measurement in step 5 and step 7 is taken from `astro build` output and the network panel on the built site. A development server reports development runtime weight and will mislead you, which is the same trap the portfolio's colophon documents.

---

## 4. Launch checklist

- [ ] Originals storage decided and documented in `COOKBOOK.md` §5
- [ ] Every gallery passes `astro check` with populated EXIF
- [ ] `extract-exif.mjs --check` runs in CI and fails on drift
- [ ] SKU uniqueness and `originalKey` resolution checks run in the build
- [ ] Gallery routes ship zero JavaScript on a production build, with the number recorded
- [ ] No full-size image fetched before a popover opens, verified in the network panel
- [ ] Alt text present on every photograph, in the grid `<img>` and in the popover `aria-label`
- [ ] Keyboard pass: Tab reaches every photograph, Enter opens, Escape closes, previous and next work
- [ ] Delivered files carry IPTC creator and copyright, and carry no GPS
- [ ] `schema.org/ImageObject` present on gallery routes
- [ ] Hotlink rule active at the CDN, verified from an off-origin page
- [ ] `robots.txt` AI crawler entries present
- [ ] Impressum reviewed as a trader Impressum if any print is for sale
- [ ] `pnpm verify` passes

---

## 5. Deliberately not building yet

**C2PA content credentials.** Signed provenance at build with `c2patool` fits this pipeline cleanly, and adoption is uneven enough that it is not worth the dependency before launch. `README.md` lists it as planned, which is accurate.

**A second island.** React is a dependency for the compiler and for the option C fallback. If launch arrives with no island, say so on the site and consider removing the dependency, because an unused runtime in `package.json` is a claim the build does not support.

**Visible watermarking.** Decided against in `README.md` as a presentation tradeoff rather than a security measure. Revisit only if reuse actually occurs, and treat that as evidence rather than as a hunch.

**Search, tags, and filtering.** A photography site with three galleries does not need them, and adding them before there is content to filter is how the JavaScript budget dies.
