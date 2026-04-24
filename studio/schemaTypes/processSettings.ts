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
      type: 'string',
      initialValue: 'La cena es así de fácil',
    }),
    defineField({
      name: 'step1Title',
      title: 'Step 1 Title',
      type: 'string',
      initialValue: '1. Elige tus sopas',
    }),
    defineField({
      name: 'step1Desc',
      title: 'Step 1 Description',
      type: 'text',
      initialValue: 'Navega y elige de nuestras recetas curadas desde nuestra tienda.',
    }),
    defineField({
      name: 'step2Title',
      title: 'Step 2 Title',
      type: 'string',
      initialValue: '2. Recibe fresco',
    }),
    defineField({
      name: 'step2Desc',
      title: 'Step 2 Description',
      type: 'text',
      initialValue: 'Ingredientes frescos entregados en la puerta de tu casa.',
    }),
    defineField({
      name: 'step3Title',
      title: 'Step 3 Title',
      type: 'string',
      initialValue: '3. Disfruta con confianza',
    }),
    defineField({
      name: 'step3Desc',
      title: 'Step 3 Description',
      type: 'text',
      initialValue: 'Sigue simples instrucciones y disfruta deliciosos platillos caseros sin estrés.',
    }),
  ]
})
