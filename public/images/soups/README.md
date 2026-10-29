# Fotos de las sopas

Sube aquí las fotos con este nombre exacto (minúsculas, sin espacios):

| Foto | Nombre del archivo |
|---|---|
| Sopa servida (foto principal) | `<slug>-plated.jpg` |
| Bolsa / empaque | `<slug>-pack.jpg` |
| Ingredientes | `<slug>-ingredients.jpg` |

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

- Formato JPG (o PNG/WebP). Lado largo de unos 2000 px y menos de 3 MB por foto.
- Se recortan en cuadrado al centro: deja la sopa centrada.
- No hace falta optimizarlas: `scripts/build-images.mjs` crea las versiones ligeras
  (carpeta `web/`, no la toques) en cada build de Vercel.
- Si falta una foto, la web usa la que ya tenía la sopa.
