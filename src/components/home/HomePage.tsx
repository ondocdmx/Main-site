// Home (fase 3): secciones en el orden acordado con el dueño. Textos en settings.json (home*),
// preguntas en faq.json, testimonios en testimonials.json; las fechas y montos salen de la configuración.
// El catálogo completo con filtros vive en /tienda.
import React from 'react';
import { Coffee, MapPin, Snowflake, Truck } from 'lucide-react';
import BoxCard from '../shop/BoxCard';
import ShopSection from '../shop/ShopSection';
import type { CardPrice } from '../shop/ProductCard';
import type { ShopFilter } from '../shop/shopList';
import Faq, { type FaqItem } from './Faq';
import { whatsappLink } from '../../commerce/whatsapp';

type Lang = 'es' | 'en';
type Bilingual = { es: string; en: string };
export type Testimonials = { testimonios: { cita: Bilingual; autor: Bilingual }[]; destacado?: Bilingual };

const H2 = 'font-title font-bold text-[32px] md:text-[44px] leading-tight text-brand-ink';
const LINK = 'min-h-[44px] inline-flex items-center font-title font-bold text-[17px] underline underline-offset-4';

// Foto de la home (public/images/home/, scripts/build-home-images.mjs): lazy salvo el hero.
function HomeImage({ name, widths, ratio, alt, sizes, eager = false, className = '' }: {
  name: string; widths: number[]; ratio: number; alt: string; sizes: string; eager?: boolean; className?: string;
}) {
  const largest = widths[widths.length - 1];
  return (
    <img
      src={`/images/home/${name}-${widths[1] ?? largest}.webp`}
      srcSet={widths.map(w => `/images/home/${name}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      width={largest}
      height={Math.round(largest / ratio)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding={eager ? 'sync' : 'async'}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

export const HERO_WIDTHS = [640, 960, 1400];
export const HERO_SIZES = '(min-width: 768px) 50vw, 100vw';

export default function HomePage({
  lang, text, tokens, onNavigate, onOpenFunnel,
  products, filters, catalogCount, resolveText, boxBadge, nudgeText, priceOf, quantityOf, onAdd, onRemove, onOpen,
  faq, testimonials,
}: {
  lang: Lang;
  text: (key: string) => string; // settings.json, ya con {tokens} llenos
  tokens: Record<string, string>;
  onNavigate: (href: string) => void;
  onOpenFunnel: () => void;
  products: any[];
  filters: ShopFilter[];
  catalogCount: number;
  resolveText: (v: any) => string;
  boxBadge: string;
  nudgeText: string;
  priceOf: (product: any) => CardPrice;
  quantityOf: (productId: string) => number;
  onAdd: (product: any) => void;
  onRemove: (product: any) => void;
  onOpen: (product: any, index: number) => void;
  faq: FaqItem[];
  testimonials: Testimonials;
}) {
  const es = lang === 'es';
  const go = (href: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate(href); };
  const box = products.find(p => p.isBox && !p.soldOut);
  const quotes = testimonials.testimonios.filter(q => q.cita?.[lang] || q.cita?.es);
  const highlight = testimonials.destacado?.[lang] || testimonials.destacado?.es || '';
  const paragraphs = (key: string) => text(key).split(/\n\s*\n/).filter(Boolean);

  return (
    <main id="contenido">
      {/* 3 · Hero: foto arriba (móvil) o a la izquierda (escritorio); nunca texto sobre la foto */}
      <section className="bg-brand-cream md:px-6 md:py-10" aria-labelledby="hero-title">
        <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div className="aspect-[4/3] md:rounded-2xl overflow-hidden">
            <HomeImage
              name="hero" widths={HERO_WIDTHS} ratio={4 / 3} sizes={HERO_SIZES} eager
              alt={es ? 'Seis sopas Ondo servidas en tazones sobre una mesa de madera' : 'Six Ondo soups served in bowls on a wooden table'}
            />
          </div>
          <div className="px-4 md:px-0 pt-6 pb-10 md:py-0">
            <p className="font-body font-semibold text-[14px] tracking-[0.12em] uppercase text-brand-deep">{text('homeKicker')}</p>
            <h1 id="hero-title" className="mt-3 font-title font-extrabold text-[44px] md:text-[64px] leading-[1.02] tracking-tight text-brand-ink">{text('homeTitle')}</h1>
            <p className="mt-4 font-body text-[18px] leading-relaxed text-brand-ink/90 max-w-xl">{text('homeSub')}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="/tienda" onClick={go('/tienda')} className="min-h-[52px] px-8 flex items-center justify-center rounded-xl bg-brand-cta text-white font-title font-bold text-[18px]">
                {text('homeCtaPrimary')}
              </a>
              <a href="#favoritas" onClick={go('/#favoritas')} className="min-h-[52px] px-8 flex items-center justify-center rounded-xl border-2 border-brand-ink text-brand-ink font-title font-bold text-[18px]">
                {text('homeCtaSecondary')}
              </a>
            </div>
            <ul className="mt-8 grid grid-cols-3 gap-3 text-center font-body text-[14px] leading-snug text-brand-ink">
              {[[Truck, 'homeTrustDelivery'], [MapPin, 'homeTrustLocal'], [Snowflake, 'homeTrustFreezer']].map(([Icon, key]: any) => (
                <li key={key} className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6 text-brand-deep" aria-hidden="true" />
                  <span>{text(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4 · Así de fácil */}
      <section id="como-funciona" className="bg-brand-card px-4 md:px-6 py-12 md:py-20" aria-labelledby="como-funciona-title">
        <div className="max-w-7xl mx-auto">
          <h2 id="como-funciona-title" className={H2}>{text('homeStepsTitle')}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
            {[1, 2, 3].map(n => (
              <li key={n} className="flex gap-4">
                <span aria-hidden="true" className="shrink-0 w-12 h-12 rounded-full bg-brand-orange text-brand-ink font-title font-bold text-[22px] flex items-center justify-center">{n}</span>
                <div>
                  <h3 className="font-title font-bold text-[22px] leading-tight text-brand-ink">{text(`homeStep${n}Title`)}</h3>
                  <p className="mt-1 font-body text-[16px] leading-relaxed text-brand-ink/85">{text(`homeStep${n}Desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5 · Empieza aquí: la caja */}
      {box && (
        <section id="empieza" className="bg-brand-cream px-4 md:px-6 pt-12 md:pt-20" aria-labelledby="empieza-title">
          <div className="max-w-7xl mx-auto">
            <h2 id="empieza-title" className="mb-4 font-body font-semibold text-[14px] tracking-[0.12em] uppercase text-brand-deep">{text('homeBoxKicker')}</h2>
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
          </div>
        </section>
      )}

      {/* 6 · Las favoritas: tarjetas de la fase 2, 6 sopas */}
      <ShopSection
        id="favoritas"
        products={products}
        filters={filters}
        lang={lang}
        resolveText={resolveText}
        title={text('homeFavoritesTitle')}
        boxBadge={boxBadge}
        nudgeText={nudgeText}
        priceOf={priceOf}
        quantityOf={quantityOf}
        onAdd={onAdd}
        onRemove={onRemove}
        onOpen={onOpen}
        onOpenFunnel={onOpenFunnel}
        limit={6}
        showBox={false}
        showSort={false}
        action={<a href="/tienda" onClick={go('/tienda')} className={`${LINK} text-brand-ink`}>{es ? `Ver las ${catalogCount}` : `See all ${catalogCount}`}</a>}
      />

      {/* 7 · ¿Por qué congelada? */}
      <section className="bg-brand-deep text-brand-cream md:grid md:grid-cols-2" aria-labelledby="congelada-title">
        <div className="aspect-[3/2] md:aspect-auto md:min-h-[420px]">
          <HomeImage name="congelador" widths={[640, 1000]} ratio={3 / 2} sizes="(min-width: 768px) 50vw, 100vw"
            alt={es ? 'Una mano toma una bolsa de sopa Ondo del congelador' : 'A hand takes a pouch of Ondo soup from the freezer'} />
        </div>
        <div className="px-4 md:px-12 py-10 md:py-16 flex flex-col justify-center">
          <h2 id="congelada-title" className="font-title font-bold text-[32px] md:text-[44px] leading-tight">{text('homeFrozenTitle')}</h2>
          {paragraphs('homeFrozenText').map((p, i) => (
            <p key={i} className="mt-4 font-body text-[17px] leading-relaxed text-brand-cream/95 max-w-xl">{p}</p>
          ))}
        </div>
      </section>

      {/* 8 · Testimonios (testimonials.json); sin testimonios, no hay sección */}
      {quotes.length > 0 && (
        <section className="bg-brand-cream px-4 md:px-6 py-12 md:py-20" aria-labelledby="testimonios-title">
          <div className="max-w-7xl mx-auto">
            <h2 id="testimonios-title" className={H2}>{text('homeTestimonialsTitle')}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {quotes.map((q, i) => (
                <li key={i}>
                  <figure className="h-full bg-brand-card rounded-2xl p-6">
                    <blockquote className="font-body text-[17px] leading-relaxed text-brand-ink">“{q.cita[lang] || q.cita.es}”</blockquote>
                    <figcaption className="mt-3 font-body font-semibold text-[14px] text-brand-ink/80">{q.autor?.[lang] || q.autor?.es}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            {highlight && (
              <p className="mt-4 flex items-center gap-3 rounded-2xl bg-chip-leaf px-5 py-4 font-body text-[16px] text-brand-ink">
                <Coffee className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{highlight}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* 9 · Tres formas de Ondo */}
      <section className="bg-brand-cream px-4 md:px-6 pb-12 md:pb-20" aria-labelledby="formas-title">
        <div className={`max-w-7xl mx-auto ${quotes.length ? '' : 'pt-12 md:pt-20'}`}>
          <h2 id="formas-title" className={H2}>{text('homeWaysTitle')}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-2xl border-2 border-brand-ink bg-brand-card p-6">
              <h3 className="font-title font-bold text-[22px] text-brand-ink">{text('homeWay1Title')}</h3>
              <p className="mt-2 font-body text-[16px] leading-relaxed text-brand-ink/85">{text('homeWay1Desc')}</p>
              <a href="/tienda" onClick={go('/tienda')} className={`${LINK} mt-2 text-brand-deep`}>{text('homeWay1Link')}</a>
            </li>
            <li className="rounded-2xl bg-brand-card p-6">
              <h3 className="font-title font-bold text-[22px] text-brand-ink">{text('homeWay2Title')}</h3>
              <p className="mt-2 font-body text-[16px] leading-relaxed text-brand-ink/85">{text('homeWay2Desc')}</p>
              <a href="/soupscripciones" onClick={go('/soupscripciones')} className={`${LINK} mt-2 text-brand-deep`}>{text('homeWay2Link')}</a>
            </li>
            <li className="rounded-2xl bg-brand-card p-6">
              <h3 className="font-title font-bold text-[22px] text-brand-ink">{text('homeWay3Title')}</h3>
              <p className="mt-2 font-body text-[16px] leading-relaxed text-brand-ink/85">{text('homeWay3Desc')}</p>
              <a href={whatsappLink(text('homeWay3Message'))} target="_blank" rel="noopener noreferrer" className={`${LINK} mt-2 text-brand-deep`}>{text('homeWay3Link')}</a>
            </li>
          </ul>
        </div>
      </section>

      {/* 10 · Desde el huerto */}
      <section className="bg-brand-card" aria-labelledby="huerto-title">
        <div className="grid grid-cols-2">
          <div className="aspect-[4/3]">
            <HomeImage name="huerto" widths={[640, 1000]} ratio={4 / 3} sizes="50vw"
              alt={es ? 'Caja de jitomates de productor local' : 'A crate of tomatoes from a local grower'} />
          </div>
          <div className="aspect-[4/3]">
            <HomeImage name="especias" widths={[640, 1000]} ratio={4 / 3} sizes="50vw"
              alt={es ? 'Especias tostándose en un sartén' : 'Spices toasting in a pan'} />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <h2 id="huerto-title" className={H2}>{text('homeOriginTitle')}</h2>
          <p className="mt-3 font-body text-[17px] leading-relaxed text-brand-ink/90">{text('homeOriginText')}</p>
        </div>
      </section>

      {/* 11 · Ana y Omar */}
      <section className="bg-brand-cream md:grid md:grid-cols-2 md:items-center" aria-labelledby="fundadores-title">
        <div className="aspect-[3/2]">
          <HomeImage name="fundadores" widths={[640, 1000]} ratio={3 / 2} sizes="(min-width: 768px) 50vw, 100vw"
            alt={es ? 'Ana y Omar, fundadores de Ondo, limpiando verduras' : 'Ana and Omar, Ondo’s founders, prepping greens'} />
        </div>
        <figure className="px-4 md:px-12 py-10">
          <h2 id="fundadores-title" className="sr-only">{es ? 'Quiénes somos' : 'Who we are'}</h2>
          <blockquote className="font-title font-bold text-[26px] md:text-[34px] leading-tight text-brand-ink">“{text('homeFoundersQuote')}”</blockquote>
          <figcaption className="mt-3 font-body font-semibold text-[16px] text-brand-ink/80">{text('homeFoundersName')}</figcaption>
        </figure>
      </section>

      {/* 12 · Preguntas frecuentes (faq.json) */}
      <Faq title={text('homeFaqTitle')} items={faq} lang={lang} tokens={tokens} />
    </main>
  );
}
