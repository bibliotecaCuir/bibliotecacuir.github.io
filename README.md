# bibliotecacuir.github.io

## Prácticas

Las páginas de `/portafolio/practicas/` se generan automáticamente a partir de
[`datos/practicas.yaml`](datos/practicas.yaml). Para agregar, editar o eliminar
una práctica no hace falta tocar HTML:

1. Editá `datos/practicas.yaml` (agregá, cambiá o borrá una entrada con `slug`,
   `titulo` y `parrafos`).
2. Si es una práctica nueva, creá la carpeta `assets/portafolio/practicas/<slug>/`
   y subí ahí las fotos (`.webp`, `.jpg` o `.png`); se muestran todas, en orden
   alfabético, sin necesidad de listarlas en ningún otro archivo.
3. Al hacer commit/push a `main`, un GitHub Action
   ([`.github/workflows/generar-practicas.yml`](.github/workflows/generar-practicas.yml))
   corre `scripts/generar-practicas.js` y commitea las páginas
   `portafolio/practicas/<slug>.html` generadas — y borra las de prácticas que
   ya no estén en el YAML.

`practicas.html` (el listado) carga las tarjetas directamente desde el YAML en
el navegador (`js/cargar-practicas.js`), así que no requiere regeneración.

Para regenerar las fichas a mano:

```sh
node scripts/generar-practicas.js
```
