// Ficha de producto (/sopas/<slug>): fotos, tags, nombre, precio, cantidad + "Agregar · $X", entrega,
// ofertas, filas plegables y "Completa tu caja". El dinero sale de priceCart() vía App.tsx (priceOf/unitCents).
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, Minus, Plus, Tag, Truck } from 'lucide-react';
import { SoupImage, TagChip, imagesFor, productTagSlugs, productTags, type WebImage } from './media';
import type { CardPrice } from './ProductCard';
import type { AddLocation } from '../../App';
import { boxShippingNote, deliveryPromise, formatMXN, offerLine } from '../../commerce/cartCopy';
import { toCents } from '../../commerce/config';
import { nextDeliveryDate } from '../../commerce/delivery';
import { productMeta } from '../../seo';

type Lang = 'es' | 'en';

// Qué significa cada dieta (la ficha lo explica bajo los tags).
const DIET_NOTE: Record<string, { es: string; en: string }> = {
  vegano: { es: 'Vegana: sin ningún ingrediente de origen animal.', en: 'Vegan: no animal ingredients at all.' },
  vegetariano: {
    es: 'Vegetariana: sin carne ni pescado; puede llevar lácteos o huevo (revisa los alérgenos).',
    en: 'Vegetarian: no meat or fish; may contain dairy or egg (check the allergens).',
  },
};

function useProductMeta(product: any, image: WebImage | null, lang: Lang) {
  useEffect(() => {
    const meta = productMeta(product, image?.og || image?.src, lang);
    const head = document.head;
    const previous: [Element, string, string][] = [];
    const set = (selector: string, attr: string, value: string) => {
      const el = head.querySelector(selector);
      if (!el) return;
      previous.push([el, attr, el.getAttribute(attr) || '']);
      el.setAttribute(attr, value);
    };
    const oldTitle = document.title;
    document.title = meta.title;
    set('meta[name="description"]', 'content', meta.description);
    set('meta[property="og:title"]', 'content', meta.title);
    set('meta[property="og:description"]', 'content', meta.description);
    set('meta[property="og:image"]', 'content', meta.image);
    let canonical = head.querySelector('link[rel="canonical"]');
    const addedCanonical = !canonical;
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); head.appendChild(canonical); }
    set('link[rel="canonical"]', 'href', meta.url);
    return () => {
      document.title = oldTitle;
      previous.forEach(([el, attr, value]) => el.setAttribute(attr, value));
      if (addedCanonical) canonical?.remove();
    };
  }, [product, image, lang]);
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-brand-ink/15">
      <summary className="min-h-[56px] flex items-center justify-between cursor-pointer list-none font-title font-bold text-[18px] text-brand-ink [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-5 font-body text-[16px] leading-relaxed text-brand-ink/85 space-y-2">{children}</div>
    </details>
  );
}

export default function ProductPage({ product, products, lang, resolveText, heatingText, storageText, priceOf, unitCents, onAdd, onBack, onOpenFunnel, onSelect }: {
  product: any;
  products: any[];
  lang: Lang;
  resolveText: (v: any) => string;
  heatingText: string;
  storageText: string;
  priceOf: (product: any) => CardPrice;
  unitCents: (product: any) => number;
  onAdd: (product: any, location: AddLocation, quantity?: number) => void;
  onBack: () => void;
  onOpenFunnel: () => void;
  onSelect: (product: any, index: number) => void;
}) {
  const es = lang === 'es';
  const name = resolveText(product.title);
  const imgs = imagesFor(product.slug);
  // Fotos: servida, bolsa, ingredientes (opcional) y la galería. Solo las que existen.
  const photos = [
    { image: imgs.plated, label: es ? 'Sopa servida' : 'Plated soup' },
    { image: imgs.pack, label: es ? 'Empaque' : 'Pouch' },
    { image: imgs.ingredients, label: es ? 'Ingredientes' : 'Ingredients' },
    ...imgs.gallery.map(image => ({ image, label: es ? 'Foto' : 'Photo' })),
  ]
    .filter((p): p is { image: WebImage; label: string } => !!p.image)
    .map((p, i) => ({ ...p, label: `${p.label} (${i + 1})` }));
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  useEffect(() => { setPhoto(0); setQty(1); window.scrollTo(0, 0); }, [product._id]);
  useProductMeta(product, imgs.plated, lang);

  const price = priceOf(product);
  const delivery = deliveryPromise(nextDeliveryDate(), lang);
  const boxNote = product.isBox ? boxShippingNote(toCents(product.price), lang) : '';
  const diets = productTagSlugs(product).filter(s => DIET_NOTE[s]);
  const more = products
    .filter(p => p._id !== product._id && !p.isBox && !p.soldOut && !p.onlySubscriptions)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
    .slice(0, 3);
  const current = photos[photo] || photos[0];

  return (
    <main className="bg-brand-cream text-brand-ink pb-28 md:pb-16">
      <div className="max-w-6xl mx-auto md:px-6 md:pt-6">
        {/* Móvil: flecha (mockup producto.png). Escritorio: migas "Tienda / Sopa" (mockup desktop). */}
        <button type="button" onClick={onBack} className="md:hidden min-h-[44px] flex items-center gap-1 px-3 font-body font-semibold text-[15px]">
          <ChevronLeft className="w-5 h-5" aria-hidden="true" /> {es ? 'Volver a las sopas' : 'Back to the soups'}
        </button>
        <nav aria-label={es ? 'Migas de pan' : 'Breadcrumb'} className="hidden md:flex items-center gap-1 min-h-[44px] mb-2 font-body text-[15px]">
          <a href="/#shop" onClick={e => { e.preventDefault(); onBack(); }} className="underline underline-offset-2">{es ? 'Tienda' : 'Shop'}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold first-letter:uppercase">{name}</span>
        </nav>

        <div className="md:grid md:grid-cols-2 md:gap-10">
          {/* Fotos */}
          <div>
            <div className="relative aspect-square md:rounded-2xl overflow-hidden bg-brand-card">
              {current?.image
                ? <SoupImage image={current.image} alt={`${name}: ${current.label}`} sizes="(min-width: 768px) 50vw, 100vw" eager className="absolute inset-0 w-full h-full" />
                : <div className="absolute inset-0 flex items-center justify-center font-body text-brand-ink/70">{current?.label}</div>}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 md:px-0 py-3 [scrollbar-width:none]">
                {photos.map((p, i) => (
                  <React.Fragment key={i}>
                    <button
                      type="button"
                      onClick={() => setPhoto(i)}
                      aria-label={p.label}
                      aria-pressed={i === photo}
                      className={`shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 ${i === photo ? 'border-brand-deep' : 'border-transparent'} bg-brand-card`}
                    >
                      {p.image
                        ? <SoupImage image={p.image} alt="" sizes="72px" className="w-full h-full" />
                        : <span className="block p-1 font-body text-[10px] leading-tight text-brand-ink/70">{p.label}</span>}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Datos */}
          <div className="px-4 md:px-0 pt-2 md:pt-0">
            {(productTags(product).length > 0 || product.onlySubscriptions) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {product.onlySubscriptions && (
                  <span className="bg-brand-light-orange text-brand-ink font-body font-semibold text-[12px] px-2 py-1 rounded-md">
                    {es ? 'Solo Soup-scripción' : 'Soup-scription only'}
                  </span>
                )}
                {productTags(product).map(tag => <React.Fragment key={tag.slug.current}><TagChip tag={tag} lang={lang} /></React.Fragment>)}
              </div>
            )}
            <h1 className="font-title font-bold text-[34px] md:text-[44px] leading-[1.05] first-letter:uppercase">{name}</h1>
            {product.descriptor && <p className="mt-2 font-body font-semibold text-[16px] text-brand-mid">{resolveText(product.descriptor)}</p>}

            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
              {price.before && <span className="font-body text-[18px] line-through text-brand-ink/60">{price.before}</span>}
              <span className="font-title font-bold text-[30px]">{price.now}</span>
              <span className="font-body text-[16px] text-brand-ink/75">
                {[resolveText(product.size), resolveText(product.servings)].filter(Boolean).join(' · ')}
              </span>
            </p>
            {boxNote && <p className="mt-1 font-body font-semibold text-[15px] text-brand-deep">{boxNote}</p>}

            {product.tagline && <p className="mt-4 font-body text-[17px] leading-relaxed first-letter:uppercase">{resolveText(product.tagline)}</p>}
            {product.description && (
              <p className="mt-3 font-body text-[16px] leading-relaxed text-brand-ink/85 whitespace-pre-line">{resolveText(product.description).trim()}</p>
            )}
            {diets.map(d => <p key={d} className="mt-3 font-body text-[14px] text-brand-ink/75">{DIET_NOTE[d][lang]}</p>)}

            {/* Cantidad + Agregar */}
            <div className="mt-6">
              {product.soldOut ? (
                <button type="button" disabled className="min-h-[56px] w-full rounded-xl border-2 border-brand-ink/30 text-brand-ink/50 font-title font-bold text-[18px]">
                  {es ? 'Agotada' : 'Sold out'}
                </button>
              ) : product.onlySubscriptions ? (
                <button type="button" onClick={onOpenFunnel} className="min-h-[56px] w-full rounded-xl bg-brand-cta text-white font-title font-bold text-[18px]">
                  {es ? 'Conocer la Soup-scripción' : 'Discover the Soup-scription'}
                </button>
              ) : (
                <div className="flex gap-3">
                  <div className="min-h-[56px] w-[136px] shrink-0 rounded-xl border-2 border-brand-ink flex items-stretch justify-between" role="group" aria-label={es ? 'Cantidad' : 'Quantity'}>
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 flex items-center justify-center" aria-label={es ? 'Una menos' : 'One less'}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex items-center font-title font-bold text-[18px]" aria-live="polite">{qty}</span>
                    <button type="button" onClick={() => setQty(q => q + 1)} className="w-11 flex items-center justify-center" aria-label={es ? 'Una más' : 'One more'}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { onAdd(product, 'product_page', qty); setQty(1); }}
                    className="min-h-[56px] flex-1 rounded-xl bg-brand-cta hover:bg-brand-deep text-white font-title font-bold text-[18px] transition-colors"
                  >
                    {es ? 'Agregar' : 'Add'} · {formatMXN(unitCents(product) * qty)}
                  </button>
                </div>
              )}
            </div>

            {/* Entrega y ofertas */}
            <div className="mt-4 rounded-2xl bg-brand-card p-4 space-y-3 font-body text-[15px] leading-snug">
              <p className="flex gap-3"><Truck className="w-5 h-5 shrink-0 text-brand-mid" aria-hidden="true" />{delivery}</p>
              <p className="flex gap-3"><Tag className="w-5 h-5 shrink-0 text-brand-mid" aria-hidden="true" />{offerLine(lang)}</p>
            </div>

            {/* Filas plegables */}
            <div className="mt-6 border-t border-brand-ink/15">
              <Row title={es ? 'Ingredientes y alérgenos' : 'Ingredients and allergens'}>
                {product.ingredients && <p>{resolveText(product.ingredients).trim()}</p>}
                {product.isBox && Array.isArray(product.boxContents) ? (
                  // Caja: los alérgenos de cada sopa, leídos de esa sopa (así no se desincronizan).
                  <>
                    <p><strong className="font-semibold">{es ? 'Alérgenos por sopa' : 'Allergens by soup'}:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      {product.boxContents.map((slug: string) => {
                        const soup = products.find(p => p.slug === slug);
                        if (!soup) return null;
                        return (
                          <li key={slug}>
                            <span className="first-letter:uppercase inline-block">{resolveText(soup.title)}</span>: {resolveText(soup.allergens) || (es ? '[ALÉRGENOS]' : '[ALLERGENS]')}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <p><strong className="font-semibold">{es ? 'Alérgenos' : 'Allergens'}:</strong> {resolveText(product.allergens) || (es ? '[ALÉRGENOS]' : '[ALLERGENS]')}</p>
                )}
              </Row>
              <Row title={es ? 'Cómo calentarla' : 'How to heat it'}><p>{heatingText}</p></Row>
              <Row title={es ? 'Conservación' : 'Storage'}><p>{storageText}</p></Row>
            </div>
          </div>
        </div>

        {/* Completa tu caja */}
        {more.length > 0 && (
          <section className="mt-10 px-4 md:px-0" aria-labelledby="more-title">
            <h2 id="more-title" className="font-title font-bold text-[28px] mb-4">{es ? 'Completa tu caja' : 'Complete your box'}</h2>
            <div className="-mx-4 px-4 md:mx-0 md:px-0 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:grid-cols-3">
              {more.map((p, i) => (
                <React.Fragment key={p._id}>
                  <article className="shrink-0 w-[44vw] max-w-[220px] md:w-auto md:max-w-none bg-brand-card rounded-2xl overflow-hidden flex flex-col">
                    <a href={`/sopas/${encodeURIComponent(p.slug)}`} onClick={e => { e.preventDefault(); onSelect(p, i); }} className="block">
                      <SoupImage image={imagesFor(p.slug).plated} alt="" sizes="(min-width: 768px) 30vw, 44vw" className="w-full aspect-square" />
                      <h3 className="px-3 pt-2 font-title font-bold text-[16px] leading-tight first-letter:uppercase">{resolveText(p.title)}</h3>
                    </a>
                    <div className="px-3 pb-3 pt-1 mt-auto flex items-center justify-between">
                      <span className="font-title font-bold">{priceOf(p).now}</span>
                      <button
                        type="button"
                        onClick={() => onAdd(p, 'completa_tu_caja')}
                        aria-label={`${es ? 'Agregar' : 'Add'}: ${resolveText(p.title)}`}
                        className="w-11 h-11 rounded-full border-2 border-brand-ink flex items-center justify-center hover:bg-brand-ink hover:text-brand-card transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </article>
                </React.Fragment>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
