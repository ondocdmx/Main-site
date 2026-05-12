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
      name: 'ingredients',
      title: 'Ingredients',
      type: 'translationRecord',
      description: 'Lista de ingredientes del producto (se muestra en el funnel de selección de sopas)',
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
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      description: 'El Product ID de Stripe (ej: prod_1ABC...). El precio viene del campo "Price (€)" de arriba.',
    }),
    defineField({
      name: 'onlySubscriptions',
      title: 'Only Subscriptions',
      type: 'boolean',
      description: 'If enabled, this product only appears in the subscription funnel — it will NOT be shown in the products section.',
      initialValue: false,
    }),
    defineField({
      name: 'soldOut',
      title: '🚫 Sold Out',
      type: 'boolean',
      description: 'If enabled, the product shows a grey overlay with "Agotado" and cannot be added to the cart.',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Additional Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Extra photos shown in the product detail popup carousel (after the main image and hover image)',
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
      onlySubscriptions: 'onlySubscriptions',
      soldOut: 'soldOut',
      media: 'image',
    },
    prepare({ titleEs, titleEn, purchaseType, onlySubscriptions, soldOut, media }) {
      const icon = soldOut ? '🚫' : (purchaseType === 'subscription' ? '🔄' : '🛒')
      const subLabel = soldOut ? 'AGOTADO' : (onlySubscriptions ? 'Solo suscripción' : (purchaseType === 'subscription' ? 'Subscription' : 'Single Purchase'))
      return {
        title: `${icon} ${titleEs || titleEn || 'Untitled'}`,
        subtitle: subLabel,
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
