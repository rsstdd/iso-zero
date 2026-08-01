# ISO Zero | A Photography Portfolio and Print Storefront

My photography site and print storefront. Astro 6, static output, images processed at build, and a gallery that ships no JavaScript at all.

<!-- Lead with a gallery screenshot here. On this site more than any other, the image sells it. -->
<!-- Live at: add URL once deployed. -->

> **Status: in active development (July 2026).**

## The premise

A photography site is images and almost nothing else, so the correct JavaScript payload for a gallery page is zero. Not "small", and not "zero until the lightbox hydrates". Zero.

That is achievable because the lightbox is built on the native Popover API rather than on a React island. Each photograph is a `<button popovertarget>` opening a `<dialog>`-class popover rendered at build; the browser supplies open, close, Escape, and light dismiss. Advancing between photographs is a pair of buttons inside each popover targeting its neighbours, so navigation is also markup.

The cost is stated rather than hidden: no arrow-key navigation and no transitions beyond CSS. Those are the price of the budget, and they were priced deliberately. If a gallery route ever ships a byte of JavaScript, an island has appeared where none was justified, and that is a bug rather than a preference.

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
| Publishing | Adding photographs means adding files and pushing. One author does not need a CMS. |

```
src/
  content/galleries/*.md    title, date, cover, ordered photo list (Zod-validated)
  content.config.ts         the schema; the boundary everything else reads
  lib/originals.ts          resolves an originalKey to a readable source
  styles/design-tokens.css  Datum, copied from the shared source
scripts/
  extract-exif.mjs          originals in, structured shooting data out
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
| Originals abstracted behind a resolver | Git LFS and object storage are the same opaque string to everything except `src/lib/originals.ts`, so the storage decision stays open without leaking into content or components. |
| Same tooling baseline as my other projects | Biome, strict TypeScript, Vitest through Astro's `getViteConfig`, `astro check` for typechecking, one Playwright smoke test. The rendering model varies between my projects; the tooling does not. |

## Protecting the images

Anything a browser renders can be captured, so the strategy is not prevention. It is limiting what can be taken, deterring casual reuse, and being able to prove ownership afterward.

| Layer | Approach |
|---|---|
| Resolution ceiling | Delivered variants are capped at approximately 2048px on the long edge at web-quality compression. Originals never enter `public/`, because the highest-value control is not shipping them. |
| No per-photo URL | The archive has no addressable image page, so there is nothing to link to and no canonical destination to scrape. This is the anti-distribution reason the lightbox avoids `:target`. |
| Metadata, deliberately | Sharp strips metadata by default, which removes GPS coordinates and also removes authorship. The pipeline re-embeds IPTC creator and copyright in every delivered file while keeping location stripped, because embedded attribution survives a right-click save. |
| Ownership in markup | `schema.org/ImageObject` with `creator`, `copyrightNotice`, and `license` on every gallery page. Google Images surfaces this as licensing attribution, which redirects reuse toward asking first. |
| Hotlink protection | A referer rule at the CDN stops other sites embedding these images on this bandwidth. Invisible to visitors, no downside. |
| AI crawlers | `robots.txt` entries for GPTBot, Google-Extended, and similar agents. Compliance is voluntary, so this is a statement of intent rather than a control, and it is priced as such. |
| Provenance (planned) | C2PA Content Credentials, signed at build with `c2patool`. Adoption is uneven, but it fits a build-time pipeline cleanly and asserts authorship cryptographically rather than cosmetically. |
| Detection | Periodic reverse-image search, escalating to an enforcement service if reuse warrants it. Copyright under German and EU law exists automatically; enforcement is the gap, not rights. |

Deliberately absent: right-click blocking, drag suppression, overlay divs, and devtools detection. Each is bypassed in seconds through the network tab, each breaks expected browser behaviour for legitimate visitors, and a portfolio should not treat its audience as suspects. Screenshots defeat every client-side trick regardless, which is why a visible watermark is treated as a presentation tradeoff rather than a security measure, and is currently decided against.

## Selling prints

A print offer is a `print` object on a photograph: SKU, gross price in integer cents, currency, paper dimensions, and edition size or null for an open edition. Presence of that object is what creates `/prints/[sku]`.

Prices are gross and integer. Integer because floating-point money is a rounding bug waiting for a large enough order, gross because German price-indication rules require the displayed figure to be what a buyer pays.

Two constraints the schema cannot enforce, both checked at build:

- SKU uniqueness across all galleries, because two prints sharing a SKU collide on the same route and one disappears silently.
- Every `originalKey` resolving to a readable source, because otherwise extraction fails later and less obviously.

Selling from Germany also converts the site's Impressum into a trader Impressum and brings withdrawal rights and shipping-cost disclosure with it. That is a content obligation rather than an architectural one, and it is recorded here so it is not discovered at launch.

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

## Known limitations

The site is not built. Everything above is design, and the distance between an intended JavaScript budget and a held one is the difficulty of the project rather than a footnote to it.

The originals storage decision is open. Git LFS is simplest below roughly 500MB and object storage with a committed manifest is correct above it. The resolver exists so that choosing later costs one file rather than a migration, but it does have to be chosen.

The lightbox has no arrow-key navigation. Prev and next are buttons, reachable by Tab and operable by Enter, which is keyboard-accessible but not keyboard-fast.

## Author

Ross Todd, senior software engineer in Munich. [GitHub](https://github.com/rsstdd) <!-- add LinkedIn when live -->

## License

MIT for the code. **All photographs are copyright Ross Todd, all rights reserved.** They are not covered by the code license and may not be reused without permission.
