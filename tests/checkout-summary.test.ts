// Resumen del pedido para la página de éxito, con Stripe simulado.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const retrieve = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({ checkout: { sessions: { retrieve } } })),
}));

const { default: handler } = await import('../api/checkout-summary');

async function call(query: any) {
  const res: any = { statusCode: 200, body: null, headers: {} };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; return res; };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  await handler({ method: 'GET', query } as any, res);
  return res;
}

const session = {
  mode: 'payment',
  payment_status: 'paid',
  amount_subtotal: 37500,
  amount_total: 42500,
  total_details: { amount_discount: 0, amount_shipping: 5000 },
  metadata: { delivery_date: '2026-11-02', delivery_slot: 'slot_9_13', delivery_postal: '06700' },
  customer_details: { email: 'cliente@example.com', address: { line1: 'Calle 1' } },
  line_items: { data: [{ description: 'Mega verde', quantity: 3, amount_total: 37500 }] },
  payment_intent: { next_action: null },
};

beforeEach(() => retrieve.mockReset());

describe('api/checkout-summary', () => {
  it('devuelve el resumen sin datos personales', async () => {
    retrieve.mockResolvedValue(session);
    const res = await call({ session_id: 'cs_test_abc123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      paymentStatus: 'paid', amountTotal: 42500, amountShipping: 5000,
      deliveryDate: '2026-11-02', deliverySlot: 'slot_9_13', oxxoVoucherUrl: null,
      items: [{ name: 'Mega verde', quantity: 3, amount: 37500 }],
    });
    expect(JSON.stringify(res.body)).not.toMatch(/cliente@example|Calle 1|06700/);
  });

  it('OXXO pendiente: devuelve el enlace a la ficha', async () => {
    retrieve.mockResolvedValue({
      ...session, payment_status: 'unpaid',
      payment_intent: { next_action: { oxxo_display_details: { hosted_voucher_url: 'https://voucher.test' } } },
    });
    const res = await call({ session_id: 'cs_test_abc123' });
    expect(res.body).toMatchObject({ paymentStatus: 'unpaid', oxxoVoucherUrl: 'https://voucher.test' });
  });

  it('rechaza ids inválidos y suscripciones', async () => {
    expect((await call({ session_id: 'nope' })).statusCode).toBe(400);
    retrieve.mockResolvedValue({ ...session, mode: 'subscription' });
    expect((await call({ session_id: 'cs_test_abc123' })).statusCode).toBe(404);
  });
});
