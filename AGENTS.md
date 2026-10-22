# ONDO — Guía para agentes de código (Claude/AI)

Proyecto e-commerce de sopas (México). Este documento es el mapa del proyecto
para cualquier asistente de IA o desarrollador que lo retome.

> **Si trabajas con el dueño de ONDO** (traspaso de octubre 2026): lee
> también **`docs/CONTEXTO-CLAUDE-DUENO.md`** — contexto completo, accesos,
> principios de trabajo y recetas de cambios habituales.

## Stack y piezas

| Pieza | Tecnología | Dónde |
|---|---|---|
| Web (frontend) | React 19 + TypeScript + Vite + Tailwind 4 | `src/App.tsx` (toda la app está aquí) |
| APIs de pago | Serverless functions (Vercel) + Stripe | `api/` |
| Contenido (textos, sopas, fotos, zonas) | Archivos JSON en el repo (antes Sanity) | `src/content/*.json`, fotos en `public/images/cms/` |
| Leads (formularios) | Serverless → Google Sheets (Apps Script) | `api/submit-soup-lead.ts`, `api/submit-delivery-lead.ts` |
| Hospedaje web | Vercel (deploy automático al push) | repo GitHub `ondocdmx/Main-site`, rama `main` |
| Analítica | GA4 vía dataLayer | `src/analytics.ts`, eventos en `docs/TRACKING.md` |

No hay CMS ni base de datos: el contenido se cambia editando los JSON y se
publica con push, igual que el código.
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
```

Deploy a producción = `git push origin main` (Vercel construye solo, incluye
las funciones de `api/`).

## Estructura de la app (`src/App.tsx`)

- Es una SPA con **routing por pathname** (sin react-router). Ver constante
  `SOUPSCRIPTION_ROUTE = '/soupscripciones'`:
  - `/sopas/:slug` → ficha de producto (modal)
  - `/sopas` → redirige a `/#shop` y hace scroll a la tienda (espera a que
    termine `isLoading`; la pantalla de carga dura mínimo 1s por diseño)
  - `/soupscripciones` → abre el funnel de suscripción sobre la home
- `vercel.json` reescribe esas rutas a `/index.html`.
- El contenido se importa estático desde `src/content/` (ver sección
  Contenido). Los ajustes se leen con `getSetting(clave, default)` /
  `getSettingText(...)`; si una clave no existe se usa el default (muchos
  textos tienen default en el objeto `t` de `App.tsx`).
- Textos bilingües: objetos `{es, en}`; resolver con `resolveText()`.
- Imágenes: rutas en texto (`/images/cms/x.webp`), resueltas con
  `resolveImage()`.
- Pantalla de carga de ~1 s a propósito (diseño); el scroll de `/sopas`
  espera a `isLoading`.
- El checkout de suscripción manda la selección de sopas en metadata de
  Stripe (`selected_soups`), no como line items.

## Contenido (`src/content/`)

Exportado de Sanity en octubre 2026 con `scripts/export-sanity.mjs` (queda
como referencia: Sanity se da de baja tras la migración). Se edita a mano:

| Archivo | Qué contiene |
|---|---|
| `settings.json` | Objeto plano con todos los ajustes: textos (`{es,en}`), banners (`bannerText`, `showMidBanner`, `midBannerText`), hero (`heroTitle`, `heroCTA`, `heroCTALink`, `heroImages`), pasos (`step1Title`…), manifiesto (`panel*`), funnel (`intro*`, `productId*`, `amount*`, `price*`), footer, envío, descuentos por volumen |
| `products.json` | Array de sopas **en el orden en que se muestran** en la tienda |
| `tags.json` | Filtros de la tienda (`name {es,en}`, `slug.current`, `icon`, `color` = clase Tailwind) |
| `deliveryZones.json` | `allowedPostalCodes` (lista vacía = acepta todos) y mensajes dentro/fuera de zona |

Imágenes en `public/images/cms/` (webp, ~800 px las de producto, ~1600 px
hero/pasos; < 300 KB). Al añadir fotos, optimizarlas igual.

## Dinero (Stripe)

- Cada producto de `products.json` guarda un **Price ID de Stripe**
  (`stripePriceId`). Cambiar un precio = crear el Price nuevo en Stripe y
  poner el ID (y el `price` mostrado) en el JSON.
- **Carrito** (`api/create-cart-checkout.ts`): compras únicas. Descuentos por
  volumen en `settings.json` (`cartDiscount1/2`: `Min`, `Percent`, `CouponId`; `Percent` vacío/0 = escalón desactivado) —
  el frontend los lee dinámicos y la API aplica el cupón con `discounts`.
  **Stripe no permite `discounts` + `allow_promotion_codes` juntos**: si no
  hay descuento por volumen se habilita `allow_promotion_codes` (códigos
  tipo ONDOFIRST); si lo hay, el cupón automático va solo.
- **Suscripción** (`api/create-checkout-session.ts`): funnel quincenal/mensual
  × 4/6/10 sopas. Price IDs y montos en `settings.json` (`productId*`,
  `amount*`, `price*`). Siempre con `allow_promotion_codes: true`.
- Envío: `shippingStripeProductId` (pese al nombre, es el **Price ID**
  `price_…` que se cobra) + `shippingPrice` (importe mostrado) en
  `settings.json`; no se cobra en pickup. `shippingStripePriceId` (`prod_…`)
  no lo usa el código.
- `apiVersion` de Stripe fijada en `'2024-06-20'`.

## Campos de producto (`src/content/products.json`)

- `_id` → identificador interno estable (carrito y funnel). Único, no cambiarlo.
- `slug` → URL `/sopas/<slug>` e `item_id` de GA4. No cambiarlo en sopas existentes.
- `title`, `tagline`, `description`, `ingredients` → `{es, en}`.
- `price` (mostrado) + `stripePriceId` (cobrado): deben coincidir.
- `image`, `hoverImage`, `images[]` (galería de la ficha), `bgColor`, `tags[]`
  (copias de objetos de `tags.json`: `_id`, `name`, `slug`, `icon`, `color`).
- Orden en la tienda = orden del array.
- `onlySubscriptions` → solo se vende vía suscripción (overlay naranja).
- `excludeFromFunnel` → no aparece en el selector de sopas del plan (boxes).
- `soldOut` → overlay AGOTADO, bloquea compra.
- `purchaseType` → single/subscription; el carrito no permite mezclar.

## Variables de entorno

Ver `.env.example`. En local usa `.env`; en Vercel deben estar configuradas:
`STRIPE_SECRET_KEY`, `FRONTEND_URL`, `GOOGLE_SHEETS_WEBHOOK_URL` (Apps Script
que recibe el formulario de sopas y los leads de zona de reparto) y,
opcional, `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL` (hoja aparte para los leads
de zona). Ninguna `VITE_*` es necesaria; nunca pongas secretos en `VITE_*`.

Los leads de zona de reparto (dirección, CP, email) son datos personales:
nunca al repo (es público) ni a logs.

## Documentación relacionada

- `docs/TRASPASO.md` — accesos, secretos y verificación post-traspaso (leer primero).
- `docs/TRACKING.md` — eventos GA4 y garantías (purchase sin duplicados).
- `docs/CONTEXTO-CLAUDE-DUENO.md` — contexto completo para el Claude del dueño.
- `docs/MANUAL-DEL-NEGOCIO.md` — manual no técnico para el dueño.

## Convenciones

- Contenido y comentarios de negocio: español. Commits: minúsculas, español,
  una línea describiendo el cambio.
- Al tocar textos, cambiar siempre `es` y `en`.
- Al tocar routing, actualizar también `vercel.json` (rewrites).
- Al tocar precios/descuentos, verificar los tres puntos donde se pintan:
  grid de productos, popup de producto y carrito (todos usan `activeDiscount`).
