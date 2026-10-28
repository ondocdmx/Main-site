import { describe, expect, it } from 'vitest';
import { COMMERCE } from './config.js';
import { deliveryLabel, findSlot, formatDeliveryDate, isPostalInZone, isValidPostal, nextDeliveryDate, normalizePostal } from './delivery.js';

// Ciudad de México es UTC-6 todo el año (sin horario de verano desde 2022).
const mx = (iso: string) => new Date(`${iso}-06:00`);

describe('nextDeliveryDate (corte domingo 23:59, hora CDMX)', () => {
  it('miércoles → el lunes siguiente', () => {
    expect(nextDeliveryDate(mx('2026-10-28T10:00'))).toBe('2026-11-02');
  });
  it('domingo 23:59 aún entra para el lunes', () => {
    expect(nextDeliveryDate(mx('2026-11-01T23:59'))).toBe('2026-11-02');
  });
  it('lunes 00:00 → el lunes de la semana siguiente', () => {
    expect(nextDeliveryDate(mx('2026-11-02T00:00'))).toBe('2026-11-09');
  });
  it('usa la hora de CDMX, no la del servidor: domingo 23:30 CDMX = lunes 05:30 UTC', () => {
    expect(nextDeliveryDate(new Date('2026-11-02T05:30:00Z'))).toBe('2026-11-02');
  });
  it('con un segundo día de reparto (jueves, corte miércoles 23:59)', () => {
    const config = { ...COMMERCE, deliveryDays: ['monday', 'thursday'] };
    expect(nextDeliveryDate(mx('2026-10-28T10:00'), config)).toBe('2026-10-29');
    expect(nextDeliveryDate(mx('2026-10-29T00:00'), config)).toBe('2026-11-02');
  });
});

describe('formato y franjas', () => {
  it('fecha en español e inglés', () => {
    expect(formatDeliveryDate('2026-11-02')).toBe('lunes 2 de noviembre');
    expect(formatDeliveryDate('2026-11-02', 'en')).toBe('Monday, November 2');
  });
  it('texto de la opción de envío en Stripe', () => {
    expect(deliveryLabel('2026-11-02', findSlot('slot_9_13')!)).toBe('Entrega lunes 2 de noviembre, 9–13 h');
  });
  it('franja desconocida', () => {
    expect(findSlot('slot_x')).toBeUndefined();
  });
});

describe('código postal', () => {
  it('solo dígitos, máximo 5', () => {
    expect(normalizePostal('06 7a00-1')).toBe('06700');
    expect(isValidPostal('0670')).toBe(false);
    expect(isValidPostal('06700')).toBe(true);
  });
  it('zona de reparto', () => {
    expect(isPostalInZone('06700')).toBe(true);
    expect(isPostalInZone('01000')).toBe(false);
    expect(isPostalInZone('0670')).toBe(false);
  });
});
