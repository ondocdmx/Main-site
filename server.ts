import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

app.post('/api/create-cart-checkout', async (req, res) => {
  const { cartItems, couponId } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    res.status(400).json({ error: 'cartItems is required' });
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const line_items = cartItems.map((item: { priceId: string; quantity: number }) => ({
    price: item.priceId,
    quantity: item.quantity,
  }));

  const sessionParams: any = {
    mode: 'payment',
    line_items,
    success_url: `${frontendUrl}?payment=success`,
    cancel_url: frontendUrl,
  };

  if (couponId) {
    sessionParams.discounts = [{ coupon: couponId }];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  res.json({ url: session.url });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, frequency, quantity, selectedSoups, letOndoChoose, contingencies } = req.body;

  if (!priceId) {
    res.status(400).json({ error: 'priceId is required' });
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Stripe metadata values are limited to 500 chars each
  const soupsValue = Array.isArray(selectedSoups)
    ? selectedSoups.join(' | ').slice(0, 490)
    : '';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        frequency: frequency || '',
        soups_per_delivery: String(quantity || ''),
        let_ondo_choose: String(letOndoChoose || false),
        selected_soups: soupsValue,
        contingencies: (contingencies || '').slice(0, 490),
      },
    },
    success_url: `${frontendUrl}?subscription=success`,
    cancel_url: frontendUrl,
  });

  res.json({ url: session.url });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ONDO API server running on http://localhost:${PORT}`);
});
