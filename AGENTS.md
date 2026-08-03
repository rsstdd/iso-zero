## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Contributor rules

- Treat `./docs/01_page-specs/HOMEPAGE_SPECIFICATION.md` and `component-specs/*` as the owning UI contracts.
- Keep `src/pages/index.astro` composition-only.
- Keep Astro `output: "static"`, `integrations: []`, and the client-JavaScript payload at zero.
- Do not add React, Tailwind, hydration directives, inline handlers, analytics, or third-party fonts.
- Preserve the canonical Datum ownership split: tokens and motifs in `design-tokens.css`, global behavior in `global.css`, component geometry in component styles.
- Keep photographs uncropped, square-cornered, shadowless, and capped at the governed derivative ceiling.
- Add or change behavior only with corresponding contract and verification updates.
- Run `npm run verify:static` and the relevant Chromium suites before handoff.
