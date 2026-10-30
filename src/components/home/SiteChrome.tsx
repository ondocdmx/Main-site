// Lo que rodea a todas las páginas: barra de anuncio, cabecera, footer y botón flotante de WhatsApp (móvil).
import React, { useEffect, useState } from 'react';
import { Menu, MessageCircle, ShoppingCart, X } from 'lucide-react';
import { announcementText } from '../../commerce/cartCopy';
import { nextDeliveryDate } from '../../commerce/delivery';
import { whatsappLink } from '../../commerce/whatsapp';

type Lang = 'es' | 'en';
export type NavLink = { href: string; label: string };

// Próxima entrega, recalculada al volver a la pestaña y cada minuto (el corte puede pasar con la página abierta).
export function useNextDelivery(): string {
  const [iso, setIso] = useState(() => nextDeliveryDate());
  useEffect(() => {
    const refresh = () => setIso(nextDeliveryDate());
    const id = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  return iso;
}

export function AnnouncementBar({ deliveryIso, lang }: { deliveryIso: string; lang: Lang }) {
  return (
    <p className="bg-brand-deep text-brand-cream text-center font-body font-semibold text-[14px] leading-snug px-4 py-2">
      {announcementText(deliveryIso, lang)}
    </p>
  );
}

// Enlaces internos: el clic lo maneja App (rutas sin recargar); el href sirve para abrir en otra pestaña.
const internalClick = (onNavigate: (href: string) => void, href: string, after?: () => void) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  after?.();
  onNavigate(href);
};

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center font-body font-semibold text-[14px]" role="group" aria-label={lang === 'es' ? 'Idioma' : 'Language'}>
      {(['es', 'en'] as const).map(l => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`min-h-[44px] min-w-[40px] px-2 uppercase ${lang === l ? 'text-brand-ink underline underline-offset-4' : 'text-brand-ink/70 hover:text-brand-ink'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader({ lang, setLang, links, cartCount, onOpenCart, onNavigate }: {
  lang: Lang;
  setLang: (l: Lang) => void;
  links: NavLink[];
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (href: string) => void;
}) {
  const es = lang === 'es';
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 bg-brand-cream border-b border-brand-ink/10">
      <div className="max-w-7xl mx-auto px-2 md:px-6 h-16 md:h-20 grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-ink"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={es ? (open ? 'Cerrar menú' : 'Abrir menú') : (open ? 'Close menu' : 'Open menu')}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
          <nav className="hidden md:flex items-center gap-6 font-title font-bold text-[17px] text-brand-ink" aria-label={es ? 'Principal' : 'Main'}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={internalClick(onNavigate, l.href)} className="min-h-[44px] flex items-center hover:underline underline-offset-4">{l.label}</a>
            ))}
          </nav>
        </div>

        <a href="/" onClick={internalClick(onNavigate, '/', close)} className="flex items-center min-h-[44px]" aria-label={es ? 'Ondo, inicio' : 'Ondo, home'}>
          <img src="/images/ondo-logo-orange.png" alt="" width={388} height={210} className="h-9 md:h-12 w-auto" />
        </a>

        <div className="flex items-center justify-end gap-1 md:gap-3">
          <div className="hidden md:block"><LangSwitch lang={lang} setLang={setLang} /></div>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={es ? `Ver carrito, ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}` : `View cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-ink"
          >
            <ShoppingCart className="w-7 h-7" aria-hidden="true" />
            {cartCount > 0 && (
              <span aria-hidden="true" className="absolute top-0.5 right-0 min-w-[20px] h-5 px-1 rounded-full bg-brand-cta text-white font-body font-bold text-[12px] leading-5 text-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movil" className="md:hidden border-t border-brand-ink/10 bg-brand-cream px-4 pb-4" aria-label={es ? 'Principal' : 'Main'}>
          <ul className="font-title font-bold text-[20px] text-brand-ink">
            {links.map(l => (
              <li key={l.href} className="border-b border-brand-ink/10">
                <a href={l.href} onClick={internalClick(onNavigate, l.href, close)} className="min-h-[52px] flex items-center">{l.label}</a>
              </li>
            ))}
            <li className="border-b border-brand-ink/10">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="min-h-[52px] flex items-center gap-2">
                <MessageCircle className="w-5 h-5" aria-hidden="true" /> WhatsApp
              </a>
            </li>
          </ul>
          <div className="pt-2"><LangSwitch lang={lang} setLang={setLang} /></div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ lang, tagline, links, instagramUrl, email, onNavigate, raised }: {
  lang: Lang;
  tagline: string;
  links: NavLink[];
  instagramUrl: string;
  email: string;
  onNavigate: (href: string) => void;
  raised: boolean; // deja sitio a la barra del carrito (móvil)
}) {
  const es = lang === 'es';
  return (
    <footer className={`bg-brand-ink text-brand-cream px-4 md:px-6 pt-12 ${raised ? 'pb-28 md:pb-12' : 'pb-12'}`}>
      <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-12">
        <div>
          <img src="/images/ondo-logo-orange.png" alt="Ondo" width={388} height={210} loading="lazy" className="h-12 w-auto" />
          <p className="mt-4 font-body text-[16px] leading-relaxed max-w-md">{tagline}</p>
        </div>
        <div className="mt-6 md:mt-0">
          <a
            href={whatsappLink(es ? 'Hola Ondo, tengo una pregunta.' : 'Hi Ondo, I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[52px] w-full md:w-auto md:px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-cream text-brand-ink font-title font-bold text-[17px]"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            {es ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp'}
          </a>
          <ul className="mt-6 flex flex-wrap gap-x-5 font-body text-[15px]">
            {links.map(l => (
              <li key={l.label}>
                <a href={l.href} onClick={internalClick(onNavigate, l.href)} className="min-h-[44px] inline-flex items-center underline underline-offset-4">{l.label}</a>
              </li>
            ))}
            {instagramUrl && (
              <li><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="min-h-[44px] inline-flex items-center underline underline-offset-4">Instagram</a></li>
            )}
            {email && (
              <li><a href={`mailto:${email}`} className="min-h-[44px] inline-flex items-center underline underline-offset-4">{email}</a></li>
            )}
          </ul>
          <p className="mt-6 font-body text-[13px] text-brand-cream/80">© {new Date().getFullYear()} Ondo</p>
        </div>
      </div>
    </footer>
  );
}

// Botón flotante (solo móvil). Aparece al bajar (no tapa los botones del hero) y sube cuando está
// la barra del carrito para no taparla.
export function WhatsAppFloat({ lang, raised }: { lang: Lang; raised: boolean }) {
  const es = lang === 'es';
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!scrolled) return null;
  return (
    <a
      href={whatsappLink(es ? 'Hola Ondo, tengo una pregunta.' : 'Hi Ondo, I have a question.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={es ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp'}
      className={`md:hidden fixed right-4 z-40 w-14 h-14 rounded-full bg-brand-deep text-brand-cream flex items-center justify-center shadow-lg ${raised ? 'bottom-[calc(88px+env(safe-area-inset-bottom))]' : 'bottom-[calc(16px+env(safe-area-inset-bottom))]'}`}
    >
      <MessageCircle className="w-7 h-7" aria-hidden="true" />
    </a>
  );
}
