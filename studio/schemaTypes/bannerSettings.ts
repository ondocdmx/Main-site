import { defineType, defineField } from 'sanity'

export const bannerSettings = defineType({
  name: 'bannerSettings',
  title: 'Banner Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'banner',
      title: 'Top Banner Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'showMidBanner',
      title: 'Show Middle Banner',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'midBanner',
      title: 'Middle Banner Text',
      type: 'translationRecord',
      hidden: ({ document }) => !document?.showMidBanner
    }),
  ]
})
