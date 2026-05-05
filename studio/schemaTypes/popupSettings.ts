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
      description: 'Text for the floating button (e.g. ¿Qué sopa amas?)',
    }),
    defineField({
      name: 'popupTitle',
      title: 'Popup Title',
      type: 'translationRecord',
      description: 'e.g. ¿Qué sopas te apapachan?',
    }),
    defineField({
      name: 'popupMessage',
      title: 'Popup Subtext',
      type: 'translationRecord',
      description: 'e.g. Dinos que sopas te encantaría que hicieramos...',
    }),
    defineField({
      name: 'field1Label',
      title: 'Field 1 Label (Soup Idea)',
      type: 'translationRecord',
    }),
    defineField({
      name: 'field2Label',
      title: 'Field 2 Label (Email)',
      type: 'translationRecord',
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer Note',
      type: 'translationRecord',
      description: 'e.g. *by submitting you agree to receive light communication...',
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
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
