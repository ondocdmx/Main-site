# Manual de verificación — tracking ONDO (GTM → GA4)

Para el equipo de la agencia. Objetivo: validar end-to-end que los eventos
del ecommerce llegan a GA4 a través del container **GTM-TBTXDQ72**
(ya insertado y en producción en `www.ondoclub.com`).

La especificación completa de eventos está en `TRACKING.md`. Este manual es
la ruta de prueba y los comportamientos esperados.

## Estado actual

| Pieza | Estado |
|---|---|
| Web | `www.ondoclub.com` — SPA React, navegación interna por `pushState` (sin recarga) |
| GTM | Container `GTM-TBTXDQ72` insertado en `index.html` (script + noscript) |
| Eventos | Todos en `window.dataLayer`, formato GTM (`{ event, ecommerce: {...} }`) |
| Moneda | `MXN` fija. `value` = productos con descuento aplicado, **sin envío** |

## Requisitos de su lado (antes de empezar)

1. Container configurado: variables Data Layer (`ecommerce.transaction_id`,
   `ecommerce.value`, `ecommerce.items`, …), trigger **History Change** para
   `page_view` (es SPA: las vistas cambian sin recargar) y tag GA4.
2. Container **publicado** (o probar en modo Preview).
3. **DebugView** abierto en GA4 (Admin → DebugView).

## Ruta de prueba (10-15 min)

**0.** Conectar Preview de GTM a `www.ondoclub.com` y abrir DebugView.

**1. Aterrizar con UTMs de prueba** (se adjuntarán al `purchase`):

```
https://www.ondoclub.com/?utm_source=qa&utm_medium=test&utm_campaign=verificacion
```

→ Esperado: `page_view`.

**2. Abrir la ficha de una sopa** (click en cualquier producto del grid).

→ Esperado: `view_item` con `ecommerce.items[]` (+ `page_view` si su trigger
History Change está bien montado).

**3. Añadir al carrito** (botón + del producto). La primera vez pide
código postal (validación de zona de reparto) — es el flujo normal.

→ Esperado: `add_to_cart`.

**4. Abrir el carrito** (ícono superior derecho, con items dentro).

→ Esperado: `view_cart`.

**5. Continuar al pago**: elegir franja horaria → "Proceder al pago"
(redirige a Stripe).

→ Esperado: `begin_checkout` con `value` correcto (con 5+ artículos hay
descuento automático 10%, con 10+ el 20% — visible en el carrito).

**6. Completar la compra real.** La web vuelve con `?payment=success`.

→ Esperado: `purchase` con `transaction_id` (= session_id de Stripe),
`items[]`, `value`, `currency: MXN`, `checkout_type: "payment"` y
`utm{}` con los UTMs del paso 1.

**Opcional — suscripción:** menú "Suscripción" → completar el funnel →
`purchase` con `checkout_type: "subscription"`, item
`Soupcripción {frecuencia} · {n} sopas`.

## Comportamientos que NO son bugs

- **`purchase` se dispara una sola vez por transacción**: hay un guard por
  `transaction_id` — refrescar la página de confirmación NO lo re-dispara.
  Para re-probar, hacer una compra nueva.
- **La URL de éxito copiada a otra pestaña/navegador NO dispara `purchase`**:
  los items se reconstruyen de un snapshot en sessionStorage (misma pestaña,
  caduca a 2 h). Es una garantía anti-duplicados, no un fallo.
- La pantalla de carga inicial dura ~1 s (por diseño).
- `value` excluye el envío y refleja el descuento por volumen si aplica.
- El modal de código postal solo aparece la primera vez por sesión.

## Sobre la compra de prueba

- Es un **pago real**. Recomendado: la sopa más barata + opción pickup
  ("recojo en tienda") para no sumar envío.
- El **reembolso** lo ejecuta el negocio desde el dashboard de Stripe
  (no afecta al evento ya enviado a GA4).

## Checklist de aceptación

- [ ] `page_view` en carga inicial y en navegación interna
- [ ] `view_item` con `items[]`
- [ ] `add_to_cart`
- [ ] `view_cart`
- [ ] `begin_checkout` con `value` correcto
- [ ] `purchase` con `transaction_id` único + `items[]` + `utm{}`
- [ ] `purchase` y `begin_checkout` marcados como eventos clave en GA4
- [ ] Repetir la verificación en DebugView **sin Preview**, con el container
      ya publicado (tráfico real)
