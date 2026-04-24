import { defineType, defineField } from 'sanity'

export const deliveryZones = defineType({
  name: 'deliveryZones',
  title: 'Delivery Zones',
  type: 'document',
  fields: [
    defineField({
      name: 'allowedPostalCodes',
      title: 'Allowed Postal Codes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of postal codes where delivery is available. Add each code as a separate item.',
    }),
    defineField({
      name: 'outOfZoneMessageEs',
      title: 'Out-of-Zone Message (ES)',
      type: 'text',
      initialValue: 'Pronto repartiremos en tu zona. Déjanos tu correo y te avisamos cuando estemos ahí.',
    }),
    defineField({
      name: 'outOfZoneMessageEn',
      title: 'Out-of-Zone Message (EN)',
      type: 'text',
      initialValue: "We'll be delivering to your area soon! Leave your email and we'll let you know.",
    }),
    defineField({
      name: 'inZoneMessageEs',
      title: 'In-Zone Confirmation (ES)',
      type: 'text',
      initialValue: '¡Perfecto! Repartimos en tu zona 🎉',
    }),
    defineField({
      name: 'inZoneMessageEn',
      title: 'In-Zone Confirmation (EN)',
      type: 'text',
      initialValue: 'Great! We deliver to your area 🎉',
    }),
  ],
})
