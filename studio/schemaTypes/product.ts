import { defineType, defineField } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'purchaseType',
      title: 'Purchase Type',
      type: 'string',
      options: {
        list: [
          { title: 'Single Purchase', value: 'single' },
          { title: 'Subscription', value: 'subscription' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'single',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (€)',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'translationRecord',
      description: 'Full description shown in the product detail popup (ingredients, details, etc.)',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'translationRecord',
      description: 'Short catchy phrase for the product',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'productTag' }],
        },
      ],
      description: 'Tags for filtering (e.g. Vegetariano, Vegano, Frío, Caliente)',
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'hoverImage',
      title: 'Hover Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'bgColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          { title: 'Beige (bg-ondo-beige)', value: 'bg-ondo-beige' },
          { title: 'White (bg-ondo-white)', value: 'bg-ondo-white' },
          { title: 'Yellow (bg-ondo-yellow)', value: 'bg-ondo-yellow' },
          { title: 'Light Green (bg-ondo-light-green)', value: 'bg-ondo-light-green' },
          { title: 'Green (bg-ondo-green)', value: 'bg-ondo-green' },
        ]
      }
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'The Stripe Price ID for single-purchase checkout (e.g. price_1ABC...)',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0
    })
  ],
  preview: {
    select: {
      titleEs: 'title.es',
      titleEn: 'title.en',
      purchaseType: 'purchaseType',
      media: 'image',
    },
    prepare({ titleEs, titleEn, purchaseType, media }) {
      const icon = purchaseType === 'subscription' ? '🔄' : '🛒'
      return {
        title: `${icon} ${titleEs || titleEn || 'Untitled'}`,
        subtitle: purchaseType === 'subscription' ? 'Subscription' : 'Single Purchase',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Manual Order',
      name: 'manualOrder',
      by: [
        { field: 'order', direction: 'asc' }
      ]
    }
  ]
})
