# Commerce, legal, and order operations

## 1. Scope

The initial storefront supports one-time purchases of individual photographic prints. It does not include accounts, subscriptions, a multi-item cart, discount campaigns, or digital products.

The architecture must complete one real purchase end to end. A static product page without payment, webhook, inventory, and fulfillment behavior is commerce-ready presentation, not a functioning storefront.

## 2. Product contract

A product page exists only when a photograph carries a complete active print offer.

Required fields:

- SKU.
- Product title.
- Gross price in integer minor units.
- Currency.
- Printed dimensions.
- Material and print process.
- Framed or unframed state.
- Edition size or explicit open edition.
- Fulfillment class.
- Production lead time.
- Shipping destinations and exclusions.
- Return and withdrawal treatment.

Example:

```ts
interface PrintOffer {
  sku: string;
  title: string;
  priceMinor: number;
  currency: "EUR";
  dimensionsMm: { width: number; height: number };
  editionSize: number | null;
  material: string;
  framed: boolean;
  fulfillmentClass: string;
  productionLeadTimeDays: { min: number; max: number };
  active: boolean;
}
```

A boolean such as `printAvailable` beside optional product fields is prohibited because it permits commercially invalid states.

## 3. Price presentation

- Store price as a positive integer in minor units.
- Render with `Intl.NumberFormat` using the page locale and currency.
- Treat the public price as gross where German B2C price rules require the total price, including VAT and other price components.
- Disclose shipping costs or the method for calculating them before the buyer submits the order.
- Do not use floating-point arithmetic for money.
- Record the exact price and tax treatment on the order at checkout creation; do not reconstruct historical orders from the current catalog.

Example display:

```text
450.00 EUR
Includes applicable VAT. Shipping calculated before payment.
```

Final wording requires review against the actual tax registration and shipping model.

## 4. Checkout architecture

Stripe Checkout is the initial hosted provider behind a local boundary.

```ts
interface CheckoutProvider {
  createSession(input: CreateCheckoutInput): Promise<CheckoutSessionResult>;
  verifyWebhook(input: VerifyWebhookInput): Promise<CheckoutEvent>;
}
```

### Session creation

`POST /api/checkout/session`:

1. Validates SKU and requested quantity.
2. Loads the authoritative print offer server-side.
3. Verifies active inventory.
4. Creates a pending order and reservation.
5. Creates a hosted checkout session with the internal order ID in provider metadata.
6. Uses an idempotency key derived from the order attempt.
7. Returns only the hosted checkout URL and public order ID.

Client-supplied price, currency, product title, or inventory values are ignored.

### Webhook processing

`POST /api/webhooks/stripe`:

1. Reads the raw request body.
2. Verifies the provider signature.
3. Records the provider event ID under a unique constraint.
4. Returns success for an already processed event.
5. Loads the related order from provider metadata.
6. Applies a valid state transition.
7. Commits inventory and triggers fulfillment only after the payment state permits it.
8. Records structured audit information.

Fulfillment must be safe to execute repeatedly and concurrently for the same checkout session.

## 5. Order model

```ts
type OrderStatus =
  | "pending"
  | "payment_processing"
  | "paid"
  | "fulfillment_pending"
  | "fulfilled"
  | "cancelled"
  | "refunded"
  | "payment_failed";

interface Order {
  id: string;
  publicId: string;
  status: OrderStatus;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  providerSessionId?: string;
  providerPaymentId?: string;
  editionNumbers?: readonly number[];
  createdAt: string;
  updatedAt: string;
}
```

State transitions are explicit. Arbitrary status updates are prohibited.

## 6. Edition inventory

Limited editions require concurrency-safe inventory.

Rules:

- Edition size is immutable after the first sale unless a documented correction is legally and editorially justified.
- Reservations expire when checkout expires or payment fails.
- A database transaction or atomic conditional update prevents overselling.
- Edition numbers are assigned once payment becomes final or according to the fulfillment policy.
- The public page may show `Available`, `Sold out`, or a verified remaining count. It must not create false urgency.

Open editions do not require edition-number allocation but still require fulfillment and availability controls.

## 7. Customer and privacy data

Collect only data required for payment, delivery, legal obligations, and support.

- Prefer hosted checkout collection.
- Avoid copying full payment data into the project database.
- Store only required provider identifiers and fulfillment information.
- Define retention periods for orders, support records, and webhook logs.
- Restrict administrative access.
- Redact sensitive fields from logs.
- Document subprocessors and data transfers in the privacy notice.

## 8. Germany and EU launch gate

This section defines engineering launch requirements, not legal advice. A qualified professional should review the final storefront and business facts.

Before accepting orders, verify at minimum:

- Provider information is easily recognizable, directly accessible, and permanently available as required for commercial digital services.
- Product characteristics, trader identity, contact information, total price, shipping, payment, delivery, complaint handling, and withdrawal information appear before the buyer submits the order where required.
- The standard 14-day distance-selling withdrawal right is addressed unless a valid exception applies.
- A made-to-order or personalized-goods exception is not assumed merely because a print is produced after purchase. The actual product configuration and legal test require review.
- Return shipping cost responsibility is disclosed.
- The checkout button wording clearly indicates an obligation to pay.
- Privacy and cookie behavior reflect the actual analytics, payment, hosting, and support integrations.
- Tax registration and gross-price display match the seller’s actual status.
- Shipping restrictions, delivery estimates, loss, damage, and customs treatment are explicit.
- An Impressum contains the applicable identity, address, electronic contact, registration, and tax identifiers.

The project must not copy a generic legal template without adapting it to the real seller, business form, tax status, products, and countries served.

## 9. Operational workflow

### Paid order

1. Webhook marks order paid.
2. Inventory commits.
3. Fulfillment task is created.
4. Customer receives confirmation.
5. Operator receives a structured fulfillment record.
6. Print production and shipment events update the order.
7. Tracking information is sent where available.

### Failure paths

- Delayed payment succeeds after the customer leaves checkout.
- Delayed payment fails.
- Checkout expires.
- Webhook delivery repeats.
- Webhook arrives before redirect completion.
- Customer closes the browser before returning.
- Inventory reservation expires during payment.
- Shipment is lost or damaged.
- Refund or cancellation occurs after edition assignment.

The webhook state is authoritative; the browser redirect is not fulfillment confirmation.

## 10. Launch acceptance criteria

- A test purchase completes from product page through webhook and order record.
- Replaying the same webhook does not duplicate fulfillment.
- Concurrent final-unit purchase attempts do not oversell.
- Failed and expired checkout sessions release reservations.
- Price displayed on the product page matches the server-created checkout.
- Shipping and tax presentation are verified for supported destinations.
- Legal pages are linked from product and checkout-adjacent surfaces.
- Logs contain correlation IDs but no payment secrets or unnecessary customer data.
