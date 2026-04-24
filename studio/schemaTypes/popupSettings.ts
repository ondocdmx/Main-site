import { defineType, defineField } from 'sanity'

export const popupSettings = defineType({
  name: 'popupSettings',
  title: 'Popup Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enable Subscription Popup',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'buttonText',
      title: 'Static Button Text',
      type: 'translationRecord',
      description: 'Text for the floating button (e.g. Subscribe, Obtén Descuento)',
    }),
    defineField({
      name: 'popupTitle',
      title: 'Popup Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'popupMessage',
      title: 'Popup Message',
      type: 'translationRecord',
    }),
    defineField({
      name: 'popupCTA',
      title: 'Popup Call to Action',
      type: 'translationRecord',
    }),
    defineField({
      name: 'popupImage',
      title: 'Popup Image',
      type: 'image',
      options: { hotspot: true },
    })
  ]
})
