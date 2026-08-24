# bibliotecacuir.github.io

## Portafolio (prácticas, activaciones, obras, otros)

Cada sección del portafolio (`practicas`, `activaciones`, `obras` y `otros`)
tiene su propio archivo en `datos/<sección>.yaml`, que es la única fuente de
verdad: las páginas de `/portafolio/<sección>/` y las tarjetas del listado
(`<sección>.html`) se generan automáticamente a partir de ahí. No hace falta
tocar HTML para agregar, editar o eliminar algo.

Hay dos formas de hacerlo:

### Opción 1: por GitHub, con un formulario (recomendado para no programadorxs)

Disponible para las cuatro secciones: `practicas`, `activaciones`, `obras` y
`otros`. En la pestaña "Issues" del repositorio, click en "New issue" y elegí
"Nueva práctica", "Nueva activación", "Nueva obra" o "Nuevo otro". Completá
el título, los párrafos (uno por línea en blanco) y arrastrá las fotos al
campo de imágenes. En "obras" y "otros" hay además dos campos opcionales,
"Link" y "Texto del link", para entradas que enlazan a un video, podcast,
artículo u otro link externo (ej. YouTube, Spotify) en vez de (o además de)
tener fotos propias. Al enviar el formulario, un GitHub Action lo procesa,
publica la página y avisa en el mismo issue cuando está lista (o qué faltó,
si algo salió mal).

Para editar algo que ya existe, usá el mismo formulario poniendo el "Slug"
de esa entrada (la parte del link, ej. `asambleas`) — actualiza esa entrada
en vez de crear una nueva. Ojo: como el formulario reemplaza la entrada
completa, si estás editando una obra con Link y dejás esos campos vacíos,
el link se borra.

### Opción 2: editando el YAML directamente

1. Editá `datos/<sección>.yaml` (agregá, cambiá o borrá una entrada con
   `slug`, `titulo` y `parrafos`; en `obras` y `otros` también podés agregar
   `link_url` y, opcionalmente, `link_texto`). Cualquier entrada puede
   además llevar un `anio` opcional (ej. `"2025"` o `"2024/2025"`) — se muestra en su tarjeta
   de `/portafolio/`; si no se completa, se muestra "s/f".
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
  `scripts/generar-activaciones.js`, `scripts/generar-obras.js` y
  `scripts/generar-otros.js` son los que se invocan por sección.
- `scripts/lib/procesar-formulario.js`: procesa lo que llega por el
  formulario de GitHub Issues (título, párrafos, slug, link, imágenes) y
  llama al generador. `scripts/procesar-nueva-practica.js`,
  `scripts/procesar-nueva-activacion.js`, `scripts/procesar-nueva-obra.js` y
  `scripts/procesar-nueva-otro.js` son los que se invocan por sección.
- `.github/ISSUE_TEMPLATE/nueva-*.yml` y `.github/workflows/*.yml`: el
  formulario y la automatización de GitHub.
- `assets/portafolio/drive-manifest.json`: **generado**, no se edita a
  mano. `scripts/generar-drive-manifest.js` lo arma leyendo los cuatro
  `datos/<sección>.yaml` (título y slug de cada entrada); lo usa
  `js/portfolio.js` en el navegador para armar los links de "proyecto
  anterior/siguiente" en cada ficha. Cada workflow de portafolio lo
  regenera y commitea junto con las páginas de su sección.
- `portafolio/index.html` (la grilla general con las tarjetas de las cuatro
  secciones mezcladas): la sección `<section class="portafolio-grilla">`
  también es **generada**, no se edita a mano. `scripts/generar-portafolio-index.js`
  la arma leyendo los cuatro `datos/<sección>.yaml`, en ese orden y en el
  orden en que aparece cada entrada dentro de su YAML (para reordenar las
  tarjetas, reordená las entradas en el YAML). Cada workflow de portafolio
  la regenera y commitea junto con las páginas de su sección.

Para regenerar las fichas a mano:

```sh
node scripts/generar-practicas.js
node scripts/generar-activaciones.js
node scripts/generar-obras.js
node scripts/generar-otros.js
node scripts/generar-portafolio-index.js
node scripts/generar-drive-manifest.js
```

## Sobre nosotres

Página `/sobre-nosotres/`, generada a partir de `datos/sobre-nosotres.yaml`
(`titulo` y `parrafos`) y de las imágenes que haya en `assets/sobre-nosotres/`
(se muestran todas, en orden alfabético, sin listarlas en el YAML — igual que
las fotos del portafolio). `scripts/generar-sobre-nosotres.js` escribe
`sobre-nosotres/index.html` completo (nav y pie incluidos, desde
`scripts/lib/plantillas-sitio.js`) cada vez que corre, así que no hace falta
tocar HTML para editar el texto o agregar fotos:

```sh
node scripts/generar-sobre-nosotres.js
```

## Colección

Catálogo en línea de la colección de Biblioteca Cuir, en `coleccion/`. Los
datos de cada pieza viven en YAML; el HTML (tanto el catálogo como cada
ficha individual) se genera o se carga a partir de ahí — no hace falta
tocar HTML a mano para agregar, editar o eliminar una pieza.

### Cómo está armada

- `coleccion/yaml/`: los datos, un archivo por caja física o sector
  (`caja-01.yaml` … `caja-10.yaml`, `grafica-01.yaml` … `grafica-04.yaml`).
  Cada uno tiene `catalogo.articulos`, una lista de piezas con campos como
  `titulo`, `codigo`, `autorxs`, `editorial`, `agno`, `tipologia`,
  `descripcion`, `material`, `altura`/`ancho`/`profundidad`,
  `ubicacionActual`, `donante`, `imagen`, etc. (ver cualquier archivo en
  `yaml/` como referencia de los campos disponibles).
- `coleccion/index.html` (el catálogo): carga las tarjetas directamente
  desde los YAML en el navegador con `cargar-catalogo.js`, sin generar
  nada — por eso el catálogo siempre refleja el contenido actual de
  `yaml/` con solo recargar la página.
- `coleccion/fichas/`: las ~620 fichas individuales (`bc-XXXX.html`), una
  por pieza. A diferencia del catálogo, estas sí son archivos estáticos
  generados — `generar-html-libros.js` los escribe a partir de `yaml/`.
- `coleccion/autorxs/`: una página estática por autorx (`nombre-autorx.html`),
  con las obras de esa persona en la colección. También generadas por
  `generar-html-libros.js`, igual que `fichas/`.
- `coleccion/autorxs.html`: listado de todxs lxs autorxs agrupados por
  letra; cada nombre enlaza a su página en `autorxs/`. También se genera
  con `generar-html-libros.js`.
- `coleccion/generar-html-libros.js`: lee todos los `yaml/*.yaml`,
  deduplica piezas repetidas entre cajas (misma combinación de
  título/autorxs/editorial/año), arma un slug por pieza (a partir del
  código, o del título si no hay código), calcula "títulos relacionados"
  por categoría/autorxs/editorial, y escribe una página por pieza en
  `fichas/`. También arma un slug por autorx y escribe una página con sus
  obras en `autorxs/`, más el listado `autorxs.html`. Antes de escribir,
  borra cualquier `.html` viejo en `fichas/` y en `autorxs/`, así que una
  pieza o autorx eliminada del YAML desaparece del sitio al regenerar.
- El encabezado (nav) y pie de página de cada ficha tienen su propia
  plantilla dentro de `coleccion/generar-html-libros.js` (funciones
  `headerGlobal`/`footer`) — a diferencia de `index.html`, `manifiesto/`,
  `dona/` y `portafolio/`, que comparten `scripts/lib/plantillas-sitio.js`.
  Un cambio de nav o pie ahí no se propaga a la colección; hay que
  editarlo en `generar-html-libros.js` y regenerar.
- Las imágenes **no viven en este repositorio**: `imagen` en el YAML es
  solo un nombre de archivo, y tanto `cargar-catalogo.js` como
  `generar-html-libros.js` arman la URL apuntando a
  `https://raw.githubusercontent.com/bibliotecaCuir/coleccion-imagenes/main/<caja>/<imagen>`
  (un único repo, `bibliotecaCuir/coleccion-imagenes`, con una carpeta por
  caja/sector).

### Agregar, editar o eliminar una pieza

1. Editar el `coleccion/yaml/<caja>.yaml` correspondiente (agregar,
   cambiar o borrar una entrada dentro de `catalogo.articulos`).
2. Si la pieza tiene una imagen nueva, subirla al repo
   `bibliotecaCuir/coleccion-imagenes`, dentro de la carpeta de esa caja
   (`<caja>/`) con el mismo nombre de archivo que se puso en `imagen`.
3. Commitear y hacer push del YAML editado a `main`.

Al hacer push, un GitHub Action (`.github/workflows/generar-coleccion.yml`)
corre `node generar-html-libros.js` y `node generar-libro-nube.js`, y
commitea en un solo commit las fichas y páginas de autorxs generadas en
`coleccion/fichas/`, `coleccion/autorxs/`, `coleccion/autorxs.html` y la
nube de libros de `index.html` — no hace falta correr el generador a mano
ni commitear esos archivos vos mismx. (`generar-libro-nube.yml` corre
además una vez al día por cron, para renovar la nube aunque no haya push.)

`coleccion/index.html` (el catálogo) no necesita regeneración — carga el
YAML en vivo.

A diferencia del portafolio (arriba), que tiene un formulario de GitHub
Issues que arma el YAML por vos, acá el YAML todavía se edita a mano. Pero
la regeneración y el commit de las páginas generadas funcionan igual en
ambos: los hace el GitHub Action al hacer push a `main`.
