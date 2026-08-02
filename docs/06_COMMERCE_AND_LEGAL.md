# 06 — Commerce and legal

Nothing in this document is legal advice. It records the obligations the project has identified and the design decisions made in response to them, and those obligations are to be confirmed with a qualified adviser before the first sale. The reason they are written down now is that discovering a trader obligation at launch is expensive, and discovering it during design is free.

## The print offer

A print offer is an optional `print` object on a photograph. Presence of the object is availability, and its required fields are what availability means.

| Field | Type | Notes |
|---|---|---|
| `sku` | lowercase slug | Route segment for `/prints/[sku]` |
| `priceCents` | positive integer | Gross, inclusive of VAT |
| `currency` | `"EUR"` | Literal, single-currency by design |
| `dimensions` | string | Paper dimensions as sold, for example `"420 × 297 mm"` |
| `editionSize` | positive integer or null | Null is an open edition |

### Why an object rather than a boolean

A `printAvailable: true` boolean beside five optional siblings validates cleanly with no price, no SKU, and no dimensions. That state passes the schema and is commercially broken, because it produces a product page offering nothing at a price of nothing. Modelling availability as the presence of a complete object makes the invalid state unrepresentable, which is the correct place to solve it.

### Why null rather than absent for edition size

Null is a claim and absent is an omission. `editionSize: null` states that the work is an open edition, which is information a buyer needs; a missing key states only that nobody filled it in. The schema requires the field precisely so the author has to decide.

### Money

Prices are integer minor units, gross, in EUR.

Integer because floating-point money is a rounding bug waiting for a large enough order, and a print storefront that computes `19.99 * 3` in binary floating point will eventually charge somebody the wrong amount. Gross because German price-indication rules require the displayed figure to be the total a consumer pays, so a net price with VAT added at checkout is not merely inconvenient, it is non-compliant.

`src/lib/money.ts` takes minor units and a currency code and returns a localised string. No other module formats currency, because two formatters disagree eventually.

## Constraints the schema cannot express

Two invariants are global rather than per entry, so Zod cannot state them and the build checks them instead.

**SKU uniqueness across all galleries.** Two prints sharing a SKU collide on `/prints/[sku]`, and one route silently disappears. `scripts/check-skus.mjs` collects every SKU across every gallery and fails the build on a duplicate.

**Every `originalKey` resolves.** Checked at build for all photographs, print-bearing or not, because a broken key surfaces later and less legibly otherwise.

## Checkout

### The decision

Stripe Payment Links for the first release. Each SKU has a Payment Link created in the Stripe dashboard, and its URL is stored beside the print offer. The purchase control on `/prints/[sku]` is an anchor.

```html
<a class="button" href="https://buy.stripe.com/…">Purchase print</a>
```

An anchor needs no script, no server, and no session endpoint, which makes it the only checkout mechanism fully compatible with a statically compiled site that ships zero JavaScript. Stripe hosts the payment page, so card data never touches this project and PCI scope stays with Stripe.

### What was rejected, and why

| Option | Rejected because |
|---|---|
| Stripe.js embedded checkout | Requires a client-side script, which ends the zero-JavaScript claim on a route that is otherwise static |
| Server-created Checkout Sessions | Requires an on-demand-rendered POST endpoint and therefore a server adapter, which converts a static site into a hybrid one for a single form submission |
| PayPal buttons | Same script requirement, with a worse checkout experience |
| Invoice by email | No script and no server, and it converts a purchase into a conversation, which loses the sale the storefront exists to make |

The server-created session is the correct design at volume, and it is deferred rather than dismissed. The migration trigger is stated below.

### What the Payment Link costs

| Cost | Assessment |
|---|---|
| Price lives in two places | The content file and the Stripe dashboard. Mitigated by a build check that fetches each linked price from the Stripe API and fails on mismatch **[UNVERIFIED]** |
| No inventory enforcement | A limited edition can be oversold, because the link does not know how many remain |
| Link creation is manual | Acceptable at the volume a single-author archive produces |

Inventory is the one that matters. For the first release, limited editions are handled by setting a Payment Link's quantity limit in Stripe to the edition size, which makes Stripe the authority on remaining stock. That is sufficient for editions in the low tens and it is not sufficient at scale, so the migration trigger is: **more than three concurrently active limited editions, or any edition larger than 25**, at which point checkout moves to server-created sessions behind a provider boundary and the site adopts a hybrid output mode for that one route.

## Fulfilment

Fulfilment is manual. An order notification arrives by email, the print is produced and shipped, and tracking is sent to the buyer.

No webhook handler exists in the first release, because a webhook requires a server and manual fulfilment at this volume does not need one. When checkout migrates to server-created sessions, the webhook arrives with it, and it must then be signature-verified and idempotent by event ID, because payment providers retry and a non-idempotent handler eventually ships two prints for one order.

## The provider boundary

Even with Payment Links, the provider is named in exactly one module. `src/lib/checkout.ts` exports a function that takes a print offer and returns a purchase URL, and every template calls that. Stripe appears nowhere else in the codebase.

The boundary is cheap now and it is what makes the later migration a change to one file, rather than a search for every place a Stripe URL was interpolated into a template.

## German trader obligations

Selling from Germany converts the site from a personal portfolio into a commercial one, and the consequences are content obligations rather than architectural ones.

| Obligation | Response |
|---|---|
| Impressum | Becomes a full trader Impressum under § 5 DDG: name, postal address, email, and VAT identification number if one is held. A portfolio Impressum is not sufficient once a sale is possible |
| Right of withdrawal | Fourteen days for consumer distance sales. Instructions and a model withdrawal form are published at `/agb/`. Prints are treated as standard goods rather than as customised goods, because an open edition produced to a published specification is unlikely to qualify for the customisation exemption |
| Price indication | Gross prices, with a statement of whether VAT is included and separate disclosure of shipping costs before the buyer commits |
| Shipping and delivery | Costs and expected delivery period stated on the product page, not only at checkout |
| VAT | Depends on turnover and on whether the Kleinunternehmerregelung applies. If it does, the required statement replaces a VAT rate on the invoice. Cross-border consumer sales within the EU raise OSS questions above the distance-selling threshold |
| Privacy notice | `/datenschutz/` describes what the hosting provider logs, what Stripe processes, and the absence of analytics and cookies. Notably short, because the site sets no cookies and runs no client script |
| Terms | `/agb/` covers formation of contract, delivery, withdrawal, and the copyright reservation on the photographs |

The copyright reservation is worth stating on the product page as well as in the terms: purchasing a print conveys the physical object and no licence to the image. Buyers rarely assume otherwise, and the sentence costs nothing.

## Structured data

Product pages emit `schema.org/Product` with an `Offer` carrying price, currency, and availability. Gallery pages emit `schema.org/ImageObject` with `creator`, `copyrightNotice`, and `license`, which Google Images surfaces as licensing metadata and which redirects some reuse toward asking first.

Both builders live in `src/lib/schema-org.ts` and derive entirely from the content schema, so a price cannot disagree between the visible data plate and the structured data.
