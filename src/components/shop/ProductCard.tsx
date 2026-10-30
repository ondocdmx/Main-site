// Tarjeta de sopa en la tienda: foto servida cuadrada, tags, nombre, una línea, precio + tamaño y "Agregar".
import React from 'react';
import QuantityStepper from './QuantityStepper';
import { SoupImage, TagChip, imagesFor, productTags } from './media';

type Lang = 'es' | 'en';
export type CardPrice = { now: string; before?: string; percent?: number };

export const CARD_SIZES = '(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 47vw';

export default function ProductCard({ product, lang, resolveText, price, quantity, onAdd, onRemove, onOpen, onOpenFunnel, eager = false }: {
  product: any;
  lang: Lang;
  resolveText: (v: any) => string;
  price: CardPrice;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onOpen: () => void;
  onOpenFunnel: () => void;
  eager?: boolean;
}) {
  const es = lang === 'es';
  const name = resolveText(product.title);
  const href = `/sopas/${encodeURIComponent(product.slug)}`;
  const open = (e: React.MouseEvent) => { e.preventDefault(); onOpen(); };

  return (
    <article className="bg-brand-card rounded-2xl overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(31,46,20,0.06)]">
      <a href={href} onClick={open} className="relative block aspect-square" tabIndex={-1} aria-hidden="true">
        <SoupImage image={imagesFor(product.slug).plated} alt="" sizes={CARD_SIZES} eager={eager} className="absolute inset-0 w-full h-full" />
        {product.soldOut && (
          <span className="absolute inset-0 bg-brand-ink/55 flex items-center justify-center font-title font-bold text-white text-[15px] tracking-wide">
            {es ? 'Agotada' : 'Sold out'}
          </span>
        )}
        {!product.soldOut && product.onlySubscriptions && (
          <span className="absolute top-2 left-2 bg-brand-light-orange text-brand-ink font-body font-semibold text-[12px] px-2 py-1 rounded-md">
            {es ? 'Solo Soup-scripción' : 'Soup-scription only'}
          </span>
        )}
      </a>

      <div className="flex flex-col flex-1 p-3 md:p-4">
        {productTags(product).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {productTags(product).map(tag => <React.Fragment key={tag.slug.current}><TagChip tag={tag} lang={lang} /></React.Fragment>)}
          </div>
        )}
        <h3 className="font-title font-bold text-[17px] md:text-[19px] leading-tight text-brand-ink first-letter:uppercase">
          <a href={href} onClick={open} className="hover:underline underline-offset-2">{name}</a>
        </h3>
        {product.tagline && (
          <p className="mt-1 font-body text-[14px] leading-snug text-brand-ink/75 line-clamp-3 first-letter:uppercase">{resolveText(product.tagline)}</p>
        )}

        <div className="mt-auto pt-3 flex items-baseline justify-between gap-2">
          <span className="font-title font-bold text-[18px] text-brand-ink">
            {price.before && <span className="mr-1 text-[14px] font-body font-normal line-through text-brand-ink/60">{price.before}</span>}
            {price.now}
          </span>
          <span className="font-body text-[13px] text-brand-ink/70">{resolveText(product.size)}</span>
        </div>

        <div className="mt-3">
          {product.soldOut ? (
            <button type="button" disabled className="min-h-[44px] w-full rounded-xl border-2 border-brand-ink/30 text-brand-ink/50 font-title font-bold">
              {es ? 'Agotada' : 'Sold out'}
            </button>
          ) : product.onlySubscriptions ? (
            <button type="button" onClick={onOpenFunnel} className="min-h-[44px] w-full font-body font-semibold text-[14px] text-brand-deep underline underline-offset-4 text-left">
              {es ? 'Conocer la Soup-scripción' : 'Discover the Soup-scription'}
            </button>
          ) : (
            <QuantityStepper quantity={quantity} onAdd={onAdd} onRemove={onRemove} lang={lang} name={name} />
          )}
        </div>
      </div>
    </article>
  );
}
