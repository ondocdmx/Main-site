import { defineType, defineField } from 'sanity'

export const productTag = defineType({
  name: 'productTag',
  title: 'Product Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tag Name',
      type: 'translationRecord',
      description: 'Display name in ES/EN',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: any) => doc.name?.es || doc.name?.en || '',
        maxLength: 50,
      },
    }),
    defineField({
      name: 'icon',
      title: 'Icon (emoji)',
      type: 'string',
      description: 'A single emoji icon for the filter button, e.g. 🌿, 🔥, ❄️',
    }),
    defineField({
      name: 'color',
      title: 'Badge Color',
      type: 'string',
      options: {
        list: [
          { title: 'Green', value: 'bg-ondo-green' },
          { title: 'Orange', value: 'bg-ondo-orange' },
          { title: 'Yellow', value: 'bg-ondo-yellow' },
          { title: 'Light Green', value: 'bg-ondo-light-green' },
          { title: 'Red', value: 'bg-ondo-red' },
          { title: 'Beige', value: 'bg-ondo-beige' },
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      titleEs: 'name.es',
      titleEn: 'name.en',
      icon: 'icon',
    },
    prepare({ titleEs, titleEn, icon }) {
      return {
        title: `${icon || ''} ${titleEs || titleEn || 'Untitled'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Manual Order',
      name: 'manualOrder',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
