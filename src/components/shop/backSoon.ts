// Sopa agotada ("Vuelve pronto"): WhatsApp con el mensaje ya escrito para pedir aviso cuando vuelva,
// y el evento GA4 `back_in_stock_request` (docs/TRACKING.md) para contar qué sopas se piden más.
import { whatsappLink } from '../../commerce/whatsapp';
import { pushEvent } from '../../analytics';

export const backSoonLink = (name: string, lang: 'es' | 'en') =>
  whatsappLink(lang === 'es'
    ? `Hola, ¿me dicen cuando tengan la sopa ${name}?`
    : `Hi, could you let me know when the ${name} soup is back?`);

export const trackBackSoon = (product: any, location: 'grid' | 'product_page') =>
  pushEvent('back_in_stock_request', {
    item_id: product?.slug || product?._id || 'desconocido',
    item_name: product?.title?.es || product?.title?.en || 'Producto',
    location,
  });
