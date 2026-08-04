# Component specification — `SiteHeader.astro`

Status: implementation-ready
Implementation: `src/components/SiteHeader.astro`

## 1. Responsibility

The site header supplies stable site identity and primary navigation. On the initial site it contains the IS0 ZER0 home link and one Galleries destination.

It does not contain About, the engineering case study, legal links, commerce, social links, theme controls, search, or a mobile menu.

## 2. Dependencies

- Datum token and global-link styles
- A pure current-route matcher, if route matching is extracted

The component does not inspect content collections.

## 3. Public contract

```ts
interface Props {
  readonly currentPath: string;
}
```

`currentPath` is a normalized site-relative path beginning and ending according to the project's trailing-slash convention.

## 4. Required output

```astro
<header class="site-header">
  <a class="site-wordmark" href="/">IS0 ZER0</a>
  <nav aria-label="Primary navigation">
    <ul>
      <li><a href="/galleries/">Galleries</a></li>
    </ul>
  </nav>
</header>
```

Current-route rules:

- At `/`, the wordmark carries `aria-current="page"`.
- At `/galleries/`, Galleries carries `aria-current="page"`.
- At `/galleries/[slug]/`, Galleries carries `aria-current="location"`.
- No link carries `aria-current` on unrelated routes.

## 5. Content rules

- Visible wordmark: `IS0 ZER0`.
- Primary link: `Galleries`.
- The visible text supplies each link's accessible name; redundant `aria-label` values are prohibited.
- No icon accompanies the wordmark.
- No generic Shop link appears until a real `/prints/` index route exists and the navigation decision changes in this document.

## 6. Datum mapping

- Wordmark: IBM Plex Serif, title case, `var(--text)`.
- Navigation: IBM Plex Sans, sentence case, `var(--text)`.
- Divider: decorative 1 px `var(--border-c)` hairline.
- Current state: persistent underline or weight, not an additional homepage accent mark.
- Focus: global accent outline.
- No panel fill, logo image, radius, or shadow.

The preliminary wireframe's uppercase mono wordmark is explicitly non-normative.

## 7. Layout and responsive behavior

- Inner content uses the wide container and standard page gutters.
- Wordmark aligns inline-start; navigation aligns inline-end.
- Flex layout permits wrapping and preserves source order.
- Both destinations remain visible at narrow widths; there is no disclosure/menu control for one navigation item.
- Text enlargement may force two lines. The component grows instead of clipping.
- The header is static, not sticky or fixed, so it cannot obscure focused content.

## 8. Interaction states

- Default links remain visibly identifiable.
- Hover strengthens underline treatment without changing layout.
- Focus-visible applies the global accent outline to the focused link.
- Current-state styling remains distinct when colours are removed.
- Visited state does not fragment the Datum palette.

## 9. Accessibility contract

- One `header` landmark through the site shell.
- One nav landmark labelled `Primary navigation`.
- List semantics group navigation links.
- `aria-current` communicates location accurately.
- Link hit areas reach the 44 × 44 px project target through logical padding.
- Focus outlines are not clipped by the header or divider.
- Visual order and DOM order remain wordmark then Galleries.

## 10. Failure behavior

Invalid or non-normalized `currentPath` fails validation in development/build tests. Unknown paths render neither link as current; they do not guess based on substring collisions.

## 11. Verification

| Concern | Check |
| --- | --- |
| Content | Exact wordmark and one primary link |
| Exclusions | No About, case study, legal, Shop, menu, or theme control |
| Current route | Route matrix for page/location/absent `aria-current` |
| Semantics | Header, labelled nav, list, two links |
| Keyboard | Focus order and Enter activation |
| Target size | Computed bounding boxes at all breakpoints |
| Responsive | 320 px, 200% text, 400% page zoom |
| Datum | Serif wordmark, Sans nav, no shadow/radius/accent fill |
| Accessibility | Axe-core, forced colours, focus visibility |

## 12. Change rules

Adding, removing, renaming, or regrouping a primary destination is an information-architecture change. It requires this document, relevant page specifications, and consistent-navigation tests to change in the same commit.
