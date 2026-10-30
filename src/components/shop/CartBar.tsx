// Barra fija abajo (solo móvil) con el carrito, y el aviso "Agregada · Ver carrito".
// El total es el mismo de priceCart() que muestra el carrito en "Pagar $X".
import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import type { CartPricing } from '../../commerce/priceCart';
import { cartCountLabel, formatMXN } from '../../commerce/cartCopy';

type Lang = 'es' | 'en';

export function StickyCartBar({ pricing, lang, onOpenCart }: { pricing: CartPricing; lang: Lang; onOpenCart: () => void }) {
  if (pricing.itemCount === 0) return null;
  const es = lang === 'es';
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-brand-card border-t border-brand-ink/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(31,46,20,0.08)]">
      <div className="font-body text-brand-ink leading-tight">
        <p className="text-[14px]">{cartCountLabel(pricing, lang)}</p>
        <p className="font-title font-bold text-[20px]">{formatMXN(pricing.total)}</p>
      </div>
      <button type="button" onClick={onOpenCart} className="min-h-[48px] px-6 rounded-xl bg-brand-deep text-brand-cream font-title font-bold text-[17px]">
        {es ? 'Ver carrito' : 'View cart'}
      </button>
    </div>
  );
}

// `stamp` cambia en cada agregado (0 = cerrado), así que cada toque reinicia los 3 s.
export function AddedToast({ stamp, lang, onOpenCart, onDone, raised }: {
  stamp: number; lang: Lang; onOpenCart: () => void; onDone: () => void; raised: boolean;
}) {
  const open = stamp > 0;
  useEffect(() => {
    if (!stamp) return;
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [stamp]);
  const es = lang === 'es';
  return (
    <div aria-live="polite" className={`fixed left-1/2 -translate-x-1/2 z-50 ${raised ? 'bottom-24 md:bottom-6' : 'bottom-6'}`}>
      {open && (
        <div className="flex items-center gap-3 bg-brand-ink text-brand-cream rounded-full pl-4 pr-2 py-1.5 shadow-lg font-body text-[15px] whitespace-nowrap">
          <Check className="w-4 h-4" aria-hidden="true" />
          <span>{es ? 'Agregada' : 'Added'}</span>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={onOpenCart} className="min-h-[44px] px-2 font-semibold underline underline-offset-4">
            {es ? 'Ver carrito' : 'View cart'}
          </button>
        </div>
      )}
    </div>
  );
}
