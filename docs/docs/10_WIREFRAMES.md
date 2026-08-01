# Wireframes

These structural ASCII diagrams define hierarchy and behavior without implying decorative styling. Production layouts may adapt at responsive breakpoints while preserving the information architecture.

## 1. Homepage

**Container:** `container-wide` at 1400 px maximum.

```text
+------------------------------------------------------------------------------+
| ISO ZERO                                      Index  Galleries  Prints  About |
|------------------------------------------------------------------------------|
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |                         HERO IMAGE 16:9 OR 3:2                         |  |
|  |                                                                        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  |-- Datum rule                                                             |
|                                                                              |
|  [Display-xl / Plex Serif]                                                   |
|  Photographs, field notes, and limited prints.                              |
|                                                                              |
|  [Body-lg / max 65ch]                                                        |
|  An archive of structures, coastlines, machines, and working landscapes.    |
|                                                                              |
|  +----------------------------------+  +----------------------------------+  |
|  | FEATURED GALLERY IMAGE           |  | FEATURED GALLERY IMAGE           |  |
|  +----------------------------------+  +----------------------------------+  |
|  Gallery title · 18 photographs       Gallery title · 12 photographs        |
|  -----------------------------         -----------------------------         |
|  Data plate                            Data plate                            |
|                                                                              |
|------------------------------------------------------------------------------|
| © 2026 ISO Zero · commit a1b2c3d · Colophon · Impressum · Privacy            |
+------------------------------------------------------------------------------+
```

### Rules

- The hero uses responsive AVIF, WebP, and JPEG output.
- The hero receives explicit dimensions and a measured priority policy.
- Directory images have zero radius and no scale hover.
- Every directory card includes a data plate.
- The footer uses commit or release identity, not a changing wall-clock timestamp.

## 2. Gallery

**Container:** `container-wide`.

```text
+------------------------------------------------------------------------------+
| ISO ZERO                                      Index  Galleries  Prints  About |
|------------------------------------------------------------------------------|
|                                                                              |
| [Display / Plex Serif]                                                       |
| Industrial decay and infrastructure                                          |
|                                                                              |
| [Body-lg / max 65ch]                                                         |
| A study of structural elements and industrial decay in high-contrast         |
| environments. Captured on medium-format digital and 35 mm film.              |
|                                                                              |
| +----------------------+ +----------------------+ +------------------------+ |
| | LINK / IMAGE 3:2     | | LINK / IMAGE 4:5     | | LINK / IMAGE 16:9     | |
| +----------------------+ |                      | |                        | |
| Data plate              |                      | +------------------------+ |
|                          +----------------------+ Data plate                |
| +----------------------+ Data plate                                        |
| | LINK / IMAGE 16:9    | +----------------------+ +------------------------+ |
| |                      | | LINK / IMAGE 3:2     | | LINK / IMAGE 4:5       | |
| +----------------------+ +----------------------+ |                        | |
| Data plate              Data plate              +------------------------+ |
|                                                   Data plate                 |
|                                                                              |
|------------------------------------------------------------------------------|
| © 2026 ISO Zero · commit a1b2c3d · Colophon · Impressum · Privacy            |
+------------------------------------------------------------------------------+
```

### No-JavaScript behavior

Each image is a normal link to its bounded large derivative. The grid, captions, and navigation remain complete.

## 3. Modal image viewer

**One reusable `<dialog>` populated on open.**

```text
+==============================================================================+
| [Close image viewer]                                                         |
|                                                                              |
|       +----------------------------------------------------------------+     |
|       |                                                                |     |
|       |                   RESPONSIVE FULL-SIZE IMAGE                   |     |
|       |                      max 2048 px long edge                     |     |
|       |                                                                |     |
|       +----------------------------------------------------------------+     |
|                                                                              |
|       |-- Data plate                                                         |
|       Structural concrete under winter light.                               |
|       FUJIFILM X-T4 · XF35mmF1.4 R · 35 mm · f/2.8 · 1/500 s · ISO 160      |
|                                                                              |
|       [Previous]                       [View print]                 [Next]     |
+==============================================================================+
```

### Rules

- The dialog is modal.
- The image is a semantic `<img>` with authored alternative text.
- Arrow keys, Escape, previous, next, and focus restoration work.
- No large derivative loads before opening.
- The script remains at or below 3 KB Brotli.

## 4. Print product page

**Container:** `container-content` at 1120 px maximum.

```text
+------------------------------------------------------------------------------+
| ISO ZERO                                      Index  Galleries  Prints  About |
|------------------------------------------------------------------------------|
|                                                                              |
| +--------------------------------------+  [H1 / Plex Serif]                  |
| |                                      |  The datum print                    |
| |                                      |                                     |
| |                                      |  [EDITION OF 10]                    |
| |        PRIMARY PRINT IMAGE           |                                     |
| |          sticky on desktop           |  450.00 EUR                         |
| |                                      |  Includes applicable VAT.           |
| |                                      |  Shipping calculated before payment.|
| |                                      |                                     |
| +--------------------------------------+  |-- Datum rule                      |
|                                           Archival pigment on Hahnemühle      |
|                                           Photo Rag. Certificate included.     |
|                                                                              |
|                                           594 × 420 mm                         |
|                                           Unframed                             |
|                                           Production: 5–10 business days       |
|                                                                              |
|                                           [Purchase print]                    |
|                                                                              |
|------------------------------------------------------------------------------|
| Shipping and returns · Impressum · Privacy · commit a1b2c3d                  |
+------------------------------------------------------------------------------+
```

## 5. Hosted checkout handoff

```text
Product page
    │
    ├─ POST SKU to server
    ▼
Pending order + inventory reservation
    │
    ▼
Stripe-hosted checkout
    │
    ├─ browser redirect ───────────────→ order status page
    │
    └─ signed webhook ────────────────→ authoritative order transition
```

The browser redirect never confirms fulfillment.

## 6. Colophon

**Container:** `container-prose` at 65ch.

```text
+------------------------------------------------------------------------------+
| ISO ZERO                                      Index  Galleries  Prints  About |
|------------------------------------------------------------------------------|
|                                                                              |
|        [H1 / Plex Serif]                                                      |
|        Colophon                                                              |
|                                                                              |
|        This site is an engineering notebook and archival catalog.            |
|        The gallery renders statically and adds a bounded viewer enhancement. |
|                                                                              |
|        |-- Datum rule                                                        |
|                                                                              |
|        [OVERLINE / PLEX MONO]                                                 |
|        01 — ARCHITECTURE AND BUILD PIPELINE                                  |
|                                                                              |
|        Originals remain private. A deterministic build produces responsive  |
|        sRGB derivatives and a generated metadata manifest.                   |
|                                                                              |
|        |-- Datum rule                                                        |
|                                                                              |
|        [OVERLINE / PLEX MONO]                                                 |
|        02 — MEASURED RESULTS                                                  |
|                                                                              |
|        JS 2.4 KB BR · LCP 1.9 S · CLS 0.01 · COMMIT A1B2C3D                 |
|                                                                              |
|------------------------------------------------------------------------------|
| © 2026 ISO Zero · Impressum · Privacy                                        |
+------------------------------------------------------------------------------+
```

Metrics shown here are illustrative until measured. Production copy must use actual evidence.
