import { defineType, defineField } from 'sanity'

export const translationRecord = defineType({
  name: 'translationRecord',
  title: 'Translation Record',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Español',
      type: 'text',
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
    })
  ]
})
