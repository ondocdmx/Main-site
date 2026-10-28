# ONDO — ondoclub.com

Tienda online de ONDO, sopas de temporada congeladas a domicilio en Ciudad de México.

- Web: React + TypeScript + Vite + Tailwind, hospedada en Vercel (cada push a `main` publica).
- Pagos: Stripe Checkout, desde las funciones de `api/`.
- Contenido (textos, sopas, precios mostrados, códigos postales): `src/content/*.json`.

```bash
npm install
cp .env.example .env   # rellenar valores
npm run dev            # http://localhost:3000
```

Antes de cambiar nada, lee **`AGENTS.md`** (mapa técnico) y **`CLAUDE.md`** (reglas de trabajo y de
negocio). Accesos y secretos: `docs/TRASPASO.md`. Auditoría del sitio: `docs/audit.md`.
