# Manual de tu negocio online — ONDO

Guía no técnica para entender tu tienda y saber qué puedes hacer tú solo
y cuándo pedirle ayuda a un desarrollador.

---

## Tu tienda son 4 piezas

| Pieza | Qué es | Dirección |
|---|---|---|
| **La web** | Lo que ven tus clientes | `ondoclub.com` |
| **El panel** | Donde TÚ cambias textos, sopas, fotos y precios | `ondo.sanity.studio` |
| **Los pagos** | Donde llega el dinero y viven los cupones | `dashboard.stripe.com` |
| **El hospedaje** | El "local" donde vive la web — se actualiza sola | Vercel (+ GitHub) |

Regla simple para orientarte:

> **Si es contenido** (textos, fotos, sopas, banners) → panel de Sanity.
> **Si es dinero** (precios, cobros, cupones, reembolsos) → Stripe.
> **Si es diseño o funcionalidad nueva** → desarrollador.

---

## Qué puedes hacer tú solo (sin tocar código)

### Desde el panel (`ondo.sanity.studio`)

| Quiero... | Dónde |
|---|---|
| Cambiar textos de la portada o banners | **Hero Settings** / **Site Settings** |
| Crear o editar una sopa (foto, descripción, tags) | **Product** |
| Marcar una sopa como AGOTADA | Product → interruptor "Sold Out" |
| Reordenar las sopas de la tienda | Product → campo **Order** (menor = primero) |
| Que el box no aparezca en los planes de suscripción | Product → interruptor "🚫 Excluir del funnel" |
| Cambiar los descuentos por cantidad (5+ / 10+) | **Site Settings** (mínimo y % de cada uno) |
| Cambiar zonas de reparto por código postal | **Delivery Zones** |

### Desde Stripe (`dashboard.stripe.com`)

| Quiero... | Dónde |
|---|---|
| Crear un código de promoción (ej: ONDOFIRST) | Promotions → crear código |
| Ver pedidos y suscripciones cobradas | Pagos / Suscripciones |
| Reembolsar | Pagos → reembolsar |

**Importante:** el porcentaje de descuento de un cupón se define en Stripe.
En el panel solo se pega el ID del cupón para el descuento automático por
cantidad (instrucciones abajo).

### Dos cosas de dinero que valen la pena memorizar

1. **Cambiar el precio de una sopa** = crear el precio nuevo en Stripe →
   copiar su ID (`price_...`) → pegarlo en la sopa, en el panel. (Se hace
   así para que la web nunca cobre un precio distinto al de Stripe.)
2. **Los códigos de promoción ya funcionan**: tus clientes pueden escribir
   su código en la página de pago. Detalle de Stripe: si el carrito ya tiene
   descuento automático (5+ sopas), no se puede añadir además un código —
   solo aparece el campo en carritos sin descuento automático.

---

## Las reglas de oro

1. **Siempre pulsa "Publish"** en el panel después de cambiar algo — si no,
   no se publica.
2. **No borres productos** — márcalos como "Sold Out". Borrar rompe links
   guardados y compartidos.
3. **No repitas números en "Order"** — si dos sopas empatan, su orden entre
   ellas es aleatorio.
4. La dirección de la suscripción es **ondoclub.com/soupscripciones**
   (con "s"). Actualiza QR o volantes impresos si usan la antigua.

---

## Cuándo llamar al desarrollador

- Cambios de diseño, colores o secciones nuevas
- Precios nuevos (crearlos en Stripe y conectarlos bien)
- Problemas de cobro, dominio o correo
- Cualquier cosa que implique tocar código

Para eso, entrégale la carpeta del proyecto: incluye una guía técnica
(`AGENTS.md`) pensada para que cualquier programador — humano o IA —
entienda todo rápidamente.

---

## Paso a paso de las tareas más comunes

Están detalladas con capturas de ruta en `INSTRUCCIONES-SANITY.md`
(en la carpeta `docs/`): cambiar el botón de la portada, sacar el box de
la suscripción, reordenar la tienda y configurar descuentos.

---

## Resumen de cuentas

| Servicio | Para qué | URL |
|---|---|---|
| Sanity | Panel de administración | ondo.sanity.studio |
| Stripe | Pagos, cupones, reembolsos | dashboard.stripe.com |
| Vercel | Hospedaje y deploys | vercel.com/dashboard |
| GitHub | Código fuente | github.com/ondocdmx/Main-site |
| Google Analytics | Estadísticas de visitas y ventas | analytics.google.com |
