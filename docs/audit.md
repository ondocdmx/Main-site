# ONDO website audit

*28 Oct 2026 · read-only review of `ondocdmx/Main-site` at commit `6463ad8` (after PRs #4 and #5). No code was changed.*

Written for Omar, not for developers. File names are given so a future developer (or Claude) can find
things; you can skip them. Line numbers are approximate ("around line …") and drift as the code changes.

---

## Summary in 10 lines

1. The whole website is **one big file**, `src/App.tsx` (about 2,650 lines). Every page, popup, cart and form lives in it.
2. Content (texts, soups, prices shown, postal codes) lives in **4 JSON files** in `src/content/`. There is no CMS and no database.
3. Payments go through **Stripe Checkout**. Two small server functions create the payment page: one for the cart, one for subscriptions.
4. There is **no Stripe webhook**: the site never hears back from Stripe after a payment. Orders are only visible in the Stripe Dashboard.
5. **Delivery is always "next Monday"**, calculated in the customer's browser. The chosen time slot is saved on the order, but the **date is not**.
6. **Pickup does not exist on the site today.** The text for it is in the code, but no screen shows it. (CLAUDE.md says otherwise; it needs correcting.)
7. Analytics: **Google Tag Manager** (container `GTM-TBTXDQ72`, managed by the agency) plus GA4 e-commerce events. No Meta/TikTok pixel.
8. The **colours on the site are not the brand colours** in CLAUDE.md, and the main orange buttons fail the contrast rule (2.4:1 vs. the 4.5:1 minimum).
9. The servers **trust what the browser sends** (which price, which coupon, which postal code). Someone technical could tamper with an order.
10. The **phase mockups are not in the repo** (`docs/mockups` doesn't exist). The phase order in section 8 is my proposal from CLAUDE.md, to confirm with you.

---

## 1. Stack: what the site is built with

| Piece | What it is | In plain words |
|---|---|---|
| Framework | React 19 + TypeScript, built with Vite | A modern JavaScript website that runs in the visitor's browser |
| Styling | Tailwind CSS 4 | Styles are written as short class names directly in the code |
| Hosting | **Vercel** | Hosts the website and the small server functions in `api/` |
| Server functions | `api/*.ts` (4 files) | Tiny programs that run on Vercel only when called: create a Stripe payment page, send a form to Google Sheets |
| Payments | Stripe Checkout (`stripe` library, API version fixed at `2024-06-20`) | The customer is sent to a payment page hosted by Stripe |
| Forms / leads | Google Sheets via an Apps Script webhook | "Which soup do you love?" form and out-of-zone address leads |
| Content | JSON files in `src/content/` (exported from Sanity in Oct 2026) | Editing a text = editing a file and publishing |

**How the site is deployed.** Every push (or merge) to the `main` branch on GitHub makes Vercel rebuild
and publish www.ondoclub.com automatically, in 1–2 minutes. Pull requests get a **preview link** first.
There is no separate "staging" site. In October one merge didn't trigger a deploy, so it's worth checking
Vercel → Deployments after each merge.

**Where environment variables (secrets) live.**

| Variable | What it's for | Where |
|---|---|---|
| `STRIPE_SECRET_KEY` | Lets the server talk to Stripe | Vercel project settings (live key `sk_live_…` in Production); local `.env` for development (test key `sk_test_…`) |
| `FRONTEND_URL` | Fallback website address for Stripe's return links | Vercel / `.env` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Where form submissions and leads are sent | Vercel / `.env` |
| `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL` | Optional separate sheet for delivery-zone leads | Vercel / `.env` |
| `GEMINI_API_KEY` | **Not used.** Leftover from the Google AI Studio template | `.env.example` only. See risk R8 |

The real values are never in the repo. `.env.example` lists the names with no values. `docs/TRASPASO.md` explains who holds which account.

---

## 2. Pages and components

The site is a **single-page app**: there is really one page, and "pages" are sections and pop-ups that
appear on top of it. The address bar is handled by hand (no routing library):

| Address | What shows |
|---|---|
| `/` | Homepage |
| `/sopas` | Homepage, scrolled to the shop |
| `/sopas/<slug>` (e.g. `/sopas/mega-verde`) | Homepage with that soup's product pop-up open |
| `/soupscripciones` | Homepage with the subscription funnel pop-up open |

`vercel.json` tells Vercel to send all of these addresses to the same page.

**Everything is in `src/App.tsx`** (one function, `App`). There are no separate component files. What renders where:

| What you see | Where in `src/App.tsx` |
|---|---|
| **Homepage**: red top banner, header, hero, shop, manifesto, "how it works" steps, footer | The whole `App` function; banner ~716, header ~724, hero ~913, manifesto ~1158, steps ~1352, footer ~1419 |
| **Product grid** (with tag filters) | "Products Section" ~948: filters ~951, grid ~1009, subscription banner under it ~1126 |
| **Product pop-up** (`/sopas/<slug>`) | "MODAL: Product Detail" ~1617 |
| **Cart drawer** | "Cart Sidebar" ~780–912 |
| **Delivery-slot step (cart)** | Inside the cart drawer footer ~853–893: three Monday slots, then "Proceder al pago" |
| **Delivery-address check** | "MODAL: Delivery Address" ~1449: postal-code check before the first add-to-cart |
| **Subscription page** (`/soupscripciones`) | "MODAL: Subscription Funnel" ~1793–2474, in 6 steps: intro ~1809 → delivery zone ~1863 → plan ~1990 → choose soups ~2115 → time slot ~2302 → summary and pay ~2349 |
| Other pop-ups | Mixed-cart warning ~1555, soup-not-found 404 ~1599, soup-request form ~2475, payment-success ~2581, floating button ~1778 |

Supporting files: `src/analytics.ts` (tracking), `src/index.css` (fonts, colours), `src/main.tsx` (starts the app), `index.html` (page title, SEO tags, Google Tag Manager).

---

## 3. Products

**Where product data lives:** `src/content/products.json`, a list of 13 items in the order they appear in
the shop (12 soups + the Ondo Box). Shop filters come from `src/content/tags.json`. Product photos are in
`public/images/cms/`.

**Stripe also has products**, but the site only stores each one's **Price ID** (`stripePriceId`), the
"which price to charge" code. The **price shown** (`price`) and the **price charged** (the Price ID in
Stripe) are two separate things that must be kept in sync by hand.

**Fields available for each soup:**

| Field | What it is | Example |
|---|---|---|
| `title` | Name, Spanish + English | "Mega verde" |
| `tagline` | Short line under the name, es/en | |
| `description` | Long text in the product pop-up, es/en | |
| `ingredients` | Ingredients text, es/en | |
| `price` | Price **shown** (MXN) | 125 |
| `stripePriceId` | Price **charged**, as a Stripe Price ID | `price_1TQY…` |
| `image`, `hoverImage`, `images[]` | Main photo, photo on hover, extra gallery photos | `/images/cms/….webp` |
| `bgColor` | Card background colour (often empty) | |
| `tags[]` | Filters: vegetarian, meat, fish, spicy, vegan (copies from `tags.json`) | |
| `slug` | Web address and analytics ID. **Never change for existing soups** | `mega-verde` |
| `_id` | Internal ID. **Never change** | |
| `soldOut` | Shows "AGOTADO" and blocks buying | |
| `onlySubscriptions` | Only available in the subscription (chowder de bacalao today) | |
| `excludeFromFunnel` | Hidden from the subscription soup picker (the box) | |
| `excludeFromVolumeDiscount` | Counts toward the 10 items but never gets the 20% (the box) | |
| `purchaseType` | `single` or `subscription`; the cart can't mix the two | |

**Not available today** (the Producto mockup will probably need them): allergens, heating time and
method, shelf life / storage, net weight, nutrition, a vegan/vegetarian flag separate from the tags, and
the order of photos (plated soup vs. pouch). Per CLAUDE.md these must never be invented: the redesign
will show visible placeholders until you provide the facts.

---

## 4. Checkout

There are **two** server functions that create a Stripe Checkout page:

### 4a. One-time orders (cart): `api/create-cart-checkout.ts`, function `handler`

Called from `handleCartCheckout` in `App.tsx` (~line 628) when the customer picks a slot and presses "Proceder al pago".

| Setting | Today |
|---|---|
| Mode | `payment` (one-off) |
| Line items | One per soup, using its **Price ID sent by the browser**. Plus a $50 shipping line (also a Price ID) unless the order is pickup, which can't happen today (see section 5) |
| Locale (language) | **Not set**: Stripe guesses from the browser's language |
| Payment methods | **Not set in code**: whatever is switched on in the Stripe Dashboard (card; OXXO only if enabled there; I can't see the Dashboard) |
| Shipping | Stripe asks for a Mexican address (`shipping_address_collection: MX`). Shipping is charged as a normal line, not as a Stripe shipping rate |
| Phone | Stripe asks for it (`phone_number_collection`) |
| Discounts | 10+ items: the 20% coupon (`cartDiscount2CouponId` = `AJPfSuZo`, limited to individual soups). Otherwise the promo-code field is shown instead. Stripe doesn't allow both at once |
| `allow_promotion_codes` | `true` only when no volume discount applies |
| Metadata (saved on the payment) | `delivery_type`, `delivery_slot` (e.g. `slot_9_13`), `delivery_address`, `delivery_postal`. Also `delivery_phone` and `delivery_email`, always empty because the site never sends them |
| After paying | Back to `ondoclub.com/?payment=success&session_id=…`, which shows the success pop-up and fires the GA4 `purchase` event |

### 4b. Subscriptions: `api/create-checkout-session.ts`, function `handler`

Called from `handleCheckout` in `App.tsx` (~line 438) at the end of the funnel.

| Setting | Today |
|---|---|
| Mode | Decided by Stripe: if the plan's price is recurring → `subscription`, otherwise `payment`. **I can't see whether your six plans renew automatically or are charged once for 3 months.** See decision D4 |
| Line items | One: the plan's Price ID (`productId*` in `settings.json`), **sent by the browser** |
| Locale / payment methods | Not set (same as above) |
| Shipping | Address and phone collected. No shipping charge (delivery is included) |
| `allow_promotion_codes` | Always `true` |
| Metadata | `frequency`, `soups_per_delivery`, `selected_soups` (e.g. "Mega verde x2 \| Betabespelta x2"), `let_ondo_choose`, `contingencies` (notes), `delivery_slot`, `delivery_address`, `delivery_postal`. Stripe caps each value at 500 characters, and the code cuts them at 490 |

### 4c. Webhook

**There is none.** Stripe never notifies the site that a payment succeeded, failed, was refunded or
that a subscription was cancelled. Consequences:
- The team reads orders by hand in the Stripe Dashboard (payments + metadata).
- Nothing records orders anywhere else: no order sheet, no custom confirmation email (only Stripe's own receipt).
- The GA4 `purchase` event fires **only if the customer comes back to the site** after paying (see section 6).

There is also `server.ts`, a **second copy** of both checkout functions for running the site on a laptop.
It is not used on Vercel, and it has drifted from the real ones (see risk R7).

---

## 5. Delivery

**Postal code.** Before the first add-to-cart (and in step 2 of the subscription funnel), a pop-up asks
for an address and postal code and checks it against the 28 codes in `src/content/deliveryZones.json`.
- Inside the zone: the browser remembers "validated" (in `localStorage`) and doesn't ask again.
- Outside the zone: the customer can't continue. They can leave their email to be notified, and the address and email go to Google Sheets as a lead.
- **The server never re-checks.** On Stripe's page the customer can type a completely different address (risk R4).

**Delivery date.** Calculated in the visitor's browser by `getNextMonday()` (top of `App.tsx`):
- Tuesday to Sunday → the coming Monday. On a Monday → the Monday after (7 days).
- **There is no order cutoff.** An order on Sunday at 23:59 is promised for Monday morning.
- It's calculated **once, when the page loads**. A tab left open past midnight shows yesterday's answer.
- Monday is hard-coded. A second delivery day needs code changes.

**Time slots.** Three fixed slots, 9–13, 13–17 and 17–21, written into the code (the `t` object in
`App.tsx`), both in the cart and in the funnel. The choice is saved on the Stripe payment as
`delivery_slot` (`slot_9_13` / `slot_13_17` / `slot_17_21`).

**What's stored on the order:** the slot, the address and the postal code. **Not the delivery date.**
The team has to work it out from the order time.

**Pickup.** The texts exist ("Ninguna me viene bien / Recojo en tienda (Roma Norte) · Sin coste de
envío"), and the cart server function knows what to do with `pickup` (it skips shipping). But **no
screen offers it**, in the cart or in the funnel, and git history shows it was never shown in this
codebase. So pickup is **not possible today**, and every cart order pays $50 shipping. CLAUDE.md
currently says "Pickup (Roma Norte): free, no postal-code check" under *Current state*. That is wrong,
and I propose correcting it (decision D1).

---

## 6. Analytics

| What | Status |
|---|---|
| **Google Tag Manager** `GTM-TBTXDQ72` | Loaded on every page (`index.html`). Managed by the agency. **What it fires (GA4, ads, pixels) is decided inside GTM, which I can't see** |
| GA4 e-commerce events (via `dataLayer`, `src/analytics.ts`) | `view_item` (product pop-up), `view_item_list` (funnel opened), `add_to_cart`, `view_cart`, `begin_checkout` (cart and subscription), `select_plan` (subscription plan chosen), `purchase` |
| UTM campaign tags | Captured on arrival and attached to `purchase` |
| `purchase` safeguards | Fires once per Stripe session (no duplicates on refresh). Its items come from a snapshot saved at checkout |
| Meta / TikTok / other pixels | **None in the code** (could exist inside GTM) |
| Documentation | `docs/TRACKING.md`, `docs/VERIFICACION-TRACKING.md` |

**Gaps:**
- `purchase` only fires if the customer **returns to the site** after paying. Closing the tab = no purchase in GA4.
- The `purchase` value **leaves out shipping and any promo code** applied on Stripe's page (e.g. ONDOFIRST), so GA4 revenue will read higher than Stripe's.
- With **OXXO**, the customer "finishes" when they get the voucher, before paying. GA4 would count a purchase that may never be paid. (Only matters if OXXO is enabled.)
- No `remove_from_cart` event.
- The comment at the top of `analytics.ts` still says the GTM container is "pending". It isn't; it's live.

---

## 7. Risks

Ordered by how much they matter for the overhaul. 🔴 = fix before or during the next phases · 🟠 = plan for it · 🟢 = cleanup.

**🔴 R1. One 2,650-line file.** Every page, pop-up and the checkout logic live in `src/App.tsx`. Any
redesign touches the same file, so changes collide, mistakes spread, and reviewing a change is hard.
There are **no automated tests** and no checks beyond "it builds" (no GitHub Actions). *Recommendation:
split the file into pieces (header, shop, product page, cart, funnel) as part of Phase 1, before
redesigning, with no visual change.*

**🔴 R2. The servers trust the browser.**
- The cart server accepts **any Price ID and any coupon ID** the browser sends.
- The subscription server accepts **any Price ID** and decides the mode from it. For example, someone
  could send the $50 shipping price as a "plan" with a full list of soups in the metadata. The team
  fulfils from that metadata.

This needs someone technical, but it's real money. *The approved `price_data` change fixes the cart
side. The subscription side needs a short list of allowed plan Price IDs on the server.*

**🔴 R3. No webhook.** No reliable record of orders, failed or pending payments (OXXO), refunds or
cancellations. Analytics depends on the customer returning. The Phase 4 welcome code ("first order only,
not for returning customers") **can't be enforced** without some record of who has bought before.

**🔴 R4. Delivery rules live only in the browser.**
- The postal-code check is done once per browser and never on the server.
- The customer can enter another address at Stripe.
- No cutoff, no stored date, Monday hard-coded.

Free shipping "inside the zone only" (target state) can't be enforced like this.

**🟠 R5. Brand and accessibility gaps.** The theme colours in `src/index.css` are **not** the CLAUDE.md
brand palette:

| Use | On the site | CLAUDE.md brand |
|---|---|---|
| Orange buttons | `#F88D36` | CTA `#C2531A` |
| Green text | `#6E913F` | ink `#1F2E14` / greens `#2E4419`, `#3E5A22` |
| Background | `#EBEBD3` / `#F8F7F4` | cream `#EEEDD9`, card `#FFFDF6` |

Contrast measured:
- **White on the current orange buttons: 2.37:1** (fails the 4.5:1 rule). With the brand CTA orange it's 4.62:1 (passes).
- **Green text on beige: 3.0:1** (fails).

Other accessibility issues:
- The cart icon and 4 other clickable things are not real buttons.
- No icon-only button has a label for screen readers (0 `aria-label`s in the code).

Fonts:
- Headings use **Raisonne Pro**, body uses **Ronzino**, both self-hosted.
- Three Google fonts are also downloaded (Inter, Oswald, Outfit). Oswald is never used.
- There's a licence file for Ronzino but **none for Raisonne Pro**, and the Raisonne specimen PDF is publicly downloadable from the site. Worth confirming you have a web licence.

**🟠 R6. Texts are scattered.** Customer-facing text lives in three places:
- `settings.json`
- defaults in the `t` object in `App.tsx`
- dozens of inline `lang === 'es' ? … : …` strings

Changing a word can mean hunting in all three. Some pieces are Spanish-only. The "$90 por sopa" copy is
typed by hand and must be updated if plan prices change.

**🟠 R7. A drifted duplicate server.** `server.ts` copies both checkout functions for local use. It's
missing the `session_id` in the return link (so tracking can't be tested locally) and it logs cart
contents. Changes made in `api/` won't be in it. *Recommendation: delete it and run locally with Vercel's own tool.*

**🟠 R8. Template leftovers.**
- `vite.config.ts` copies `GEMINI_API_KEY` into the public website code if it's ever set. That would expose the key to anyone.
- `README.md` is the Google AI Studio template.
- `metadata.json` calls the project a "Kettle & Fire E-Commerce Clone".
- `KettleReference.html` (750 KB) is a competitor page saved as a reference.
- The package is named `react-example`.
- Unused libraries: `@google/genai`, `express`, `motion`.

None of these break the site, but they confuse whoever reads the code next (human or AI).

**🟢 R9. 220 MB of unused photos.** `public/images` holds 231 MB, mostly 8 original camera JPGs of
18–41 MB each. Visitors don't download them (the site uses the optimised versions in `public/images/cms/`),
but they are uploaded with every deploy and slow down every copy of the repo. Three of them are fallback
images for the "how it works" steps: if those settings were ever deleted, the homepage would suddenly
load ~80 MB.

**🟢 R10. Stripe coupon chore.** Every new soup must be added to the 20% coupon, which means creating a
new one, or Stripe charges full price while the cart shows −20%. It's documented in CLAUDE.md, and the
`price_data` build removes it.

**🟢 R11. Smaller items.**
- The success return link doesn't say which order was paid, so the success pop-up can't show order details.
- Stripe metadata is cut at 490 characters, which is fine for today's soup names.
- `delivery_phone` and `delivery_email` are always empty, because Stripe collects them on its own page instead.

---

## 8. Recommended order of work

**The mockups are not in the repo.** You referenced `/docs/mockups`, but it doesn't exist, and CLAUDE.md
only names four mobile mockups (Home, Producto, Carrito, Oferta de bienvenida) and mentions "Phase 4"
(welcome offer) and "Phase 5" (subscriptions). The plan below is **my proposal**, built from CLAUDE.md
and this audit. Please share the screenshots (I can add them to `docs/mockups/`) and correct the phases
if yours are different.

### Phase 0: Housekeeping (small, safe, no visual change)
- Correct CLAUDE.md about pickup (D1).
- Remove template leftovers: Gemini key line, README, `metadata.json`, `KettleReference.html`, unused libraries, `server.ts` (R7, R8).
- Move the 220 MB of original photos out of the website folder (keep them in Drive) (R9).
- Fix the `analytics.ts` comment.
- *Content and tooling only → can go to `main` after checks. Removing `server.ts` touches how checkout is tested, so it goes on a branch.*

### Phase 1: Foundations: structure, brand, accessibility
- Split `App.tsx` into components **with no visual change** (R1). Everything after this gets easier and safer.
- Apply the brand palette and fonts from CLAUDE.md as design tokens; fix contrast (CTA `#C2531A`, ink text) (R5).
- Real buttons and labels (accessibility); drop unused fonts.
- Gather all texts into `settings.json` (R6), so copy can be edited in one place.
- *Needs decisions D5 (palette), D6 (font licence).*

### Phase 2: Home + Producto (mockups)
- Redesign the homepage and product page, mobile-first at 390 px.
- Product page with the plated soup as main photo; visible placeholders for allergens, heating time, shelf life, etc. until you provide them.
- Literal CTAs ("Agregar", "Arma tu caja").
- *Needs the mockups (D7) and the product facts (D8).*

### Phase 3: Carrito + checkout + delivery (the money phase)
- **`price_data` checkout** (approved): prices and the 20% calculated on the server, test-mode catalog, no more coupon chore (R2, R10).
- **Free shipping**: box always; 7+ soups; 10+ with the 20%; inside the zone only.
- **Server-side zone check**, using the address entered on Stripe (R4).
- **Delivery date stored on the order**, an order cutoff, configurable delivery days.
- Pickup: build it or remove the leftover texts (D1).
- Out-of-zone: WhatsApp button next to the lead form (already decided).
- Subscription server: only accept your six plan Price IDs (R2).
- *Needs: Stripe test key in this environment; decisions D2 (cutoff), D3 (webhook), D9 (OXXO).*

### Phase 4: Oferta de bienvenida (ONDOFIRST 10%)
- First-order-only code: one-time orders, subscriptions and the box; never stacked with the 20%.
- Enforcing "first order / not for returning customers" **needs a record of past buyers**: a webhook (D3) or, at minimum, Stripe's built-in "first-time order" setting.
- Welcome-offer screen from the mockup.

### Phase 5: Subscriptions
- Move subscriptions off stored Price IDs; rework the funnel; decide prominence.
- Per-soup pricing is already on the site.
- *Needs D4 (are plans recurring or one-off?).*

**Why this order:** Phase 1 makes every later change cheaper and less risky. Home and Producto (Phase 2)
are the most visible and least risky to money. Phase 3 changes how money is collected, so it comes once
the code is easier to work in and the Stripe test key is in place. Phase 4 depends on Phase 3's
server-side pricing and on a decision about remembering past buyers. Phase 5 is the biggest Stripe change and goes last.

### Decisions needed from you

| # | Decision | Why it matters | Blocks |
|---|---|---|---|
| D1 | **Pickup**: build it (free, Roma Norte) or drop it? It doesn't exist today, though CLAUDE.md says "Pickup stays" | Changes the cart flow and shipping rules | Phase 0 (doc fix), Phase 3 |
| D2 | **Order cutoff**: day and time (e.g. Saturday 18:00) for Monday delivery | Today a Sunday-midnight order is promised for Monday morning | Phase 3 |
| D3 | **Webhook**: add one so the site records each paid order (e.g. to a Google Sheet) and knows past buyers? | Reliable orders, accurate GA4, OXXO, enforcing ONDOFIRST | Phases 3–4 |
| D4 | **Subscription billing**: in Stripe, do the six plans renew automatically (and how often), or are they charged once for 3 months? | The site says "3 meses · sin compromiso · cancela cuando quieras"; the code doesn't decide this, Stripe does | Phase 5, and accuracy of today's copy |
| D5 | **Palette**: confirm the CLAUDE.md colours replace the current site colours | Phase 1 visual change across the whole site | Phase 1 |
| D6 | **Raisonne Pro licence**: do you have a web licence? | Legal; otherwise switch to Outfit (the CLAUDE.md fallback) | Phase 1 |
| D7 | **Mockups**: share the screenshots and your Phase 1–5 list | My order may not match yours | Phase 2 onward |
| D8 | **Product facts**: allergens, heating time/method, shelf life, net weight per soup | Product page; never invented | Phase 2 |
| D9 | **OXXO**: is it enabled in Stripe? Do you want it? | Affects "paid" vs. "voucher issued", tracking and stock planning | Phase 3 |
| D10 | **GTM access**: can you get access (or a list of tags) from the agency? | To know what's actually tracked, and whether a Meta pixel exists | Analytics work |
