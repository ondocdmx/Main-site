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
- La web es **una sola app React** (`src/App.tsx`, ~2.800 líneas) + **3
  funciones de servidor** en `api/` que crean los pagos en Stripe.
- Se publica sola: **cada push a `main` en GitHub → Vercel la construye y la
  pone en `www.ondoclub.com` en 1-2 minutos.**
- Hoy los textos, sopas y fotos vienen de **Sanity** (un panel de contenido
  externo que es cuenta de Jesús). **Tu primera gran tarea es eliminar esa
  dependencia** (sección 6): el contenido pasará a vivir en archivos del repo
  y el dueño lo cambiará pidiéndotelo a ti.
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
| **Sanity** (proyecto `s3nnv28f`, panel `ondo.sanity.studio`) | Contenido (textos, sopas, fotos) | **Jesús** (temporal) | Lectura pública por API, sin cuenta. **Se elimina tras la migración** |
| **Google Sheets** (webhook) | Recibe el formulario "¿Qué sopa amas más?" | Dueño (verificar) | Variable `GOOGLE_SHEETS_WEBHOOK_URL` en Vercel |

⚠️ **El repo es PÚBLICO** en GitHub. Cualquiera puede leer el código y su
historial. Nunca escribas secretos en archivos del repo (ver sección 9).

---

## 2. Cómo se conecta el dueño contigo

### 2.1 Opción recomendada: Claude Code (app de escritorio, pestaña "Code", o claude.ai/code)

1. El dueño abre Claude → **Code**.
2. Conecta su cuenta de GitHub (`ondocdmx`) y elige el repo **`ondocdmx/Main-site`**.
   - En la versión web/nube (claude.ai/code) no necesita instalar nada en su
     computadora: tú trabajas en una copia en la nube, creas una rama y
     abres un Pull Request.
   - En la app de escritorio con carpeta local necesita: Git, Node 20+, y
     clonar el repo (`git clone https://github.com/ondocdmx/Main-site.git`).
     Si elige esta vía, guíalo paso a paso y haz tú los comandos.
3. Al abrir el repo, Claude Code carga `CLAUDE.md` → `AGENTS.md`
   automáticamente. Este documento está enlazado desde ahí.

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

- **Cambios de texto triviales** (una errata): el dueño puede autorizar
  ir directo a `main` sin PR. Pregúntale la primera vez qué prefiere y
  respeta su respuesta.
- **Cambios de dinero, checkout, routing o tracking**: SIEMPRE PR + preview +
  confirmación explícita.
- Ojo: en las *previews* de Vercel el pago puede no funcionar si
  `STRIPE_SECRET_KEY` solo está configurada para *Production*. No es un bug
  del cambio; verifica el checkout en local con la clave de test o después
  del merge.

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
| Contenido | Sanity (hasta la migración) → después archivos en `src/content/` |
| Analítica | `src/analytics.ts` → `window.dataLayer` → GTM de la agencia |
| Hosting | Vercel, framework `vite`, salida `dist/`, rewrites en `vercel.json` |

### 3.2 Archivos que importan

| Archivo | Qué es |
|---|---|
| `src/App.tsx` | **Toda la app**: estado, routing, tienda, ficha de producto, carrito, funnel de suscripción, modales, footer. El objeto `t` (arriba del archivo) tiene los textos por defecto en `es` y `en` |
| `src/analytics.ts` | Eventos de ecommerce (view_item, add_to_cart, begin_checkout, purchase…) |
| `src/sanityClient.ts` | Cliente de Sanity (lectura + escritura de leads). Desaparece con la migración |
| `src/index.css` | Estilos globales y tema Tailwind (colores `ondo-*`, fuentes) |
| `api/create-cart-checkout.ts` | Crea la sesión de Stripe del **carrito** (compra única) |
| `api/create-checkout-session.ts` | Crea la sesión de Stripe de la **suscripción** |
| `api/submit-soup-lead.ts` | Envía el formulario "¿Qué sopa amas más?" a Google Sheets |
| `vercel.json` | Rewrites de rutas SPA a `index.html` |
| `index.html` | Snippet de GTM, meta tags, fuentes |
| `public/images/`, `public/fonts/` | Imágenes y fuentes locales |
| `studio/` | Código del panel Sanity. Desaparece con la migración |
| `server.ts` | Servidor Express para probar `api/` en local (opcional, legado) |
| `docs/` | `TRACKING.md`, `VERIFICACION-TRACKING.md` (analítica), `TRASPASO.md` (accesos), `MANUAL-DEL-NEGOCIO.md` (para el dueño), `INSTRUCCIONES-SANITY.md` (obsoleto tras migrar) |

Basura heredada que puedes limpiar (con permiso): `README.md` (plantilla de
Google AI Studio, no describe el proyecto), `metadata.json`,
`KettleReference.html`, dependencia `@google/genai` y `GEMINI_API_KEY`
(no se usan), `migrate-to-sanity.mjs` y `scripts/*.mjs` (scripts de una vez).

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

### 3.4 Cómo se carga el contenido hoy

`fetchData()` en `App.tsx` pide a Sanity, en paralelo, 9 documentos de
ajustes (`siteSettings`, `productSettings`, `processSettings`,
`manifestoSettings`, `popupSettings`, `heroSettings`, `aboutSettings`,
`funnelSettings`, `footerSettings`), los tags, las zonas de reparto y los
productos. Los ajustes se **mezclan en un solo objeto** `settings` y se leen
con `getSetting(clave, valorPorDefecto)` / `getSettingText(...)`.

- Hay una pantalla de carga de **mínimo 1 segundo** a propósito (diseño).
- Textos bilingües: objetos `{ es, en }` resueltos con `resolveText()`.
  Si un ajuste no existe, se usa el texto por defecto del objeto `t`.
- Si Sanity devuelve 0 productos o falla, se muestran `MOCK_PRODUCTS`
  (sopas de demo). Si alguna vez ves "Crema de Elote" o "Pozole Rojo" en
  la web real, el contenido no cargó.
- Imágenes: objetos de imagen de Sanity convertidos a URL con `urlFor()`
  (CDN de Sanity). `resolveImage()` ya acepta también rutas en texto
  (`/images/...`), lo que facilita la migración.

---

## 4. El dinero: cómo funciona Stripe aquí

### 4.1 Principio rector

**El importe que se cobra lo decide Stripe, nunca la web.** La web solo
envía *Price IDs* (`price_...`). Los números que se ven en la web son
"escaparate" y deben coincidir con Stripe; si no coinciden, el cliente ve un
precio y paga otro → reclamaciones. Cada vez que toques un precio, verifica
ambos lados.

### 4.2 Compra única (carrito) — `api/create-cart-checkout.ts`

- Cada sopa tiene un `stripePriceId` (en Sanity hoy; en `src/content/`
  después). La query acepta también el nombre antiguo `stripeProductId`.
- El carrito no permite mezclar productos `single` con `subscription`
  (`purchaseType`).
- **Envío**: precio de Stripe en `shippingStripeProductId` (hoy
  `price_1TVdyM3Xzew6cmN1XeoTHlMC`, $50 mostrado en `shippingPrice`). No se
  cobra si el cliente elige *pickup*.
- **Descuentos por volumen**: dos escalones (`cartDiscount1*`,
  `cartDiscount2*`: mínimo de sopas, porcentaje, ID de cupón de Stripe y
  etiqueta). Si el porcentaje está vacío o en 0, el escalón desaparece de
  toda la web. El % mostrado es escaparate; lo que se cobra es el **cupón de
  Stripe** (`couponId`). Deben coincidir.
- **Regla de Stripe**: no se puede mandar `discounts` y
  `allow_promotion_codes` a la vez. Si aplica descuento por volumen → va el
  cupón y NO aparece el campo de código promo. Si no → aparece el campo
  (códigos tipo `ONDOFIRST`, creados en Stripe → Promotions).
- Los datos de entrega (franja, teléfono, email, dirección, CP) van en la
  `metadata` del pago. Stripe además pide dirección (solo MX) y teléfono.
- Precios mostrados, popup de producto y carrito usan `activeDiscount`:
  **al tocar descuentos revisa los tres sitios**.

### 4.3 Suscripción — `api/create-checkout-session.ts`

- Matriz frecuencia × cantidad: `quincenal|mensual` × `4|6|10` sopas.
- Cada combinación tiene en los ajustes del funnel: `productId{Frecuencia}{N}`
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
| "Sube la sopa X a $160" | 1) Pide al dueño (o con el conector de Stripe, tras confirmar) crear un **nuevo Price** de $160 en el producto de Stripe de esa sopa. Los precios de Stripe no se editan, se crean nuevos. 2) Cambia `stripePriceId` y `price` de esa sopa en el contenido. 3) PR + preview + merge. 4) Haz una compra de prueba o revisa el checkout. 5) Opcional: archivar el precio viejo en Stripe |
| "Quiero un código de descuento" | Se crea en **Stripe → Promotions** (cupón + código). No requiere código en la web. Si quiere anunciarlo, cambia el texto del banner intermedio |
| "Quita/cambia el descuento por cantidad" | Ajusta `cartDiscountN*`. Si cambia el %, debe crear el cupón correspondiente en Stripe y actualizar el `couponId` |
| "Cambia el precio de la suscripción" | Nuevo Price recurrente en Stripe → actualizar `productId…`, `amount…` y `price…` de esa combinación |
| "Cambia el envío" | Nuevo Price en Stripe → `shippingStripeProductId` + `shippingPrice` |
| "Reembolsa a un cliente" | Lo hace el dueño en Stripe → Pagos → Reembolsar (o tú con el conector, solo con confirmación explícita) |

---

## 5. Catálogo de producto

Campos de cada sopa (hoy en `studio/schemaTypes/product.ts`):

| Campo | Significado |
|---|---|
| `title`, `tagline`, `description`, `ingredients` | Textos `{es, en}` |
| `slug` | Identificador en la URL (`/sopas/sopa-tlalpena`) y en analítica (`item_id`). **No lo cambies** en sopas existentes: rompe links compartidos y la historia de GA4 |
| `price` | Precio mostrado (escaparate) |
| `stripePriceId` | Lo que se cobra |
| `purchaseType` | `single` / `subscription` |
| `order` | Orden en la tienda (menor = primero). **Evita empates** |
| `soldOut` | Overlay AGOTADO, bloquea compra |
| `onlySubscriptions` | Solo vía suscripción (overlay naranja) |
| `excludeFromFunnel` | No aparece en el selector de sopas de la suscripción (ej. el Box de 5) |
| `bgColor`, `image`, `hoverImage`, `images[]` | Visual |
| `tags[]` | Referencias a tags (nombre `{es,en}`, slug, icono, color) para filtros |

Estado del catálogo en el momento del traspaso (12 productos):

| order | Producto | precio | tipo | notas |
|---|---|---|---|---|
| -1 | Ondo Box: 5 sopas | 600 | single | excluido del funnel |
| 0 | garbanzo y rabo | 150 | single | |
| 0 | Estofado inglés | 150 | single | empate de order con el anterior |
| 1 | betabespelta | 125 | **subscription** | revisar si es intencional |
| 1 | calabaza de castilla dahl | 125 | single | |
| 1 | coliflor avellanada | 125 | single | |
| 2 | pro-gazpacho | 125 | single | ⚠️ **mismo Price ID que "mega verde"** |
| 2 | mega verde | 125 | single | ⚠️ ídem (`price_1TW40k…`) |
| 3 | berenjena y lenteja | 125 | single | |
| 3 | sopa tlalpeña | 150 | single | |
| 5 | salchispätzle | 150 | single | |
| 5 | cebolla caramelizada | 125 | single | |

**Pendientes a revisar con el dueño** (no los "arregles" sin preguntar):
1. *pro-gazpacho* y *mega verde* cobran el mismo Price de Stripe. Si son
   el mismo importe puede que no importe para el cobro, pero en Stripe
   aparecerán como el mismo producto (los reportes de ventas no
   distinguen). Probablemente hay que crear un Price propio para una.
2. Varios empates de `order` → orden aleatorio entre ellas. Proponer una
   numeración limpia (10, 20, 30… deja hueco para insertar).
3. *betabespelta* tiene `purchaseType: subscription`: no se puede mezclar en
   el carrito con las demás. Confirmar si es lo deseado.

---

## 6. TAREA PRIORITARIA: independizarse de Sanity

### 6.1 Por qué

- Sanity es cuenta de Jesús; el dueño no debe depender de un tercero.
- Con Claude, cambiar un texto en un archivo es tan fácil como en un panel,
  y queda versionado en Git (se puede deshacer cualquier cambio).
- **Privacidad**: el dataset de Sanity es público. Los "leads" de zona de
  reparto (direcciones y códigos postales que escriben los clientes, 21 a
  la fecha) son legibles por cualquiera que conozca la API. Hay que sacarlos
  de ahí.
- **Seguridad**: el archivo `migrate-to-sanity.mjs` tiene un token de Sanity
  escrito en el código, y el repo es público. Jesús debe revocarlo; tú
  borras el archivo.

### 6.2 Restricciones

- **Sanity sigue encendido hasta que la migración esté en producción y
  verificada.** No le pidas a Jesús que lo borre antes.
- El dataset es de lectura pública: puedes exportarlo **sin cuenta ni
  token**, con la API HTTP:
  `https://s3nnv28f.api.sanity.io/v2024-04-24/data/query/production?query=<GROQ url-encoded>`
- Las imágenes son públicas en
  `https://cdn.sanity.io/images/s3nnv28f/production/<id>-<ancho>x<alto>.<ext>`.
  Un `asset._ref` como `image-abc123-1200x800-jpg` corresponde a
  `abc123-1200x800.jpg`. Hay ~84 imágenes en el dataset (no todas se usan).
- Los leads contienen datos personales: **nunca** los subas al repo
  (público). Expórtalos a un CSV que le entregas al dueño fuera del repo
  (descarga local), y bórralo de cualquier carpeta del proyecto.
- El resultado visual de la web debe quedar **idéntico**. Comprueba
  página por página contra producción antes de hacer merge.

### 6.3 Plan paso a paso

1. **Rama**: `migracion/sin-sanity`.
2. **Script de exportación** `scripts/export-sanity.mjs` (Node, sin
   dependencias nuevas, usa `fetch`):
   - Ejecuta exactamente las mismas queries que `fetchData()` (copiar
     `PRODUCTS_QUERY` tal cual, con `coalesce` y tags desreferenciados).
   - Recorre el resultado y, para cada objeto de imagen (`{asset:{_ref}}`,
     también dentro de arrays como `heroImages` e `images`), descarga la
     imagen del CDN con `?w=1600&fm=webp&q=80`, guárdala en
     `public/images/cms/<nombre-legible>.webp` y reemplaza el objeto por la
     ruta en texto `/images/cms/<nombre>.webp`.
   - Escribe `src/content/settings.json` (el objeto mezclado, en el mismo
     orden de spread que `fetchData`), `src/content/products.json` (ya
     ordenado), `src/content/tags.json`, `src/content/deliveryZones.json`.
   - Quita campos internos de Sanity (`_rev`, `_createdAt`, `_updatedAt`,
     `_type` de los documentos de ajustes). Conserva `_id` de productos:
     el carrito y el checkout los usan.
   - Por separado, exporta los `deliveryLead` a un CSV **fuera del repo**
     para el dueño.
3. **App.tsx**:
   - Reemplazar `fetchData()` por imports estáticos de `src/content/*.json`.
     Mantener la pantalla de carga de ~1 s (el scroll de `/sopas` depende
     de `isLoading`); si el dueño prefiere quitarla, es decisión suya.
   - Cambiar los `urlFor(x).url()` del hero, pasos 1-3, ilustración del
     panel 3 y logo del footer por `resolveImage(x)` (ya soporta rutas).
     Eliminar la rama `urlFor` de `resolveImage`.
   - En `handleCartCheckout`, el `client.fetch(PRODUCTS_QUERY)` "fresco"
     ya no hace falta: usar los productos importados.
   - Eliminar `MOCK_PRODUCTS` y su lógica de fallback (ya no hay fetch que
     falle).
   - **Leads de zona de reparto** (`checkDelivery` y `submitNotifyEmail`
     usan `writeClient`): reemplazar por un `POST` a una función nueva
     `api/submit-delivery-lead.ts` que los mande a Google Sheets (copiar el
     patrón de `api/submit-soup-lead.ts`, mismo manejo de redirección de
     Apps Script). Pregunta al dueño si quiere guardar esos leads (útil
     para saber dónde piden reparto) o simplemente descartarlos. Por defecto:
     guardarlos en Sheets.
   - Borrar logs de depuración `console.log('[Sanity] …')`, `[SANITY IDs]`,
     `[CHECKOUT IDs]`.
4. **Limpieza**: borrar `src/sanityClient.ts`, `studio/`,
   `migrate-to-sanity.mjs`, `scripts/fix-drafts.mjs`,
   `scripts/migrate-i18n.mjs`; quitar `@sanity/client` y `@sanity/image-url`
   de `package.json` (`npm uninstall`). `scripts/export-sanity.mjs` puede
   borrarse tras usarse (o quedarse como referencia, sin datos).
5. **Variables**: quitar `VITE_SANITY_*` de `.env.example`; pedir al dueño
   que las borre en Vercel → Settings → Environment Variables. Añadir
   `GOOGLE_SHEETS_WEBHOOK_URL` a `.env.example` (sin valor) si no está.
6. **Verificación** (antes del merge, en local y en la preview):
   - `npm run lint` y `npm run build` sin errores.
   - Home, tienda, cada ficha `/sopas/<slug>`, filtros por tag, carrito,
     funnel `/soupscripciones` completo, footer, versión EN.
   - Cada sopa: el `stripePriceId` del JSON == el de Sanity (compáralos con
     un script, no a ojo).
   - Checkout carrito y suscripción hasta la página de Stripe (en local con
     `sk_test_…` y tarjeta `4242 4242 4242 4242`).
   - Validación de código postal (zona válida e inválida) y que el lead
     llega a Sheets.
   - En la consola del navegador: ninguna petición a `sanity.io`.
   - Eventos de `dataLayer` como en `docs/VERIFICACION-TRACKING.md`.
7. **Documentación** (en el mismo PR): actualizar `AGENTS.md`
   (sección contenido), `docs/TRASPASO.md`, `docs/MANUAL-DEL-NEGOCIO.md` y
   este documento (secciones 3.4, 5, 6 y 7) para reflejar que el contenido
   vive en `src/content/`. Borrar `docs/INSTRUCCIONES-SANITY.md` o
   reescribirlo como "cómo pedirle cambios a Claude".
8. **Merge** → comprobar `www.ondoclub.com` en vivo.
9. **Cierre**: avisar al dueño para que le diga a Jesús que ya puede
   **revocar los tokens y borrar el proyecto de Sanity**. Hasta entonces,
   no.

---

## 7. Operaciones del día a día (tras la migración)

| El dueño pide… | Dónde lo cambias |
|---|---|
| Cambiar un texto de la web | `src/content/settings.json` (busca la clave). Si no está, es el texto por defecto en el objeto `t` de `App.tsx`. **Cambia siempre `es` y `en`** (si el dueño solo da el español, propón la traducción y confírmala) |
| Añadir una sopa | Nuevo objeto en `src/content/products.json` (todos los campos de la sección 5) + foto en `public/images/cms/` (optimizada, webp, ~1600 px) + Price en Stripe. `_id` y `slug` únicos y estables |
| Marcar agotada / disponible | `soldOut: true/false` en la sopa |
| Reordenar la tienda | Campo `order` (sin empates) |
| Sacar una sopa de la suscripción | `excludeFromFunnel: true` |
| Quitar una sopa definitivamente | Mejor `soldOut: true` o retirarla del JSON pero **avisar** de que su URL dejará de funcionar |
| Cambiar foto | Reemplazar archivo en `public/images/cms/` (mismo nombre) u otro nombre y actualizar la ruta. Optimizar siempre (no subir fotos de 5 MB) |
| Cambiar zonas de reparto | `src/content/deliveryZones.json` → `allowedPostalCodes`. Lista vacía = acepta cualquier CP |
| Cambiar banner superior / intermedio | Claves `bannerText`, `showMidBanner`, `midBannerText` |
| Botón del hero | Claves `heroCTA` (texto) y `heroCTALink` (destino; `#shop` = tienda) |
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
| `GOOGLE_SHEETS_WEBHOOK_URL` | Vercel | URL de Apps Script del formulario de sopas (y leads tras migrar) |
| `VITE_SANITY_WRITE_TOKEN` (+ `VITE_SANITY_PROJECT_ID/DATASET`) | Vercel | **Se eliminan** tras la migración |

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

Las funciones `api/` en local: `npm run dev` solo sirve el frontend. Para
probar el checkout en local usa `vercel dev` (requiere `vercel login` con
la cuenta del dueño) o `npm run server` (`server.ts`, puerto 3001; ojo,
solo replica los dos endpoints de pago, no `submit-soup-lead`, y puede
estar desfasado respecto a `api/` — compáralo antes de fiarte).

---

## 13. Checklist de la primera sesión (Claude, haz esto primero)

1. Lee `AGENTS.md`, este documento, `docs/TRACKING.md`.
2. Confirma con el dueño que tiene acceso de admin a: GitHub
   (`ondocdmx`), Vercel (proyecto de ondoclub.com), Stripe, dominio.
3. Confirma que en Vercel existen `STRIPE_SECRET_KEY` (live),
   `FRONTEND_URL` y `GOOGLE_SHEETS_WEBHOOK_URL`.
4. Revisa con él los 3 pendientes de catálogo de la sección 5.
5. Propón hacer la migración de la sección 6 y, con su ok, ejecútala.
6. Recomiéndale hacer el repo privado (sección 9).
7. Tras la migración, avísale de que puede pedir a Jesús que borre Sanity.
