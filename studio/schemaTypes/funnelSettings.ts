import { defineType, defineField } from 'sanity'

export const funnelSettings = defineType({
  name: 'funnelSettings',
  title: 'Funnel de Suscripción',
  type: 'document',
  groups: [
    { name: 'step1', title: 'Paso 1 – Intro' },
    { name: 'step2', title: 'Paso 2 – Plan' },
    { name: 'stripe', title: 'Stripe Price IDs' },
    { name: 'step3', title: 'Paso 3 – Sopas' },
    { name: 'step4', title: 'Paso 4 – Resumen' },
  ],
  fields: [
    // ── STEP 1: INTRO ──────────────────────────────────────────────────
    defineField({
      name: 'introTitle',
      title: 'Título',
      type: 'translationRecord',
      group: 'step1',
    }),
    defineField({
      name: 'introDescription',
      title: 'Descripción',
      type: 'translationRecord',
      group: 'step1',
    }),
    defineField({
      name: 'introBenefits',
      title: 'Lista de beneficios',
      type: 'array',
      group: 'step1',
      of: [{
        type: 'object',
        name: 'benefit',
        preview: { select: { title: 'es' } },
        fields: [
          defineField({ name: 'es', title: 'Español', type: 'string' }),
          defineField({ name: 'en', title: 'English', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'introCtaText',
      title: 'Texto del botón CTA',
      type: 'translationRecord',
      group: 'step1',
    }),
    defineField({
      name: 'introImage',
      title: 'Imagen de cabecera',
      type: 'image',
      options: { hotspot: true },
      group: 'step1',
    }),

    // ── STEP 2: PLAN SELECTION ─────────────────────────────────────────
    defineField({
      name: 'planTitle',
      title: 'Título',
      type: 'translationRecord',
      group: 'step2',
    }),
    defineField({
      name: 'subscriptionDurationLabel',
      title: 'Duración de la suscripción (texto)',
      type: 'translationRecord',
      group: 'step2',
      description: 'Ej: "3 meses · sin compromiso"',
    }),
    defineField({
      name: 'frequencyLabel',
      title: 'Etiqueta "Frecuencia"',
      type: 'translationRecord',
      group: 'step2',
    }),
    defineField({
      name: 'quincenalLabel',
      title: 'Etiqueta "Quincenal"',
      type: 'translationRecord',
      group: 'step2',
    }),
    defineField({
      name: 'quincenalDeliveriesLabel',
      title: 'Info entregas quincenal',
      type: 'translationRecord',
      group: 'step2',
      description: 'Ej: "6 entregas en 3 meses"',
    }),
    defineField({
      name: 'mensualLabel',
      title: 'Etiqueta "Mensual"',
      type: 'translationRecord',
      group: 'step2',
    }),
    defineField({
      name: 'mensualDeliveriesLabel',
      title: 'Info entregas mensual',
      type: 'translationRecord',
      group: 'step2',
      description: 'Ej: "3 entregas en 3 meses"',
    }),
    defineField({
      name: 'quantityLabel',
      title: 'Etiqueta "Cantidad"',
      type: 'translationRecord',
      group: 'step2',
    }),
    // Precios visibles en el botón (display only, no afectan Stripe)
    defineField({ name: 'priceQuincenal4',  title: 'Precio visible — Quincenal 4 sopas',  type: 'string', group: 'step2', description: 'Ej: 89€/envío' }),
    defineField({ name: 'priceQuincenal6',  title: 'Precio visible — Quincenal 6 sopas',  type: 'string', group: 'step2' }),
    defineField({ name: 'priceQuincenal10', title: 'Precio visible — Quincenal 10 sopas', type: 'string', group: 'step2' }),
    defineField({ name: 'priceMensual4',    title: 'Precio visible — Mensual 4 sopas',    type: 'string', group: 'step2' }),
    defineField({ name: 'priceMensual6',    title: 'Precio visible — Mensual 6 sopas',    type: 'string', group: 'step2' }),
    defineField({ name: 'priceMensual10',   title: 'Precio visible — Mensual 10 sopas',   type: 'string', group: 'step2' }),

    // ── STRIPE PRICE IDs ───────────────────────────────────────────────
    defineField({
      name: 'stripeQuincenal4',
      title: 'Price ID — Quincenal 4 sopas',
      type: 'string',
      group: 'stripe',
      description: 'Ej: price_1ABC...',
    }),
    defineField({ name: 'stripeQuincenal6',  title: 'Price ID — Quincenal 6 sopas',  type: 'string', group: 'stripe' }),
    defineField({ name: 'stripeQuincenal10', title: 'Price ID — Quincenal 10 sopas', type: 'string', group: 'stripe' }),
    defineField({ name: 'stripeMensual4',    title: 'Price ID — Mensual 4 sopas',    type: 'string', group: 'stripe' }),
    defineField({ name: 'stripeMensual6',    title: 'Price ID — Mensual 6 sopas',    type: 'string', group: 'stripe' }),
    defineField({ name: 'stripeMensual10',   title: 'Price ID — Mensual 10 sopas',   type: 'string', group: 'stripe' }),

    // ── STEP 3: PRODUCT SELECTION ──────────────────────────────────────
    defineField({
      name: 'selectionTitle',
      title: 'Título',
      type: 'translationRecord',
      group: 'step3',
    }),
    defineField({
      name: 'ondoChoiceTitle',
      title: 'Título de la sopa "Elección de ONDO"',
      type: 'translationRecord',
      group: 'step3',
      description: 'Nombre que aparece en la card del producto sorpresa',
    }),
    defineField({
      name: 'ondoChoiceDescription',
      title: 'Descripción de la sopa "Elección de ONDO"',
      type: 'translationRecord',
      group: 'step3',
      description: 'Tagline corto, ej: "Sorpresa de temporada seleccionada por nuestro chef"',
    }),
    defineField({
      name: 'ondoChoiceImage',
      title: 'Foto de la sopa "Elección de ONDO"',
      type: 'image',
      options: { hotspot: true },
      group: 'step3',
    }),
    defineField({
      name: 'ondoChoiceBgColor',
      title: 'Color de fondo de la card (clase Tailwind)',
      type: 'string',
      group: 'step3',
      description: 'Ej: bg-ondo-beige',
      initialValue: 'bg-ondo-beige',
    }),
    defineField({
      name: 'contingenciesLabel',
      title: 'Etiqueta de alergias/preferencias',
      type: 'translationRecord',
      group: 'step3',
    }),
    defineField({
      name: 'contingenciesPlaceholder',
      title: 'Placeholder de alergias/preferencias',
      type: 'translationRecord',
      group: 'step3',
    }),

    // ── STEP 4: SUMMARY & CHECKOUT ─────────────────────────────────────
    defineField({
      name: 'summaryTitle',
      title: 'Título del resumen',
      type: 'translationRecord',
      group: 'step4',
    }),
    defineField({
      name: 'checkoutButtonText',
      title: 'Texto del botón de pago',
      type: 'translationRecord',
      group: 'step4',
    }),
    defineField({
      name: 'termsText',
      title: 'Texto de términos y condiciones',
      type: 'translationRecord',
      group: 'step4',
    }),
  ],
})
