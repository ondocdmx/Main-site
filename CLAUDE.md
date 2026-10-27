@AGENTS.md

Ondo — ondoclub.com
Ondo is a soup-first food brand in Mexico City. We sell frozen, seasonal soups in 500 ml pouches,
delivered to customers' homes. Founders: Ana and Omar. Site language: Spanish (es-MX) first, English second.
How to work in this repo

* Always start by reading the relevant code and proposing a short plan. Wait for approval before editing.
* Work on a new git branch per task. Never push to main or deploy to production without explicit approval.
* Use Stripe TEST keys for all development. Never touch live keys.
* Keep changes small and reviewable. Explain what you changed in plain language at the end.
* Never invent facts: ingredients, allergens, shelf life, heating times, testimonials, prices, delivery

zones. If a fact is missing, use a visible placeholder like [TIEMPO DE CALENTADO] and list it in your summary.

* All customer-facing Spanish must have correct accents (tú, más, métete, decides) and use "tú".
* Mobile first: design and test at 390px width first, then desktop.
* Accessibility: real <button>/<a> elements, labels on inputs, touch targets ≥ 44px, text contrast ≥ 4.5:1.

Business rules (single source of truth: put these in one config file, never hard-code in components)

* Individual soup prices: $125 MXN (vegetarian/vegan) or $150 MXN (meat/fish), 500 ml each.
* Caja de bienvenida (5-soup box): $600 MXN, ALWAYS ships free.
* Shipping: $50 MXN. Free when the order has 7 or more individual soups, or contains a 5-soup box.
* 10+ soups: 20% off the soups AND free shipping.
* Welcome offer: 15% off the first order only, via a single-use code tied to an email.
* Only ONE discount per order. If an order qualifies for 20% (10+ soups), the 20% applies and the 15% does not.
* All free shipping applies only inside the delivery zone (list of postal codes in config).
* Delivery: Mondays only, three slots: 9–13 h, 13–17 h, 17–21 h. Order cutoff: [DÍA Y HORA LÍMITE].

Delivery days must be configurable (we may add a second day later).

* "Solo suscriptores" soups cannot be bought individually.

Brand

* Colors: cream background #EEEDD9, card #FFFDF6, ink #1F2E14, deep green #2E4419, mid green #3E5A22,

olive #6B8E3A (large text/graphics only), brand orange #E8711F (logo/accents),
CTA orange #C2531A with white text (passes contrast), light orange #F7A35C.

* Type: geometric bold display for headings (current brand font, or Outfit 700–800 as fallback),

clean sans for body (Inter or current body font).

* Voice: warm, playful, "apapacho". Playful in headlines; literal and clear on buttons

("Agregar", "Arma tu caja", "Pagar $475" — never vague CTAs like "¡Apapáchate!").

* Food photography: always show the plated, cooked soup as the main image. Pouch photos are secondary.

Reference

* Design mockups (mobile): Home, Producto, Carrito, Oferta de bienvenida. Omar will share screenshots.
* WhatsApp: +52 55 8525 9797 · Email: ondocdmx@gmail.com
