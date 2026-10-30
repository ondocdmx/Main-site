// "Agregar" que, tras el primer toque, se vuelve − n +. Bajar a 0 devuelve el botón "Agregar".
import React from 'react';
import { Minus, Plus } from 'lucide-react';

type Lang = 'es' | 'en';

export default function QuantityStepper({ quantity, onAdd, onRemove, lang, name, addLabel, tone = 'light', className = '' }: {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  lang: Lang;
  name: string; // para lectores de pantalla
  addLabel?: string;
  tone?: 'light' | 'dark' | 'cta';
  className?: string;
}) {
  const es = lang === 'es';
  const base = 'min-h-[44px] w-full rounded-xl font-title font-bold text-[16px] transition-colors';
  if (quantity === 0) {
    const look = tone === 'cta'
      ? 'bg-brand-cta text-white hover:bg-[#A8451A]'
      : tone === 'dark'
        ? 'bg-brand-cream text-brand-ink hover:bg-white'
        : 'border-2 border-brand-ink text-brand-ink bg-transparent hover:bg-brand-ink hover:text-brand-card';
    return (
      <button type="button" onClick={onAdd} className={`${base} ${look} ${className}`} aria-label={`${addLabel || (es ? 'Agregar' : 'Add')}: ${name}`}>
        {addLabel || (es ? 'Agregar' : 'Add')}
      </button>
    );
  }
  const frame = tone === 'light' ? 'border-2 border-brand-ink text-brand-ink' : 'border-2 border-brand-cream text-brand-cream';
  return (
    <div className={`${base} ${frame} flex items-stretch justify-between ${className}`} role="group" aria-label={es ? `Cantidad de ${name}` : `${name} quantity`}>
      <button type="button" onClick={onRemove} className="w-12 flex items-center justify-center" aria-label={es ? `Quitar una ${name}` : `Remove one ${name}`}>
        <Minus className="w-4 h-4" />
      </button>
      <span className="flex items-center" aria-live="polite">{quantity}</span>
      <button type="button" onClick={onAdd} className="w-12 flex items-center justify-center" aria-label={es ? `Agregar otra ${name}` : `Add another ${name}`}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
