// Carrito (cajón lateral): sopas, barra de beneficios, entrega (día, franja, código postal), totales y pago.
// Todo el dinero sale de priceCart() y las fechas de delivery.ts; aquí solo se pinta.
import React, { useEffect, useRef, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import type { CartPricing } from '../commerce/priceCart';
import { COMMERCE } from '../commerce/config';
import { blockerMessage, cartTitle, checkoutBlocker, formatMXN, progressMessage } from '../commerce/cartCopy';
import { formatDeliveryDate, isPostalInZone, isValidPostal, nextDeliveryDate, normalizePostal } from '../commerce/delivery';
import { productToItem, pushEcommerce } from '../analytics';

type Lang = 'es' | 'en';
export type CartLine = { product: any; quantity: number };
export type CheckoutRequest = { slot: string; postal: string; deliveryDate: string };
export type CheckoutResult = { error?: string; deliveryDate?: string };

const SLOT_KEY = 'ondo_cart_slot';
const POSTAL_KEY = 'ondo_cart_postal';
const readStore = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const writeStore = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* noop */ } };

const whatsappLink = (text: string) => `https://wa.me/${COMMERCE.whatsappNumber}?text=${encodeURIComponent(text)}`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBrowse: () => void;
  cart: CartLine[];
  pricing: CartPricing;
  lang: Lang;
  resolveText: (v: any) => string;
  resolveImage: (v: any) => string;
  onChangeQuantity: (productId: string, delta: number) => void;
  onCheckout: (req: CheckoutRequest) => Promise<CheckoutResult>;
}

export default function CartDrawer({ isOpen, onClose, onBrowse, cart, pricing, lang, resolveText, resolveImage, onChangeQuantity, onCheckout }: Props) {
  const es = lang === 'es';
  const [slot, setSlot] = useState<string | null>(() => {
    const saved = readStore(SLOT_KEY);
    return COMMERCE.deliverySlots.some(s => s.id === saved) ? saved : null;
  });
  const [postal, setPostal] = useState<string>(() => normalizePostal(readStore(POSTAL_KEY) || readStore('ondo_delivery_postal') || ''));
  // La fecha se recalcula cada minuto: si pasa el corte con el carrito abierto, cambia sola.
  const [deliveryDate, setDeliveryDate] = useState(() => nextDeliveryDate());
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySent, setNotifySent] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setDeliveryDate(nextDeliveryDate()), 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (slot) writeStore(SLOT_KEY, slot); }, [slot]);
  useEffect(() => { writeStore(POSTAL_KEY, postal); }, [postal]);

  const postalValid = isValidPostal(postal);
  const postalInZone = isPostalInZone(postal);
  const blocker = checkoutBlocker({ slot, postalValid, postalInZone });

  // add_shipping_info: una vez por cada combinación válida de franja + código postal.
  const lastShippingInfo = useRef('');
  useEffect(() => {
    if (!slot || !postalInZone || cart.length === 0) return;
    const key = `${slot}|${postal}`;
    if (lastShippingInfo.current === key) return;
    lastShippingInfo.current = key;
    pushEcommerce('add_shipping_info', cart.map(l => productToItem(l.product, l.quantity)), {
      value: (pricing.subtotal - pricing.discountAmount) / 100,
      shipping_tier: slot,
    });
  }, [slot, postal, postalInZone, cart.length]);

  // Fuera de zona: se guarda el CP como lead una vez (sin correo), para saber dónde nos buscan.
  const reportedPostal = useRef('');
  useEffect(() => {
    setNotifySent(false);
    if (!postalValid || postalInZone || reportedPostal.current === postal) return;
    reportedPostal.current = postal;
    saveLead(postal);
  }, [postal]);

  function saveLead(cp: string, email?: string) {
    fetch('/api/submit-delivery-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postalCode: cp, isServiceable: false, address: '', ...(email ? { email } : {}) }),
    }).catch(() => { /* no bloquea al cliente */ });
  }

  async function pay() {
    if (blocker || !slot || isPaying) return;
    setIsPaying(true);
    setPayError('');
    const result = await onCheckout({ slot, postal, deliveryDate });
    // Si todo va bien, el navegador ya se fue a Stripe. Si no, se explica aquí mismo.
    if (!result.deliveryDate && !result.error) return; // el navegador ya va camino a Stripe
    if (result.deliveryDate) {
      setDeliveryDate(result.deliveryDate);
      setPayError(es
        ? `Pasó la hora de corte: tu pedido ahora llega el ${formatDeliveryDate(result.deliveryDate)}. Revisa y vuelve a pagar.`
        : `The cutoff passed: your order now arrives ${formatDeliveryDate(result.deliveryDate, 'en')}. Check and pay again.`);
    } else if (result.error) {
      setPayError(result.error);
    }
    setIsPaying(false);
  }

  function goToDelivery() {
    document.getElementById('cart-delivery-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (slot && !postalValid) document.getElementById('cart-postal')?.focus({ preventScroll: true });
  }

  const hasBox = pricing.freeShippingReason === 'box';
  const bulkOn = COMMERCE.bulkDiscountPercent > 0;
  const barMax = bulkOn ? COMMERCE.bulkDiscountMinItems : COMMERCE.freeShippingMinSoups;
  const barFill = Math.min(pricing.itemCount / barMax, 1) * 100;
  const markerAt = (COMMERCE.freeShippingMinSoups / barMax) * 100;
  const dateText = formatDeliveryDate(deliveryDate, lang);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-brand-ink/40 z-40 backdrop-blur-sm" onClick={onClose} />}
      <aside
        aria-label={es ? 'Carrito' : 'Cart'}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-brand-card text-brand-ink shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full invisible'}`}
      >
        {/* Título */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="font-title font-bold text-[22px] leading-tight">
            {cart.length ? cartTitle(pricing, lang) : (es ? 'Tu carrito' : 'Your cart')}
          </h2>
          <button type="button" onClick={onClose} aria-label={es ? 'Cerrar carrito' : 'Close cart'} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-brand-cream">
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-brand-cream px-6 text-center">
            <p className="font-body text-[16px]">{es ? 'Tu carrito está vacío.' : 'Your cart is empty.'}</p>
            <button type="button" onClick={onBrowse} className="h-12 px-6 rounded-xl bg-brand-cta text-white font-title font-bold text-[16px]">
              {es ? 'Ver sopas' : 'See soups'}
            </button>
          </div>
        ) : (
          <>
            {/* Barra: envío gratis a 7 sopas, 20% a 10 artículos */}
            <div className="px-4 pb-4 border-b border-brand-ink/10">
              <p className="font-body font-semibold text-[15px] mb-2" aria-live="polite">{progressMessage(pricing, lang)}</p>
              <div className="relative h-2.5 rounded-full bg-brand-cream">
                <div className="h-full rounded-full bg-brand-mid transition-all duration-500" style={{ width: `${barFill}%` }} />
                {bulkOn && !hasBox && (
                  <div className="absolute -top-1 w-[3px] h-[18px] bg-brand-ink rounded" style={{ left: `calc(${markerAt}% - 1px)` }} aria-hidden />
                )}
              </div>
              {bulkOn && (
                <div className="relative h-5 mt-1 font-body text-[12px] text-brand-ink/75">
                  {!hasBox && (
                    <span className="absolute -translate-x-full pr-2 whitespace-nowrap" style={{ left: `${markerAt}%` }}>
                      {es ? `${COMMERCE.freeShippingMinSoups} sopas · envío gratis` : `${COMMERCE.freeShippingMinSoups} soups · free shipping`}
                    </span>
                  )}
                  <span className="absolute right-0 whitespace-nowrap">
                    {es ? `${COMMERCE.bulkDiscountMinItems} · ${COMMERCE.bulkDiscountPercent}% menos` : `${COMMERCE.bulkDiscountMinItems} · ${COMMERCE.bulkDiscountPercent}% off`}
                  </span>
                </div>
              )}
            </div>

            {/* Sopas + entrega (se desplaza); totales y botón quedan fijos abajo */}
            <div className="flex-1 overflow-y-auto bg-brand-cream px-4 py-4 flex flex-col gap-3">
              {cart.map(({ product, quantity }) => {
                const line = pricing.lines.find(l => l.productId === product._id);
                const name = resolveText(product.title);
                const tagline = (resolveText(product.tagline) || '').split('|')[0].replace(/\*.*/, '').trim();
                return (
                  <div key={product._id} className="flex gap-3 p-3 rounded-2xl bg-brand-card">
                    <img
                      src={resolveImage(product.platedImage || product.image)}
                      alt={name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-brand-cream"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-title font-bold text-[16px] leading-tight">{name}</h3>
                        <div className="text-right shrink-0">
                          {line?.lineDiscount ? (
                            <span className="block font-body text-[12px] text-brand-ink/60 line-through">{formatMXN(line.lineSubtotal)}</span>
                          ) : null}
                          <span className="font-title font-bold text-[16px]">{formatMXN(line?.lineTotal ?? 0)}</span>
                        </div>
                      </div>
                      {tagline && <p className="font-body text-[14px] text-brand-ink/75 truncate">{tagline}</p>}
                      <div className="mt-2 inline-flex items-center h-11 rounded-xl border border-brand-ink/20 bg-brand-card">
                        <button type="button" onClick={() => onChangeQuantity(product._id, -1)} aria-label={es ? `Quitar una ${name}` : `Remove one ${name}`} className="w-11 h-11 flex items-center justify-center">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-title font-bold text-[16px]" aria-live="polite">{quantity}</span>
                        <button type="button" onClick={() => onChangeQuantity(product._id, 1)} aria-label={es ? `Añadir otra ${name}` : `Add another ${name}`} className="w-11 h-11 flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Entrega */}
              <section className="mt-3" aria-labelledby="cart-delivery-title">
                <h3 id="cart-delivery-title" className="font-title font-bold text-[18px] mb-3">
                  {es ? `Llega el ${dateText}` : `Arrives ${dateText}`}
                </h3>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label={es ? 'Franja de entrega' : 'Delivery slot'}>
                  {COMMERCE.deliverySlots.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={slot === s.id}
                      onClick={() => setSlot(s.id)}
                      className={`h-14 rounded-xl border font-title font-bold text-[15px] transition-colors ${slot === s.id ? 'bg-brand-deep border-brand-deep text-white' : 'bg-brand-card border-brand-ink/25 hover:border-brand-deep'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <label htmlFor="cart-postal" className="block font-body font-semibold text-[14px] mt-4 mb-1">
                  {es ? 'Código postal de entrega' : 'Delivery postal code'}
                </label>
                <input
                  id="cart-postal"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="06700"
                  value={postal}
                  onChange={e => setPostal(normalizePostal(e.target.value))}
                  aria-describedby="cart-postal-status"
                  className="w-full h-12 px-4 rounded-xl border border-brand-ink/25 bg-brand-card font-body text-[16px] focus:outline-none focus:border-brand-deep"
                />
                <div id="cart-postal-status" aria-live="polite">
                  {postalValid && postalInZone && (
                    <p className="mt-2 flex items-center gap-1.5 font-body font-semibold text-[14px] text-brand-mid">
                      <Check className="w-4 h-4" /> {es ? 'Entregamos en tu zona' : 'We deliver to your area'}
                    </p>
                  )}
                  {postalValid && !postalInZone && (
                    <div className="mt-3 p-3 rounded-xl bg-brand-card">
                      <p className="font-body font-semibold text-[14px]">{es ? 'Aún no llegamos a tu zona.' : "We don't deliver to your area yet."}</p>
                      <p className="font-body text-[14px] text-brand-ink/80 mb-3">{es ? 'Escríbenos y vemos qué podemos hacer.' : "Message us and we'll see what we can do."}</p>
                      <a
                        href={whatsappLink(es ? `Hola Ondo, mi código postal es ${postal} y me gustaría pedir sopa.` : `Hi Ondo, my postal code is ${postal} and I'd like to order soup.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-11 rounded-xl bg-brand-deep text-white font-title font-bold text-[15px]"
                      >
                        {es ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp'}
                      </a>
                      {notifySent ? (
                        <p className="mt-3 font-body text-[14px] text-brand-mid font-semibold">{es ? '¡Gracias! Te avisamos cuando lleguemos.' : "Thanks! We'll let you know when we get there."}</p>
                      ) : (
                        <form
                          className="mt-3"
                          onSubmit={e => { e.preventDefault(); if (!notifyEmail.trim()) return; saveLead(postal, notifyEmail.trim()); setNotifySent(true); }}
                        >
                          <label htmlFor="cart-notify" className="block font-body text-[14px] mb-1">
                            {es ? 'O déjanos tu correo y te avisamos cuando lleguemos:' : "Or leave your email and we'll tell you when we arrive:"}
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="cart-notify"
                              type="email"
                              autoComplete="email"
                              value={notifyEmail}
                              onChange={e => setNotifyEmail(e.target.value)}
                              placeholder={es ? 'tu@correo.com' : 'you@email.com'}
                              className="flex-1 min-w-0 h-11 px-3 rounded-xl border border-brand-ink/25 bg-brand-card font-body text-[16px] focus:outline-none focus:border-brand-deep"
                            />
                            <button type="submit" disabled={!notifyEmail.trim()} className="h-11 px-4 rounded-xl border-2 border-brand-deep text-brand-deep font-title font-bold text-[14px] disabled:opacity-50">
                              {es ? 'Avísame' : 'Notify me'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Totales + pago (fijos abajo) */}
            <div className="border-t border-brand-ink/10 bg-brand-card px-4 pt-3 pb-4 shrink-0">
              <dl className="font-body text-[15px]">
                <div className="flex justify-between py-0.5"><dt>Subtotal</dt><dd>{formatMXN(pricing.subtotal)}</dd></div>
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between py-0.5 text-brand-mid font-semibold">
                    <dt>{es ? `Descuento ${pricing.discountPercent}%` : `${pricing.discountPercent}% discount`}</dt>
                    <dd>−{formatMXN(pricing.discountAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between py-0.5"><dt>{es ? 'Envío' : 'Shipping'}</dt><dd>{pricing.shipping === 0 ? (es ? 'Gratis' : 'Free') : formatMXN(pricing.shipping)}</dd></div>
                <div className="flex justify-between items-baseline border-t border-brand-ink/10 mt-1.5 pt-1.5">
                  <dt className="font-title font-bold text-[20px]">Total</dt>
                  <dd className="font-title font-bold text-[24px]">{formatMXN(pricing.total)}</dd>
                </div>
              </dl>
              <div className="min-h-[20px] mt-2 text-center font-body text-[13px] text-brand-ink/80" role="status">
                {payError || (blocker && blocker !== 'outOfZone' ? (
                  // La entrega puede quedar abajo del todo: el aviso lleva hasta ella.
                  <button type="button" onClick={goToDelivery} className="underline underline-offset-2">{blockerMessage(blocker, lang)}</button>
                ) : blockerMessage(blocker, lang))}
              </div>
              <button
                type="button"
                onClick={pay}
                disabled={!!blocker || isPaying}
                className="mt-1 w-full h-14 rounded-xl bg-brand-cta text-white font-title font-bold text-[18px] transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {isPaying ? (es ? 'Abriendo el pago…' : 'Opening checkout…') : `${es ? 'Pagar' : 'Pay'} ${formatMXN(pricing.total)}`}
              </button>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {COMMERCE.cartPaymentMethods.map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-lg border border-brand-ink/20 font-body text-[13px] font-semibold">{m}</span>
                ))}
              </div>
              <a
                href={whatsappLink(es ? 'Hola Ondo, tengo una duda con mi pedido.' : 'Hi Ondo, I have a question about my order.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block py-2 text-center font-body font-semibold text-[14px] text-brand-deep underline"
              >
                {es ? '¿Dudas? Escríbenos por WhatsApp' : 'Questions? Message us on WhatsApp'}
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
