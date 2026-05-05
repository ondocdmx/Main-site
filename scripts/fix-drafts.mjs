import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 's3nnv28f',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-04-24',
  token: process.env.SANITY_TOKEN,
})

const FIELDS = {
  siteSettings:    ['bannerText','midBannerText','navShop','navSubs','navSteps','navAbout','emptyCart','subtotal','checkout'],
  productSettings: ['filtersTitle','filterBundle','filterNew','filterBestseller','filterVegan','sortBy','subscribeTab','singleTab'],
  aboutSettings:   ['aboutTitle','aboutHeader','aboutSub','aboutLink','aboutCTA'],
  manifestoSettings: ['panel1Eyebrow','panel1TitleLine1','panel1TitleLine2','panel1Subheadline','panel1SubAccentWord','panel1Tagline','panel1CTAText','panel2Eyebrow','panel2HeadlinePrimary','panel2HeadlineAccent','panel3Eyebrow','panel3FounderRole','panel3OrangeEyebrow','panel3OrangeHeadline','panel4Eyebrow','panel4Quote','panel4CTAText'],
}

for (const [docType, fields] of Object.entries(FIELDS)) {
  const draftId = 'drafts.' + docType
  const draft = await client.getDocument(draftId)
  if (!draft) { console.log('— No draft:', draftId); continue }

  const published = await client.getDocument(docType)
  const patch = {}

  for (const field of fields) {
    const dv = draft[field]
    const pv = published?.[field]
    if (typeof dv === 'string') {
      const en = (pv && typeof pv === 'object') ? pv.en : dv
      patch[field] = { _type: 'translationRecord', es: dv, en }
      console.log('  wrap:', field, '(' + dv.substring(0,30) + ')')
    } else if (dv && typeof dv === 'object' && !dv._type) {
      patch[field] = { _type: 'translationRecord', ...dv }
      console.log('  _type:', field)
    }
  }

  if (Object.keys(patch).length > 0) {
    await client.patch(draftId).set(patch).commit()
    console.log('✅', draftId, '—', Object.keys(patch).length, 'campos\n')
  } else {
    console.log('—', draftId + ': ya ok\n')
  }
}

console.log('✅ Todos los drafts corregidos')
