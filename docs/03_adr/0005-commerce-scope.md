# ADR 0005: Implement one complete hosted-checkout purchase flow

- **Status:** Accepted
- **Date:** 2026-07-31
- **Revisit trigger:** Initial purchase flow is operational and product requirements justify cart, accounts, or another provider.

## Context

The original architecture described print product pages and server-side form submission but did not define payment, orders, inventory, webhook processing, or fulfillment.

For a project presented as a commercial storefront, static product pages alone create an incomplete claim. A complete vertical slice provides stronger engineering evidence than a broad catalog with no transaction boundary.

## Decision

Implement one-time single-product purchases through Stripe Checkout behind a local `CheckoutProvider` interface.

The initial flow includes:

- Authoritative server-side product lookup.
- Pending order creation.
- Inventory reservation.
- Hosted checkout session.
- Signed webhook verification.
- Idempotent order-state transitions.
- Concurrency-safe limited-edition inventory.
- Confirmation and fulfillment records.
- Expiry, delayed-payment, failure, cancellation, and refund handling.

No multi-item cart, account system, bespoke payment form, or subscription support is included.

## Alternatives

### A. Product inquiry only

Valid for an art portfolio, but rejected because the project explicitly claims storefront behavior and benefits from demonstrating transactional boundaries.

### B. Payment links without internal orders

Rejected because limited editions require authoritative inventory and fulfillment state.

### C. Custom payment form

Rejected because it increases payment and accessibility surface without product benefit.

## Consequences

### Positive

- The storefront claim becomes verifiable.
- The project demonstrates async events, security boundaries, idempotency, and concurrency.
- Hosted checkout reduces payment-data exposure.

### Negative

- A server runtime and database become necessary.
- Legal, tax, support, and fulfillment obligations become real.
- Provider integration and test environments require maintenance.

## Verification

- End-to-end test payment.
- Signed webhook failure test.
- Event replay test.
- Concurrent final-unit purchase test.
- Session expiry and reservation release test.
