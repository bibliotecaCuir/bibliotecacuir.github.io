# bibliotecacuir.github.io

## Portafolio (prácticas, activaciones, obras, ...)

Cada sección del portafolio (por ahora `practicas`, `activaciones` y `obras`)
tiene su propio archivo en `datos/<sección>.yaml`, que es la única fuente de
verdad: las páginas de `/portafolio/<sección>/` y las tarjetas del listado
(`<sección>.html`) se generan automáticamente a partir de ahí. No hace falta
tocar HTML para agregar, editar o eliminar algo.

Hay dos formas de hacerlo:

### Opción 1: por GitHub, con un formulario (recomendado para no programadorxs)

En la pestaña "Issues" del repositorio, click en "New issue" y elegí
"Nueva práctica", "Nueva activación" o "Nueva obra". Completá el título, los
párrafos (uno por línea en blanco) y arrastrá las fotos al campo de
imágenes. En "obras" hay además dos campos opcionales, "Link" y "Texto del
link", para obras que enlazan a un video o podcast externo (ej. YouTube,
Spotify) en vez de (o además de) tener fotos propias. Al enviar el
formulario, un GitHub Action lo procesa, publica la página y avisa en el
mismo issue cuando está lista (o qué faltó, si algo salió mal).

Para editar algo que ya existe, usá el mismo formulario poniendo el "Slug"
de esa entrada (la parte del link, ej. `asambleas`) — actualiza esa entrada
en vez de crear una nueva. Ojo: como el formulario reemplaza la entrada
completa, si estás editando una obra con Link y dejás esos campos vacíos,
el link se borra.

### Opción 2: editando el YAML directamente

1. Editá `datos/<sección>.yaml` (agregá, cambiá o borrá una entrada con
   `slug`, `titulo` y `parrafos`; en `obras` también podés agregar `link_url`
   y, opcionalmente, `link_texto`).
2. Si es una entrada nueva y tiene fotos propias, creá la carpeta
   `assets/portafolio/<sección>/<slug>/` y subí ahí las fotos (`.webp`,
   `.jpg` o `.png`); se muestran todas, en orden alfabético, sin necesidad de
   listarlas en ningún otro archivo. Toda entrada necesita al menos una
   imagen en esa carpeta para tener portada (incluso una obra que es
   principalmente un link, como un podcast).
3. Al hacer commit/push a `main`, un GitHub Action corre el generador
   correspondiente y commitea las páginas HTML generadas — y borra las de
   entradas que ya no estén en el YAML.

### Cómo está armado

- `datos/<sección>.yaml`: los datos.
- `<sección>.html` (el listado): carga las tarjetas directamente desde el
  YAML en el navegador, con `js/cargar-portafolio.js`.
- `scripts/lib/generar-portafolio.js`: generador compartido de las fichas
  `portafolio/<sección>/<slug>.html` (incluye el link opcional y el
  achicado automático de letra para títulos largos). `scripts/generar-practicas.js`,
  `scripts/generar-activaciones.js` y `scripts/generar-obras.js` son los
  que se invocan por sección.
- `scripts/lib/procesar-formulario.js`: procesa lo que llega por el
  formulario de GitHub Issues (título, párrafos, slug, link, imágenes) y
  llama al generador. `scripts/procesar-nueva-practica.js`,
  `scripts/procesar-nueva-activacion.js` y `scripts/procesar-nueva-obra.js`
  son los que se invocan por sección.
- `.github/ISSUE_TEMPLATE/nueva-*.yml` y `.github/workflows/*.yml`: el
  formulario y la automatización de GitHub.

Para regenerar las fichas a mano:

```sh
node scripts/generar-practicas.js
node scripts/generar-activaciones.js
node scripts/generar-obras.js
```
