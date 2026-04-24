import { defineType, defineField } from 'sanity'

export const productSettings = defineType({
  name: 'productSettings',
  title: 'Product Section Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showProducts',
      title: 'Show Products Section',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'globalSubscriptionDiscount',
      title: 'Global Subscription Discount (%)',
      type: 'number',
      description: 'Default discount for subscriptions (e.g. 20 for 20%)',
      initialValue: 20
    }),
    defineField({
      name: 'filtersTitle',
      title: 'Filters Title',
      type: 'string',
      initialValue: 'Filtros'
    }),
    defineField({
      name: 'filterBundle',
      title: 'Filter: Bundle/Vegetarian',
      type: 'string',
      initialValue: 'Vegetariano'
    }),
    defineField({
      name: 'filterNew',
      title: 'Filter: Cold/New',
      type: 'string',
      initialValue: 'Frío'
    }),
    defineField({
      name: 'filterBestseller',
      title: 'Filter: Hot/Bestseller',
      type: 'string',
      initialValue: 'Caliente'
    }),
    defineField({
      name: 'filterVegan',
      title: 'Filter: Vegan',
      type: 'string',
      initialValue: 'Vegano'
    }),
    defineField({
      name: 'sortBy',
      title: 'Sort By Text',
      type: 'string',
      initialValue: 'Ordenar por'
    }),
    defineField({
      name: 'subscribeTab',
      title: 'Tab: Subscription',
      type: 'string',
      initialValue: 'Suscripción'
    }),
    defineField({
      name: 'singleTab',
      title: 'Tab: Single Purchase',
      type: 'string',
      initialValue: 'Una sola compra'
    }),
  ]
})
