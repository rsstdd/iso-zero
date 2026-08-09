# 07 — Testing, security, and operations

## The verification matrix

This is the register the core engineering principle refers to. Every claim the project makes appears here with its evidence, and a claim with no row is a claim the project is not entitled to make.

| Claim                                               | Status           | Evidence                                                       |
| --------------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| Zero script bytes on every route                    | Enforced         | `scripts/check-no-script.mjs` over `dist/`                     |
| No framework integration is registered              | Enforced         | Assertion over `astro.config.mjs`; dependency guard in CI      |
| Every gallery validates against the schema          | Enforced         | `astro check` and content collection validation                |
| Alt text present and non-whitespace                 | Enforced         | Schema refinement                                              |
| SKUs are unique site-wide                           | Enforced         | `scripts/check-skus.mjs`                                       |
| Every `originalKey` resolves                        | Enforced         | Build-time resolver check                                      |
| EXIF in content files matches the originals         | Enforced         | `extract-exif.mjs --check` in CI                               |
| No GPS in delivered derivatives                     | Enforced         | `scripts/check-metadata.mjs`                                   |
| IPTC creator and copyright in delivered JPEGs       | Enforced         | `scripts/check-metadata.mjs`                                   |
| Originals absent from build output                  | Enforced         | Path assertion over `dist/`                                    |
| No axe-core violations at WCAG 2.2 AA               | Enforced         | Playwright plus axe-core over every built route                |
| Cumulative Layout Shift of 0                        | Measured         | Field measurement, recorded per release                        |
| Largest Contentful Paint under 2.0 s                | Measured         | Field measurement, recorded per release with conditions        |
| Keyboard traversal of gallery and viewer            | Measured         | Manual script per browser, recorded per release                |
| Screen-reader announcement is correct               | Measured         | VoiceOver with Safari, NVDA with Firefox, recorded per release |
| Popover support covers the actual audience          | **[UNVERIFIED]** | To be measured from server logs after launch                   |
| Document weight scales acceptably with gallery size | **[UNVERIFIED]** | To be measured against a full 40-photograph gallery            |
| Derivative quality settings are visually correct    | **[UNVERIFIED]** | To be recorded after inspection                                |
| Stripe price matches the content file               | **[UNVERIFIED]** | Build check against the Stripe API, not yet written            |
| Colour renders as intended across displays          | **[UNVERIFIED]** | Wide-gamut display comparison, not yet performed               |

Removing an **[UNVERIFIED]** marker happens in the same commit that adds its check or records its measurement. Marking something verified in advance of the evidence is the failure mode this entire mechanism exists to prevent.

## Test strategy

| Level           | Tool                                    | Covers                                                                                                       |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Unit            | Vitest, through Astro's `getViteConfig` | `formatExif`, `money`, `schema-org`, the originals resolver against the filesystem adapter                   |
| Contract        | Vitest                                  | Schema acceptance and rejection cases, including the whitespace alt-text case and the incomplete print offer |
| Build assertion | Node scripts                            | The enforced rows above, run against `dist/`                                                                 |
| End to end      | Playwright                              | One smoke test per route family, plus keyboard traversal of a gallery and its viewer                         |
| Accessibility   | Playwright with axe-core                | Every built route                                                                                            |

Testing Library and jsdom are removed with the React dependencies. A site with no components that render client-side has nothing for them to test, and leaving them installed implies a testing approach the project does not use.

The unit tests worth writing are the ones covering functions where a wrong answer is plausible and silent. `formatExif` converting 0.004 seconds to `1/250` is exactly that, because an off-by-one in the reciprocal rounding produces a value that looks entirely reasonable and is wrong.

## Image protection

Anything a browser renders can be captured, so the strategy is not prevention. It is limiting what can be taken, deterring casual reuse, and being able to prove ownership afterwards.

| Layer                  | Approach                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Resolution ceiling     | Derivatives capped at 2048 px on the long edge at web-quality compression. Originals never enter `public/` or `dist/`, because the highest-value control is declining to ship the valuable file                                |
| No per-photograph URL  | The archive has no addressable image page, so there is nothing to link and no canonical destination to scrape. This is the anti-distribution reason the viewer avoids `:target`                                                |
| Metadata, deliberately | Sharp strips metadata by default, which removes GPS and also removes authorship. The pipeline re-embeds IPTC creator and copyright while keeping location stripped, because embedded attribution survives a right-click save   |
| Ownership in markup    | `schema.org/ImageObject` with `creator`, `copyrightNotice`, and `license` on every gallery page                                                                                                                                |
| Hotlink protection     | A referer rule at the CDN prevents other sites embedding these images on this bandwidth. Invisible to visitors, no downside                                                                                                    |
| AI crawlers            | `robots.txt` entries for GPTBot, Google-Extended, and similar agents. Compliance is voluntary, so this is a statement of intent rather than a control, and it is priced as such                                                |
| Provenance             | C2PA Content Credentials signed at build with `c2patool`. Deferred past the first release. Adoption is uneven, however it fits a build-time pipeline cleanly and asserts authorship cryptographically rather than cosmetically |
| Detection              | Periodic reverse-image search, escalating to an enforcement service if reuse warrants it. Copyright under German and EU law exists automatically, so enforcement is the gap rather than rights                                 |

Deliberately absent: right-click blocking, drag suppression, overlay divs, and devtools detection. Each is bypassed in seconds through the network panel, each breaks expected browser behaviour for legitimate visitors, and each requires a script the project does not ship. A portfolio should not treat its audience as suspects. Screenshots defeat every client-side trick regardless, which is why a visible watermark is treated as a presentation tradeoff rather than a security measure, and is currently decided against.

## Site security

A statically compiled site with no client script has a small attack surface, and the headers below keep it small.

| Header                      | Value                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                                                                                                                |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                             |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                     |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                                                                                |

`script-src 'none'` is the load-bearing line. It is the only header in the table that is both a security control and a design assertion, because a policy forbidding all script means an accidentally introduced island fails visibly in the browser rather than passing unnoticed. It is a runtime backstop behind the build-time check, and two independent mechanisms enforcing the same rule is appropriate for the rule the project is named after.

`form-action 'none'` holds while checkout is an anchor. It is relaxed to the checkout origin only if the project migrates to server-created sessions.

## Continuous integration

`pnpm verify` runs lint, typecheck, test, and build. CI runs `pnpm verify` plus the build assertions and the end-to-end suite.

| Gate                           | Blocking                 |
| ------------------------------ | ------------------------ |
| Biome check                    | Yes                      |
| `astro check`                  | Yes                      |
| Vitest                         | Yes                      |
| `extract-exif.mjs --check`     | Yes                      |
| `check-skus.mjs`               | Yes                      |
| Build                          | Yes                      |
| `check-no-script.mjs`          | Yes                      |
| `check-metadata.mjs`           | Yes                      |
| Dependency guard               | Yes                      |
| Playwright, including axe-core | Yes                      |
| Field performance measurement  | No, recorded per release |

The dependency guard fails the build if `react`, `react-dom`, `@astrojs/react`, or `tailwindcss` appear in `package.json`. It is a blunt instrument and it is the right one, because the failure it prevents is a future contributor reintroducing an island by installing a dependency that makes islands possible.

`pnpm verify` does not currently include the end-to-end suite, and that is deliberate: Playwright's browser download makes the local loop slow, and CI runs it regardless.

## Deployment

Static output to a CDN-backed host, deployed from `main`, with preview deployments per pull request. The requirements are ordinary: custom headers, referer-based hotlink rules, HTTP/2 or HTTP/3, and Brotli.

Environment variables are limited to the originals bucket credentials and endpoint, and they are build-time only. Nothing at runtime holds a secret, because at runtime there is nothing but files.

Rollback is redeploying the previous commit. A statically compiled site has no migration to reverse and no session state to reconcile, which is one of the quieter benefits of the whole approach.

## Monitoring

Server logs are the only telemetry. They answer which galleries are visited, which prints are viewed, what browsers arrive, and where traffic originates, which is the complete set of questions a single-author portfolio needs answered.

No analytics script, no consent banner, and no cookie. The privacy notice at `/datenschutz/` is short as a direct consequence, and that shortness is worth more to a reader than any dashboard would be worth to the author.
