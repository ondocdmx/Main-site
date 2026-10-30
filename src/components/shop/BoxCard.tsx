// La caja: primera, verde oscuro, ocupa toda la fila. Su envío sale de boxShippingNote (la caja sola paga envío).
import React from 'react';
import QuantityStepper from './QuantityStepper';
import { SoupImage, imagesFor } from './media';
import { boxShippingNote, formatMXN } from '../../commerce/cartCopy';
import { toCents } from '../../commerce/config';

type Lang = 'es' | 'en';

export default function BoxCard({ product, lang, resolveText, badge, quantity, onAdd, onRemove, onOpen }: {
  product: any;
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
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-title font-bold text-[32px] leading-none">{formatMXN(toCents(product.price))}</span>
          {shipping && <span className="bg-brand-light-orange text-brand-ink font-body font-semibold text-[13px] px-2.5 py-1 rounded-md">{shipping}</span>}
        </div>
        {perSoup && (
          <p className="mt-2 font-body text-[14px] text-brand-cream/85">
            {es ? `${perSoup} por sopa · 500 ml cada una` : `${perSoup} per soup · 500 ml each`}
          </p>
        )}
        <div className="mt-5">
          <QuantityStepper quantity={quantity} onAdd={onAdd} onRemove={onRemove} lang={lang} name={name}
            addLabel={es ? 'Agregar caja' : 'Add box'} tone={quantity ? 'dark' : 'cta'} />
        </div>
      </div>
    </article>
  );
}
