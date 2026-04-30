import { defineType, defineField } from 'sanity'

export const footerSettings = defineType({
  name: 'footerSettings',
  title: 'Footer Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      initialValue: '© 2026 ONDO. All rights reserved.',
      description: 'Text shown at the bottom of the footer.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      initialValue: 'hola@ondo.mx',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
      initialValue: '+52 1 234 567 890',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      initialValue: 'https://instagram.com',
    }),
    defineField({
      name: 'showInstagram',
      title: 'Show Instagram Link',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'footerLogo',
      title: 'Footer Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'Logo displayed in the footer. Falls back to the default ONDO logo.',
    }),
  ],
})
