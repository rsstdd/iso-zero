# Product and engineering brief

## 1. Product definition

ISO Zero is a photography portfolio, archival catalog, and limited-edition print storefront. It presents the work as a precise record rather than a generic creative-agency site. The interface behaves like an engineering notebook: restrained, explicit, data-aware, and transparent about technical limits.

The project has two simultaneous purposes:

1. Provide a credible public home for photography and print sales.
2. Demonstrate Staff-level engineering through explicit trade-offs, delivery evidence, operational controls, and measurable outcomes.

The second purpose must not degrade the first. Technical constraints serve the viewer and the artist; the viewer does not serve an arbitrary technical purity test.

## 2. Primary users

### Gallery visitor

Needs:

- Fast access to photographs on mobile and desktop.
- Stable layout with no unexpected shifting.
- Clear gallery structure and unobtrusive controls.
- A usable full-size viewer with keyboard and pointer input.

### Print buyer

Needs:

- Clear image, material, dimensions, edition, price, tax, shipping, and availability information.
- A trustworthy hosted checkout.
- Confirmation and support information.
- Accurate withdrawal, return, and delivery disclosures.

### Hiring manager or engineer

Needs:

- A concise explanation of the problem and constraints.
- Architecture that maps to implemented code.
- Evidence for performance, accessibility, security, and correctness claims.
- Honest trade-offs and rejected alternatives.
- Source code and a reproducible local workflow.

### Maintainer

Needs:

- Clear ownership boundaries between authored and generated data.
- Build failures that identify corrective action.
- Stable identifiers and deterministic outputs.
- Documentation that does not contradict itself.

## 3. Product principles

### Images remain primary

Interface color, animation, and decoration remain subordinate to the photographs. Dark neutral chrome minimizes visual tinting and distraction.

### Static by default, enhanced where justified

The entire gallery grid, captions, navigation, and product information render as HTML. A small script may improve the viewer where it materially improves accessibility and interaction quality.

### Measured rather than assumed

Performance, browser loading behavior, metadata preservation, and privacy controls require measurements or automated assertions.

### Privacy and attribution are separate concerns

GPS removal protects privacy. IPTC metadata preserves authorship. Resolution limits reduce the value of copied assets. None of these controls prevents copying after an image reaches a browser.

### Invalid states fail early

Incomplete print offers, duplicate SKUs, missing originals, stale manifests, and route collisions must fail before deployment.

### Public claims match production behavior

The site must not claim zero JavaScript, zero layout shift, metadata protection, accessibility, or commerce readiness without recorded evidence.

## 4. Functional scope

### Required for initial release

- Homepage with one high-impact hero image.
- Gallery directory.
- At least one gallery with twelve or more real photographs.
- Responsive grid preserving source aspect ratios.
- Modal image viewer with previous, next, close, Arrow Left, Arrow Right, Escape, and focus restoration.
- EXIF data plates generated from source metadata.
- Colophon describing architecture and measured results.
- Print product page generated only from a complete print object.
- One complete hosted-checkout purchase path.
- Impressum, privacy information, shipping disclosure, and consumer-rights content reviewed for launch.

### Required before calling the project portfolio-ready

- Production deployment.
- Cross-browser browser tests.
- Automated accessibility scan plus manual keyboard and screen-reader pass.
- Recorded JavaScript, CSS, HTML, image, LCP, INP, and CLS measurements.
- Verified delivered metadata and absence of GPS.
- CI evidence for content and route invariants.
- Public architecture diagram, ADR summaries, and source link.

## 5. Non-goals for the initial release

- User accounts.
- Multi-item cart.
- Search, tags, and faceted filtering before the content volume justifies them.
- Client-side state-management framework.
- Visible watermarking without evidence of a reuse problem.
- C2PA signing before the baseline asset pipeline is stable.
- Bespoke payment UI.
- Digital downloads.
- Social features, comments, likes, or personalization.
- Per-photo HTML pages for photographs not offered as prints.

## 6. Success criteria

### Product

- Visitors can identify galleries, open images, navigate, close the viewer, and reach print information without confusion.
- Print buyers can determine the total price and shipping implications before purchase.
- The interface works at 200% zoom and across mobile landscape and portrait orientations.

### Performance

- Gallery base content requires no JavaScript.
- Viewer enhancement remains at or below 3 KB Brotli.
- Core Web Vitals meet good thresholds at the 75th percentile when field data becomes available: LCP at or below 2.5 seconds, INP at or below 200 ms, and CLS at or below 0.1.
- No full-size derivative is requested before the viewer opens.

### Accessibility

- WCAG 2.2 AA target.
- All functionality is keyboard operable.
- Focus remains visible and unobscured.
- Pointer targets meet or exceed 24 by 24 CSS pixels, with 44 by 44 CSS pixels preferred for viewer controls.
- Every photograph has authored alternative text; decorative images use empty alternative text intentionally.

### Asset integrity

- Every source resolves through the originals boundary.
- Derivatives are deterministic for a source hash and transform version.
- Delivered assets contain no GPS.
- Supported outputs contain creator and copyright metadata.
- Width, height, aspect ratio, format, and content hash are recorded in the generated manifest.

### Commerce

- Print availability cannot exist without SKU, gross price, currency, dimensions, edition definition, and fulfillment data.
- Checkout fulfillment is idempotent.
- Signed webhook events drive order state.
- Limited-edition inventory cannot be oversold under concurrent requests.

## 7. Project risks

| Risk | Consequence | Control |
|---|---|---|
| Architecture exceeds implementation | Portfolio reads as speculative | Ship a narrow vertical slice before expanding documentation |
| Zero-JS ideology harms viewer usability | Keyboard and modal behavior degrade | Use a small framework-free enhancement and measure it |
| Large galleries inflate HTML and DOM | Parsing and memory costs despite low JS | One reusable dialog; route-size and DOM budgets |
| Generated data drifts from sources | Incorrect EXIF and routes | Sidecar manifest plus `--check` in CI |
| Originals storage creates slow builds | Expensive or unreliable deploys | Hash-based incremental processing and cached derivatives |
| Protection claims overpromise | Misleading public narrative | Use precise threat-model language |
| Commerce obligations remain incomplete | Legal and operational exposure | Launch gate and professional review |
| Documentation drifts | Junior or AI implementers receive conflicting rules | Source-of-truth map and ADRs |
