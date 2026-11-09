// La caja: primera, verde oscuro, ocupa toda la fila. Su envío sale de boxShippingNote (la caja sola paga envío).
// `boxContents` (products.json, slugs) = las sopas de la caja: sus nombres van en una línea bajo el tagline.
import React from 'react';
import QuantityStepper from './QuantityStepper';
import { SoupImage, imagesFor } from './media';
import { boxShippingNote, formatMXN } from '../../commerce/cartCopy';
import { toCents } from '../../commerce/config';

type Lang = 'es' | 'en';

export default function BoxCard({ product, products = [], lang, resolveText, badge, quantity, onAdd, onRemove, onOpen }: {
  product: any;
  products?: any[]; // catálogo, para los nombres de boxContents
  lang: Lang;
  resolveText: (v: any) => string;
  badge: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const es = lang === 'es';
  const name = resolveText(product.title);
  const href = `/sopas/${encodeURIComponent(product.slug)}`;
  const open = (e: React.MouseEvent) => { e.preventDefault(); onOpen(); };
  const soups = Number(product.soupsInBox) || 0;
  const perSoup = soups ? formatMXN(Math.round(toCents(product.price) / soups)) : '';
  const contents: string[] = (Array.isArray(product.boxContents) ? product.boxContents : [])
    .map((slug: string) => resolveText(products.find(p => p.slug === slug)?.title))
    .filter(Boolean)
    .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1));
  const shipping = boxShippingNote(toCents(product.price), lang);

  return (
    <article className="col-span-full bg-brand-deep text-brand-cream rounded-2xl overflow-hidden grid md:grid-cols-2">
      <a href={href} onClick={open} className="relative block aspect-square md:aspect-auto md:min-h-[360px]" tabIndex={-1} aria-hidden="true">
        <SoupImage image={imagesFor(product.slug).plated} alt="" sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 w-full h-full" />
        {badge && (
          <span className="absolute top-3 left-3 bg-brand-card text-brand-ink font-body font-semibold text-[13px] px-2.5 py-1 rounded-md">{badge}</span>
        )}
      </a>
      <div className="p-5 md:p-8 flex flex-col justify-center">
        <h3 className="font-title font-bold text-[26px] md:text-[32px] leading-tight">
          <a href={href} onClick={open} className="hover:underline underline-offset-4">{name}</a>
        </h3>
        {product.tagline && <p className="mt-2 font-body text-[16px] leading-snug text-brand-cream/90">{resolveText(product.tagline)}</p>}
        {contents.length > 0 && (
          <p className="mt-1.5 font-body font-semibold text-[14px] leading-snug text-brand-cream">
            <span className="sr-only">{es ? 'Incluye: ' : 'Includes: '}</span>{contents.join(' · ')}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-title font-bold text-[32px] leading-none">{formatMXN(toCents(product.price))}</span>
          {shipping && <span className="bg-brand-light-orange text-brand-ink font-body font-semibold text-[13px] px-2.5 py-1 rounded-md">{shipping}</span>}
        </div>
        {perSoup && (
          <p className="mt-2 font-body text-[14px] text-brand-cream/85">
            {es ? `${perSoup} por sopa · 500 ml cada una` : `${perSoup} per soup · 500 ml each`}
          </p>
        )}
        {/* Agregar (2/3) + "Más info" (1/3, solo borde): en móvil no es obvio que la foto y el título abren la ficha */}
        <div className="mt-5 flex gap-3">
          <div className="flex-[2] min-w-0">
            <QuantityStepper quantity={quantity} onAdd={onAdd} onRemove={onRemove} lang={lang} name={name}
              addLabel={es ? 'Agregar caja' : 'Add box'} tone={quantity ? 'dark' : 'cta'} />
          </div>
          <a
            href={href}
            onClick={open}
            className="flex-1 min-w-0 min-h-[44px] rounded-xl border-2 border-brand-cream text-brand-cream hover:bg-brand-cream hover:text-brand-ink font-title font-bold text-[16px] flex items-center justify-center text-center transition-colors"
            aria-label={es ? `Más info: ${name}` : `More info: ${name}`}
          >
            {es ? 'Más info' : 'More info'}
          </a>
        </div>
      </div>
    </article>
  );
}
