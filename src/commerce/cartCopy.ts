// Textos del carrito que dependen del resultado de priceCart(). Puros, para poder probarlos.
import type { CartPricing } from './priceCart.js';
import { COMMERCE } from './config.js';
import { cutoffFor, formatDeliveryDate } from './delivery.js';

type Lang = 'es' | 'en';

// "$1,060" sin centavos; "$387.50" solo cuando hay centavos.
export function formatMXN(cents: number): string {
  const pesos = cents / 100;
  const decimals = cents % 100 === 0 ? 0 : 2;
  return `$${pesos.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// "3 sopas" / "1 caja y 2 sopas" (barra del carrito y título del carrito)
export function cartCountLabel(p: Pick<CartPricing, 'soupCount' | 'itemCount'>, lang: Lang = 'es'): string {
  const boxes = p.itemCount - p.soupCount;
  const parts = lang === 'es'
    ? [boxes ? plural(boxes, 'caja', 'cajas') : '', p.soupCount || !boxes ? plural(p.soupCount, 'sopa', 'sopas') : '']
    : [boxes ? plural(boxes, 'box', 'boxes') : '', p.soupCount || !boxes ? plural(p.soupCount, 'soup', 'soups') : ''];
  return parts.filter(Boolean).join(lang === 'es' ? ' y ' : ' and ');
}

// "Tu carrito · 3 sopas" / "Tu carrito · 1 caja y 2 sopas"
export function cartTitle(p: Pick<CartPricing, 'soupCount' | 'itemCount'>, lang: Lang = 'es'): string {
  return `${lang === 'es' ? 'Tu carrito' : 'Your cart'} · ${cartCountLabel(p, lang)}`;
}

// Mensaje sobre la barra de progreso: primero el envío gratis (por monto), luego el 20% (por artículos).
export function progressMessage(p: CartPricing, lang: Lang = 'es'): string {
  const pct = COMMERCE.bulkDiscountPercent;
  const bulkDone = pct > 0 && p.discountType === 'bulk';
  const toBulk = pct > 0 && !bulkDone ? p.soupsToBulkDiscount : 0;
  if (!p.freeShippingReason) {
    const oneSoup = p.itemCount > 0 && p.amountToFreeShipping <= COMMERCE.cheapestSoupPrice;
    if (lang === 'en') return oneSoup ? 'Add 1 more soup for free shipping' : `${formatMXN(p.amountToFreeShipping)} to go for free shipping`;
    return oneSoup ? 'Agrega 1 sopa más y tu envío es gratis' : `Te faltan ${formatMXN(p.amountToFreeShipping)} para envío gratis`;
  }
  if (lang === 'en') {
    if (bulkDone) return `You have free shipping and ${pct}% off`;
    return toBulk ? `You have free shipping. ${toBulk} more for ${pct}% off` : 'You have free shipping';
  }
  if (bulkDone) return `Tienes envío gratis y ${pct}% menos`;
  if (!toBulk) return 'Ya tienes envío gratis';
  return `Ya tienes envío gratis. ${toBulk === 1 ? 'Te falta 1' : `Te faltan ${toBulk}`} para ${pct}% menos`;
}

// Etiqueta junto al precio de la caja: "Envío gratis" (boxShipsFree o si la caja sola llega al mínimo);
// si no, "+ envío, o gratis si agregas 1 sopa".
export function boxShippingNote(boxPriceCents: number, lang: Lang = 'es', config = COMMERCE): string {
  const gap = config.freeShippingMinAmount - boxPriceCents;
  if (config.boxShipsFree || gap <= 0) return lang === 'es' ? 'Envío gratis' : 'Free shipping';
  const n = Math.ceil(gap / config.cheapestSoupPrice);
  return lang === 'es'
    ? `+ envío, o gratis si agregas ${n === 1 ? '1 sopa' : `${n} sopas`}`
    : `+ shipping, or free if you add ${n === 1 ? '1 soup' : `${n} soups`}`;
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

// Ficha de producto: "Pide antes del domingo 23:59 y llega el lunes 2 de noviembre"
export function deliveryPromise(iso: string, lang: Lang = 'es'): string {
  const { day, time } = cutoffFor(iso, lang);
  return lang === 'es'
    ? `Pide antes del ${day} ${time} y llega el ${formatDeliveryDate(iso, 'es')}`
    : `Order by ${day} ${time} and it arrives ${formatDeliveryDate(iso, 'en')}`;
}

// Ficha de producto: "Envío gratis desde $725 · 20% menos desde 10 sopas" (de settings.json)
export function offerLine(lang: Lang = 'es'): string {
  const ship = formatMXN(COMMERCE.freeShippingMinAmount);
  const { bulkDiscountPercent: pct, bulkDiscountMinItems: min } = COMMERCE;
  const es = lang === 'es';
  const parts = [es ? `Envío gratis desde ${ship}` : `Free shipping from ${ship}`];
  if (pct) parts.push(es ? `${pct}% menos desde ${min} sopas` : `${pct}% off from ${min} soups`);
  return parts.join(' · ');
}
