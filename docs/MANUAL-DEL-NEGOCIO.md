# Manual de tu negocio online — ONDO

Guía no técnica para entender tu tienda y saber cómo cambiarla. Desde el
traspaso, tu "desarrollador" es **tu Claude**: le pides los cambios en
lenguaje normal y él los hace, te enseña una vista previa y los publica.

---

## Tu tienda son 4 piezas

| Pieza | Qué es | Dirección |
|---|---|---|
| **La web** | Lo que ven tus clientes | `ondoclub.com` |
| **El contenido** | Textos, sopas, fotos y zonas de reparto. Viven en archivos del proyecto; los cambia tu Claude cuando se lo pides | GitHub (`src/content/`) |
| **Los pagos** | Donde llega el dinero y viven los cupones | `dashboard.stripe.com` |
| **El hospedaje** | El "local" donde vive la web — se actualiza sola | Vercel (+ GitHub) |

Regla simple para orientarte:

> **Si es contenido** (textos, fotos, sopas, banners) → pídeselo a tu Claude.
> **Si es dinero** (precios, cobros, cupones, reembolsos) → Stripe (tu Claude
> te guía y luego conecta el precio nuevo en la web).
> **Si es diseño o funcionalidad nueva** → también tu Claude, con vista previa
> antes de publicar.

---

## Cómo cambiar la web

### Pidiéndoselo a tu Claude (sin tocar código)

Ejemplos de mensajes que funcionan bien:

| Quiero... | Escríbele algo como... |
|---|---|
| Cambiar textos de la portada o banners | "Cambia el banner de arriba a 'ENVÍO GRATIS ESTA SEMANA' (en inglés 'FREE SHIPPING THIS WEEK')" |
| Crear una sopa nueva | "Quiero lanzar [nombre], [descripción], $150, foto adjunta. El precio en Stripe es price_…" |
| Marcar una sopa como AGOTADA | "Marca la sopa tlalpeña como agotada" |
| Reordenar las sopas de la tienda | "Pon el Box de 5 sopas primero y la tlalpeña segunda" |
| Que una sopa no aparezca en los planes de suscripción | "Saca el box del selector de la suscripción" |
| Cambiar los descuentos por cantidad (5+ / 10+) | "Quiero 10% a partir de 5 sopas" (antes crea el cupón en Stripe) |
| Cambiar zonas de reparto por código postal | "Añade el CP 06700 a las zonas de reparto" |

Tu Claude te enseña una **vista previa** antes de publicar; cuando dices
"ok", en 1-2 minutos está en ondoclub.com. Todo queda guardado con
historial: cualquier cambio se puede deshacer.

### Desde Stripe (`dashboard.stripe.com`)

| Quiero... | Dónde |
|---|---|
| Crear un código de promoción (ej: ONDOFIRST) | Promotions → crear código |
| Ver pedidos y suscripciones cobradas | Pagos / Suscripciones |
| Reembolsar | Pagos → reembolsar |

**Importante:** el porcentaje de descuento de un cupón se define en Stripe.
La web solo guarda el ID del cupón para el descuento automático por
cantidad: crea el cupón en Stripe y pásale el ID a tu Claude.

### Dos cosas de dinero que valen la pena memorizar

1. **Cambiar el precio de una sopa** = crear el precio nuevo en Stripe →
   copiar su ID (`price_...`) → dárselo a tu Claude para que lo ponga en la
   sopa. (Se hace así para que la web nunca cobre un precio distinto al de
   Stripe.)
2. **Los códigos de promoción ya funcionan**: tus clientes pueden escribir
   su código en la página de pago. Detalle de Stripe: si el carrito ya tiene
   descuento automático por cantidad, no se puede añadir además un código —
   solo aparece el campo en carritos sin descuento automático.

---

## Las reglas de oro

1. **Mira la vista previa antes de decir "ok"** — lo que apruebas es lo que
   se publica.
2. **No borres productos** — márcalos como agotados. Borrar rompe links
   guardados y compartidos.
3. **Siempre en español e inglés** — si le das un texto solo en español, tu
   Claude te propondrá la traducción; revísala.
4. La dirección de la suscripción es **ondoclub.com/soupscripciones**
   (con "s"). Actualiza QR o volantes impresos si usan la antigua.

---

## Lo que haces tú directamente

- Todo lo que pasa **dentro de Stripe**: crear precios y cupones, ver
  pedidos, reembolsar (tu Claude te dice exactamente dónde clicar).
- Dar o quitar accesos a cuentas.
- Dominio y correo.

El proyecto incluye guías técnicas (`AGENTS.md` y
`docs/CONTEXTO-CLAUDE-DUENO.md`) para que cualquier programador — humano o
IA — entienda todo rápidamente.

---

## Tus leads (contactos de clientes)

Cuando alguien escribe su código postal para ver si repartimos en su zona
(y, si está fuera, deja su correo), o te cuenta qué sopa le gustaría en
"¿Qué sopa amas más?", queda guardado en tu repositorio **privado**
`ondo-leads` de GitHub.

No tienes que abrir nada: **pregúntaselo a tu Claude**. Por ejemplo:
"¿cuántos leads hubo este mes?", "¿desde qué códigos postales nos piden y
no llegamos?", "¿qué sopas piden más?".

---

## Resumen de cuentas

| Servicio | Para qué | URL |
|---|---|---|
| Claude | Tu desarrollador: cambios de contenido y diseño | claude.ai (pestaña Code) |
| Stripe | Pagos, cupones, reembolsos | dashboard.stripe.com |
| Vercel | Hospedaje y deploys | vercel.com/dashboard |
| GitHub | Código fuente | github.com/ondocdmx/Main-site |
| Google Analytics | Estadísticas de visitas y ventas | analytics.google.com |
