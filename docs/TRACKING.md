# ONDO — Especificación de eventos de tracking (dataLayer)

Implementación completa en `src/analytics.ts`. Todos los eventos se envían a
`window.dataLayer`, consumidos por el **GTM de la agencia** (container
`GTM-TBTXDQ72` — snippet ya insertado en `index.html`).

## Configuración en GTM (agencia)

- Variable de tipo **Data Layer Variable** por cada campo usado (ej. `ecommerce.transaction_id`).
- Trigger **History Change** para `page_view` (es una SPA: los cambios de vista son `pushState`).
- En GA4, marcar `purchase` y `begin_checkout` como **conversiones**.

## Eventos ecommerce estándar

| Evento | Cuándo se dispara | Parámetros |
|---|---|---|
| `view_item` | Se abre la ficha de un producto (URL `/sopas/{slug}`, desde el grid o carga directa) | `ecommerce.items[]`, `value`, `currency` |
| `add_to_cart` | Se añade una unidad al carrito (grid, ficha, tras validar código postal) | ídem |
| `view_cart` | Se abre el panel del carrito (con items) | ídem |
| `begin_checkout` | Se inicia el pago en Stripe: carrito completo o plan de suscripción | ídem (+ `value` ya con descuento aplicado, sin envío) |
| `purchase` | Al volver del pago con éxito (`?payment=success` / `?subscription=success`) | + `transaction_id`, `checkout_type`, `utm{}` |

### Estructura de `items[]`

```json
{
  "item_id": "sopa-tlalpena",          // slug de Sanity (estable y único)
  "item_name": "Sopa tlalpeña",        // título en español
  "item_category": "Sopas",            // "Sopas" | "Soupcripciones"
  "price": 180,
  "quantity": 1
}
```

Los planes de suscripción se envían como item con `item_id` = Stripe Price ID,
`item_name` = `Soupcripción {frecuencia} · {n} sopas`, `item_category` = `Soupcripciones`.

## Eventos del funnel de suscripción

| Evento | Cuándo |
|---|---|
| `view_item_list` (`item_list_name: "soupscripciones"`) | Se abre el funnel (botones de suscripción o URL `/soupscripciones`) |
| `select_plan` (`plan_frequency`, `plan_soups`, `value`) | El usuario confirma su plan (pasa a elegir sopas) |
| `begin_checkout` | Inicia el pago del plan |
| `purchase` (`checkout_type: "subscription"`) | Alta de suscripción confirmada |

## Garantías técnicas

- **`purchase` no se duplica**: guard en `sessionStorage` por `transaction_id`
  (refrescar la página de confirmación no re-dispara), y la URL se limpia tras
  la primera lectura.
- **`transaction_id` único**: es el `session_id` de Stripe, añadido al
  `success_url` como `{CHECKOUT_SESSION_ID}` por las funciones
  `api/create-checkout-session.ts` y `api/create-cart-checkout.ts`.
- **Items del `purchase`**: se reconstruyen desde un snapshot guardado en
  `sessionStorage` al iniciar el checkout (caduca a las 2 h). Sin snapshot
  válido no se dispara (evita compras sin datos).
- **UTMs**: se capturan al aterrizar (`utm_source|medium|campaign|content|term`)
  y persisten en `sessionStorage` — sobreviven a la navegación y al redirect de
  Stripe (mismo origen, misma pestaña). Se adjuntan al `purchase` en `ecommerce.utm`.

## Notas / decisiones abiertas

- **Envío** excluido del `value` (GA4 = productos con descuento). Si se quiere
  revenue exacto incluyendo envío, hay que sumar `shippingPrice` — decidir.
- Moneda fija **MXN**.
- Sin GTM activo, los eventos solo quedan en `dataLayer` (inspeccionables en
  consola; en dev se loguean con `[dataLayer]`).
