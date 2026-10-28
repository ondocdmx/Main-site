// Contenido del popup de "pago completado" para pedidos del carrito (no suscripciones).
// Los datos vienen de /api/checkout-summary (Stripe), no del navegador.
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { formatMXN } from '../commerce/cartCopy';
import { findSlot, formatDeliveryDate } from '../commerce/delivery';

export interface OrderSummary {
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
  items: { name: string; quantity: number; amount: number }[];
  amountSubtotal: number;
  amountDiscount: number;
  amountShipping: number;
  amountTotal: number;
  deliveryDate: string;
  deliverySlot: string;
  oxxoVoucherUrl: string | null;
}

interface Props {
  summary: OrderSummary | null | false; // null = cargando, false = no se pudo leer
  lang: 'es' | 'en';
  onClose: () => void;
}

export default function OrderSuccess({ summary, lang, onClose }: Props) {
  const es = lang === 'es';
  const pendingOxxo = !!summary && summary.paymentStatus === 'unpaid';
  const slot = summary ? findSlot(summary.deliverySlot) : undefined;
  const date = summary && summary.deliveryDate ? formatDeliveryDate(summary.deliveryDate, lang) : '';
  const weekday = date.split(/[ ,]/)[0];

  return (
    <div className="bg-brand-card text-brand-ink w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
      <div className="bg-brand-deep text-white px-6 pt-8 pb-6 text-center">
        {pendingOxxo ? <Clock className="w-12 h-12 mx-auto mb-3" /> : <CheckCircle className="w-12 h-12 mx-auto mb-3" />}
        <h2 className="font-title font-bold text-[26px] leading-tight">
          {pendingOxxo ? (es ? 'Falta un paso' : 'One more step') : (es ? '¡Gracias por tu pedido!' : 'Thanks for your order!')}
        </h2>
        {date && slot && (
          <p className="font-body text-[16px] mt-2">
            {es ? `Llega el ${date}, ${slot.label}` : `Arrives ${date}, ${slot.label}`}
          </p>
        )}
      </div>

      <div className="px-6 py-6 flex flex-col gap-5">
        {pendingOxxo && (
          <div className="rounded-xl bg-brand-cream p-4">
            <p className="font-body font-semibold text-[15px]">
              {es ? 'Tu pedido queda confirmado cuando pagues en OXXO.' : 'Your order is confirmed once you pay at OXXO.'}
            </p>
            {summary && summary.oxxoVoucherUrl && (
              <a href={summary.oxxoVoucherUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center h-12 rounded-xl bg-brand-cta text-white font-title font-bold text-[16px]">
                {es ? 'Ver tu ficha de pago OXXO' : 'See your OXXO voucher'}
              </a>
            )}
          </div>
        )}

        {summary === null && <p className="font-body text-[15px] text-center">{es ? 'Cargando tu pedido…' : 'Loading your order…'}</p>}

        {summary && (
          <dl className="font-body text-[15px]">
            {summary.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3 py-0.5">
                <dt>{item.quantity} × {item.name}</dt>
                <dd className="shrink-0">{formatMXN(item.amount)}</dd>
              </div>
            ))}
            {summary.amountDiscount > 0 && (
              <div className="flex justify-between py-0.5 text-brand-mid font-semibold"><dt>{es ? 'Descuento' : 'Discount'}</dt><dd>−{formatMXN(summary.amountDiscount)}</dd></div>
            )}
            <div className="flex justify-between py-0.5"><dt>{es ? 'Envío' : 'Shipping'}</dt><dd>{summary.amountShipping ? formatMXN(summary.amountShipping) : (es ? 'Gratis' : 'Free')}</dd></div>
            <div className="flex justify-between items-baseline border-t border-brand-ink/10 mt-1.5 pt-1.5">
              <dt className="font-title font-bold text-[18px]">Total</dt>
              <dd className="font-title font-bold text-[20px]">{formatMXN(summary.amountTotal)}</dd>
            </div>
          </dl>
        )}

        {!pendingOxxo && (
          <p className="font-body text-[15px]">
            {es
              ? `Te escribimos por WhatsApp ${weekday ? `el ${weekday}` : 'el día de entrega'} cuando tu sopa vaya en camino.`
              : `We'll message you on WhatsApp ${weekday ? `on ${weekday}` : 'on delivery day'} when your soup is on its way.`}
          </p>
        )}
        <p className="font-body text-[13px] text-brand-ink/75">
          {es ? 'Stripe te envió el recibo por correo. Si no lo ves, revisa tu carpeta de spam.' : 'Stripe emailed you a receipt. If you don\'t see it, check your spam folder.'}
        </p>

        <button type="button" onClick={onClose} className="h-12 rounded-xl border-2 border-brand-deep text-brand-deep font-title font-bold text-[16px]">
          {es ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  );
}
