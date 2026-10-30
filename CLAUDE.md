@AGENTS.md

# Ondo — ondoclub.com

Ondo is a soup-first food brand in Mexico City. We sell frozen, seasonal soups in 500 ml pouches,
delivered to customers' homes. Founders: Ana and Omar. Site language: Spanish (es-MX) first, English second.

This file has three parts. Part 1 is how to work. Part 2 is what the code does today (verified).
Part 3 is where we are going: it is NOT built. Never treat Part 3 as a description of the code.

## 1. HOW WE WORK

### Approval and deploys

* Always start by reading the relevant code and proposing a short plan. Wait for approval before editing.
* Money and logistics changes go on a branch and wait for Omar's approval before merging to main.
  That means anything touching checkout, pricing, discounts, Stripe, the cart or delivery logic,
  including these JSON fields: `price`, `stripePriceId` (products.json); `cartDiscount*`, `shipping*`,
  `productId*`, `amount*` (settings.json); anything in deliveryZones.json.
* Content-only edits (copy, images, product text in JSON) may go straight to main.
  `npm run lint` and `npm run build` must pass before any push.
* This replaces the 27 Oct 2026 "push anything to main" note; docs/CONTEXTO-CLAUDE-DUENO.md §2.2 says the same.
* Use Stripe TEST keys for all development. Never touch live keys.
* Keep changes small and reviewable. Explain what you changed in plain language at the end.

### Facts and copy

* Never invent facts: ingredients, allergens, shelf life, heating times, testimonials, prices, delivery
  zones. If a fact is missing, use a visible placeholder like [TIEMPO DE CALENTADO] and list it in your summary.
* Subscriptions are sold by price per soup, never by a savings percentage (decision 28 Oct 2026).
  The site says "desde $90 por sopa" (every 2 weeks, 10 soups: $5400 / 60 soups). If an `amount*`
  changes, update that copy too. The funnel calculates each plan's price per soup in `App.tsx`.
  The only percentage on the site is the cart's real volume discount (`cartDiscount2Percent`).
* All customer-facing Spanish must have correct accents (tú, más, métete, decides) and use "tú".
* Mobile first: design and test at 390px width first, then desktop.
* Accessibility: real <button>/<a> elements, labels on inputs, touch targets ≥ 44px, text contrast ≥ 4.5:1.

### Brand

* Colors: cream background #EEEDD9, card #FFFDF6, ink #1F2E14, deep green #2E4419, mid green #3E5A22,
  olive #6B8E3A (large text/graphics only), brand orange #E8711F (logo/accents),
  CTA orange #C2531A with white text (passes contrast), light orange #F7A35C.
* Type: geometric bold display for headings (current brand font, or Outfit 700–800 as fallback),
  clean sans for body (Inter or current body font).
* Voice: warm, playful, "apapacho". Playful in headlines; literal and clear on buttons
  ("Agregar", "Arma tu caja", "Pagar $475" — never vague CTAs like "¡Apapáchate!").
* Food photography: always show the plated, cooked soup as the main image. Pouch photos are secondary.

### Reference

* Design mockups (mobile) live in docs/mockups: home-*.png, producto.png, carrito.png, bienvenida.png.
  Desktop mockups (home, producto, carrito, bienvenida): docs/mockups/desktop/ondo-mockups-desktop.pdf,
  with the same caveat: some copy and rules in them are outdated (e.g. "Envío gratis desde 7 sopas", "Más pedida").
  They show layout and intent, not exact pixels. Where a mockup and a written spec disagree, the written
  spec wins. Use the site's existing fonts, colors and components, not the mockups' stand-ins.
  bienvenida.png says "15% menos": that is outdated. The welcome offer is ONDOFIRST, 10% (owner, 28 Oct 2026).
  carrito.png shows "Meses sin intereses" (skipped for now) and a 7-soup marker (free shipping is now by amount, see Part 2).
* WhatsApp: +52 55 8525 9797 · Email: ondocdmx@gmail.com

## 2. CURRENT STATE (verified in the code, 27 Oct 2026)

Where things live:

* Soup prices: per product in `src/content/products.json`: `price` is what the cart shows AND charges (sent
  as `price_data` since Phase 1.3). `stripePriceId` (live) is only used to find the soup's Stripe Product, so
  sales roll up per soup; `stripeTestProductId` is the test-mode Product (`scripts/stripe-test-catalog.mjs`).
  $125 vegetarian/vegan, $150 meat/fish, Ondo Box (5 soups) $600.
* Pricing engine (Phase 1.1, 28 Oct 2026): `priceCart()` in `src/commerce/priceCart.ts` is the ONLY place
  that calculates the cart's subtotal, discount, shipping and total (in centavos). The cart UI and
  `api/create-cart-checkout.ts` both call it. `src/commerce/config.ts` reads the rules from the JSON files
  (no separate config file). Tests: `npm test` (`src/commerce/priceCart.test.ts`, `tests/`).
  The browser sends only product `_id`s and quantities; the server looks up prices in products.json.
* Shipping: `shippingPrice` ($50) in `settings.json`, sent to Stripe as a shipping option (no Price ID since Phase 1.2).
  Free when the cart subtotal before discounts reaches `freeShippingMinAmount` ($725, owner decision 28 Oct 2026):
  6 veggie soups, 5 meat soups, or the box + 1 soup. Any order with the box ships free too (owner, 30 Oct 2026:
  `boxShipsFree: true` in settings.json, read by `priceCart()`); its card and page say "Envío gratis".
  The free-shipping zone is not checked on the server yet.
* No pickup (owner decision 28 Oct 2026): Ondo does not do pickups, and the site has no pickup option.
  Orders are saved with `delivery_type: home_delivery` and `free_shipping_reason` (`minAmount`, `box` or empty).
* Discounts: one volume tier, `cartDiscount2*` in `settings.json`: 10+ items in the cart → 20%. The server
  creates the Stripe coupon itself (`api/_lib/catalog.ts`, id `ondo_bulk_20_<hash>`) for every individual
  soup, never the box (shipping is never discounted: it's a shipping option). A new soup or a new % gives a
  new coupon automatically; nothing to do by hand. `cartDiscount1` is no longer read. Items with `isBox: true`
  count as 1 item toward the 10 but never get the 20%. ADDING A NEW SOUP: give it a `stripePriceId` (live) and
  run `scripts/stripe-test-catalog.mjs` for test mode.
* Promo codes: when no volume discount applies, the cart checkout shows Stripe's promo-code field.
  The subscription checkout always shows it. ONDOFIRST exists in Stripe since 28 Oct 2026: customers type
  the promotion code `ONDOFIRST` (`promo_1UVPzV3Xzew6cmN1P0h1dkh7`); the coupon behind it is `ggW569cH`
  (10%, duration "Once", so subscription renewals are not discounted). Stripe's "first-time order only"
  is ticked on the promotion code. It works wherever the code field shows (carts under 10 items,
  subscriptions) and can't stack with the 20%. `welcomeCode`/`welcomePercent` in settings.json mirror it
  for `priceCart()`, but the cart has no code field yet: Stripe applies ONDOFIRST on its own page. Since Phase 1.2
  shipping is a Stripe shipping option, so coupons (ONDOFIRST included) no longer discount it. The site doesn't advertise it yet. Stripe's first-order check doesn't
  catch a returning customer with a new email; stricter enforcement is Phase 4.
* Cart (Phase 1.2, `src/components/CartDrawer.tsx`): one screen with the soups, the benefits bar, the delivery
  block (date, slot, postal code) and "Pagar $X" straight to Stripe. Cart, slot and postal code are saved in
  localStorage (`ondo_cart`, `ondo_cart_slot`, `ondo_cart_postal`). Cart thumbnails use `platedImage` (products.json).
* Postal codes: `src/content/deliveryZones.json` → `allowedPostalCodes`, 26 codes (03120, which does not exist, and a duplicate 06030 removed 30 Oct 2026). Checked live in the cart
  (no pop-up before adding to cart any more) and again on the server. Out of zone: no checkout, a WhatsApp
  button, and an optional email; the postal code (and email) become a lead in Google Sheets. The subscription
  funnel keeps its own postal-code step.
* Delivery day: `deliveryDays` (['monday']), `deliverySlots` and `orderCutoff` (1 day before, 23:59, Mexico City)
  in settings.json, computed by `src/commerce/delivery.ts` for the cart, the funnel and the server. The server
  re-checks slot, postal code and date (409 if the cutoff passed) and saves `delivery_date`, `delivery_slot`,
  `delivery_postal`, `discount_type` on the Checkout Session and the PaymentIntent. Stripe collects the address.
* Cart checkout (`api/create-cart-checkout.ts`): Stripe in Spanish (`es-419`), card only (Apple/Google Pay come
  with card if enabled in the Dashboard), shipping as a shipping option "Entrega lunes 2 de noviembre, 9–13 h".
  `price_data` lines (Phase 1.3). OXXO (1-day voucher) is built but off: `oxxoEnabled` in settings.json; turn it
  on only after the checklist in `docs/checkout.md` §7. Setup and test-mode testing: `docs/checkout.md`.
* Success page: `api/checkout-summary.ts` reads the order from Stripe (no personal data) for the Spanish
  confirmation pop-up (`src/components/OrderSuccess.tsx`).
* Subscriptions (`api/create-checkout-session.ts`): six Stripe Price IDs (`productId*`) and the price shown
  for 3 months (`amount*`) in `settings.json`. Every 2 weeks = 6 deliveries in 3 months; monthly = 3.
  Price per soup: monthly 4/6/10 = $106.25 / $100 / $95; every 2 weeks 4/6/10 = $100 / $95.83 / $90.
  Billing (owner, 28 Oct 2026): every plan renews automatically every 3 months and charges the card each
  time. There is no one-time 3-month plan today. Recurring plans can't be paid by transfer or OXXO.
* "Solo suscriptores" soups (`onlySubscriptions` in products.json) can't be added to the cart: the
  button opens the subscription funnel instead. Keep it that way.
* Orders (Phase 1.3): `api/stripe-webhook.ts` records each cart order in the "Pedidos" Google Sheet via the Apps
  Script in `docs/apps-script/pedidos.gs` (env `ORDERS_WEBHOOK_URL`, `ORDERS_WEBHOOK_TOKEN`, `STRIPE_WEBHOOK_SECRET`).
  Card → `pagado`; OXXO → `pendiente_oxxo`, then `pagado` or `oxxo_no_pagado`. Only `pagado` rows are delivered.
  Manual review (one email to `reviewEmail`, ondocdmx@gmail.com) when Stripe's postal code differs from the
  cart's, is out of zone, or OXXO is confirmed after the cutoff. Idempotent (PaymentIntent metadata
  `ondo_order_status` + one row per session). Subscriptions are still read in the Stripe Dashboard.

* Homepage (Phase 3, 30 Oct 2026): `src/components/home/` in the order Omar set (announcement bar, header,
  hero, Así de fácil, Empieza aquí (box), Las favoritas (6 soups), ¿Por qué congelada?, testimonials, Tres formas,
  Desde el huerto, Ana y Omar, FAQ, footer). Copy: `home*` keys in settings.json, with `{tokens}` filled from config
  (`src/components/home/homeCopy.ts`); FAQ in `src/content/faq.json`; testimonials in `src/content/testimonials.json`
  (empty list = section hidden). Full catalog with filters: `/tienda` (`/sopas` and `/#shop` redirect there).
  No loading screen. Home photos: `public/images/home/` (`node scripts/build-home-images.mjs`).
* The gift option ("Regala sopa") isn't built: its card links to WhatsApp until the gift funnel exists.

Do not change how prominent subscriptions are on the site until Omar asks in a specific Phase 5 task.
(Phase 3 removed the subscription marquee and manifesto at Omar's request; subscriptions now live in
"Tres formas de Ondo", the header and under the /tienda grid.)

## 3. TARGET STATE (NOT built yet)

Do not assume any of this exists, and do not refactor toward it unless Omar asks in a specific task.

Rules:

* Caja de bienvenida (5-soup box): $600 MXN with free shipping (owner, 30 Oct 2026; replaces the 28 Oct "box pays shipping"). Built: `boxShipsFree`.
* Shipping: $50 MXN. Free when the subtotal before discounts is $725 or more (box + 1 soup, 6 veggie or
  5 meat soups). The shop shows "free shipping" hints when one more soup would get there.
* 10+ items: 20% off AND free shipping. The box counts as ONE item toward the 10, never as 5.
  The 20% applies to individual soups only, never to the box's price (it already has a discount
  built in). Example: 9 soups + 1 box = 10 items → 20% off the 9 soups, box at full $600.
  (20% stays for now; the owner may lower it later to offset free shipping.)
* Welcome offer (Phase 4): code ONDOFIRST, 10% off the customer's first order. Allowed on one-time orders
  and on subscriptions. Not allowed for a returning customer, e.g. someone who cancels a subscription
  and signs up again to reuse it. How "first order" is enforced is decided in the Phase 4 build.
  It applies to the box too (e.g. a first order that is just one box).
  It combines with free shipping (free shipping is not a discount).
* Only ONE discount per order. If an order qualifies for 20% (10+ items), the 20% applies and ONDOFIRST does not.
* All free shipping applies only inside the delivery zone.
* Delivery: Mondays, three slots (9–13 h, 13–17 h, 17–21 h). Order cutoff: Sunday 23:59 (Mexico City
  time) for the next day's delivery. Enforced on the server, and the delivery date saved on every order.
  Delivery days must be configurable (we may add a second day later).

Decisions already made:

* Stripe, one-time orders (approved 28 Oct 2026): send prices at checkout (`price_data` in the Checkout
  Session line items), calculated on the server from products.json, never from prices sent by the
  browser. Each line points at the soup's existing Stripe Product (`price_data.product`), so sales keep
  rolling up per soup in Stripe's reports. Test mode uses its own copy of the catalog, with the IDs
  chosen by an environment variable. Coupons (e.g. the 20% volume coupon) also need test-mode copies.
  Subscriptions keep their Price IDs until Phase 5.
* Business rules live in the existing `settings.json`, `products.json` and `deliveryZones.json`.
  Do not create a new config file.
* No pickup (owner, 28 Oct 2026). Don't add pickup back unless Omar asks.
* Stripe webhook (approved 28 Oct 2026): record every paid order (with its delivery date) somewhere the
  team can read, e.g. a Google Sheet, and keep a record of past buyers (needed to enforce ONDOFIRST).
* Gift option (coming): a one-time 3-month plan, paid once, that anyone can buy, including for themselves.
* Outside the zone: no checkout. Keep lead capture and add a WhatsApp button.
* Subscriptions keep their Price IDs and checkout until Phase 5. ONDOFIRST may be used on them.
* The promo-code field stays (cart without volume discount; subscription checkout always).
* Stripe reporting: not used today, but will be as orders grow. Sales should keep rolling up under
  the catalog products in Stripe.
