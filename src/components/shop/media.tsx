// Fotos de producto (generadas por scripts/build-images.mjs) y chips de tags. Lo usan la tienda y la ficha.
import React from 'react';
import productImages from '../../content/productImages.json';
import tagsContent from '../../content/tags.json';

type Lang = 'es' | 'en';
export type WebImage = { src: string; srcset: string; width: number; height: number; og?: string };
type ProductImages = { plated: WebImage | null; pack: WebImage | null; ingredients: WebImage | null; gallery: WebImage[] };

const IMAGES = productImages as Record<string, ProductImages>;
const EMPTY: ProductImages = { plated: null, pack: null, ingredients: null, gallery: [] };
export const imagesFor = (slug: string): ProductImages => IMAGES[slug] ?? EMPTY;

// Cuadrada, con width/height para que no salte el layout; lazy salvo `eager` (lo que está arriba del todo).
export function SoupImage({ image, alt, sizes, eager = false, className = '' }: {
  image: WebImage | null; alt: string; sizes: string; eager?: boolean; className?: string;
}) {
  if (!image) return <div className={`bg-brand-cream ${className}`} aria-hidden="true" />;
  return (
    <img
      src={image.src}
      srcSet={image.srcset}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}

// ── Tags ──
type Tag = { slug: { current: string }; name: { es: string; en: string }; tone?: string };
const TAGS = new Map((tagsContent as Tag[]).map(t => [t.slug.current, t]));
const TONE_CLASS: Record<string, string> = {
  leaf: 'bg-chip-leaf', butter: 'bg-chip-butter', clay: 'bg-chip-clay', sky: 'bg-chip-sky', spice: 'bg-chip-spice', plum: 'bg-chip-plum',
};
// Orden en la tarjeta: dieta primero, luego picante (chile) y especiada (jengibre, especias: no es para niños chicos).
const TAG_ORDER = ['vegano', 'vegetariano', 'carne', 'pescado', 'picante', 'especiada'];

export const productTagSlugs = (product: any): string[] =>
  (product?.tags || []).map((t: any) => t?.slug?.current).filter(Boolean);

export const productTags = (product: any): Tag[] =>
  productTagSlugs(product)
    .sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b))
    .map(slug => TAGS.get(slug))
    .filter((t): t is Tag => !!t);

export function TagChip({ tag, lang }: { tag: Tag; lang: Lang }) {
  return (
    <span className={`${TONE_CLASS[tag.tone || ''] || 'bg-chip-butter'} text-brand-ink font-body font-semibold text-[12px] leading-none px-2 py-1 rounded-md`}>
      {tag.name[lang] || tag.name.es}
    </span>
  );
}
