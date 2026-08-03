# Component specification — `SiteFooter.astro`

Status: implementation-ready  
Implementation: `src/components/SiteFooter.astro`

## 1. Responsibility

The site footer exposes secondary project material, legal destinations, copyright ownership, and deterministic build identity. It keeps these links discoverable without competing with the photographic path.

It does not repeat the primary navigation, render commerce, show social icons, collect email, display analytics consent, or calculate state from the wall clock.

## 2. Dependencies

- `DataPlate.astro`
- Datum navigation, data, border, and spacing tokens
- Build identity supplied by the shell/build pipeline

The component does not read environment variables or Git directly.

## 3. Public contract

```ts
interface Props {
  readonly copyrightYear: number;
  readonly buildSha: string;
  readonly contentVersion: string;
}
```

Rules:

- `copyrightYear` is a four-digit explicit project value.
- `buildSha` is a validated full hexadecimal commit SHA; display may abbreviate it to seven characters.
- `contentVersion` is a non-empty deterministic version identifier.

## 4. Required output

```astro
<footer class="site-footer">
  <div class="site-footer__inner">
    <nav aria-label="Project">
      <ul>
        <li><a href="/about/">About</a></li>
        <li><a href="/case-study/">Engineering case study</a></li>
      </ul>
    </nav>

    <nav aria-label="Legal">
      <ul>
        <li><a href="/impressum/">Impressum</a></li>
        <li><a href="/datenschutz/">Datenschutz</a></li>
        <li><a href="/agb/">AGB</a></li>
      </ul>
    </nav>

    <DataPlate>
      <p>© 2026 Ross Todd. All rights reserved.</p>
      <dl class="site-footer__build">
        <div><dt>Build</dt><dd>8f3c2a1</dd></div>
        <div><dt>Content</dt><dd>2026.08</dd></div>
      </dl>
    </DataPlate>
  </div>
</footer>
```

The visible SHA example is illustrative; actual output derives from the supplied immutable value. Full build identity also remains available in document metadata through `Base.astro`.

## 5. Content rules

Project navigation:

- About.
- Engineering case study.

Legal navigation:

- Impressum.
- Datenschutz.
- AGB.

Ownership/build:

- `© {year} Ross Todd. All rights reserved.`
- Build SHA.
- Content version.

No Galleries duplication, generic Shop link, social profile, email address, location, promotional statement, or generated timestamp appears without a separate information-architecture decision.

## 6. Datum mapping

- Footer boundary: decorative 1 px `var(--border-c)` hairline.
- Links: IBM Plex Sans, `var(--text)` or approved secondary text token, persistent underline.
- Copyright/build: IBM Plex Mono, tabular figures, slashed zero, `var(--text-muted)`.
- Build labels may use uppercase mono overline styling; ordinary link labels remain sentence case.
- Build metadata uses `DataPlate`.
- Focus: global accent outline.
- No logo repetition, panel fill, radius, shadow, icon-only link, or accent decoration.

## 7. Layout and responsive behavior

- Inner content uses the wide container and shared page gutters.
- Deliberate Datum spacing separates footer from preceding content.
- Wide: project and legal nav groups may share a row; ownership/build follows in a stable grid.
- Narrow: groups stack in source order—Project, Legal, ownership/build.
- Lists wrap naturally without comma or separator glyph dependencies.
- No CSS `order`, duplicated mobile markup, truncation, or horizontal scrolling.
- Links reach the 44 × 44 px project target through logical padding and group gaps.

## 8. Interaction states

- Links remain underlined by default.
- Hover strengthens underline treatment without changing layout.
- Focus-visible uses the global accent outline.
- Visited links retain Datum's normal palette.
- Forced-colour mode preserves underline and focus.
- No animated reveal, accordion, or disclosure behavior.

## 9. Accessibility contract

- One site-level `footer` landmark.
- Project and Legal nav landmarks have distinct accessible names.
- Navigation groups use list semantics.
- Link labels identify destinations without surrounding context.
- Build identity uses `dl` label-value relationships.
- Copyright punctuation is natural text; visual separator glyphs do not encode grouping.
- Tab order follows Project links, Legal links, then any linked build content; build values are not focusable when plain text.

## 10. Security and determinism

- Every URL is a same-origin route literal.
- No external social/checkout URL enters this component.
- No script, event handler, tracking pixel, form, or cookie control.
- Year and build identity derive from explicit build inputs, not runtime time or browser state.

## 11. Failure behavior

Build failure is required for:

- invalid copyright year;
- malformed or blank build SHA;
- blank content version;
- duplicate or unresolved required routes.

The component does not omit legal links silently. A missing legal route is a release blocker.

## 12. Verification

| Concern | Check |
| --- | --- |
| Project links | Exact About and case-study routes |
| Legal links | Exact Impressum, Datenschutz, and AGB routes |
| Exclusions | No Galleries, Shop, social, form, analytics, or timestamp |
| Landmarks | One footer; Project and Legal nav labels unique |
| Lists | Both nav groups use ul/li |
| Build data | Year, author, rights, SHA abbreviation, content version |
| Routes | Broken-link check over every destination |
| Keyboard | Source-order traversal and visible focus |
| Target size | Bounding-box checks at narrow and wide widths |
| Reflow | 320 px, zoom, text spacing, long localized legal labels |
| Datum | Sans links, Mono data, decorative hairlines, no shadow/accent decoration |
| Accessibility | Axe-core, forced colours, screen-reader landmark list |

## 13. Change rules

Adding or removing a footer destination, altering legal labels, changing build identity, or introducing an external link requires this specification, route inventory, legal documentation where applicable, and consistent-navigation tests to change together.
