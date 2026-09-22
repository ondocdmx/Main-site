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

## Bonus: nueva dirección de la suscripción

La suscripción ahora está en **ondoclub.com/soupscripciones**
(antes era `/soupcripciones`). El menú de la web ya apunta a la nueva
dirección; solo actualízala si la tienes impresa en QR o volantes.
