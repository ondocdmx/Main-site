import { defineType, defineField } from 'sanity'

export const soupRequest = defineType({
  name: 'soupRequest',
  title: 'Soup Request',
  type: 'document',
  fields: [
    defineField({
      name: 'soupIdea',
      title: 'Soup Idea',
      type: 'text',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
