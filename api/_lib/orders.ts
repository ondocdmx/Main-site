// Pedido del carrito tal como se guarda en la hoja "Pedidos" (Apps Script, docs/apps-script/pedidos.gs).
// Puro: recibe la sesión de Stripe ya leída, sin red. Lo usa api/stripe-webhook.ts.
import { formatDeliveryDate, isPostalInZone, nextDeliveryDate } from '../../src/commerce/delivery.js';

export type OrderStatus = 'pagado' | 'pendiente_oxxo' | 'oxxo_no_pagado';

export interface OrderRecord {
  session_id: string;
  status: OrderStatus;
  payment_method: 'card' | 'oxxo';
  updated_at: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  stripe_postal: string;
  cart_postal: string;
  delivery_date: string;
  delivery_slot: string;
  items: string;
  subtotal: number; // pesos
  discount: number;
  discount_type: string;
  shipping: number;
  total: number;
  review_reasons: string[];
}

const pesos = (cents: number | null | undefined) => (cents ?? 0) / 100;

export function orderStatus(eventType: string, paymentStatus: string): OrderStatus {
  if (eventType === 'checkout.session.async_payment_failed') return 'oxxo_no_pagado';
  return paymentStatus === 'paid' ? 'pagado' : 'pendiente_oxxo';
}

// Motivos para revisar a mano un pedido pagado. Vacío = todo en orden.
export function reviewReasons(o: Pick<OrderRecord, 'status' | 'payment_method' | 'stripe_postal' | 'cart_postal' | 'delivery_date'>, now: Date): string[] {
  if (o.status !== 'pagado') return [];
  const reasons: string[] = [];
  if (!o.stripe_postal) reasons.push('Stripe no tiene código postal de envío');
  else {
    if (o.stripe_postal !== o.cart_postal) reasons.push(`CP distinto: carrito ${o.cart_postal || '—'}, Stripe ${o.stripe_postal}`);
    if (!isPostalInZone(o.stripe_postal)) reasons.push(`CP de Stripe fuera de zona: ${o.stripe_postal}`);
  }
  // OXXO se confirma hasta 1 día hábil después de pagar: si llega pasado el corte, ya no entra ese lunes.
  if (o.payment_method === 'oxxo' && o.delivery_date) {
    const next = nextDeliveryDate(now);
    if (next > o.delivery_date) reasons.push(`OXXO pagado después del corte del ${formatDeliveryDate(o.delivery_date)}: entregar el ${formatDeliveryDate(next)}`);
  }
  return reasons;
}

export function buildOrderRecord(session: any, eventType: string, now: Date = new Date()): OrderRecord {
  const status = orderStatus(eventType, session.payment_status);
  const intent = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null;
  const chargeType = intent?.latest_charge?.payment_method_details?.type;
  const isOxxo = eventType !== 'checkout.session.completed' || status === 'pendiente_oxxo' || chargeType === 'oxxo';
  // Con apiVersion 2024-06-20 la dirección está en shipping_details; versiones nuevas la mueven.
  const shipping = session.shipping_details ?? session.collected_information?.shipping_details ?? null;
  const addr = shipping?.address ?? {};
  const record = {
    session_id: session.id,
    status,
    payment_method: (isOxxo ? 'oxxo' : 'card') as 'card' | 'oxxo',
    updated_at: now.toISOString(),
    email: session.customer_details?.email || '',
    name: shipping?.name || session.customer_details?.name || '',
    phone: session.customer_details?.phone || '',
    address: [addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(', '),
    stripe_postal: String(addr.postal_code || '').trim(),
    cart_postal: session.metadata?.delivery_postal || '',
    delivery_date: session.metadata?.delivery_date || '',
    delivery_slot: session.metadata?.delivery_slot || '',
    items: (session.line_items?.data || []).map((l: any) => `${l.description} x${l.quantity}`).join(' | '),
    subtotal: pesos(session.amount_subtotal),
    discount: pesos(session.total_details?.amount_discount),
    discount_type: session.metadata?.discount_type || '',
    shipping: pesos(session.total_details?.amount_shipping),
    total: pesos(session.amount_total),
  };
  return { ...record, review_reasons: reviewReasons(record, now) };
}
