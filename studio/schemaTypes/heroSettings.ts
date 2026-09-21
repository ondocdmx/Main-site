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
      name: 'heroCTALink',
      title: 'Hero CTA — URL de destino',
      type: 'string',
      description: 'Ej: /soupcripciones (interno), #shop (ancla) o https://... (externo). Vacío = ir a la sección de productos.',
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero Images (Right Side)',
      type: 'array',
      of: [{ type: 'image' }],
    }),
  ]
})
