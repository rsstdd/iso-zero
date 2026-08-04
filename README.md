# IS0 ZER0 | A Photography Portfolio and Print Storefront

My photography site and print storefront. Astro 7, static output, images processed at build, and a site that ships no JavaScript at all.

<!-- Lead with a gallery screenshot here. On this site more than any other, the image sells it. -->
<!-- Live at: add URL once deployed. -->

> **Status: in active development (August 2026).** Documentation baseline complete; implementation not started.

## The premise

A photography site is images and almost nothing else, so the correct JavaScript payload for a gallery page is zero. Not "small", and not "zero until the lightbox hydrates". Zero.

That is achievable because the lightbox is built on the native Popover API rather than on a React island. Each photograph is a `<button popovertarget>` opening a popover rendered at build and marked `role="dialog"`; the browser supplies open, close, Escape, light dismiss, and the top layer. Advancing between photographs is a pair of buttons inside each popover targeting its neighbours, so navigation is also markup.

The costs are stated rather than hidden. There is no arrow-key navigation and no transition beyond CSS. More importantly, `popover="auto"` is not a modal dialog: it does not trap focus and it does not make the document behind it inert, so a keyboard user who tabs past the close button leaves the viewer and re-enters the grid underneath. The mechanism that would fix that is `<dialog>` with `showModal()`, and `showModal()` is a script call — one method, and the entire distance between this design and full modal semantics. The mitigations are documented in [`docs/05_INTERACTION_AND_ACCESSIBILITY.md`](docs/05_INTERACTION_AND_ACCESSIBILITY.md), and none of them fully substitutes for a trap.

Those are the price of the budget, and they were priced deliberately. If a route ever ships a byte of JavaScript, an island has appeared where none was justified, and that is a bug rather than a preference.

## Documentation

The full design record lives in [`docs/`](docs/README.md). Start with [`docs/00_DOCUMENTATION_MAP.md`](docs/00_DOCUMENTATION_MAP.md), which names the single source of truth for every concern so that duplicated rules cannot drift.

This README is a summary written for someone deciding whether to read further. Where it and a document under `docs/` disagree, the document is correct.

## How it works

| Concern | Approach |
|---|---|
| Image processing | Astro's build-time pipeline over Sharp: responsive `srcset`, AVIF and WebP variants, and correct aspect-ratio placeholders so nothing shifts during load. |
| Galleries | Astro build content collections with Zod schemas. Live collections do not support the `image()` helper, and build-time image processing is the reason this site uses Astro. |
| Alt text | Required by the schema, and whitespace does not satisfy it. `z.string().min(1)` accepts a single space, which is how empty alt text reaches production while passing a schema that claims to require it. |
| EXIF | `scripts/extract-exif.mjs` reads the originals with `exifr` and writes structured shooting data into the `exif` key of each gallery file, so captions derive from the files and cannot drift. |
| Lightbox | Native popover, zero JavaScript. See the premise above. |
| Colour | Everything converts to sRGB at build. Photographers notice mangled colour, and I am the audience most likely to complain. |
| Prints | An optional `print` object per photograph. Its presence is availability, and it is what makes a `/prints/[sku]` route exist. |
| Checkout | A Stripe Payment Link, rendered as an anchor. An anchor needs no script, no server, and no session endpoint. |
| Publishing | Adding photographs means adding files and pushing. One author does not need a CMS. |

```
src/
  content/galleries/*.md    title, date, cover, ordered photo list (Zod-validated)
  content.config.ts         the schema; the boundary everything else reads
  lib/originals.ts          resolves an originalKey to a readable source
  lib/exif.ts               measured values in, display strings out
  lib/money.ts              integer minor units in, localised gross price out
  lib/checkout.ts           the provider boundary; a print offer in, a URL out
  styles/design-tokens.css  Datum, vendored and flattened from the shared source
scripts/
  extract-exif.mjs          originals in, structured shooting data out
  check-skus.mjs            SKU uniqueness across all galleries
  check-no-script.mjs       asserts zero script bytes in the build output
  check-metadata.mjs        asserts GPS absent and IPTC present in derivatives
```

## Key decisions

| Decision | Reasoning |
|---|---|
| Astro over a React SPA or Next | Shipping a React runtime to render a static image grid is the wrong trade. Astro reserves JavaScript for interaction that demands it, and here nothing does. |
| Native popover over a React lightbox | The browser already implements open, close, Escape, and light dismiss. Importing a runtime to reimplement them would cost roughly 45KB and buy arrow keys. |
| No hash fragments or query parameters for photographs | A `:target` lightbox is the usual zero-JavaScript approach and it produces a permalink per image. Permalinks are what make uncoordinated redistribution easy, so that approach is rejected here despite fitting the budget. |
| Permalinks only where a print is sold | `/prints/[sku]` exists for work that is for sale, because a purchase link has to be shareable. The rest of the archive has no addressable per-photo URL. |
| `print` as an optional object, not a `printAvailable` boolean | A boolean beside five optional siblings validates `printAvailable: true` with no price and no SKU. That state passes the schema and is commercially broken. |
| EXIF nested under one key | The extraction script owns `exif` and nothing else, so the generated region of each content file is bounded and a hand edit to a neighbouring field survives the next run. |
| EXIF stored measured, not formatted | `fNumber: 2.8`, not `"f/2.8"`. A pre-rendered string means the data plate and any later sort or filter disagree about what the value is. |
| Originals in private object storage, behind a resolver | Git LFS puts the full-resolution archive in clone scope, so anyone with repository access has every original. Object storage keeps archive access separate from source access, which is the correct separation for the most valuable asset here. The resolver in `src/lib/originals.ts` still exists, because the adapter is what makes the filesystem usable in development and in tests. |
| Payment Links over a hosted Checkout Session | A server-created session needs a POST endpoint and therefore a server adapter, which converts a statically compiled site into a hybrid one for a single form submission. The migration trigger is recorded in [`docs/06_COMMERCE_AND_LEGAL.md`](docs/06_COMMERCE_AND_LEGAL.md) rather than left to judgment. |
| Vanilla CSS over Tailwind | The shared Datum tokens declare their type scale, font stacks, and radii inside `@theme` blocks that only exist under a Tailwind build. The vendored copy flattens them into `:root`, because half a design system silently evaporating is a worse outcome than a manual resynchronisation. |
| Same tooling baseline as my other projects | Biome, strict TypeScript, Vitest through Astro's `getViteConfig`, `astro check` for typechecking, one Playwright smoke test. The rendering model varies between my projects; the tooling does not. |

## Every claim is checked, measured, or marked

A claim about performance, protection, accessibility, or correctness here is either enforced automatically, measured and recorded, or explicitly marked unverified. There is no implicit verified state, and the register is in [`docs/07_TESTING_SECURITY_AND_OPERATIONS.md`](docs/07_TESTING_SECURITY_AND_OPERATIONS.md).

The zero-JavaScript property in particular is enforced twice: a build assertion greps the emitted HTML for script bytes and fails on any, and a Content Security Policy of `script-src 'none'` backs it at runtime so that an accidental island fails visibly rather than quietly. A dependency guard fails the build if `react`, `react-dom`, `@astrojs/react`, or `tailwindcss` returns to `package.json`, because the reliable way to prevent an island is to remove the mechanism that makes one possible.

Two independent mechanisms enforcing the same rule is proportionate for the rule the project is named after.

## Protecting the images

Anything a browser renders can be captured, so the strategy is not prevention. It is limiting what can be taken, deterring casual reuse, and being able to prove ownership afterward.

| Layer | Approach |
|---|---|
| Resolution ceiling | Delivered variants are capped at approximately 2048px on the long edge at web-quality compression. Originals never enter `public/` or the build output, because the highest-value control is not shipping them. |
| No per-photo URL | The archive has no addressable image page, so there is nothing to link to and no canonical destination to scrape. This is the anti-distribution reason the lightbox avoids `:target`. |
| Metadata, deliberately | Sharp strips metadata by default, which removes GPS coordinates and also removes authorship. The pipeline re-embeds IPTC creator and copyright in every delivered file while keeping location stripped, because embedded attribution survives a right-click save. |
| Ownership in markup | `schema.org/ImageObject` with `creator`, `copyrightNotice`, and `license` on every gallery page. Google Images surfaces this as licensing attribution, which redirects reuse toward asking first. |
| Hotlink protection | A referer rule at the CDN stops other sites embedding these images on this bandwidth. Invisible to visitors, no downside. |
| AI crawlers | `robots.txt` entries for GPTBot, Google-Extended, and similar agents. Compliance is voluntary, so this is a statement of intent rather than a control, and it is priced as such. |
| Provenance (planned) | C2PA Content Credentials, signed at build with `c2patool`. Adoption is uneven, but it fits a build-time pipeline cleanly and asserts authorship cryptographically rather than cosmetically. |
| Detection | Periodic reverse-image search, escalating to an enforcement service if reuse warrants it. Copyright under German and EU law exists automatically; enforcement is the gap, not rights. |

Deliberately absent: right-click blocking, drag suppression, overlay divs, and devtools detection. Each is bypassed in seconds through the network tab, each breaks expected browser behaviour for legitimate visitors, each requires a script this site does not ship, and a portfolio should not treat its audience as suspects. Screenshots defeat every client-side trick regardless, which is why a visible watermark is treated as a presentation tradeoff rather than a security measure, and is currently decided against.

## Selling prints

A print offer is a `print` object on a photograph: SKU, gross price in integer cents, currency, paper dimensions, and edition size or null for an open edition. Presence of that object is what creates `/prints/[sku]`.

Prices are gross and integer. Integer because floating-point money is a rounding bug waiting for a large enough order, gross because German price-indication rules require the displayed figure to be what a buyer pays.

Two constraints the schema cannot enforce, both checked at build:

- SKU uniqueness across all galleries, because two prints sharing a SKU collide on the same route and one disappears silently.
- Every `originalKey` resolving to a readable source, because otherwise extraction fails later and less obviously.

Selling from Germany also converts the site's Impressum into a trader Impressum and brings withdrawal rights and shipping-cost disclosure with it. That is a content obligation rather than an architectural one, and it is recorded in [`docs/06_COMMERCE_AND_LEGAL.md`](docs/06_COMMERCE_AND_LEGAL.md) so it is not discovered at launch. None of it is legal advice, and it is to be confirmed with an adviser before the first sale.

## Running locally

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev                                # localhost:4321
node scripts/extract-exif.mjs           # refresh EXIF after adding photographs
node scripts/extract-exif.mjs --check   # exit non-zero if regeneration would change a file
pnpm verify                             # lint, typecheck, test, build
```

`--check` runs in CI. It converts "someone forgot to run the extraction script" from silent drift into a failed build, which is the only reason writing generated data into hand-authored content files is safe.

`pnpm verify` excludes the Playwright suite deliberately, because the browser download makes the local loop slow and CI runs it regardless.

## Known limitations

The site is not built. Everything above is design, and the distance between an intended JavaScript budget and a held one is the difficulty of the project rather than a footnote to it.

The repository currently contradicts its own decisions in five places, all of which are the first milestone in [`docs/08_IMPLEMENTATION_PLAN.md`](docs/08_IMPLEMENTATION_PLAN.md): `astro.config.mjs` registers `@astrojs/react` and the Tailwind Vite plugin, `package.json` carries the React and Testing Library dependencies as scaffold residue, `scripts/extract-exif.mjs` emits a sidecar of pre-formatted strings that `src/content.config.ts` would reject and implements no `--check`, `src/lib/originals.ts` does not exist, and the Datum tokens are vendored unflattened.

The lightbox has no arrow-key navigation and does not trap focus. Previous and next are buttons, reachable by Tab and operable by Enter, which is keyboard-accessible but not keyboard-fast, and the focus consequence is the sharpest cost of the budget rather than an oversight.

Limited editions are not enforced by the site. A Payment Link's quantity limit in Stripe is the authority on remaining stock for now, which is sufficient in the low tens and is not sufficient at scale.

## Author

Ross Todd, senior software engineer in Munich. [GitHub](https://github.com/rsstdd) <!-- add LinkedIn when live -->

## License

MIT for the code. **All photographs are copyright Ross Todd, all rights reserved.** They are not covered by the code license and may not be reused without permission.
