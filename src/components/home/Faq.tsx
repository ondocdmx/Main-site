// Preguntas frecuentes (src/content/faq.json): acordeón accesible, botón + aria-expanded por pregunta.
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { fillTokens } from './homeCopy';

type Lang = 'es' | 'en';
export type FaqItem = { id: string; pregunta: { es: string; en: string }; respuesta: { es: string; en: string } };

export default function Faq({ title, items, lang, tokens }: { title: string; items: FaqItem[]; lang: Lang; tokens: Record<string, string> }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) => setOpen(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <section id="preguntas" aria-labelledby="preguntas-title" className="bg-brand-cream px-4 md:px-6 py-12 md:py-20 scroll-mt-16 md:scroll-mt-24">
      <div className="max-w-3xl mx-auto">
        <h2 id="preguntas-title" className="font-title font-bold text-[32px] md:text-[44px] leading-tight text-brand-ink">{title}</h2>
        <div className="mt-6 border-t border-brand-ink/15">
          {items.map(item => {
            const expanded = open.has(item.id);
            return (
              <div key={item.id} id={`faq-${item.id}`} className="border-b border-brand-ink/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-${item.id}-q`}
                    aria-expanded={expanded}
                    aria-controls={`faq-${item.id}-a`}
                    onClick={() => toggle(item.id)}
                    className="w-full min-h-[60px] py-4 flex items-center justify-between gap-4 text-left font-body font-semibold text-[17px] text-brand-ink"
                  >
                    <span>{item.pregunta[lang] || item.pregunta.es}</span>
                    <Plus className={`w-5 h-5 shrink-0 transition-transform ${expanded ? 'rotate-45' : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={`faq-${item.id}-a`}
                  role="region"
                  aria-labelledby={`faq-${item.id}-q`}
                  hidden={!expanded}
                  className="pb-5 pr-8 font-body text-[16px] leading-relaxed text-brand-ink/90"
                >
                  {fillTokens(item.respuesta[lang] || item.respuesta.es, tokens)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
