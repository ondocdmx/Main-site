import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    origin, productId, amount, frequency, quantity,
    selectedSoups, letOndoChoose, contingencies,
    deliverySlot, deliveryAddress, deliveryPostal,
  } = req.body;

  if (!productId || !amount) {
    res.status(400).json({ error: 'productId and amount are required' });
    return;
  }

  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';

  const soupsValue = Array.isArray(selectedSoups)
    ? selectedSoups.join(' | ').slice(0, 490)
    : '';

  const interval = frequency === 'Mensual' ? 'month' : 'week';
  const intervalCount = frequency === 'Mensual' ? 1 : 2;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['MX'] },
      line_items: [{
        price_data: {
          currency: 'mxn',
          product: productId,
          unit_amount: Math.round(amount * 100),
          recurring: { interval, interval_count: intervalCount },
        },
        quantity: 1,
      }],
      subscription_data: {
        metadata: {
          frequency: frequency || '',
          soups_per_delivery: String(quantity || ''),
          let_ondo_choose: String(letOndoChoose || false),
          selected_soups: soupsValue,
          contingencies: (contingencies || '').slice(0, 490),
          delivery_slot: deliverySlot || '',
          delivery_address: (deliveryAddress || '').slice(0, 490),
          delivery_postal: deliveryPostal || '',
        },
      },
      success_url: `${frontendUrl}?subscription=success`,
      cancel_url: frontendUrl,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
