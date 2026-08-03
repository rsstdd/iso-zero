# Component specification — `Base.astro`

Status: implementation-ready  
Implementation: `src/layouts/Base.astro`

## 1. Responsibility

`Base.astro` owns the shared HTML document shell: metadata, self-hosted font resources, skip link, site header, one main landmark, and site footer. It supplies a slot for route content.

It does not load gallery content, choose a hero, render page headings, or contain route-specific layout.

## 2. Dependencies

- `SkipLink.astro`
- `SiteHeader.astro`
- `SiteFooter.astro`
- `src/styles/design-tokens.css`
- `src/styles/global.css`
- Pure metadata helpers, if present

It must not depend on any page module, content entry, framework integration, or client runtime.

## 3. Public contract

```ts
interface Props {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly currentPath: string;
  readonly socialImage?: ImageMetadata;
  readonly buildSha: string;
  readonly contentVersion: string;
  readonly copyrightYear: number;
}
```

All strings are trimmed and non-empty. `canonicalPath` and `currentPath` are site-relative absolute paths beginning with `/`. `copyrightYear` is an explicit deterministic value, not the result of `Date.now()` or `new Date()` at render time.

## 4. Required output

```astro
<!doctype html>
<html lang="en">
  <head>...</head>
  <body>
    <SkipLink />
    <SiteHeader currentPath={currentPath} />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter
      copyrightYear={copyrightYear}
      buildSha={buildSha}
      contentVersion={contentVersion}
    />
  </body>
</html>
```

The document contains exactly one `body` and one main landmark. Pages do not supply another `main`.

## 5. Head contract

Required fields:

- UTF-8 charset.
- Responsive viewport declaration.
- Unique page title.
- Non-empty meta description.
- Canonical absolute URL derived from `canonicalPath` and the configured site origin.
- Open Graph title, description, URL, type, and optional image.
- Twitter summary-large-image fields when a social image is present.
- `color-scheme: dark` and Datum-compatible theme colour.
- Commit SHA and content version metadata.
- Favicon and manifest links if those assets exist.

The shell may preload only self-hosted font files proven necessary above the fold. It must not load third-party font CSS or analytics.

No wall-clock build timestamp appears in markup. No `<script>` element appears, including inert JSON-LD, while the project's literal no-script-element assertion remains authoritative.

## 6. Datum mapping

- `html` and `body`: `var(--bg)` and `var(--text)`.
- Global type defaults come from Datum's Sans stack.
- Route content inherits tokenized page gutters and container utilities rather than shell-specific raw spacing.
- No shell background layer, radius, or shadow.

## 7. Responsive behavior

The shell does not duplicate slots or landmarks at breakpoints. Header, main slot, and footer stay in document order. Route components own internal responsive behavior.

The body prevents accidental inline overflow without clipping focus outlines or masking a component defect. `overflow-x: hidden` is not an acceptable substitute for reflow correctness.

## 8. Accessibility contract

- `<html lang="en">` is present.
- Skip link is the first focusable element.
- `main#main` is the skip destination and accepts programmatic fragment focus through `tabindex="-1"`.
- The page title identifies the route.
- Header and footer are consistent across routes.
- Custom fonts are not required for comprehension.
- Zoom, text spacing, reduced motion, and forced colours remain usable.

## 9. Security and performance

- No inline event handlers or executable script.
- Canonical and social URLs are escaped and generated from trusted configuration.
- Social images must be web derivatives, never private originals.
- Above-the-fold font preloads use correct `as`, `type`, and `crossorigin` attributes and do not duplicate stylesheet requests.
- The shell introduces no render-blocking third-party request.

## 10. Failure behavior

Build failure is required for missing or blank title, description, canonical path, build SHA, content version, invalid current path, or invalid copyright year.

An absent optional social image omits image metadata cleanly. It does not emit an empty URL.

## 11. Verification

| Concern | Check |
| --- | --- |
| Document structure | One html, head, body, header, main, and footer |
| Metadata | Title, description, canonical, OG, Twitter, build identity |
| Skip order | Skip link is first focusable element |
| No script | `check-no-script.mjs` over built output |
| Fonts | No third-party origin; no duplicate preload request |
| Accessibility | Axe-core plus landmark and title assertions |
| Reflow | 320 px, 400% zoom, text-spacing review |
| Security | Production headers from `07_TESTING_SECURITY_AND_OPERATIONS.md` |

## 12. Change rules

Changes to shell landmarks, required props, head fields, or slot placement require this document and cross-route tests to change in the same commit.
