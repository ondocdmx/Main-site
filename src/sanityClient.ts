import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 's3nnv28f', 
  dataset: 'production', 
  useCdn: false,
  apiVersion: '2024-04-24',
})

// Write client for creating leads (delivery address data)
// Token should be set in .env as VITE_SANITY_WRITE_TOKEN
export const writeClient = createClient({
  projectId: 's3nnv28f',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-04-24',
  token: typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SANITY_WRITE_TOKEN : undefined,
})

const builder = imageUrlBuilder(client)
export function urlFor(source: any) {
  return builder.image(source)
}
