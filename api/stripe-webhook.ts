import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildOrderRecord, type OrderRecord } from './_lib/orders.js';
import { COMMERCE } from '../src/commerce/config.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

// Stripe firma el cuerpo tal cual llega: hay que leerlo sin que Vercel lo convierta en JSON.
export const config = { api: { bodyParser: false } };

const HANDLED = new Set([
  'checkout.session.completed', // tarjeta: pagado; OXXO: ficha emitida (aún sin pagar)
  'checkout.session.async_payment_succeeded', // OXXO pagado
  'checkout.session.async_payment_failed', // OXXO vencido sin pagar
]);

// En Vercel, leer req.body lo convierte en JSON (y se pierde el texto firmado): se lee el stream
// directamente. Solo si alguien ya lo consumió (express.raw en server.ts) se usa req.body.
async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const stream = req as any;
  if (stream.readable && !stream.readableEnded && typeof stream[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    return Buffer.concat(chunks);
  }
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  throw new Error('No se pudo leer el cuerpo del webhook');
}

// Manda el pedido a la hoja "Pedidos" (Apps Script). La hoja actualiza la fila por session_id
// y manda el correo de revisión una sola vez. Apps Script ejecuta el script con el POST y responde
// con un 302 a la URL del resultado, que se lee con GET: es justo lo que hace fetch al seguirlo.
async function saveOrder(order: OrderRecord) {
  const url = process.env.ORDERS_WEBHOOK_URL;
  if (!url) throw new Error('ORDERS_WEBHOOK_URL no está configurada');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: process.env.ORDERS_WEBHOOK_TOKEN || '', reviewEmail: COMMERCE.reviewEmail, order }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`La hoja de pedidos respondió ${res.status}`);
  const result: any = await res.json().catch(() => ({}));
  if (result?.ok !== true) throw new Error(`La hoja de pedidos no confirmó: ${result?.error || 'sin respuesta'}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET no está configurada' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await readRawBody(req), String(req.headers['stripe-signature'] || ''), secret);
  } catch (err: any) {
    res.status(400).json({ error: `Firma inválida: ${err.message}` });
    return;
  }

  if (!HANDLED.has(event.type)) {
    res.json({ received: true, ignored: event.type });
    return;
  }
  const eventSession = event.data.object as Stripe.Checkout.Session;
  if (eventSession.mode !== 'payment') {
    // Las suscripciones siguen leyéndose en el Dashboard de Stripe (Fase 5).
    res.json({ received: true, ignored: 'subscription' });
    return;
  }

  try {
    // Se relee la sesión con la versión de API fijada (forma estable) y con sus líneas y el pago.
    const session: any = await stripe.checkout.sessions.retrieve(eventSession.id, {
      expand: ['line_items', 'payment_intent.latest_charge'],
    });
    const order = buildOrderRecord(session, event.type);
    const intent = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null;

    // Idempotente: el pago guarda el último estado registrado. El mismo evento dos veces = un pedido.
    if (intent?.metadata?.ondo_order_status === order.status) {
      res.json({ received: true, duplicate: true });
      return;
    }

    await saveOrder(order);
    if (intent) await stripe.paymentIntents.update(intent.id, { metadata: { ondo_order_status: order.status } });
    res.json({ received: true, status: order.status, review: order.review_reasons.length > 0 });
  } catch (err: any) {
    // 500 = Stripe reintenta (hasta 3 días). Reintentar es seguro: la hoja actualiza por session_id.
    console.error('stripe-webhook:', err?.message);
    res.status(500).json({ error: 'No se pudo registrar el pedido' });
  }
}
