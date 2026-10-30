// Entrega: próximo día de reparto según el corte (hora de Ciudad de México), franjas y códigos postales.
// Lo usan el carrito, el funnel y el servidor, para que todos calculen la misma fecha.
import { COMMERCE, type CommerceConfig, type DeliverySlot } from './config.js';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_MS = 24 * 60 * 60 * 1000;

// Hora "de pared" en la zona del negocio, expresada como un Date en UTC (solo para comparar y contar días).
function wallClock(now: Date, timeZone: string): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(now).map(p => [p.type, p.value]),
  );
  return new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute));
}

const toIso = (d: Date) => d.toISOString().slice(0, 10);
const fromIso = (iso: string) => new Date(`${iso}T00:00:00Z`);

// Primer día de reparto cuyo corte no ha pasado. Devuelve 'AAAA-MM-DD' (fecha de Ciudad de México).
// Corte = `daysBefore` días antes a las `time` (ej. domingo 23:59 para el lunes); el minuto del corte aún cuenta.
export function nextDeliveryDate(now: Date = new Date(), config: CommerceConfig = COMMERCE): string {
  const { daysBefore, time, timeZone } = config.orderCutoff;
  const [h, m] = time.split(':').map(Number);
  const local = wallClock(now, timeZone);
  const today = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  for (let i = 0; i <= 14 + daysBefore; i++) {
    const day = new Date(today + i * DAY_MS);
    if (!config.deliveryDays.includes(WEEKDAYS[day.getUTCDay()])) continue;
    const cutoffEnd = day.getTime() - daysBefore * DAY_MS + (h * 60 + m + 1) * 60 * 1000;
    if (local.getTime() < cutoffEnd) return toIso(day);
  }
  throw new Error('Sin días de reparto configurados');
}

// "lunes 2 de noviembre" / "Monday, November 2"
export function formatDeliveryDate(iso: string, lang: 'es' | 'en' = 'es'): string {
  const d = fromIso(iso);
  return lang === 'es'
    ? `${DAYS_ES[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]}`
    : `${DAYS_EN[d.getUTCDay()]}, ${MONTHS_EN[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function findSlot(id: string | null | undefined, config: CommerceConfig = COMMERCE): DeliverySlot | undefined {
  return config.deliverySlots.find(s => s.id === id);
}

// Texto de la opción de envío en Stripe: "Entrega lunes 2 de noviembre, 9–13 h"
export function deliveryLabel(iso: string, slot: DeliverySlot): string {
  return `Entrega ${formatDeliveryDate(iso, 'es')}, ${slot.label}`;
}

// Código postal: solo dígitos, máximo 5 (se usa al teclear).
export const normalizePostal = (input: string) => input.replace(/\D/g, '').slice(0, 5);
export const isValidPostal = (cp: string) => /^\d{5}$/.test(cp);

export function isPostalInZone(cp: string, config: CommerceConfig = COMMERCE): boolean {
  if (!isValidPostal(cp)) return false;
  const zone = config.allowedPostalCodes.map(c => c.trim());
  return zone.length === 0 || zone.includes(cp);
}

// Día y hora del corte para una entrega: { day: 'domingo', time: '23:59' } (lunes con corte 1 día antes).
export function cutoffFor(iso: string, lang: 'es' | 'en' = 'es', config: CommerceConfig = COMMERCE): { day: string; time: string } {
  const d = new Date(fromIso(iso).getTime() - config.orderCutoff.daysBefore * DAY_MS);
  return { day: (lang === 'es' ? DAYS_ES : DAYS_EN)[d.getUTCDay()], time: config.orderCutoff.time };
}
