// Textos del carrito que dependen del resultado de priceCart(). Puros, para poder probarlos.
import type { CartPricing } from './priceCart.js';
import { COMMERCE } from './config.js';

type Lang = 'es' | 'en';

// "$1,060" sin centavos; "$387.50" solo cuando hay centavos.
export function formatMXN(cents: number): string {
  const pesos = cents / 100;
  const decimals = cents % 100 === 0 ? 0 : 2;
  return `$${pesos.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// "Tu carrito · 3 sopas" / "Tu carrito · 1 caja y 2 sopas"
export function cartTitle(p: Pick<CartPricing, 'soupCount' | 'itemCount'>, lang: Lang = 'es'): string {
  const boxes = p.itemCount - p.soupCount;
  const parts = lang === 'es'
    ? [boxes ? plural(boxes, 'caja', 'cajas') : '', p.soupCount || !boxes ? plural(p.soupCount, 'sopa', 'sopas') : '']
    : [boxes ? plural(boxes, 'box', 'boxes') : '', p.soupCount || !boxes ? plural(p.soupCount, 'soup', 'soups') : ''];
  return `${lang === 'es' ? 'Tu carrito' : 'Your cart'} · ${parts.filter(Boolean).join(lang === 'es' ? ' y ' : ' and ')}`;
}

// Mensaje sobre la barra de progreso (envío gratis a 7 sopas, 20% a 10 artículos).
export function progressMessage(p: CartPricing, lang: Lang = 'es'): string {
  const pct = COMMERCE.bulkDiscountPercent;
  const bulkDone = pct > 0 && p.soupsToBulkDiscount === 0 && p.discountType === 'bulk';
  const toBulk = pct > 0 && !bulkDone ? p.soupsToBulkDiscount : 0;
  if (lang === 'en') {
    if (!p.freeShippingReason) return `${plural(p.soupsToFreeShipping, 'more soup', 'more soups')} for free shipping`;
    const shipping = p.freeShippingReason === 'box' ? 'Your box includes free shipping' : 'You have free shipping';
    if (bulkDone) return `You have free shipping and ${pct}% off`;
    return toBulk ? `${shipping}. ${toBulk} more for ${pct}% off` : shipping;
  }
  if (!p.freeShippingReason) {
    return p.soupsToFreeShipping === 1 ? 'Te falta 1 sopa para envío gratis' : `Te faltan ${p.soupsToFreeShipping} sopas para envío gratis`;
  }
  if (bulkDone) return `Tienes envío gratis y ${pct}% menos`;
  const shipping = p.freeShippingReason === 'box' ? 'Tu caja incluye envío gratis' : 'Ya tienes envío gratis';
  if (!toBulk) return shipping;
  return `${shipping}. ${toBulk === 1 ? 'Te falta 1' : `Te faltan ${toBulk}`} para ${pct}% menos`;
}

export type CheckoutBlocker = 'slot' | 'postal' | 'outOfZone' | 'slotAndPostal' | null;

// Por qué el botón de pagar está desactivado (null = se puede pagar).
export function checkoutBlocker(state: { slot: string | null; postalValid: boolean; postalInZone: boolean }): CheckoutBlocker {
  if (state.postalValid && !state.postalInZone) return 'outOfZone';
  if (!state.slot && !state.postalValid) return 'slotAndPostal';
  if (!state.slot) return 'slot';
  if (!state.postalValid) return 'postal';
  return null;
}

export function blockerMessage(b: CheckoutBlocker, lang: Lang = 'es'): string {
  const es = {
    slot: 'Elige una franja de entrega para continuar',
    postal: 'Escribe tu código postal para continuar',
    slotAndPostal: 'Elige una franja y escribe tu código postal para continuar',
    outOfZone: 'Aún no llegamos a tu código postal',
  };
  const en = {
    slot: 'Choose a delivery slot to continue',
    postal: 'Enter your postal code to continue',
    slotAndPostal: 'Choose a slot and enter your postal code to continue',
    outOfZone: "We don't deliver to your postal code yet",
  };
  return b ? (lang === 'es' ? es : en)[b] : '';
}
