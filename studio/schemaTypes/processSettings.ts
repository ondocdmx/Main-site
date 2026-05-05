import { defineType, defineField } from 'sanity'

export const processSettings = defineType({
  name: 'processSettings',
  title: 'Process Section Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showSteps',
      title: 'Show Process Section',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'stepsTitle',
      title: 'Section Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step1Title',
      title: 'Step 1 Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step1Desc',
      title: 'Step 1 Description',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step2Title',
      title: 'Step 2 Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step2Desc',
      title: 'Step 2 Description',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step3Title',
      title: 'Step 3 Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step3Desc',
      title: 'Step 3 Description',
      type: 'translationRecord',
    }),
    defineField({
      name: 'step1Image',
      title: 'Step 1 Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'step2Image',
      title: 'Step 2 Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'step3Image',
      title: 'Step 3 Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ]
})
