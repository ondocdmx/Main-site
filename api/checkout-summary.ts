import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

// Resumen de un pedido del carrito para la página de "pago completado".
// Solo lectura y sin datos personales (ni dirección, ni correo, ni teléfono).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const sessionId = String(req.query.session_id || '');
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    res.status(400).json({ error: 'session_id inválido' });
    return;
  }

  try {
    const session: any = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
    if (session.mode !== 'payment') {
      res.status(404).json({ error: 'No es un pedido del carrito' });
      return;
    }
    const intent = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null;
    const oxxo = intent?.next_action?.oxxo_display_details;
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      paymentStatus: session.payment_status, // 'paid' | 'unpaid' (OXXO pendiente) | 'no_payment_required'
      items: (session.line_items?.data || []).map((l: any) => ({
        name: l.description,
        quantity: l.quantity,
        amount: l.amount_total,
      })),
      amountSubtotal: session.amount_subtotal,
      amountDiscount: session.total_details?.amount_discount ?? 0,
      amountShipping: session.total_details?.amount_shipping ?? 0,
      amountTotal: session.amount_total,
      deliveryDate: session.metadata?.delivery_date || '',
      deliverySlot: session.metadata?.delivery_slot || '',
      oxxoVoucherUrl: oxxo?.hosted_voucher_url || null,
    });
  } catch (err: any) {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
}
