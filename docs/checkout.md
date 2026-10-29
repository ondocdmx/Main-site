# Checkout del carrito (Stripe)

Cómo funciona el pago de las compras del carrito, qué hay que activar en Stripe y en Vercel, y cómo
probarlo en **modo test** sin cobrar a nadie. Las suscripciones van aparte (`api/create-checkout-session.ts`)
y no cambian hasta la Fase 5.

## 1. Qué pasa cuando alguien paga

1. El carrito manda al servidor solo **qué sopas y cuántas**, la franja, el código postal y la fecha.
   `api/create-cart-checkout.ts` recalcula todo con `priceCart()` desde `products.json`: nunca confía en
   precios del navegador.
2. Crea la sesión de Stripe Checkout:
   - en español (`es-419`), dirección solo en México;
   - **una línea por sopa** con el precio de `products.json` (`price_data`), apuntando al Product de
     Stripe de esa sopa (las ventas siguen sumando por sopa en los reportes);
   - el **envío** como opción de envío: "Entrega lunes 2 de noviembre, 9–13 h", $50 o $0;
   - **20% desde 10 artículos**: un cupón que el servidor crea solo (`ondo_bulk_20_…`), válido solo
     para las sopas individuales (ni la caja ni el envío). Si se añade una sopa nueva, el servidor
     crea un cupón nuevo con ella: ya no hay que tocar cupones a mano;
   - sin 20%, aparece el campo de código de Stripe para **ONDOFIRST** (10%, solo primer pedido; lo
     revisa Stripe). En la Fase 4 lo aplicará el servidor y el campo desaparece;
   - pago con **tarjeta** (Apple Pay y Google Pay salen solos si están activos en Stripe) y, si
     `oxxoEnabled` es `true` en `settings.json`, **OXXO** con ficha válida 1 día.
3. El cliente paga en Stripe y vuelve a la página de éxito (`api/checkout-summary.ts`).
4. Stripe avisa al **webhook** (`api/stripe-webhook.ts`), que apunta el pedido en la hoja "Pedidos":

| Evento de Stripe | Qué significa | Estado en la hoja |
|---|---|---|
| `checkout.session.completed` (pagado) | Tarjeta cobrada | `pagado` → **se entrega** |
| `checkout.session.completed` (sin pagar) | OXXO: ficha emitida | `pendiente_oxxo` → **no se entrega todavía** |
| `checkout.session.async_payment_succeeded` | OXXO pagado | `pagado` → se entrega |
| `checkout.session.async_payment_failed` | OXXO venció sin pagar | `oxxo_no_pagado` → no se entrega |

**Revisión manual** (correo a `reviewEmail`, hoy ondocdmx@gmail.com, una sola vez por pedido) cuando un
pedido pagado tiene:
- el código postal que escribió en Stripe **distinto** del que puso en el carrito;
- el código postal de Stripe **fuera de la zona** de reparto;
- un **OXXO confirmado después del corte** de su lunes (Stripe puede tardar hasta 1 día hábil en
  confirmar un pago en OXXO): el correo dice qué lunes toca entregarlo.

**Sin duplicados:** si Stripe manda el mismo aviso dos veces, el webhook lo ve en el pago
(`ondo_order_status`) y no hace nada; además la hoja actualiza la fila del pedido en vez de añadir otra.
Si la hoja falla, el webhook responde error y Stripe reintenta solo (hasta 3 días).

## 2. Variables en Vercel

Vercel → proyecto → Settings → Environment Variables. **Production** usa claves live; **Preview** usa
claves de test.

| Variable | Production | Preview |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` del endpoint **live** | `whsec_…` del endpoint **de test** |
| `ORDERS_WEBHOOK_URL` | URL de la hoja "Pedidos" (§4) | la misma, o la de una hoja de pruebas |
| `ORDERS_WEBHOOK_TOKEN` | la clave que pusiste en el script (§4) | igual |
| `FRONTEND_URL` | `https://www.ondoclub.com` | (vacío está bien) |

Tras cambiar variables hay que volver a desplegar (Deployments → ⋯ → Redeploy). Al redesplegar una
Preview, el entorno debe decir **Preview**: un redeploy o "Promote" a Production usa la clave live.

**Probar = Preview, nunca Production.** Las tarjetas de prueba (`4242…`) siempre se rechazan en
Production ("La solicitud se hizo en modo activo, pero con una tarjeta de prueba conocida"): es lo
correcto. La dirección `main-site-git-<rama>-…vercel.app` apunta al deployment **más nuevo** de la rama;
si ese es uno de Production, la Preview y su webhook de test dejan de funcionar hasta el siguiente push.
Una Preview con clave live se niega a abrir el pago (mensaje "Esta Preview usa la clave live de Stripe").

## 3. Qué activar en el Dashboard de Stripe

Hazlo **dos veces**: primero en modo test (interruptor "Test mode" arriba a la derecha) y luego en live.

1. **OXXO**: Settings → Payment methods → OXXO → Turn on. Si OXXO no está activo y `oxxoEnabled`
   es `true`, Stripe rechaza la sesión y **nadie puede pagar**: enciende `oxxoEnabled` solo después.
2. **Apple Pay**: Settings → Payment method domains → Add domain → `www.ondoclub.com` (y también
   `ondoclub.com`). Stripe verifica el dominio solo. Luego Settings → Payment methods → Apple Pay → On.
   Google Pay: Payment methods → Google Pay → On (no necesita dominio).
   Cuando estén activos, añade `"Apple Pay"` a `cartPaymentMethods` en `settings.json` para que el
   carrito lo muestre.
3. **Webhook**: Developers → Webhooks → Add endpoint.
   - URL live: `https://www.ondoclub.com/api/stripe-webhook`
   - Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`.
   - Copia el "Signing secret" (`whsec_…`) a `STRIPE_WEBHOOK_SECRET` en Vercel.
   - En test, el endpoint apunta a la URL fija de la rama en Vercel
     (`https://main-site-git-<rama>-ondos-projects-25e4ad16.vercel.app/api/stripe-webhook`). Si la
     Preview tiene "Deployment Protection", Stripe recibe un 401: activa "Protection Bypass for
     Automation" en Vercel y añade `?x-vercel-protection-bypass=<secreto>` a la URL del endpoint.

## 4. Hoja "Pedidos" (Apps Script)

1. Abre la hoja de Google donde quieres los pedidos (puede ser una pestaña nueva de "Customer Database").
2. Extensiones → Apps Script → borra lo que haya y pega `docs/apps-script/pedidos.gs`.
3. Configuración del proyecto (⚙️) → Propiedades del script → Añadir: `TOKEN` = una clave larga al azar.
4. Implementar → Nueva implementación → tipo **Aplicación web** → Ejecutar como: **Yo** → Acceso:
   **Cualquier persona** → Implementar → autoriza (Gmail y Hojas).
5. Copia la URL (`https://script.google.com/macros/s/…/exec`) a `ORDERS_WEBHOOK_URL` y la clave a
   `ORDERS_WEBHOOK_TOKEN` en Vercel.

La pestaña "Pedidos" se crea sola con el primer pedido. Contiene datos personales (nombre, correo,
teléfono, dirección): no la compartas fuera del equipo. También es la lista de compradores que la
Fase 4 necesita para el "solo primer pedido".

## 5. Catálogo de modo test (una vez, y al añadir sopas)

En modo test Stripe no ve los productos live. Para crear las sopas en test y guardar sus IDs en
`products.json` (`stripeTestProductId`):

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-test-catalog.mjs
```

Se puede correr las veces que haga falta (no duplica). Se niega a correr con una clave live. Después,
commit del `products.json`. Sin esto, la Preview responde "No pudimos abrir el pago".

## 6. Cómo probar en modo test

En la Preview de Vercel (claves de test). Fecha de caducidad: cualquiera futura; CVC: cualquier
número de 3 cifras; nombre y dirección: cualquiera (código postal de la zona, p. ej. 06700).

**Pago con tarjeta que funciona**
1. Carrito con 3 sopas, franja y CP 06700 → "Pagar".
2. En Stripe: la página está en español, el resumen muestra las sopas, "Entrega lunes …, 9–13 h" y $50.
3. Tarjeta `4242 4242 4242 4242` → Pagar.
4. Debes ver la página de éxito con el pedido. En la hoja: una fila `pagado`, `card`.
5. Repite con 6 vegetarianas (envío $0) y con 10 sopas (línea "20% desde 10 sopas", solo en las sopas).

**Tarjeta rechazada**
- `4000 0000 0000 0002`: Stripe dice "Tu tarjeta fue rechazada" y deja reintentar. No se crea pedido.
- `4000 0000 0000 9995`: rechazada por fondos insuficientes.
- `4000 0025 0000 3155`: pide autenticación 3D Secure (pulsa "Complete" en la ventana de prueba).

**OXXO** (con `oxxoEnabled: true` en una rama de prueba)
1. Elige OXXO en Stripe. El correo que escribas decide qué pasa con la ficha:

| Correo | Qué simula |
|---|---|
| `cualquiera+succeed_immediately@ejemplo.com` | Pagada al momento (aviso en segundos) |
| `cualquiera@ejemplo.com` | Pagada a los ~3 minutos |
| `cualquiera+expire_immediately@ejemplo.com` | Vence sin pagar al momento |
| `cualquiera+expire_with_delay@ejemplo.com` | Vence sin pagar a los ~3 minutos |

2. Al volver: página de éxito con "Tu pedido queda confirmado cuando pagues en OXXO" y el enlace a la
   ficha. Hoja: fila `pendiente_oxxo`.
3. Cuando Stripe confirma: la misma fila pasa a `pagado` (o a `oxxo_no_pagado` si vence).

(Fuente: guía de Stripe "OXXO payments → Test your integration"; revísala si algo no cuadra.)

**Revisión manual**
- Pon CP 06700 en el carrito y 01000 en la dirección de Stripe → al pagar, la fila dice
  "CP distinto…" y "fuera de zona", y llega **un** correo a ondocdmx@gmail.com.
- Reenvía el evento desde Stripe (Developers → Webhooks → el evento → Resend): no aparece una segunda
  fila ni un segundo correo.

**Sin Stripe en la nube (local)**: `npm run server` + `npm run dev`, y la CLI de Stripe reenvía los
avisos: `stripe listen --forward-to localhost:3001/api/stripe-webhook` (usa el `whsec_…` que imprime).

## 7. Antes de encender OXXO en producción

- [ ] OXXO activo en Stripe **live**.
- [ ] Webhook live creado y `STRIPE_WEBHOOK_SECRET` (live) en Vercel Production.
- [ ] Hoja "Pedidos" funcionando (`ORDERS_WEBHOOK_URL` y `ORDERS_WEBHOOK_TOKEN` en Production).
- [ ] Un pedido de prueba en test llegó a la hoja como `pendiente_oxxo` → `pagado`.
- [ ] El equipo sabe que **solo se entregan las filas `pagado`**.
- [ ] Entonces: `"oxxoEnabled": true` en `settings.json` (cambio de dinero: en rama y con aprobación de Omar).
