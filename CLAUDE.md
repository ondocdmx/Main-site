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

* Design mockups (mobile): Home, Producto, Carrito, Oferta de bienvenida. Omar will share screenshots.
* WhatsApp: +52 55 8525 9797 · Email: ondocdmx@gmail.com

## 2. CURRENT STATE (verified in the code, 27 Oct 2026)

Where things live:

* Soup prices: per product in `src/content/products.json`: `price` (shown) + `stripePriceId` (charged).
  $125 vegetarian/vegan, $150 meat/fish, Ondo Box (5 soups) $600.
* Shipping: `shippingPrice` ($50, shown) + `shippingStripeProductId` (the Price ID charged) in `settings.json`.
  Charged on every home-delivery order. There is no free-shipping threshold today.
* Pickup: does not exist. No screen offers it, so every cart order pays shipping. Leftover pickup texts
  (`slotPickup*`, `pickupNote` in `App.tsx`) and the `isPickup` branch in `api/create-cart-checkout.ts`
  are dead code. Owner decision 28 Oct 2026: Ondo does not do pickups.
* Discounts: one volume tier, `cartDiscount2*` in `settings.json`: 10+ items in the cart → 20%, applied
  by the API as the Stripe coupon in `cartDiscount2CouponId`. `cartDiscount1` is not set (off).
  Items with `excludeFromVolumeDiscount: true` in products.json (the box) count as 1 item toward the 10
  but never get the 20%. Stripe can't exclude products from a coupon, only include them, so the coupon
  lists every individual soup. ADDING A NEW SOUP: it must be on that coupon, or Stripe charges it at full
  price while the cart shows −20%. Coupons can't be edited: create a new one and update the ID.
* Promo codes: when no volume discount applies, the cart checkout shows Stripe's promo-code field.
  The subscription checkout always shows it. ONDOFIRST does NOT exist in Stripe yet (owner, 27 Oct 2026);
  it only appears in a code comment and an unused default banner text.
* Postal codes: `src/content/deliveryZones.json` → `allowedPostalCodes`, 28 codes. Checked in the
  browser before adding to cart. Outside the zone the customer can't add to cart; the address (and
  email, if they ask to be notified) becomes a lead in Google Sheets.
* Delivery day: Monday, hard-coded in `src/App.tsx` (`getNextMonday()`). Slots 9–13, 13–17, 17–21 are
  hard-coded in the `t` object in `App.tsx`. Orders until Sunday 23:59 → next day; on Monday → the
  following Monday. That matches the owner's cutoff (Sunday before midnight), but it's calculated in the
  customer's browser, once at page load, and the server never checks it. The date is not saved on the order.
* Subscriptions (`api/create-checkout-session.ts`): six Stripe Price IDs (`productId*`) and the price shown
  for 3 months (`amount*`) in `settings.json`. Every 2 weeks = 6 deliveries in 3 months; monthly = 3.
  Price per soup: monthly 4/6/10 = $106.25 / $100 / $95; every 2 weeks 4/6/10 = $100 / $95.83 / $90.
  Billing (owner, 28 Oct 2026): every plan renews automatically every 3 months and charges the card each
  time. There is no one-time 3-month plan today. Recurring plans can't be paid by transfer or OXXO.
* "Solo suscriptores" soups (`onlySubscriptions` in products.json) can't be added to the cart: the
  button opens the subscription funnel instead. Keep it that way.
* Orders: there is no Stripe webhook and no order database. The team reads orders and their
  `delivery_*` metadata in the Stripe Dashboard.

Do not change how prominent subscriptions are on the site until Omar asks in a specific Phase 5 task.

## 3. TARGET STATE (NOT built yet)

Do not assume any of this exists, and do not refactor toward it unless Omar asks in a specific task.

Rules:

* Caja de bienvenida (5-soup box): $600 MXN, ALWAYS ships free.
* Shipping: $50 MXN. Free when the order has 7 or more individual soups, or contains a 5-soup box.
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
* No pickup (owner, 28 Oct 2026). Remove the leftover pickup texts and code in a cleanup task.
* Stripe webhook (approved 28 Oct 2026): record every paid order (with its delivery date) somewhere the
  team can read, e.g. a Google Sheet, and keep a record of past buyers (needed to enforce ONDOFIRST).
* Gift option (coming): a one-time 3-month plan, paid once, that anyone can buy, including for themselves.
* Outside the zone: no checkout. Keep lead capture and add a WhatsApp button.
* Subscriptions keep their Price IDs and checkout until Phase 5. ONDOFIRST may be used on them.
* The promo-code field stays (cart without volume discount; subscription checkout always).
* Stripe reporting: not used today, but will be as orders grow. Sales should keep rolling up under
  the catalog products in Stripe.
