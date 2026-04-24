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
  ]
})
