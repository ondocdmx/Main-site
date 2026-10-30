import { describe, expect, it } from 'vitest';
import { cartNudge, priceCart, type CartItem, type PricedProduct } from './priceCart.js';
import { COMMERCE } from './config.js';

const veg: PricedProduct = { _id: 'veg', price: 125 };
const meat: PricedProduct = { _id: 'meat', price: 150 };
const box: PricedProduct = { _id: 'box', price: 600, isBox: true };
const soups = (n: number, product = veg): CartItem => ({ product, quantity: n });
const boxes = (n = 1): CartItem => ({ product: box, quantity: n });

describe('config (settings.json)', () => {
  it('tiene las reglas acordadas', () => {
    expect(COMMERCE.shippingFee).toBe(5000);
    expect(COMMERCE.freeShippingMinAmount).toBe(72500);
    expect(COMMERCE.cheapestSoupPrice).toBe(12500);
    expect(COMMERCE.bulkDiscountMinItems).toBe(10);
    expect(COMMERCE.bulkDiscountPercent).toBe(20);
    expect(COMMERCE.welcomeCode).toBe('ONDOFIRST');
    expect(COMMERCE.welcomePercent).toBe(10);
    expect(COMMERCE.boxShipsFree).toBe(true);
  });
});

describe('priceCart: envío gratis desde $725 (antes de descuentos)', () => {
  it('carrito vacío: todo en cero, sin envío', () => {
    expect(priceCart([])).toMatchObject({
      soupCount: 0, subtotal: 0, discountType: null, discountAmount: 0, shipping: 0, total: 0,
      freeShippingReason: null, amountToFreeShipping: 72500, soupsToBulkDiscount: 10,
    });
  });

  it('1 sopa: paga envío', () => {
    expect(priceCart([soups(1)])).toMatchObject({ subtotal: 12500, shipping: 5000, total: 17500, amountToFreeShipping: 60000, soupsToBulkDiscount: 9 });
  });

  it('5 vegetarianas ($625): paga envío, faltan $100', () => {
    expect(priceCart([soups(5)])).toMatchObject({ subtotal: 62500, shipping: 5000, total: 67500, amountToFreeShipping: 10000 });
  });

  it('6 vegetarianas ($750): envío gratis', () => {
    expect(priceCart([soups(6)])).toMatchObject({ subtotal: 75000, shipping: 0, total: 75000, freeShippingReason: 'minAmount', amountToFreeShipping: 0 });
  });

  it('7 sopas: envío gratis', () => {
    expect(priceCart([soups(7)])).toMatchObject({ subtotal: 87500, discountType: null, shipping: 0, total: 87500, soupsToBulkDiscount: 3 });
  });

  it('carne: 4 ($600) paga envío, 5 ($750) no', () => {
    expect(priceCart([soups(4, meat)])).toMatchObject({ shipping: 5000, amountToFreeShipping: 12500 });
    expect(priceCart([soups(5, meat)])).toMatchObject({ subtotal: 75000, shipping: 0 });
  });

  it('justo en el límite: 4 de carne + 1 vegetariana = $725 → gratis; 3 + 2 = $700 → paga', () => {
    expect(priceCart([soups(4, meat), soups(1)])).toMatchObject({ subtotal: 72500, shipping: 0, freeShippingReason: 'minAmount' });
    expect(priceCart([soups(3, meat), soups(2)])).toMatchObject({ subtotal: 70000, shipping: 5000, amountToFreeShipping: 2500 });
  });

  it('9 sopas: envío gratis, sin 20%', () => {
    expect(priceCart([soups(5), soups(4, meat)])).toMatchObject({ subtotal: 122500, discountType: null, shipping: 0, total: 122500, soupsToBulkDiscount: 1 });
  });

  it('10 sopas: 20% y envío gratis', () => {
    expect(priceCart([soups(10)])).toMatchObject({ subtotal: 125000, discountType: 'bulk', discountPercent: 20, discountAmount: 25000, shipping: 0, total: 100000 });
  });

  it('12 sopas mixtas: 20% sobre todas', () => {
    expect(priceCart([soups(6), soups(6, meat)])).toMatchObject({ subtotal: 165000, discountType: 'bulk', discountAmount: 33000, shipping: 0, total: 132000 });
  });

  it('caja sola ($600): envío gratis por la caja', () => {
    expect(priceCart([boxes()])).toMatchObject({ soupCount: 0, itemCount: 1, subtotal: 60000, shipping: 0, total: 60000, freeShippingReason: 'box', amountToFreeShipping: 0 });
  });

  it('caja sola con boxShipsFree apagado: paga envío, faltan $125', () => {
    const config = { ...COMMERCE, boxShipsFree: false };
    expect(priceCart([boxes()], {}, config)).toMatchObject({ shipping: 5000, total: 65000, freeShippingReason: null, amountToFreeShipping: 12500 });
    expect(cartNudge(priceCart([boxes()], {}, config), config)).toEqual({ type: 'freeShipping', count: 1 });
  });

  it('caja + 1 vegetariana ($725): envío gratis', () => {
    expect(priceCart([boxes(), soups(1)])).toMatchObject({ subtotal: 72500, shipping: 0, total: 72500 });
  });

  it('caja + 2 sopas: envío gratis', () => {
    expect(priceCart([boxes(), soups(2)])).toMatchObject({ itemCount: 3, subtotal: 85000, shipping: 0, total: 85000 });
  });

  it('caja + 5 sopas: la caja cuenta como 1 → 6 artículos, sin 20%', () => {
    expect(priceCart([boxes(), soups(5)])).toMatchObject({ itemCount: 6, subtotal: 122500, discountType: null, shipping: 0, soupsToBulkDiscount: 4 });
  });

  it('caja + 9 sopas: 20% solo a las sopas, caja a $600', () => {
    const r = priceCart([boxes(), soups(9)]);
    expect(r.discountType).toBe('bulk');
    expect(r.lines.find(l => l.productId === 'box')).toMatchObject({ lineDiscount: 0, lineTotal: 60000 });
    expect(r).toMatchObject({ subtotal: 172500, discountAmount: 22500, shipping: 0, total: 150000 });
  });
});

describe('priceCart: ONDOFIRST (10%)', () => {
  it('3 sopas: 10% a las sopas, el envío se cobra completo', () => {
    expect(priceCart([soups(3)], { welcomeCode: 'ONDOFIRST' })).toMatchObject({
      subtotal: 37500, discountType: 'welcome', discountPercent: 10, discountAmount: 3750, shipping: 5000, total: 38750,
    });
  });

  it('6 vegetarianas: el código no quita el envío gratis (se cuenta antes del descuento)', () => {
    expect(priceCart([soups(6)], { welcomeCode: 'ONDOFIRST' })).toMatchObject({ subtotal: 75000, discountAmount: 7500, shipping: 0, total: 67500 });
  });

  it('10 sopas: gana el 20%, no se suman', () => {
    expect(priceCart([soups(10)], { welcomeCode: 'ONDOFIRST' })).toMatchObject({ discountType: 'bulk', discountPercent: 20, discountAmount: 25000, total: 100000 });
  });

  it('caja sola: 10% a la caja y envío gratis (no es un descuento)', () => {
    expect(priceCart([boxes()], { welcomeCode: 'ondofirst ' })).toMatchObject({ discountType: 'welcome', discountAmount: 6000, shipping: 0, total: 54000 });
  });

  it('código desconocido: no hace nada', () => {
    expect(priceCart([soups(3)], { welcomeCode: 'OTRO' })).toMatchObject({ discountType: null, discountAmount: 0, total: 42500 });
  });

  it('rechaza cantidades inválidas', () => {
    expect(() => priceCart([soups(-1)])).toThrow();
    expect(() => priceCart([soups(1.5)])).toThrow();
  });
});

describe('cartNudge (aviso en la tienda: a 1 sopa del envío gratis)', () => {
  it('no avisa con el carrito vacío ni lejos del envío gratis', () => {
    expect(cartNudge(priceCart([]))).toBeNull();
    expect(cartNudge(priceCart([soups(4)]))).toBeNull(); // faltan $225
    expect(cartNudge(priceCart([soups(3, meat), soups(1)]))).toBeNull(); // faltan $150: una vegetariana no basta
  });
  it('avisa cuando cualquier sopa cierra la diferencia', () => {
    expect(cartNudge(priceCart([soups(5)]))).toEqual({ type: 'freeShipping', count: 1 }); // faltan $100
    expect(cartNudge(priceCart([soups(4, meat)]))).toEqual({ type: 'freeShipping', count: 1 }); // faltan $125
    expect(cartNudge(priceCart([boxes()]))).toBeNull(); // caja sola: ya tiene envío gratis
  });
  it('con envío gratis: sin aviso hasta que falta 1 para el 20%', () => {
    expect(cartNudge(priceCart([soups(6)]))).toBeNull();
    expect(cartNudge(priceCart([soups(9)]))).toEqual({ type: 'bulk', count: 1 });
  });
});
