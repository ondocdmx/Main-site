# ONDO — Contexto completo para el Claude del dueño

> **Para Claude:** este documento es tu briefing de arranque. Léelo entero antes
> de hacer nada. Quien te habla es **el dueño de ONDO**: conoce su negocio a
> fondo pero **no es programador**. A partir de este traspaso tú eres su
> desarrollador: él te pide cambios en lenguaje normal y tú los haces,
> los verificas y los publicas, explicándole todo sin jerga.
>
> Complementa (no reemplaza) a `AGENTS.md`, que es el mapa técnico corto.
> Si algo de aquí contradice al código, **manda el código**: verifícalo y
> corrige este documento.

Fecha del traspaso: octubre 2026. Desarrollador anterior: Jesús Valenzuela
(AutomatoWebs).

---

## 0. Resumen en 30 segundos

- ONDO vende sopas en CDMX: **compra única** (carrito) y **suscripciones**
  quincenales/mensuales ("soupscripciones").
- La web es **una sola app React** (`src/App.tsx`, ~2.600 líneas) + **4
  funciones de servidor** en `api/` (2 crean los pagos en Stripe, 2 mandan
  formularios a Google Sheets).
- Se publica sola: **cada push a `main` en GitHub → Vercel la construye y la
  pone en `www.ondoclub.com` en 1-2 minutos.**
- Los textos, sopas y fotos viven **en archivos del repo** (`src/content/*.json`
  y `public/images/cms/`). Antes venían de Sanity (cuenta de Jesús); la
  migración está hecha (sección 6). El dueño cambia el contenido
  pidiéndotelo a ti.
- Los **leads** (contactos que deja la gente) llegan a su Google Sheets
  **"Customer Database"**. Si pregunta por leads, léelos de ahí con el
  conector de Google Drive (sección 14).
- El dinero vive en **Stripe** (cuenta del negocio). La web nunca decide
  cuánto se cobra: solo dice a Stripe *qué precio* (Price ID) cobrar.

---

## 1. Quién es dueño de qué

| Pieza | Para qué sirve | Dueño | Cómo accedes tú (Claude) |
|---|---|---|---|
| **GitHub** `ondocdmx/Main-site` | El código. Fuente de verdad | Dueño (cuenta `ondocdmx`) | Conectando el repo a Claude Code (sección 2) |
| **Vercel** | Hospeda la web y las funciones `api/`; despliega solo al hacer push | Dueño | Indirecto: haces push y Vercel despliega. Para ver logs o variables, se lo pides al dueño o usas el conector de Vercel si lo instala |
| **Stripe** | Cobros, precios, cupones, códigos promo, reembolsos | Dueño (cuenta del negocio) | No tienes acceso por defecto. Le dices al dueño qué clicar, o usa el conector de Stripe si lo instala (ver 2.3) |
| **Dominio** `ondoclub.com` | La dirección de la web | Dueño (registrador donde lo compró) | No lo toques. DNS apunta a Vercel. El apex redirige 307 a `www` (normal) |
| **Google Tag Manager / GA4** | Analítica. Container `GTM-TBTXDQ72` | Agencia de marketing del dueño | El código solo empuja eventos a `dataLayer`; la agencia configura GTM |
| **Sanity** (proyecto `s3nnv28f`) | Ya no se usa: el contenido se migró al repo | **Jesús** | Nada. **Se borra** cuando la migración esté en producción y verificada (sección 6.4) |
| **Google Sheets** (webhook) | Recibe el formulario "¿Qué sopa amas más?" y los leads de zona de reparto | Dueño (verificar) | Variables `GOOGLE_SHEETS_WEBHOOK_URL` (y opcional `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL`) en Vercel |

⚠️ **El repo es PÚBLICO** en GitHub. Cualquiera puede leer el código y su
historial. Nunca escribas secretos en archivos del repo (ver sección 9).

---

## 2. Cómo se conecta el dueño contigo

### 2.1 Cómo se conecta (Claude Code en la nube)

Requisito: plan de Claude **Pro, Max o Team** (el plan gratis no incluye
Claude Code). No hace falta instalar nada en su computadora.

1. Entrar a **claude.ai/code** (o la app de escritorio → pestaña **Code** →
   elegir **Cloud**, o la app del celular → pestaña **Code**).
2. **Conectar GitHub**: claude.ai/code lo pide al entrar → autorizar con la
   cuenta `ondocdmx`. Cuando lo ofrezca, **instalar la Claude GitHub App** en
   la cuenta `ondocdmx` (dar acceso a `Main-site`). Es imprescindible si el
   repo pasa a privado (recomendado, sección 9). Directo:
   https://github.com/apps/claude/installations/new
3. El entorno **Default** se crea solo (Pro/Max). Sirve tal cual: tiene
   acceso a npm, y no necesita claves (los secretos viven en Vercel).
4. En el selector de repositorio (debajo del cuadro de texto) elegir
   **`ondocdmx/Main-site`**, rama `main`. Modo de permisos: **Plan** si
   quiere revisar antes qué vas a hacer, o **Auto**/**Accept edits**.
5. Escribir la petición. Primera vez: *"Lee docs/CONTEXTO-CLAUDE-DUENO.md y
   haz el checklist de la primera sesión."*

Cómo vuelven los cambios a la web: trabajas en una copia en la nube y
**subes una rama** a GitHub. El dueño pulsa **Create PR** en la vista de
cambios → en el PR de GitHub aparece la **Preview de Vercel** → si le gusta,
pulsa **Merge pull request** en GitHub → Vercel publica en 1-2 min.

`CLAUDE.md` → `AGENTS.md` se cargan solos al abrir el repo, y desde ahí
llegas a este documento.

Alternativa (solo si el dueño quiere trabajar en su propia computadora):
app de escritorio → Code → **Local**; necesita Git, Node 20+ y clonar el
repo (`git clone https://github.com/ondocdmx/Main-site.git`). Guíalo y haz
tú los comandos.

El **chat normal** de Claude (sin "Code") puede leer el repo si conecta
GitHub como conector, pero no publica cambios: para editar la web, siempre
Claude Code.

### 2.2 Flujo de trabajo estándar (úsalo SIEMPRE salvo indicación contraria)

```
Dueño pide un cambio en palabras normales
  → tú lo entiendes y, si es ambiguo, preguntas UNA vez con opciones concretas
  → creas una rama (ej. `cambio/texto-hero-navidad`)
  → haces el cambio mínimo
  → `npm run lint` y `npm run build` (deben pasar)
  → commit (español, minúsculas, una línea) + push de la rama
  → abres un Pull Request en GitHub
  → Vercel genera una "Preview" (URL temporal) en el PR → se la das al dueño
  → el dueño mira la preview y dice "ok"
  → haces merge a `main` → Vercel publica en www.ondoclub.com (1-2 min)
  → compruebas la web en vivo y le confirmas al dueño
```

- **Decisión del dueño (27 oct 2026, reemplaza la anterior)**:
  - **Dinero y logística → rama + aprobación**: todo lo que toque checkout,
    precios, descuentos, Stripe, el carrito o la lógica de reparto va en
    una rama y espera el "ok" del dueño antes del merge a `main`. Incluye
    estos campos de los JSON: `price` y `stripePriceId` (`products.json`);
    `cartDiscount*`, `shipping*`, `productId*` y `amount*`
    (`settings.json`); todo `deliveryZones.json`.
  - **Solo contenido → directo a `main`**: textos, imágenes y textos de
    producto en los JSON pueden ir con push directo a `main`.
  - En ambos casos `npm run lint` + `npm run build` deben pasar antes del push.
- **Cambios de routing o tracking**: explícale al dueño qué cambia y espera
  su "ok" antes del push.
- Ojo: en las *previews* de Vercel el pago puede no funcionar si
  `STRIPE_SECRET_KEY` solo está configurada para *Production*. No es un bug
  del cambio; verifica el checkout en local con la clave de test o después
  del merge.
- **Comprueba que el merge llegó a producción**: en Vercel → Deployments
  debe aparecer una fila *Production* con el commit del merge en `main`.
  En octubre 2026 un merge no generó deploy (la web siguió con la versión
  anterior). Si pasa: Deployments → ⋯ → *Create Deployment* con la rama
  `main`, o un nuevo push a `main`.

### 2.3 Conectores opcionales (que el dueño puede añadir en Claude)

- **GitHub**: imprescindible (ya cubierto en 2.1).
- **Vercel** (conector/MCP oficial): te permite ver deploys, logs y
  variables de entorno sin pedirle capturas. Recomendado.
- **Stripe** (conector/MCP oficial): te permite consultar productos,
  precios, cupones y pagos. Si lo instala, pide que sea con una **clave
  restringida** (restricted key) de solo lectura al principio. **Nunca
  crees, modifiques o reembolses nada en Stripe sin confirmación explícita
  del dueño en el chat, mostrando antes qué vas a hacer y el importe.**

Comprueba en el directorio de conectores de Claude qué existe en ese
momento; no asumas.

---

## 3. Arquitectura técnica

### 3.1 Stack

| Pieza | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind 4, `lucide-react`, `motion` |
| Funciones servidor | Vercel Serverless Functions en `api/*.ts` (Node), SDK `stripe` |
| Contenido | Archivos JSON en `src/content/` + imágenes en `public/images/cms/` (sin CMS) |
| Analítica | `src/analytics.ts` → `window.dataLayer` → GTM de la agencia |
| Hosting | Vercel, framework `vite`, salida `dist/`, rewrites en `vercel.json` |

### 3.2 Archivos que importan

| Archivo | Qué es |
|---|---|
| `src/App.tsx` | **Toda la app**: estado, routing, tienda, ficha de producto, carrito, funnel de suscripción, modales, footer. El objeto `t` (arriba del archivo) tiene los textos por defecto en `es` y `en` |
| `src/analytics.ts` | Eventos de ecommerce (view_item, add_to_cart, begin_checkout, purchase…) |
| `src/content/*.json` | **El contenido**: `settings.json` (textos y ajustes), `products.json` (sopas, en orden de tienda), `tags.json` (filtros), `deliveryZones.json` (códigos postales) |
| `public/images/cms/` | Fotos del contenido (webp optimizado) |
| `src/index.css` | Estilos globales y tema Tailwind (colores `ondo-*`, fuentes) |
| `api/create-cart-checkout.ts` | Crea la sesión de Stripe del **carrito** (compra única) |
| `api/create-checkout-session.ts` | Crea la sesión de Stripe de la **suscripción** |
| `api/submit-soup-lead.ts` | Envía el formulario "¿Qué sopa amas más?" a Google Sheets |
| `api/submit-delivery-lead.ts` | Envía los leads de zona de reparto (CP, dirección, email si está fuera de zona) a Google Sheets |
| `vercel.json` | Rewrites de rutas SPA a `index.html` |
| `index.html` | Snippet de GTM, meta tags, fuentes |
| `public/images/`, `public/fonts/` | Imágenes y fuentes locales |
| `scripts/export-sanity.mjs` | Script de la migración (una vez). Solo referencia: Sanity se da de baja |
| `server.ts` | Servidor local (`npm run server`, :3001) que ejecuta las mismas funciones de `api/` que Vercel |
| `docs/` | `TRACKING.md`, `VERIFICACION-TRACKING.md` (analítica), `TRASPASO.md` (accesos), `MANUAL-DEL-NEGOCIO.md` (para el dueño) |

### 3.3 Routing (sin react-router)

La app lee `window.location.pathname`:

| Ruta | Qué muestra |
|---|---|
| `/` | Home: hero, banners, tienda (`#shop`), cómo funciona, nosotros, footer |
| `/sopas/:slug` | Home + ficha del producto abierta en modal (dispara `view_item`) |
| `/sopas` | Redirige a `/#shop` y hace scroll a la tienda cuando termina la carga |
| `/soupscripciones` | Home + funnel de suscripción abierto. Constante `SOUPSCRIPTION_ROUTE` |
| `?payment=success&session_id=…` | Vuelta de Stripe tras compra → evento `purchase` |
| `?subscription=success&session_id=…` | Vuelta de Stripe tras alta de suscripción |

**Si añades o cambias una ruta, actualiza también `vercel.json`**, si no,
la URL directa da 404 en producción.

### 3.4 Cómo se carga el contenido

`App.tsx` importa estáticamente los JSON de `src/content/` (van dentro del
bundle; no hay peticiones a ningún CMS):

- `settings.json` es un **objeto plano** con todas las claves (antes eran 9
  documentos de Sanity mezclados). Se leen con
  `getSetting(clave, valorPorDefecto)` / `getSettingText(...)`. Si una clave
  no existe, se usa el valor por defecto (muchos textos lo tienen en el
  objeto `t` de `App.tsx`), así que puedes **añadir** claves que hoy no
  están (ej. `heroCTALink`).
- `products.json` es un array **en el orden de la tienda** (no hay campo
  `order`: el orden es el del array).
- Textos bilingües: objetos `{ es, en }` resueltos con `resolveText()`.
- Imágenes: rutas en texto (`/images/cms/<nombre>.webp`) resueltas con
  `resolveImage()`.
- Hay una pantalla de carga de **~1 segundo** a propósito (diseño); el
  scroll de `/sopas` espera a que termine (`isLoading`). Si el dueño
  prefiere quitarla, es decisión suya.

---

## 4. El dinero: cómo funciona Stripe aquí

### 4.1 Principio rector

**El importe que se cobra lo decide Stripe, nunca la web.** La web solo
envía *Price IDs* (`price_...`). Los números que se ven en la web son
"escaparate" y deben coincidir con Stripe; si no coinciden, el cliente ve un
precio y paga otro → reclamaciones. Cada vez que toques un precio, verifica
ambos lados.

### 4.2 Compra única (carrito) — `api/create-cart-checkout.ts`

- Cada sopa tiene un `stripePriceId` en `src/content/products.json`.
- El carrito no permite mezclar productos `single` con `subscription`
  (`purchaseType`).
- **Envío**: precio de Stripe en `shippingStripeProductId` (pese al nombre es
  un Price ID; hoy `price_1TVdyM3Xzew6cmN1XeoTHlMC`, $50 mostrado en
  `shippingPrice`). `shippingStripePriceId` (`prod_…`) no lo usa el código.
  Gratis con 7+ sopas (`freeShippingMinSoups`) o si hay una caja
  (`boxShipsFree`); si no, se cobra (ONDO no hace recogida en tienda).
- **Motor de precios**: `priceCart()` en `src/commerce/priceCart.ts` calcula
  todo (subtotal, descuento, envío, total) para el carrito y para la API.
  El navegador solo manda `_id` + cantidad. Tests: `npm test`.
- **Descuento por volumen**: un escalón (`cartDiscount2*`: mínimo, porcentaje,
  ID de cupón de Stripe). Si el porcentaje está vacío o en 0, desaparece de
  toda la web. La caja (`isBox`) cuenta como 1 pero nunca recibe el 20%. El % mostrado es escaparate; lo que se cobra es el **cupón de
  Stripe** (`couponId`). Deben coincidir.
- **Regla de Stripe**: no se puede mandar `discounts` y
  `allow_promotion_codes` a la vez. Si aplica descuento por volumen → va el
  cupón y NO aparece el campo de código promo. Si no → aparece el campo
  (códigos tipo `ONDOFIRST`, creados en Stripe → Promotions).
- Los datos de entrega (franja, teléfono, email, dirección, CP) van en la
  `metadata` del pago. Stripe además pide dirección (solo MX) y teléfono.
- Precios mostrados, popup de producto y carrito leen el resultado de
  `priceCart()`: **al tocar reglas de dinero, cambia el motor y sus tests**.

### 4.3 Suscripción — `api/create-checkout-session.ts`

- Matriz frecuencia × cantidad: `quincenal|mensual` × `4|6|10` sopas.
- Cada combinación tiene en `settings.json`: `productId{Frecuencia}{N}`
  (Price ID de Stripe, recurrente), `amount{Frecuencia}{N}` (número que se
  muestra/trackea) y `price{Frecuencia}{N}` (texto visible).
- Las sopas elegidas **no son líneas de Stripe**: viajan en metadata
  `selected_soups` (texto separado por ` | `, máx. ~490 caracteres), junto a
  `frequency`, `soups_per_delivery`, `let_ondo_choose`, `contingencies`,
  `delivery_*`. El equipo de ONDO lee eso en Stripe para preparar el pedido.
- Siempre `allow_promotion_codes: true`.
- La función detecta si el Price es recurrente (`subscription`) o no
  (`payment`).

### 4.4 Cosas fijas

- `apiVersion` de Stripe: `'2024-06-20'`. No la cambies sin probar todo.
- Moneda: **MXN** (también en analítica). Algunas descripciones viejas del
  panel dicen "€": es un error de texto, ignóralo/corrígelo.
- `success_url` lleva `{CHECKOUT_SESSION_ID}`: lo usa el tracking para no
  duplicar compras. No lo quites.

### 4.5 Recetas de dinero (lo que el dueño pedirá)

| El dueño dice… | Qué haces |
|---|---|
| "Sube la sopa X a $160" | 1) Pide al dueño (o con el conector de Stripe, tras confirmar) crear un **nuevo Price** de $160 en el producto de Stripe de esa sopa. Los precios de Stripe no se editan, se crean nuevos. 2) Cambia `stripePriceId` y `price` de esa sopa en `src/content/products.json`. 3) PR + preview + merge. 4) Haz una compra de prueba o revisa el checkout. 5) Opcional: archivar el precio viejo en Stripe |
| "Quiero un código de descuento" | Se crea en **Stripe → Promotions** (cupón + código). No requiere código en la web. Si quiere anunciarlo, cambia el texto del banner intermedio |
| "Quita/cambia el descuento por cantidad" | Ajusta `cartDiscount2*` en `settings.json` (`Percent` vacío o 0 = desactivado; un solo escalón). Si cambia el %, debe crear el cupón correspondiente en Stripe y actualizar el `couponId` |
| "Cambia el precio de la suscripción" | Nuevo Price recurrente en Stripe → actualizar `productId…`, `amount…` y `price…` de esa combinación |
| "Cambia el envío" | Nuevo Price en Stripe → `shippingStripeProductId` + `shippingPrice` |
| "Reembolsa a un cliente" | Lo hace el dueño en Stripe → Pagos → Reembolsar (o tú con el conector, solo con confirmación explícita) |

---

## 5. Catálogo de producto

Campos de cada sopa (en `src/content/products.json`):

| Campo | Significado |
|---|---|
| `_id` | Identificador interno (carrito y funnel). Único y estable: para sopas nuevas usa algo legible, ej. `sopa-nueva-2026` |
| `title`, `tagline`, `description`, `ingredients` | Textos `{es, en}` |
| `slug` | Identificador en la URL (`/sopas/sopa-tlalpena`) y en analítica (`item_id`). **No lo cambies** en sopas existentes: rompe links compartidos y la historia de GA4 |
| `price` | Precio mostrado (escaparate) |
| `stripePriceId` | Lo que se cobra |
| `purchaseType` | `single` / `subscription` |
| `soldOut` | Overlay AGOTADO, bloquea compra |
| `onlySubscriptions` | Solo vía suscripción (overlay naranja) |
| `excludeFromFunnel` | No aparece en el selector de sopas de la suscripción (ej. el Box de 5) |
| `bgColor`, `image`, `hoverImage`, `images[]` | Visual. Imágenes = rutas `/images/cms/….webp` |
| `tags[]` | Copia de los objetos de `tags.json` que aplican (`_id`, `name {es,en}`, `slug.current`, `icon`, `color`). El filtro compara por `slug.current`; si cambias un tag en `tags.json`, cámbialo también en las sopas |

**Orden en la tienda = orden del array** en `products.json`.

Estado del catálogo en el momento del traspaso (12 productos, en el orden
de la tienda):

| # | Producto | precio | tipo | notas |
|---|---|---|---|---|
| 1 | Ondo Box: 5 sopas | 600 | single | excluido del funnel |
| 2 | garbanzo y rabo | 150 | single | |
| 3 | Estofado inglés | 150 | single | |
| 4 | betabespelta | 125 | single | |
| 5 | calabaza de castilla dahl | 125 | single | |
| 6 | coliflor avellanada | 125 | single | |
| 7 | pro-gazpacho | 125 | single | |
| 8 | mega verde | 125 | single | |
| 9 | berenjena y lenteja | 125 | single | slug `berenjena-al-fuego` |
| 10 | sopa tlalpeña | 150 | single | |
| 11 | salchispätzle | 150 | single | |
| 12 | cebolla caramelizada | 125 | single | |

**Pendientes resueltos con el dueño** (octubre 2026):
1. *mega verde* cobraba el Price de *pro-gazpacho*; ahora usa el suyo
   (`price_1TQYFh…`, confirmado por el dueño en Stripe).
2. *betabespelta* pasó de `subscription` a `single`: se compra en el
   carrito con las demás (el dueño la sacó de la suscripción).

---

## 6. Migración fuera de Sanity (hecha) y cierre pendiente

### 6.1 Por qué se hizo

- Sanity era cuenta de Jesús; el dueño no debe depender de un tercero.
- Con Claude, cambiar un texto en un archivo es tan fácil como en un panel,
  y queda versionado en Git (se puede deshacer cualquier cambio).
- **Privacidad**: el dataset de Sanity era de lectura pública y contenía los
  "leads" de zona de reparto (direcciones y códigos postales de clientes).
  Ahora esos leads van a Google Sheets (`api/submit-delivery-lead.ts`,
  sección 14) y los 21 históricos se entregaron al dueño en un CSV **fuera
  del repo**.
- **Seguridad**: `migrate-to-sanity.mjs` tenía un token de Sanity escrito en
  el código (repo público). El archivo se borró, pero sigue en el historial
  de Git: **el token debe revocarse** (lo hace Jesús al borrar el proyecto).

### 6.2 Qué se hizo (rama `migracion/sin-sanity`)

1. `scripts/export-sanity.mjs` leyó el dataset público con las mismas
   queries que usaba la web y escribió `src/content/{settings,products,tags,deliveryZones}.json`.
   Las imágenes usadas (54) se descargaron a `public/images/cms/*.webp` al
   mismo tamaño que servía la web (800 px fichas, 1600 px hero/pasos) y con
   el mismo recorte.
2. `App.tsx` importa esos JSON (sin `fetchData`, sin `urlFor`, sin
   `MOCK_PRODUCTS`); el checkout usa los productos importados; se mantiene
   la pantalla de carga de ~1 s.
3. Leads de zona → `api/submit-delivery-lead.ts` → Google Sheets.
4. Borrados: `src/sanityClient.ts`, `studio/`, `migrate-to-sanity.mjs`,
   `scripts/fix-drafts.mjs`, `scripts/migrate-i18n.mjs`,
   `docs/INSTRUCCIONES-SANITY.md`, dependencias `@sanity/*`.
5. Verificado: `npm run lint` + `npm run build`; web local idéntica a
   producción (home, las 12 fichas, filtros, carrito con descuento, funnel,
   EN); ninguna petición a `sanity.io`; los `stripePriceId` y demás valores
   del JSON comparados con Sanity por script (todos iguales).

### 6.3 Pendiente antes/después del merge

- **Leads**: comprobar que llega a la hoja una fila de zona de reparto
  (sección 14.3).
- **Vercel**: borrar `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET` y
  `VITE_SANITY_WRITE_TOKEN` (Settings → Environment Variables).
- Probar en la preview el checkout de carrito y suscripción hasta la página
  de Stripe.
- Tras el merge: comprobar `www.ondoclub.com` en vivo.

### 6.4 Cierre

Con la migración en producción y verificada, el dueño avisa a Jesús para
que **revoque los tokens y borre el proyecto de Sanity** (`s3nnv28f`).
Hasta entonces, no. A partir de ahí `scripts/export-sanity.mjs` deja de
funcionar (queda solo como referencia).

---

## 7. Operaciones del día a día (tras la migración)

| El dueño pide… | Dónde lo cambias |
|---|---|
| Cambiar un texto de la web | `src/content/settings.json` (busca la clave). Si no está, es el texto por defecto en el objeto `t` de `App.tsx`. **Cambia siempre `es` y `en`** (si el dueño solo da el español, propón la traducción y confírmala) |
| Añadir una sopa | Nuevo objeto en `src/content/products.json`, en la posición donde debe salir (todos los campos de la sección 5) + fotos en `public/images/cms/` (webp, ~800 px, < 300 KB) + Price en Stripe. `_id` y `slug` únicos y estables |
| Marcar agotada / disponible | `soldOut: true/false` en la sopa |
| Reordenar la tienda | Mover los objetos dentro del array de `products.json` |
| Sacar una sopa de la suscripción | `excludeFromFunnel: true` |
| Quitar una sopa definitivamente | Mejor `soldOut: true` o retirarla del JSON pero **avisar** de que su URL dejará de funcionar |
| Añadir/cambiar un filtro (tag) | `src/content/tags.json` + el mismo objeto en `tags[]` de cada sopa |
| Cambiar foto | Reemplazar archivo en `public/images/cms/` (mismo nombre) u otro nombre y actualizar la ruta. Optimizar siempre (no subir fotos de 5 MB) |
| Cambiar zonas de reparto | `src/content/deliveryZones.json` → `allowedPostalCodes`. Lista vacía = acepta cualquier CP |
| Cambiar banner superior / intermedio | Claves `bannerText`, `showMidBanner`, `midBannerText` |
| Botón del hero | Claves `heroCTA` (texto) y `heroCTALink` (destino; `#shop` = tienda; vacío o ausente = abre el funnel). `heroCTALink` hoy no existe en `settings.json`: añádela si hace falta |
| Precios / descuentos / envío | Sección 4.5 |
| Nueva página o sección | Es un cambio de diseño: propón un plan, muéstralo en preview |

---

## 8. Analítica (no romperla)

- Especificación completa: `docs/TRACKING.md`. Prueba manual:
  `docs/VERIFICACION-TRACKING.md`.
- `item_id` de los productos = `slug`. Cambiar slugs rompe la continuidad de
  datos en GA4.
- `purchase` se protege contra duplicados con `sessionStorage` y el
  `session_id` de Stripe. No toques `firePurchaseOnce` ni los `success_url`
  sin entender esto.
- GTM y GA4 los gestiona la agencia: si el dueño pide "ver ventas en
  Analytics", es cosa de la agencia/GA4, no del código.

---

## 9. Secretos y seguridad

| Variable | Dónde vive | Notas |
|---|---|---|
| `STRIPE_SECRET_KEY` | Vercel (Production: `sk_live_…`) y `.env` local (`sk_test_…`) | **Nunca** en el repo ni en el chat en claro |
| `FRONTEND_URL` | Vercel: `https://www.ondoclub.com` | Fallback de las URLs de retorno |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Vercel | URL de Apps Script del formulario de sopas y de los leads de zona de reparto |
| `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL` | Vercel (opcional) | Hoja aparte para los leads de zona; si no existe se usa la anterior |
| `VITE_SANITY_WRITE_TOKEN` (+ `VITE_SANITY_PROJECT_ID/DATASET`) | Vercel | Ya no se usan: **borrarlas** (sección 6.3) |

Reglas:
- El repo es público. `.env` está en `.gitignore`; nunca lo fuerces.
- Cualquier variable `VITE_*` acaba visible en el navegador. Nunca pongas
  ahí nada secreto.
- Si alguna vez se filtra una clave: rotarla en el servicio (Stripe →
  Developers → API keys), actualizar Vercel y redeploy. Explícaselo al dueño
  paso a paso.
- Si el dueño te pega una clave en el chat, úsala solo para lo que la
  pidió y recomiéndale rotarla si era la `sk_live`.
- Recomendación pendiente al dueño: **hacer el repo privado**
  (GitHub → Settings → Danger zone → Change visibility). Vercel sigue
  funcionando igual. Recuerda: lo que ya estuvo público en el historial
  debe considerarse expuesto (por eso se revocan tokens, no basta borrarlos).

---

## 10. Principios de trabajo (cómo debes comportarte)

1. **Habla como socio, no como programador.** Explica qué vas a cambiar y
   qué verá el cliente final, no cómo. Nada de jerga sin traducir.
2. **Confirma antes de tocar dinero.** Precios, cupones, envío, checkout,
   reembolsos: describe el cambio con importes concretos y espera un "sí".
3. **Cambios pequeños y reversibles.** Un cambio por PR. Todo se puede
   deshacer con Git: si algo sale mal en producción, revierte primero
   (`git revert` + push) y luego investiga.
4. **Verifica siempre.** `npm run lint` + `npm run build` antes de cada push;
   mira la preview; tras el merge, abre `www.ondoclub.com` y comprueba el
   cambio. No digas "listo" sin haberlo visto.
5. **Bilingüe.** Toda la web existe en español e inglés. Un texto nuevo sin
   su versión en inglés es un cambio incompleto.
6. **No rompas URLs.** Slugs, `/soupscripciones`, `/sopas/...` pueden estar
   en QR, Instagram, volantes. Si hay que cambiar una, deja redirección
   (`vercel.json`).
7. **Stripe es la verdad del dinero; el repo es la verdad del contenido.**
   No dupliques información en sitios distintos sin necesidad.
8. **Mantén este documento vivo.** Si cambias arquitectura, flujos o
   decisiones del negocio, actualiza este archivo y `AGENTS.md` en el mismo
   PR. El próximo Claude (o tú en otra sesión) depende de ello.
9. **Sé honesto con lo que no puedes hacer.** No tienes acceso al dashboard
   de Stripe, Vercel, el dominio o GTM salvo conectores. Dile al dueño
   exactamente dónde clicar.
10. **Convenciones del repo**: comentarios de negocio en español; commits en
    español, minúsculas, una línea; no añadir dependencias sin motivo; no
    reescribir `App.tsx` entero "para ordenarlo" sin que lo pida el dueño
    (es grande pero funciona; refactors grandes = riesgo sin beneficio
    visible).
11. **Imágenes ligeras**: webp, ~1600 px máximo, < 300 KB. La web carga en
    móviles en CDMX con datos.
12. **Datos personales** (direcciones, emails, teléfonos de clientes) nunca
    en el repo, nunca en logs públicos.

---

## 11. Cómo pedirme cosas (guía para el dueño — compártesela)

Ejemplos de peticiones que funcionan bien:

- "Marca la sopa tlalpeña como agotada hasta nuevo aviso."
- "Cambia el banner de arriba a 'ENVÍO GRATIS ESTA SEMANA' y en inglés
  'FREE SHIPPING THIS WEEK'."
- "Quiero lanzar una sopa nueva: [nombre], [descripción], $150, foto
  adjunta. Ya creé el precio en Stripe, el ID es price_…"
- "Pon el Box de 5 sopas primero en la tienda."
- "Quiero cambiar el precio de la suscripción mensual de 6 sopas a $X.
  Dime qué tengo que hacer en Stripe."
- "Enséñame cómo quedaría antes de publicarlo."
- "Algo se ve mal en el celular en la sección de cómo funciona" (+ captura).
- "¿Cuántas sopas tenemos agotadas ahora mismo?"

Lo que conviene que el dueño haga él mismo (o tú le guías):
- Todo lo que pase dentro de Stripe (crear precios, cupones, reembolsos)
  salvo que tengas conector y su autorización.
- Dar o quitar accesos a cuentas.
- Dominio y correo.

---

## 12. Arranque local (si trabajas en su computadora)

```bash
git clone https://github.com/ondocdmx/Main-site.git ondo && cd ondo
npm install
cp .env.example .env    # pedir al dueño STRIPE_SECRET_KEY de TEST (sk_test_…)
npm run dev             # http://localhost:3000
npm run lint            # typecheck
npm run build           # build de producción
```

Las funciones `api/` en local: `npm run dev` solo sirve el frontend. En otra
terminal, `npm run server` (`server.ts`, puerto 3001) ejecuta los cuatro
archivos de `api/` tal cual (no es una copia), y `npm run dev` le reenvía
`/api`. Usa una clave `sk_test_…` en `.env`. También vale `vercel dev`
(requiere `vercel login` con la cuenta del dueño).

---

## 13. Checklist de la primera sesión (Claude, haz esto primero)

1. Lee `AGENTS.md`, este documento, `docs/TRACKING.md`.
2. Confirma con el dueño que tiene acceso de admin a: GitHub
   (`ondocdmx`), Vercel (proyecto de ondoclub.com), Stripe, dominio.
3. Confirma que en Vercel existen `STRIPE_SECRET_KEY` (live),
   `FRONTEND_URL` y `GOOGLE_SHEETS_WEBHOOK_URL`.
4. Revisa con él los pendientes de catálogo de la sección 5 (resueltos en octubre 2026).
5. Revisa con él los pendientes de la sección 6.3 (Google Sheets, variables
   de Vercel) si la migración aún no está en producción.
6. Recomiéndale hacer el repo privado (sección 9).
7. Con la migración en producción y verificada, avísale de que puede pedir
   a Jesús que borre Sanity (sección 6.4).

---

## 14. Leads: dónde están y cómo consultarlos

### 14.1 Dónde viven

Todos los leads llegan al Google Sheets **"Customer Database"** del Drive del
dueño (`ondocdmx@gmail.com`), vía un Apps Script cuya URL está en
`GOOGLE_SHEETS_WEBHOOK_URL` (Vercel). El script escribe 4 columnas:

| Columna | Formulario de sopas (`api/submit-soup-lead.ts`) | Zona de reparto (`api/submit-delivery-lead.ts`) |
|---|---|---|
| Timestamp | fecha (UTC, ISO) | fecha (UTC, ISO) |
| Email | email del cliente | email solo si estaba fuera de zona y pidió aviso |
| Sopa que ama | la sopa que pidió | detalle: `CP 11800 · EN ZONA · <dirección>` |
| Fuente | `¿Qué sopa amas más?` | `Zona de reparto` |

Los leads de zona reutilizan la columna "Sopa que ama" para no tener que
cambiar el script. Si el dueño quiere columnas propias, la función ya manda
también `postalCode`, `address` e `isServiceable`: bastaría con que el
script (Extensiones → Apps Script en la hoja) los escriba, o crear una hoja
aparte y poner su URL en `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL`.

Los 21 leads históricos (de Sanity, mayo-julio 2026) no están en la hoja: se
le entregaron al dueño en un CSV. Si quiere, puede pegarlos en la hoja.

### 14.2 Cómo responder al dueño

Para leer la hoja necesitas el **conector de Google Drive** en Claude,
conectado con la cuenta `ondocdmx@gmail.com`. Si no lo tiene, pídele que lo
active (Ajustes → Conectores → Google Drive). Busca el archivo por su
nombre, "Customer Database".

Preguntas típicas: "¿cuántos leads hubo este mes?", "¿desde qué códigos
postales nos piden y no llegamos?" (filtra Fuente = Zona de reparto, `FUERA
DE ZONA`, agrupa por CP), "¿qué sopas piden más?", "dame los correos de
quienes pidieron aviso". Responde con números concretos y, si ayuda, una
tabla. Si muchos CP fuera de zona se repiten, propón ampliar
`src/content/deliveryZones.json`.

Son datos personales: nunca los copies al repo (es público), a issues, PRs
ni a ningún sitio público.

### 14.3 Si dejan de llegar leads

- Comprobar que `GOOGLE_SHEETS_WEBHOOK_URL` sigue en Vercel y que el Apps
  Script sigue desplegado como Web App (si alguien lo vuelve a desplegar,
  la URL cambia y hay que actualizarla en Vercel + redeploy).
- Prueba: en www.ondoclub.com, añadir una sopa al carrito, escribir un CP y
  ver que aparece la fila con Fuente "Zona de reparto".
- Los errores salen en los logs de Vercel de `api/submit-*-lead`.

