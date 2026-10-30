import { describe, expect, it } from 'vitest';
import settings from '../../content/settings.json';
import faq from '../../content/faq.json';
import { fillTokens, homeTokens, minPricePerSoup } from './homeCopy';

describe('homeCopy', () => {
  it('precio por sopa más bajo de las soup-scripciones: $90', () => {
    expect(minPricePerSoup(settings)).toBe(90);
    expect(minPricePerSoup({})).toBe(0);
  });

  it('llena la copy con la configuración', () => {
    const tokens = homeTokens('2026-11-02', 'es', settings);
    expect(tokens).toMatchObject({
      entrega: 'lunes 2 de noviembre', dias: 'lunes', franjas: '9–13 h, 13–17 h y 17–21 h',
      corteDia: 'domingo', corteHora: '23:59', envio: '$50', envioGratis: '$725', minVolumen: '10', descuento: '20', porSopa: '$90',
    });
    expect(fillTokens('Desde {porSopa} por sopa, cada {dias}. {nada}', tokens)).toBe('Desde $90 por sopa, cada lunes. {nada}');
  });

  it('las preguntas frecuentes no dejan claves sin llenar', () => {
    for (const lang of ['es', 'en'] as const) {
      const tokens = homeTokens('2026-11-02', lang, settings);
      for (const item of faq.preguntas) expect(fillTokens(item.respuesta[lang], tokens)).not.toMatch(/\{\w+\}/);
    }
  });
});
