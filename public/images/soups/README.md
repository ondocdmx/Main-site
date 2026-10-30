# Fotos de las sopas

Sube aquí las fotos con este nombre exacto (minúsculas, sin espacios):

| Foto | Nombre del archivo |
|---|---|
| Sopa servida (foto principal) | `<slug>-plated.jpg` |
| Bolsa / empaque | `<slug>-pack.jpg` |
| Ingredientes (opcional; hoy no hay) | `<slug>-ingredients.jpg` |
| Más fotos para la ficha (opcional, en este orden) | `<slug>-gallery-1.jpg`, `<slug>-gallery-2.jpg`… |

`<slug>` es el de la sopa:

```
ondo-box
garbanzo-y-rabo
estofado-ingles
betabespelta
calabaza-de-castilla-dahl
coliflor-avellanada
berenjena-al-fuego
mega-verde
chowder-bacalao
pro-gazpacho
sopa-tlalpena
salchispatzle
cebolla-caramelizada
```

Ejemplo: `mega-verde-plated.jpg`.

- Formato JPG (o PNG/WebP). GitHub acepta hasta 25 MB por foto, pero todo lo que se sube se queda en el
  repositorio para siempre y hace más lento cada deploy. Antes de subir, reduce todas de una vez
  a ~2000 px de lado largo (en Mac: Vista Previa → seleccionar todas → Herramientas → Ajustar tamaño).
- Se recortan en cuadrado al centro: deja la sopa centrada.
- No hace falta optimizarlas: `scripts/build-images.mjs` crea las versiones ligeras
  (carpeta `web/`, no la toques) en cada build de Vercel.
- Si falta una foto, la web usa la que ya tenía la sopa. Si subes alguna `gallery-N` de una sopa,
  sustituye a toda su galería anterior.
- No hay foto "hover": la tienda nueva solo muestra la sopa servida (`plated`).
