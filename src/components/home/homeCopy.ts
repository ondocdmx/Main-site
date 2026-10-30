// Datos que la copy de la home (settings.json, faq.json) toma de la configuración, para que nunca se desfase:
// {entrega}, {dias}, {franjas}, {corteDia}, {corteHora}, {envio}, {envioGratis}, {minVolumen}, {descuento}, {porSopa}.
// Puro, para poder probarlo (homeCopy.test.ts).
import { COMMERCE, toCents, type CommerceConfig } from '../../commerce/config';
import { cutoffFor, deliveryWeekdays, formatDeliveryDate } from '../../commerce/delivery';
import { formatMXN } from '../../commerce/cartCopy';

type Lang = 'es' | 'en';

// Precio por sopa más bajo de los planes de soup-scripción (amount* = lo que se cobra por 3 meses).
// Quincenal = 6 entregas en 3 meses; mensual = 3. Hoy: quincenal 10 → $5400 / 60 = $90.
export function minPricePerSoup(settings: Record<string, any>): number {
  const perSoup: number[] = [];
  for (const [freq, deliveries] of [['Quincenal', 6], ['Mensual', 3]] as const) {
    for (const soups of [4, 6, 10]) {
      const amount = Number(settings[`amount${freq}${soups}`]);
      if (amount > 0) perSoup.push(amount / (soups * deliveries));
    }
  }
  return perSoup.length ? Math.min(...perSoup) : 0;
}

const joinList = (items: string[], lang: Lang) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${lang === 'es' ? 'y' : 'and'} ${items[items.length - 1]}`;

export function homeTokens(deliveryIso: string, lang: Lang, settings: Record<string, any>, config: CommerceConfig = COMMERCE): Record<string, string> {
  const { day, time } = cutoffFor(deliveryIso, lang, config);
  const perSoup = minPricePerSoup(settings);
  return {
    entrega: formatDeliveryDate(deliveryIso, lang),
    dias: deliveryWeekdays(lang, config),
    franjas: joinList(config.deliverySlots.map(s => s.label), lang),
    corteDia: day,
    corteHora: time,
    envio: formatMXN(config.shippingFee),
    envioGratis: formatMXN(config.freeShippingMinAmount),
    minVolumen: String(config.bulkDiscountMinItems),
    descuento: String(config.bulkDiscountPercent),
    porSopa: perSoup ? formatMXN(toCents(perSoup)) : '[PRECIO]',
  };
}

// Cambia {clave} por su valor; una clave desconocida se queda tal cual (se ve en la web y se nota).
export const fillTokens = (text: string, tokens: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (match, key) => tokens[key] ?? match);
