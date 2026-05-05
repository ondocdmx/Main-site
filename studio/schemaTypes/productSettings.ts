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
      type: 'translationRecord',
    }),
    defineField({
      name: 'filterBundle',
      title: 'Filter: Bundle/Vegetarian',
      type: 'translationRecord',
    }),
    defineField({
      name: 'filterNew',
      title: 'Filter: Cold/New',
      type: 'translationRecord',
    }),
    defineField({
      name: 'filterBestseller',
      title: 'Filter: Hot/Bestseller',
      type: 'translationRecord',
    }),
    defineField({
      name: 'filterVegan',
      title: 'Filter: Vegan',
      type: 'translationRecord',
    }),
    defineField({
      name: 'sortBy',
      title: 'Sort By Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'subscribeTab',
      title: 'Tab: Subscription',
      type: 'translationRecord',
    }),
    defineField({
      name: 'singleTab',
      title: 'Tab: Single Purchase',
      type: 'translationRecord',
    }),
    defineField({
      name: 'clubBannerTitle',
      title: 'Club Banner Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'clubBannerCTA',
      title: 'Club Banner CTA',
      type: 'translationRecord',
    }),
  ]
})
