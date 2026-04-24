import { defineType, defineField } from 'sanity'

export const deliveryLead = defineType({
  name: 'deliveryLead',
  title: 'Delivery Lead',
  type: 'document',
  fields: [
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'postalCode',
      title: 'Postal Code',
      type: 'string',
    }),
    defineField({
      name: 'isServiceable',
      title: 'Is Serviceable?',
      type: 'boolean',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Only collected when address is not serviceable',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'postalCode',
      subtitle: 'email',
      serviceable: 'isServiceable',
    },
    prepare({ title, subtitle, serviceable }) {
      return {
        title: `CP: ${title || 'N/A'}`,
        subtitle: serviceable ? '✅ Serviceable' : `❌ Not serviceable — ${subtitle || 'No email'}`,
      }
    }
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }]
    }
  ]
})
