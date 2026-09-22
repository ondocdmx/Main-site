import { defineType, defineField } from 'sanity'

export const aboutSettings = defineType({
  name: 'aboutSettings',
  title: 'About Section Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'aboutTitle',
      title: 'About Section Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'aboutHeader',
      title: 'About Section Header',
      type: 'translationRecord',
    }),
    defineField({
      name: 'aboutSub',
      title: 'About Section Subtitle',
      type: 'translationRecord',
    }),
    defineField({
      name: 'aboutLink',
      title: 'About Link Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'aboutCTA',
      title: 'About CTA Button',
      type: 'translationRecord',
    }),
    defineField({
      name: 'aboutCTALink',
      title: 'About CTA — URL de destino',
      type: 'string',
      description: 'Ej: /soupscripciones (interno), #shop (ancla) o https://... (externo). Vacío = ir a la sección de productos.',
    }),
  ]
})
