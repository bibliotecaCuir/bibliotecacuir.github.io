# colección

Catálogo en línea de la colección de Biblioteca Cuir. Los datos de cada pieza
viven en YAML; el HTML (tanto el catálogo como cada ficha individual) se
genera o se carga a partir de ahí — no hace falta tocar HTML a mano para
agregar, editar o eliminar una pieza.

## Cómo está armado

- `yaml/`: los datos, un archivo por caja física o sector (`caja-01.yaml` …
  `caja-10.yaml`, `grafica-01.yaml` … `grafica-04.yaml`). Cada uno tiene
  `catalogo.articulos`, una lista de piezas con campos como `titulo`,
  `codigo`, `autorxs`, `editorial`, `agno`, `tipologia`, `descripcion`,
  `material`, `altura`/`ancho`/`profundidad`, `ubicacionActual`, `donante`,
  `imagen`, etc. (ver cualquier archivo en `yaml/` como referencia de los
  campos disponibles).
- `index.html` (el catálogo): carga las tarjetas directamente desde los YAML
  en el navegador con `cargar-catalogo.js`, sin generar nada — por eso el
  catálogo siempre refleja el contenido actual de `yaml/` con solo recargar
  la página.
- `html/`: las ~140 fichas individuales (`bc-XXXX.html`), una por pieza. A
  diferencia del catálogo, estas sí son archivos estáticos generados —
  `generar-html-libros.js` los escribe a partir de `yaml/`.
- `generar-html-libros.js`: lee todos los `yaml/*.yaml`, deduplica piezas
  repetidas entre cajas (misma combinación de título/autorxs/editorial/año),
  arma un slug por pieza (a partir del código, o del título si no hay
  código), calcula "títulos relacionados" por categoría/autorxs/editorial, y
  escribe una página por pieza en `html/`. También borra cualquier `.html`
  viejo en `html/` antes de escribir, así que una pieza eliminada del YAML
  desaparece del sitio al regenerar.
- El encabezado (nav) y pie de página de cada ficha vienen de
  `../scripts/lib/plantillas-sitio.js`, la misma plantilla compartida que
  usan `index.html`, `manifiesto/`, `dona/` y `portafolio/`. Un cambio ahí
  (ej. el link de Instagram, un ítem del menú) se propaga a las ~140 fichas
  la próxima vez que se regenera — no hay que tocarlas una por una.
- Las imágenes **no viven en este repositorio**: `imagen` en el YAML es solo
  un nombre de archivo, y tanto `cargar-catalogo.js` como
  `generar-html-libros.js` arman la URL apuntando a
  `https://raw.githubusercontent.com/bibliotecaCuir/<caja>/main/imagenes/<imagen>`
  (un repo aparte por caja, en la organización `bibliotecaCuir`).

## Agregar, editar o eliminar una pieza

1. Editar el `yaml/<caja>.yaml` correspondiente (agregar, cambiar o borrar
   una entrada dentro de `catalogo.articulos`).
2. Si la pieza tiene una imagen nueva, subirla al repo de imágenes de esa
   caja (`bibliotecaCuir/<caja>`, carpeta `imagenes/`) con el mismo nombre
   de archivo que se puso en `imagen`.
3. Regenerar las fichas:

   ```sh
   node generar-html-libros.js
   ```

4. Commitear tanto el YAML editado como los cambios en `html/`.

`index.html` (el catálogo) no necesita regeneración — carga el YAML en vivo.

## A diferencia del portafolio

El portafolio (`/portafolio/<sección>/`, ver el README raíz) tiene un
formulario de GitHub Issues y una GitHub Action que corre el generador y
commitea automáticamente. La colección todavía no tiene esa automatización:
el paso 3 de arriba (`node generar-html-libros.js`) hay que correrlo a mano
y commitear el resultado.
