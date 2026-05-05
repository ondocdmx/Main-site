import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'bannerText',
      title: 'Top Banner Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'showMidBanner',
      title: 'Show Middle Banner',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'midBannerText',
      title: 'Middle Banner Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'navShop',
      title: 'Navigation: Shop',
      type: 'translationRecord',
    }),
    defineField({
      name: 'navSubs',
      title: 'Navigation: Subscription',
      type: 'translationRecord',
    }),
    defineField({
      name: 'navSteps',
      title: 'Navigation: How it Works',
      type: 'translationRecord',
    }),
    defineField({
      name: 'navAbout',
      title: 'Navigation: About',
      type: 'translationRecord',
    }),
    defineField({
      name: 'emptyCart',
      title: 'Empty Cart Message',
      type: 'translationRecord',
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'checkout',
      title: 'Checkout Button Text',
      type: 'translationRecord',
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
