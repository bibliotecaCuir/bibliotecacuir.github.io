# bibliotecacuir.github.io

## Portafolio (prácticas, activaciones, ...)

Cada sección del portafolio (por ahora `practicas` y `activaciones`) tiene su
propio archivo en `datos/<sección>.yaml`, que es la única fuente de verdad:
las páginas de `/portafolio/<sección>/` y las tarjetas del listado
(`<sección>.html`) se generan automáticamente a partir de ahí. No hace falta
tocar HTML para agregar, editar o eliminar algo.

Hay dos formas de hacerlo:

### Opción 1: por GitHub, con un formulario (recomendado para no programadorxs)

En la pestaña "Issues" del repositorio, click en "New issue" y elegí
"Nueva práctica" o "Nueva activación". Completá el título, los párrafos (uno
por línea en blanco) y arrastrá las fotos al campo de imágenes. Al enviarlo,
un GitHub Action procesa el formulario, publica la página y te avisa en el
mismo issue cuando está lista (o qué faltó, si algo salió mal).

Para editar algo que ya existe, usá el mismo formulario poniendo el "Slug"
de esa práctica o activación (la parte del link, ej. `asambleas`) — actualiza
esa entrada en vez de crear una nueva.

### Opción 2: editando el YAML directamente

1. Editá `datos/<sección>.yaml` (agregá, cambiá o borrá una entrada con
   `slug`, `titulo` y `parrafos`).
2. Si es una entrada nueva, creá la carpeta
   `assets/portafolio/<sección>/<slug>/` y subí ahí las fotos (`.webp`,
   `.jpg` o `.png`); se muestran todas, en orden alfabético, sin necesidad de
   listarlas en ningún otro archivo.
3. Al hacer commit/push a `main`, un GitHub Action corre el generador
   correspondiente y commitea las páginas HTML generadas — y borra las de
   entradas que ya no estén en el YAML.

### Cómo está armado

- `datos/<sección>.yaml`: los datos.
- `<sección>.html` (el listado): carga las tarjetas directamente desde el
  YAML en el navegador, con `js/cargar-portafolio.js`.
- `scripts/lib/generar-portafolio.js`: generador compartido de las fichas
  `portafolio/<sección>/<slug>.html`. `scripts/generar-practicas.js` y
  `scripts/generar-activaciones.js` son los que se invocan por sección.
- `scripts/lib/procesar-formulario.js`: procesa lo que llega por el
  formulario de GitHub Issues (título, párrafos, slug, imágenes) y llama al
  generador. `scripts/procesar-nueva-practica.js` y
  `scripts/procesar-nueva-activacion.js` son los que se invocan por sección.
- `.github/ISSUE_TEMPLATE/nueva-*.yml` y `.github/workflows/*.yml`: el
  formulario y la automatización de GitHub.

Para regenerar las fichas a mano:

```sh
node scripts/generar-practicas.js
node scripts/generar-activaciones.js
```
