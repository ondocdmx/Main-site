# ONDO — Guía para agentes de código (Claude/AI)

Proyecto e-commerce de sopas (México). Este documento es el mapa del proyecto
para cualquier asistente de IA o desarrollador que lo retome.

## Stack y piezas

| Pieza | Tecnología | Dónde |
|---|---|---|
| Web (frontend) | React 19 + TypeScript + Vite + Tailwind 4 | `src/App.tsx` (toda la app está aquí) |
| APIs de pago | Serverless functions (Vercel) + Stripe | `api/` |
| Panel de administración | Sanity Studio v3, hosteado en Sanity | `studio/` → https://ondo.sanity.studio |
| Hospedaje web | Vercel (deploy automático al push) | repo GitHub `ondocdmx/Main-site`, rama `main` |
| Analítica | GA4 vía dataLayer | `src/analytics.ts`, eventos en `docs/TRACKING.md` |

Sanity: projectId `s3nnv28f`, dataset `production` (ver `studio/sanity.cli.ts`).
Dominio: `www.ondoclub.com` (el apex redirige con 307 a www, es normal).

## Arranque (día 1)

```bash
git clone https://github.com/ondocdmx/Main-site.git ondo && cd ondo
npm install
cp .env.example .env    # rellenar valores (ver docs/TRASPASO.md sección 2)
npm run dev             # http://localhost:3000
```

Los secretos, las cuentas a ceder y la verificación post-traspaso están en
**`docs/TRASPASO.md`** — es el documento de entrada del proyecto.

## Comandos

```bash
# Web
npm run dev        # dev server en :3000
npm run lint       # tsc --noEmit (typecheck)
npm run build      # build de producción

# Studio (panel de administración)
cd studio
npm run dev        # studio local
npm run deploy     # publica el studio en ondo.sanity.studio (no interactivo)
```

Deploy a producción = `git push origin main` (Vercel construye solo, incluye
las funciones de `api/`). Cambios de schema en Sanity **requieren** además
`cd studio && npm run deploy`.

## Estructura de la app (`src/App.tsx`)

- Es una SPA con **routing por pathname** (sin react-router). Ver constante
  `SOUPSCRIPTION_ROUTE = '/soupscripciones'`:
  - `/sopas/:slug` → ficha de producto (modal)
  - `/sopas` → redirige a `/#shop` y hace scroll a la tienda (espera a que
    termine `isLoading`; la pantalla de carga dura mínimo 1s por diseño)
  - `/soupscripciones` → abre el funnel de suscripción sobre la home
- `vercel.json` reescribe esas rutas a `/index.html`.
- `fetchData()` mergea en un solo objeto varios documentos de Sanity
  (`siteSettings`, `heroSettings`, `funnelSettings`, etc.) — se leen con
  `getSetting(clave, default)`.
- Textos bilingües: tipo `translationRecord` `{es, en}`; resolver con
  `resolveText()`. El objeto `t` tiene defaults hardcodeados.
- **Fallback mock**: si Sanity devuelve 0 productos, la web muestra
  `MOCK_PRODUCTS` (datos de demo). No es un bug si aparecen: significa que
  el dataset está vacío o falló el fetch.
- El checkout de suscripción manda la selección de sopas en metadata de
  Stripe (`selected_soups`), no como line items.

## Dinero (Stripe)

- Cada producto en Sanity guarda un **Price ID de Stripe** (`stripePriceId`).
  Cambiar un precio = crear el Price nuevo en Stripe y pegar el ID en Sanity.
- **Carrito** (`api/create-cart-checkout.ts`): compras únicas. Descuentos por
  volumen configurados en Sanity (`cartDiscount1/2`: mínimo, %, couponId) —
  el frontend los lee dinámicos y la API aplica el cupón con `discounts`.
  **Stripe no permite `discounts` + `allow_promotion_codes` juntos**: si no
  hay descuento por volumen se habilita `allow_promotion_codes` (códigos
  tipo ONDOFIRST); si lo hay, el cupón automático va solo.
- **Suscripción** (`api/create-checkout-session.ts`): funnel quincenal/mensual
  × 4/6/10 sopas. Price IDs y montos en `funnelSettings` (`productId*`,
  `amount*`). Siempre con `allow_promotion_codes: true`.
- Envío: producto de Stripe + precio dinámico (`shippingStripeProductId` +
  `shippingPrice` en `siteSettings`); no se cobra en pickup.
- `apiVersion` de Stripe fijada en `'2024-06-20'`.

## Campos de producto importantes (`studio/schemaTypes/product.ts`)

- `order` (número) → orden en la tienda (asc). Evitar empates.
- `onlySubscriptions` → solo se vende vía suscripción (overlay naranja).
- `excludeFromFunnel` → no aparece en el selector de sopas del plan (boxes).
- `soldOut` → overlay AGOTADO, bloquea compra.
- `purchaseType` → single/subscription; el carrito no permite mezclar.

## Variables de entorno

Ver `.env.example`. En local usa `.env`; en Vercel deben estar configuradas:
`STRIPE_SECRET_KEY`, `FRONTEND_URL`, `VITE_SANITY_PROJECT_ID`,
`VITE_SANITY_DATASET`, `VITE_SANITY_WRITE_TOKEN` (usado por el frontend para
guardar leads de zona de reparto en Sanity — es un token con permisos de
escritura limitados a ese uso).

## Documentación relacionada

- `docs/TRASPASO.md` — accesos, secretos y verificación post-traspaso (leer primero).
- `docs/TRACKING.md` — eventos GA4 y garantías (purchase sin duplicados).
- `docs/INSTRUCCIONES-SANITY.md` — tareas del cliente paso a paso (CTA hero,
  box, orden, códigos promoción, descuentos).
- `docs/MANUAL-DEL-NEGOCIO.md` — manual no técnico para el dueño.

## Convenciones

- Contenido y comentarios de negocio: español. Commits: minúsculas, español,
  una línea describiendo el cambio.
- Cambios visibles por el cliente en Sanity requieren **Publish** (el studio
  avisa, pero recordarlo al probar).
- Al tocar routing, actualizar también `vercel.json` (rewrites).
- Al tocar precios/descuentos, verificar los tres puntos donde se pintan:
  grid de productos, popup de producto y carrito (todos usan `activeDiscount`).
