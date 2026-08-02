# 09 — Portfolio case study

*Written for a reader evaluating engineering judgment. Every claim below is either enforced by a check in the repository or recorded as a measurement, and the ones that are neither are marked. This document restates decisions in prose for a different audience; it does not introduce any.*

## The premise

Most photography sites are built the way most sites are built, which means a component framework arrives first and the images are fitted around it afterwards. That ordering is defensible when a page has state to manage, and a photography archive has none: the content is fixed at publication, the interactions are look closer and go to the next one, and the only thing a visitor is waiting for is image bytes. Every kilobyte of framework runtime on such a page is therefore a kilobyte competing with the content it exists to present, which is the observation the entire project is built on and the reason its target is not a small JavaScript payload but an absent one.

Zero. Not small, and not zero until a lightbox hydrates.

## What the constraint bought

The constraint is only interesting because it turned out to be achievable, and it was achievable because the platform absorbed the work that would otherwise have justified a runtime. The image viewer is the load-bearing case. A lightbox is the canonical reason a static gallery grows an island: something has to open the overlay, trap focus, handle Escape, respond to a click outside, and manage the stacking context, and every one of those is conventionally a listener.

The Popover API supplies all of them declaratively. Each photograph is a `<button popovertarget>`, each overlay is a popover rendered at build, and the browser handles open, close, Escape, light dismiss, and the top layer. Navigation between photographs is a second and third button inside each popover pointing at its neighbours, which makes advancing through a gallery a matter of markup rather than of state. The React lightbox this replaces would have cost roughly 45 KB of runtime before any application code, and it would have bought arrow keys.

Arrow keys are what the budget actually costs, and naming the cost precisely is more useful than defending the decision. Previous and next are buttons: reachable by Tab, operable by Enter, keyboard-accessible and not keyboard-fast.

## The cost that required a real judgment

A sharper cost sits underneath the interaction model, and it is the part of this project most worth discussing in an interview.

`popover="auto"` is not a modal dialog. It provides Escape and light dismiss and the top layer, however it does not trap focus and it does not make the document behind it inert. A keyboard user who continues tabbing past the close button leaves the viewer and re-enters the gallery underneath it. The mechanism that would fix this is `<dialog>` with `showModal()`, and `showModal()` is a script call — one method, and the entire distance between this design and full modal semantics.

Paying for that method means a runtime, a hydration boundary, and the end of the claim the project is named after. Declining to pay for it means shipping a viewer that is announced as a dialog and does not contain focus like one. The design declines, and mitigates: the popovers are rendered after the grid so that tabbing out reaches the end of the document rather than looping through the gallery, each carries an accessible name derived from its photograph's alt text, and the close button is the last focusable element inside. Should testing show this to be a real barrier rather than a theoretical one, the correct response is to remove the viewer and link to a larger derivative, because degrading to a plain link is consistent with the budget and adding a script is not.

The general point is that a constraint which has never cost anything was never a constraint. This one costs something specific, the cost is written down in [`05_INTERACTION_AND_ACCESSIBILITY.md`](05_INTERACTION_AND_ACCESSIBILITY.md), and it was priced before it was accepted.

## Modelling that fails loudly

The content layer is where most of the remaining engineering sits, and its governing idea is that a malformed input should fail the build rather than degrade in production. Three decisions illustrate it.

Alt text is required, and whitespace does not satisfy it. `z.string().min(1)` accepts a single space, which is exactly how empty alt text reaches production while passing a schema that claims to require it, and a validation rule that produces the appearance of a guarantee is worse than no rule at all. A refinement on the trimmed length closes it.

A print offer is an optional object rather than a `printAvailable` boolean beside five optional siblings, because that alternative shape validates `printAvailable: true` with no price, no SKU, and no dimensions. That state passes the schema and is commercially broken, so the model makes it unrepresentable instead of catching it later.

EXIF is stored as measured rather than as displayed: `fNumber: 2.8`, not `"f/2.8"`. A pre-rendered string means the data plate and any subsequent sort or filter disagree about what the value is, and the disagreement surfaces the first time anyone wants photographs ordered by aperture. Formatting is a presentation concern and lives in one function.

## Writing generated data into authored files

The extraction script writes camera data into the `exif` key of each gallery file, which is normally a mistake. Generated content in a hand-authored file drifts the moment somebody edits the file without rerunning the generator, and the conventional fix is a sidecar manifest that nobody edits by hand.

The approach is safe here for one reason: `extract-exif.mjs --check` runs in continuous integration and exits non-zero if regeneration would change any file. That converts "someone forgot to run the script" from silent drift into a failed build, and without it the sidecar would be the correct design. Nesting the generated values under a single key does the rest of the work, because a bounded generated region is what allows a hand edit to a neighbouring field to survive the next run.

The pattern generalises: co-locating generated and authored data is a legitimate trade when, and only when, a check enforces the invariant that co-location threatens.

## Protection without theatre

Anything a browser renders can be captured, so the strategy is not prevention. It is limiting what can be taken, deterring casual reuse, and being able to prove ownership afterwards.

The highest-value control is refusing to deliver the valuable file: originals live in private object storage, never enter the repository or the build output, and delivered derivatives are capped at 2048 px on the long edge, which is ample for viewing and inadequate for printing at any size a buyer would pay for. Beyond that, the archive has no per-photograph URL — which is also the reason the viewer avoids the conventional `:target` lightbox, since `:target` produces a permalink per image as a side effect and a permalink is what makes uncoordinated redistribution convenient. Sharp strips metadata by default, removing GPS, which is wanted, and authorship, which is not, so the pipeline re-embeds IPTC creator and copyright while keeping location stripped, because embedded attribution survives a right-click save.

What is deliberately absent is more informative than what is present: no right-click blocking, no drag suppression, no overlay divs, no devtools detection. Each is defeated in seconds through the network panel, each breaks expected browser behaviour for legitimate visitors, and each requires a script this site does not ship. A portfolio should not treat its audience as suspects.

## Verification as the actual deliverable

The project's operating rule is that a claim about performance, protection, accessibility, or correctness is either enforced automatically, measured and recorded, or explicitly marked unverified, and there is no implicit verified state. The register lives in [`07_TESTING_SECURITY_AND_OPERATIONS.md`](07_TESTING_SECURITY_AND_OPERATIONS.md), and a claim with no row there is a claim the project is not entitled to make.

In practice this means a build assertion greps the emitted HTML for script bytes and fails on any, a Content Security Policy of `script-src 'none'` backs that assertion at runtime so an accidental island fails visibly rather than quietly, a dependency guard fails the build if React or Tailwind returns to `package.json`, and a metadata scan asserts GPS absent and IPTC present across every delivered derivative. The zero-JavaScript property is enforced by two independent mechanisms, which is proportionate for the property the project is named after.

The habit is worth more than any individual check. A portfolio project that asserts a performance characteristic it has not measured is less credible than one that asserts nothing, because the reader cannot distinguish the unmeasured claims from the measured ones and therefore discounts all of them.

## Current status

The site is not built. Everything above is design, and the distance between an intended JavaScript budget and a held one is the difficulty of this project rather than a footnote to it. The repository presently contradicts its own decisions in five places — a registered React integration, a Tailwind plugin, scaffold dependencies, an extraction script that disagrees with its schema, and a resolver module that does not exist — all of which are the first milestone in [`08_IMPLEMENTATION_PLAN.md`](08_IMPLEMENTATION_PLAN.md).

Stating that plainly is the same discipline as the verification matrix, applied to the project rather than to its output.

## Author

Ross Todd, senior software engineer in Munich. [GitHub](https://github.com/rsstdd)
