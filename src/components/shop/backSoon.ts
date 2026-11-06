// Sopa agotada ("Vuelve pronto"): WhatsApp con el mensaje ya escrito para pedir aviso cuando vuelva.
import { whatsappLink } from '../../commerce/whatsapp';

export const backSoonLink = (name: string, lang: 'es' | 'en') =>
  whatsappLink(lang === 'es'
    ? `Hola, ¿me dicen cuando tengan la sopa ${name}?`
    : `Hi, could you let me know when the ${name} soup is back?`);
