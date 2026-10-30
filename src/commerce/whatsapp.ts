// Enlace de WhatsApp de Ondo (número en settings.json → whatsappNumber), con mensaje opcional ya escrito.
// Lo usan el carrito, el footer y el botón flotante.
import { COMMERCE } from './config.js';

export const whatsappLink = (text = '') =>
  `https://wa.me/${COMMERCE.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
