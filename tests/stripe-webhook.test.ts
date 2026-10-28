// Webhook de Stripe con firmas reales (la librería de Stripe firma sin red) y Stripe/hoja simulados.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const retrieve = vi.fn();
const piUpdate = vi.fn();
let realStripe: any;
vi.mock('stripe', async importOriginal => {
  const Actual: any = (await importOriginal<any>()).default;
  return {
    default: vi.fn().mockImplementation(() => {
      realStripe = new Actual('sk_test_x');
      realStripe.checkout.sessions.retrieve = retrieve;
      realStripe.paymentIntents.update = piUpdate;
      return realStripe;
    }),
  };
});

const SECRET = 'whsec_test_ondo';
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
process.env.ORDERS_WEBHOOK_URL = 'https://script.test/exec';
process.env.ORDERS_WEBHOOK_TOKEN = 'tok';

const { default: handler } = await import('../api/stripe-webhook');
const { reviewReasons } = await import('../api/_lib/orders');
const { nextDeliveryDate } = await import('../src/commerce/delivery');

const sheet = vi.fn();
vi.stubGlobal('fetch', sheet);

const DATE = nextDeliveryDate();
function session(over: any = {}) {
  return {
    id: 'cs_test_1',
    mode: 'payment',
    payment_status: 'paid',
    amount_subtotal: 37500,
    amount_total: 42500,
    total_details: { amount_discount: 0, amount_shipping: 5000 },
    metadata: { delivery_date: DATE, delivery_slot: 'slot_9_13', delivery_postal: '06700', discount_type: '' },
    customer_details: { email: 'ana@example.com', name: 'Ana', phone: '+525500000000' },
    shipping_details: { name: 'Ana', address: { line1: 'Calle 1', city: 'CDMX', state: 'CDMX', postal_code: '06700' } },
    line_items: { data: [{ description: 'Mega verde', quantity: 3 }] },
    payment_intent: { id: 'pi_1', metadata: {}, latest_charge: { payment_method_details: { type: 'card' } } },
    ...over,
  };
}

async function deliver(type: string, opts: { signature?: string; mode?: string } = {}) {
  const payload = JSON.stringify({ id: 'evt_1', object: 'event', type, data: { object: { id: 'cs_test_1', object: 'checkout.session', mode: opts.mode || 'payment' } } });
  const signature = opts.signature ?? realStripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  const res: any = { statusCode: 200, body: null };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; return res; };
  await handler({ method: 'POST', headers: { 'stripe-signature': signature }, body: Buffer.from(payload) } as any, res);
  return res;
}
const sentOrder = (i = 0) => JSON.parse(sheet.mock.calls[i][1].body);

beforeEach(() => {
  retrieve.mockReset();
  piUpdate.mockReset();
  piUpdate.mockResolvedValue({});
  sheet.mockReset();
  sheet.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
});

describe('api/stripe-webhook', () => {
  it('rechaza una firma inválida sin tocar nada', async () => {
    const res = await deliver('checkout.session.completed', { signature: 't=1,v1=falsa' });
    expect(res.statusCode).toBe(400);
    expect(retrieve).not.toHaveBeenCalled();
    expect(sheet).not.toHaveBeenCalled();
  });

  it('tarjeta pagada: un pedido "pagado" en la hoja y el pago marcado', async () => {
    retrieve.mockResolvedValue(session());
    const res = await deliver('checkout.session.completed');
    expect(res.statusCode).toBe(200);
    expect(sheet).toHaveBeenCalledTimes(1);
    const body = sentOrder();
    expect(body.token).toBe('tok');
    expect(body.reviewEmail).toBe('ondocdmx@gmail.com');
    expect(body.order).toMatchObject({
      session_id: 'cs_test_1', status: 'pagado', payment_method: 'card', email: 'ana@example.com',
      stripe_postal: '06700', cart_postal: '06700', delivery_date: DATE, delivery_slot: 'slot_9_13',
      items: 'Mega verde x3', subtotal: 375, shipping: 50, total: 425, review_reasons: [],
    });
    expect(piUpdate).toHaveBeenCalledWith('pi_1', { metadata: { ondo_order_status: 'pagado' } });
  });

  it('el mismo evento dos veces = un pedido', async () => {
    retrieve.mockResolvedValueOnce(session());
    await deliver('checkout.session.completed');
    retrieve.mockResolvedValueOnce(session({ payment_intent: { id: 'pi_1', metadata: { ondo_order_status: 'pagado' } } }));
    const res = await deliver('checkout.session.completed');
    expect(res.body).toMatchObject({ duplicate: true });
    expect(sheet).toHaveBeenCalledTimes(1);
  });

  it('OXXO: ficha emitida → pendiente; luego pagado; o vencido', async () => {
    retrieve.mockResolvedValueOnce(session({ payment_status: 'unpaid', payment_intent: { id: 'pi_1', metadata: {} } }));
    await deliver('checkout.session.completed');
    expect(sentOrder(0).order).toMatchObject({ status: 'pendiente_oxxo', payment_method: 'oxxo', review_reasons: [] });

    retrieve.mockResolvedValueOnce(session({ payment_intent: { id: 'pi_1', metadata: { ondo_order_status: 'pendiente_oxxo' } } }));
    await deliver('checkout.session.async_payment_succeeded');
    expect(sentOrder(1).order).toMatchObject({ status: 'pagado', payment_method: 'oxxo' });

    retrieve.mockResolvedValueOnce(session({ payment_status: 'unpaid', payment_intent: { id: 'pi_1', metadata: { ondo_order_status: 'pendiente_oxxo' } } }));
    await deliver('checkout.session.async_payment_failed');
    expect(sentOrder(2).order).toMatchObject({ status: 'oxxo_no_pagado' });
  });

  it('CP de Stripe distinto o fuera de zona: pedido marcado para revisión', async () => {
    retrieve.mockResolvedValue(session({ shipping_details: { name: 'Ana', address: { line1: 'Calle 2', postal_code: '01000' } } }));
    await deliver('checkout.session.completed');
    expect(sentOrder().order.review_reasons).toEqual([
      'CP distinto: carrito 06700, Stripe 01000',
      'CP de Stripe fuera de zona: 01000',
    ]);
  });

  it('si la hoja falla, responde 500 para que Stripe reintente y no marca el pago', async () => {
    retrieve.mockResolvedValue(session());
    sheet.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: false, error: 'token' }) });
    const res = await deliver('checkout.session.completed');
    expect(res.statusCode).toBe(500);
    expect(piUpdate).not.toHaveBeenCalled();
  });

  it('ignora suscripciones y otros eventos', async () => {
    expect((await deliver('checkout.session.completed', { mode: 'subscription' })).body).toMatchObject({ ignored: 'subscription' });
    expect((await deliver('invoice.paid')).body).toMatchObject({ ignored: 'invoice.paid' });
    expect(retrieve).not.toHaveBeenCalled();
  });
});

describe('reviewReasons: OXXO y el corte', () => {
  const base = { status: 'pagado' as const, payment_method: 'oxxo' as const, stripe_postal: '06700', cart_postal: '06700' };
  it('OXXO confirmado antes del corte: sin revisión', () => {
    // Pedido del lunes 2 de nov., pago confirmado el domingo 1 a las 20:00 (CDMX)
    expect(reviewReasons({ ...base, delivery_date: '2026-11-02' }, new Date('2026-11-01T20:00:00-06:00'))).toEqual([]);
  });
  it('OXXO confirmado después del corte: entregar el lunes siguiente', () => {
    expect(reviewReasons({ ...base, delivery_date: '2026-11-02' }, new Date('2026-11-02T09:00:00-06:00'))).toEqual([
      'OXXO pagado después del corte del lunes 2 de noviembre: entregar el lunes 9 de noviembre',
    ]);
  });
  it('tarjeta: nunca por el corte; pendientes: nunca', () => {
    expect(reviewReasons({ ...base, payment_method: 'card', delivery_date: '2026-11-02' }, new Date('2026-11-05T09:00:00-06:00'))).toEqual([]);
    expect(reviewReasons({ ...base, status: 'pendiente_oxxo', stripe_postal: '01000', delivery_date: '2026-11-02' }, new Date())).toEqual([]);
  });
});
