# Guía ONDO — 3 ajustes para la tienda (desde Sanity)

Entra al panel de administración: **ondo.sanity.studio**
Después de cada cambio, pulsa el botón azul **Publish** para que se vea en la web.

---

## 1. Que el botón de la portada lleve a la tienda

1. Abre **Hero Settings**.
2. En el campo **"Hero CTA — URL de destino"** escribe: `#shop`
3. Publish.

> Si lo dejas vacío también funciona: el botón llevará a la tienda igual.

---

## 2. Que el Box de 5 sopas NO aparezca al armar una suscripción

El box es una compra única — no tiene sentido que se pueda elegir como si fuera
"una sopa" dentro de un plan.

1. Abre **Product** y haz clic en el **Box de 5 sopas**.
2. Activa el interruptor **"🚫 Excluir del funnel de suscripción"**.
3. Publish.

> El box se sigue vendiendo con total normalidad en la tienda. Solo desaparece
> del paso donde el cliente arma su plan de sopas.

---

## 3. Que el Box de 5 sopas aparezca primero en la tienda

La tienda muestra primero los productos con el número de orden más bajo.

1. En el mismo **Box de 5 sopas**, busca el campo **Order**.
2. Escribe: `-1`
3. Publish.

> Importante: que ninguna otra sopa tenga el mismo número, o el orden entre
> ellas será aleatorio.

---

## 4. Códigos de promoción (como ONDOFIRST)

Los códigos **no se crean en Sanity** — se crean en el **Dashboard de Stripe**:
*Promotions → Crear código*. Puedes tener todos los que quieras (dos, tres…);
no hay que configurar nada por código en la web.

**Los clientes ya pueden escribir su código en la página de pago** (está
habilitado, tanto para compras normales como para suscripciones).

Una regla de Stripe que conviene conocer:

- Carrito **sin** descuento automático (menos de 5 sopas) → el cliente puede
  escribir su código sin problema.
- Carrito **con** descuento automático (5+ sopas) → el descuento se aplica
  solo, y en ese caso Stripe no permite añadir además un código. El campo
  de código solo aparece cuando no hay descuento automático.

El texto del banner que anuncia los códigos sí se cambia en Sanity:
**Site Settings → Middle Banner Text**.

---

## 5. Descuentos por cantidad (5+ y 10+ sopas)

Ahora se controlan completamente desde **Site Settings**:

| Campo | Qué hace |
|---|---|
| Descuento 1 — mínimo de productos | Desde cuántas sopas se aplica (hoy: 5) |
| Descuento 1 — porcentaje (%) | Cuánto se descuenta (hoy: 10) |
| Descuento 1 — ID del cupón de Stripe | El cupón que se aplica al cobrar |
| Descuento 2 — (ídem) | El segundo escalón (hoy: 10 sopas → 20%) |

Cambia el número, pulsa **Publish**, y la tienda (precios, carrito y avisos
de "añade 1 más") se ajusta sola. Si dejas un campo vacío, se usa el valor
actual (5/10% y 10/20%).

---

## Bonus: nueva dirección de la suscripción

La suscripción ahora está en **ondoclub.com/soupscripciones**
(antes era `/soupcripciones`). El menú de la web ya apunta a la nueva
dirección; solo actualízala si la tienes impresa en QR o volantes.
