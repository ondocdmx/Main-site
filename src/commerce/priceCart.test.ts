import { describe, expect, it } from 'vitest';
import { cartNudge, priceCart, type CartItem, type PricedProduct } from './priceCart.js';
import { COMMERCE } from './config.js';

const veg: PricedProduct = { _id: 'veg', price: 125 };
const meat: PricedProduct = { _id: 'meat', price: 150 };
const box: PricedProduct = { _id: 'box', price: 600, isBox: true };
const soups = (n: number, product = veg): CartItem => ({ product, quantity: n });

describe('config (settings.json)', () => {
  it('tiene las reglas acordadas', () => {
    expect(COMMERCE.shippingFee).toBe(5000);
    expect(COMMERCE.freeShippingMinSoups).toBe(7);
    expect(COMMERCE.bulkDiscountMinItems).toBe(10);
    expect(COMMERCE.bulkDiscountPercent).toBe(20);
    expect(COMMERCE.boxShipsFree).toBe(true);
    expect(COMMERCE.welcomeCode).toBe('ONDOFIRST');
    expect(COMMERCE.welcomePercent).toBe(10);
  });
});

describe('priceCart', () => {
  it('carrito vacío: todo en cero, sin envío', () => {
    const r = priceCart([]);
    expect(r).toMatchObject({
      soupCount: 0, subtotal: 0, discountType: null, discountAmount: 0, shipping: 0, total: 0,
      freeShippingReason: null, soupsToFreeShipping: 7, soupsToBulkDiscount: 10,
    });
  });

  it('1 sopa: paga envío', () => {
    const r = priceCart([soups(1)]);
    expect(r).toMatchObject({ subtotal: 12500, discountType: null, shipping: 5000, total: 17500, soupsToFreeShipping: 6, soupsToBulkDiscount: 9 });
  });

  it('6 sopas: aún paga envío, le falta 1', () => {
    const r = priceCart([soups(6)]);
    expect(r).toMatchObject({ subtotal: 75000, shipping: 5000, total: 80000, freeShippingReason: null, soupsToFreeShipping: 1 });
  });

  it('7 sopas: envío gratis', () => {
    const r = priceCart([soups(7)]);
    expect(r).toMatchObject({ subtotal: 87500, discountType: null, shipping: 0, total: 87500, freeShippingReason: 'minSoups', soupsToFreeShipping: 0, soupsToBulkDiscount: 3 });
  });

  it('9 sopas: envío gratis, sin 20%', () => {
    const r = priceCart([soups(5), soups(4, meat)]);
    expect(r).toMatchObject({ subtotal: 122500, discountType: null, discountAmount: 0, shipping: 0, total: 122500, soupsToBulkDiscount: 1 });
  });

  it('10 sopas: 20% y envío gratis', () => {
    const r = priceCart([soups(10)]);
    expect(r).toMatchObject({ subtotal: 125000, discountType: 'bulk', discountPercent: 20, discountAmount: 25000, shipping: 0, total: 100000, soupsToBulkDiscount: 0 });
  });

  it('12 sopas mixtas: 20% sobre todas', () => {
    const r = priceCart([soups(6), soups(6, meat)]);
    expect(r).toMatchObject({ subtotal: 165000, discountType: 'bulk', discountAmount: 33000, shipping: 0, total: 132000 });
  });

  it('caja sola: $600, envío gratis', () => {
    const r = priceCart([{ product: box, quantity: 1 }]);
    expect(r).toMatchObject({ soupCount: 0, itemCount: 1, subtotal: 60000, discountType: null, shipping: 0, total: 60000, freeShippingReason: 'box', soupsToFreeShipping: 0 });
  });

  it('caja + 2 sopas: envío gratis por la caja', () => {
    const r = priceCart([{ product: box, quantity: 1 }, soups(2)]);
    expect(r).toMatchObject({ soupCount: 2, itemCount: 3, subtotal: 85000, discountType: null, shipping: 0, total: 85000, freeShippingReason: 'box' });
  });

  it('caja + 5 sopas: la caja cuenta como 1 → 6 artículos, sin 20%', () => {
    const r = priceCart([{ product: box, quantity: 1 }, soups(5)]);
    expect(r).toMatchObject({ itemCount: 6, subtotal: 122500, discountType: null, shipping: 0, total: 122500, soupsToBulkDiscount: 4 });
  });

  it('caja + 9 sopas (ejemplo de CLAUDE.md): 20% solo a las sopas, caja a $600', () => {
    const r = priceCart([{ product: box, quantity: 1 }, soups(9)]);
    expect(r.itemCount).toBe(10);
    expect(r.discountType).toBe('bulk');
    expect(r.lines.find(l => l.productId === 'box')).toMatchObject({ lineDiscount: 0, lineTotal: 60000 });
    expect(r).toMatchObject({ subtotal: 172500, discountAmount: 22500, shipping: 0, total: 150000 });
  });

  it('ONDOFIRST con 3 sopas: 10% a las sopas, el envío se cobra completo', () => {
    const r = priceCart([soups(3)], { welcomeCode: 'ONDOFIRST' });
    expect(r).toMatchObject({ subtotal: 37500, discountType: 'welcome', discountPercent: 10, discountAmount: 3750, shipping: 5000, total: 38750 });
  });

  it('ONDOFIRST con 10 sopas: gana el 20%, no se suman', () => {
    const r = priceCart([soups(10)], { welcomeCode: 'ONDOFIRST' });
    expect(r).toMatchObject({ discountType: 'bulk', discountPercent: 20, discountAmount: 25000, total: 100000 });
  });

  it('ONDOFIRST con una caja: 10% a la caja, envío gratis', () => {
    const r = priceCart([{ product: box, quantity: 1 }], { welcomeCode: 'ondofirst ' });
    expect(r).toMatchObject({ discountType: 'welcome', discountAmount: 6000, shipping: 0, total: 54000 });
  });

  it('código desconocido: no hace nada', () => {
    const r = priceCart([soups(3)], { welcomeCode: 'OTRO' });
    expect(r).toMatchObject({ discountType: null, discountAmount: 0, total: 42500 });
  });

  it('rechaza cantidades inválidas', () => {
    expect(() => priceCart([soups(-1)])).toThrow();
    expect(() => priceCart([soups(1.5)])).toThrow();
  });
});

describe('cartNudge (aviso en la tienda)', () => {
  it('no avisa con el carrito vacío ni lejos del envío gratis (4 sopas)', () => {
    expect(cartNudge(priceCart([]))).toBeNull();
    expect(cartNudge(priceCart([soups(4)]))).toBeNull();
  });
  it('5 sopas: faltan 2 para envío gratis', () => {
    expect(cartNudge(priceCart([soups(5)]))).toEqual({ type: 'freeShipping', count: 2 });
  });
  it('6 sopas: falta 1 para envío gratis', () => {
    expect(cartNudge(priceCart([soups(6)]))).toEqual({ type: 'freeShipping', count: 1 });
  });
  it('7 a 8 sopas: ya tiene envío gratis, sin aviso', () => {
    expect(cartNudge(priceCart([soups(7)]))).toBeNull();
    expect(cartNudge(priceCart([soups(8)]))).toBeNull();
  });
  it('9 sopas: falta 1 para el 20%', () => {
    expect(cartNudge(priceCart([soups(9)]))).toEqual({ type: 'bulk', count: 1 });
  });
  it('caja + 5 sopas: el envío ya es gratis, sin aviso', () => {
    expect(cartNudge(priceCart([{ product: box, quantity: 1 }, soups(5)]))).toBeNull();
  });
});
