// Tienda: chips de filtro (una fila con scroll lateral), "Ordenar", la caja primero y la rejilla de sopas.
// La home la usa recortada ("Las favoritas"): `limit` sopas, sin caja ni "Ordenar", con un enlace junto al título.
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import ProductCard, { type CardPrice } from './ProductCard';
import BoxCard from './BoxCard';
import { shopList, type ShopFilter, type SortKey } from './shopList';

type Lang = 'es' | 'en';

export default function ShopSection({ id = 'shop', products, filters, lang, resolveText, title, boxBadge, nudgeText, priceOf, quantityOf, onAdd, onRemove, onOpen, onOpenFunnel, limit, showBox = true, showSort = true, allAsIcon = false, action, headingLevel = 2, children }: {
  id?: string;
  products: any[];
  filters: ShopFilter[];
  lang: Lang;
  resolveText: (v: any) => string;
  title: string;
  boxBadge: string;
  nudgeText: string;
  priceOf: (product: any) => CardPrice;
  quantityOf: (productId: string) => number;
  onAdd: (product: any) => void;
  onRemove: (product: any) => void;
  onOpen: (product: any, index: number) => void;
  onOpenFunnel: () => void;
  limit?: number; // máximo de sopas (la home muestra 6)
  showBox?: boolean;
  showSort?: boolean;
  allAsIcon?: boolean; // el filtro "Todas" como estrella (home)
  action?: React.ReactNode; // junto al título (ej. "Ver las 13")
  headingLevel?: 1 | 2; // /tienda: h1
  children?: React.ReactNode; // lo que va debajo de la rejilla
}) {
  const es = lang === 'es';
  const [filterId, setFilterId] = useState(filters[0]?.id || '');
  const [sort, setSort] = useState<SortKey>('featured');
  const list = shopList(products, filters.find(f => f.id === filterId), sort);
  const box = showBox ? list.box : null;
  const items = limit ? list.items.slice(0, limit) : list.items;
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  // Índice para GA4 (select_item): la caja es el 0 cuando se ve.
  const offset = box ? 1 : 0;

  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-brand-cream scroll-mt-16 md:scroll-mt-28" id={id} aria-labelledby={`${id}-title`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-4">
          <Heading id={`${id}-title`} className="font-title font-bold text-[32px] md:text-[44px] leading-none text-brand-ink whitespace-nowrap">{title}</Heading>
          {action}
          {showSort && (
          <label className="shrink-0 flex items-center gap-2 font-body text-[14px] text-brand-ink">
            <span>{es ? 'Ordenar' : 'Sort'}</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="min-h-[44px] max-w-[10rem] rounded-xl border border-brand-ink/30 bg-brand-card px-2 text-[14px] font-semibold text-brand-ink"
            >
              <option value="featured">{es ? 'Destacadas' : 'Featured'}</option>
              <option value="priceAsc">{es ? 'Precio: menor a mayor' : 'Price: low to high'}</option>
              <option value="priceDesc">{es ? 'Precio: mayor a menor' : 'Price: high to low'}</option>
            </select>
          </label>
          )}
        </div>

        <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto [scrollbar-width:none] mb-6" role="group" aria-label={es ? 'Filtrar sopas' : 'Filter soups'}>
          <div className="flex gap-2 w-max">
            {filters.map(f => {
              const active = f.id === filterId;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilterId(f.id)}
                  className={`min-h-[44px] min-w-[44px] px-4 flex items-center justify-center rounded-full whitespace-nowrap font-body font-semibold text-[15px] border-2 transition-colors ${
                    active ? 'bg-brand-deep border-brand-deep text-brand-cream' : 'bg-brand-card border-brand-ink/20 text-brand-ink hover:border-brand-ink'
                  }`}
                >
                  {allAsIcon && f.tags.length === 0
                    ? <><Star className="w-5 h-5" fill="currentColor" aria-hidden="true" /><span className="sr-only">{f.name[lang] || f.name.es}</span></>
                    : (f.name[lang] || f.name.es)}
                </button>
              );
            })}
          </div>
        </div>

        {nudgeText && (
          <p className="mb-4 font-body font-semibold text-[14px] text-brand-deep" aria-live="polite">{nudgeText}</p>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-3 ${limit ? '' : 'lg:grid-cols-4'} gap-3 md:gap-6`}>
          {box && (
            <BoxCard
              product={box}
              lang={lang}
              resolveText={resolveText}
              badge={boxBadge}
              quantity={quantityOf(box._id)}
              onAdd={() => onAdd(box)}
              onRemove={() => onRemove(box)}
              onOpen={() => onOpen(box, 0)}
            />
          )}
          {items.map((product, i) => (
            <React.Fragment key={product._id}>
            <ProductCard
              product={product}
              lang={lang}
              resolveText={resolveText}
              price={priceOf(product)}
              quantity={quantityOf(product._id)}
              onAdd={() => onAdd(product)}
              onRemove={() => onRemove(product)}
              onOpen={() => onOpen(product, i + offset)}
              onOpenFunnel={onOpenFunnel}
            />
            </React.Fragment>
          ))}
        </div>
        {!box && items.length === 0 && (
          <p className="py-10 text-center font-body text-brand-ink/70">{es ? 'No hay sopas con este filtro por ahora.' : 'No soups with this filter right now.'}</p>
        )}
        {children}
      </div>
    </section>
  );
}
