import { defineType, defineField } from 'sanity'

export const heroSettings = defineType({
  name: 'heroSettings',
  title: 'Hero Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showHero',
      title: 'Show Hero Section',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'heroSub',
      title: 'Hero Subtitle',
      type: 'translationRecord',
    }),
    defineField({
      name: 'heroCTA',
      title: 'Hero CTA Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero Images (Right Side)',
      type: 'array',
      of: [{ type: 'image' }],
    }),
  ]
})
