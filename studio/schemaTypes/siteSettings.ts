import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'bannerText',
      title: 'Top Banner Text',
      type: 'string',
      initialValue: 'APAPÁCHATE | ENVÍO GRATIS EN 12+ CARTONES',
    }),
    defineField({
      name: 'midBannerText',
      title: 'Middle Banner Text',
      type: 'string',
      initialValue: '¡Aprovecha un regalo con tu primer pedido usando código: ONDOFIRST!',
    }),
    defineField({
      name: 'navShop',
      title: 'Navigation: Shop',
      type: 'string',
      initialValue: 'TIENDA',
    }),
    defineField({
      name: 'navSubs',
      title: 'Navigation: Subscription',
      type: 'string',
      initialValue: 'SUSCRIPCIÓN',
    }),
    defineField({
      name: 'navSteps',
      title: 'Navigation: How it Works',
      type: 'string',
      initialValue: 'CÓMO FUNCIONA',
    }),
    defineField({
      name: 'navAbout',
      title: 'Navigation: About',
      type: 'string',
      initialValue: 'NOSOTROS',
    }),
    defineField({
      name: 'emptyCart',
      title: 'Empty Cart Message',
      type: 'string',
      initialValue: 'Tu carrito está vacío',
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal Text',
      type: 'string',
      initialValue: 'Subtotal',
    }),
    defineField({
      name: 'checkout',
      title: 'Checkout Button Text',
      type: 'string',
      initialValue: 'Ir a pagar',
    }),

    // ── CART DISCOUNTS ─────────────────────────────────────────────────
    defineField({
      name: 'cartDiscount1Min',
      title: 'Descuento 1 — mínimo de productos',
      type: 'number',
      description: 'Ej: 6 → se aplica cuando el carrito tiene 6 o más productos',
    }),
    defineField({
      name: 'cartDiscount1Label',
      title: 'Descuento 1 — etiqueta visible',
      type: 'string',
      description: 'Ej: 20% descuento',
    }),
    defineField({
      name: 'cartDiscount1CouponId',
      title: 'Descuento 1 — ID del cupón de Stripe',
      type: 'string',
      description: 'El ID del cupón que creaste en el Dashboard de Stripe (ej: DISC_20PCT)',
    }),
    defineField({
      name: 'cartDiscount2Min',
      title: 'Descuento 2 — mínimo de productos',
      type: 'number',
      description: 'Ej: 10 → se aplica cuando el carrito tiene 10 o más productos',
    }),
    defineField({
      name: 'cartDiscount2Label',
      title: 'Descuento 2 — etiqueta visible',
      type: 'string',
      description: 'Ej: 30% descuento',
    }),
    defineField({
      name: 'cartDiscount2CouponId',
      title: 'Descuento 2 — ID del cupón de Stripe',
      type: 'string',
      description: 'El ID del cupón que creaste en el Dashboard de Stripe (ej: DISC_30PCT)',
    }),
  ]
})
