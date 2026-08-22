const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");
const { escaparHTML, imageUrl, leerCatalogos, normalizar } = require("./lib-catalogo.js");

const SITIO_ROOT = path.join(__dirname, "..");
const INDEX_PATH = path.join(SITIO_ROOT, "index.html");
const ELEGIBLES_PATH = path.join(__dirname, "nube-elegibles.yaml");
const CANTIDAD_LIBROS = 14;

const COLORES = ["libro-azul", "libro-rosado", "libro-amarillo", "libro-verde"];
const FORMAS = ["", "libro-pequeno", "libro-alto", "libro-ancho", "libro-inclinado"];

function elegirAlAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function leerCodigosElegibles() {
  const codigos = yaml.load(fs.readFileSync(ELEGIBLES_PATH, "utf8"));
  return new Set(codigos.map(normalizar));
}

function elegirLibros(publicaciones, codigosElegibles, cantidad) {
  const elegibles = publicaciones.filter((pub) => codigosElegibles.has(normalizar(pub.item.codigo)));
  const barajado = [...elegibles].sort(() => Math.random() - 0.5);
  return barajado.slice(0, cantidad);
}

function marcador(pub) {
  const clases = ["libro-marcador", elegirAlAzar(COLORES), elegirAlAzar(FORMAS)]
    .filter(Boolean)
    .join(" ");
  const imagen = escaparHTML(imageUrl(pub.item, pub.caja));
  const titulo = escaparHTML(pub.item.titulo || "Sin título");

  return `            <a class="${clases}" href="/coleccion/fichas/${pub.slug}.html"><img src="${imagen}" alt="${titulo}"></a>`;
}

function generarSeccion(libros) {
  const marcadores = libros.map(marcador).join("\n");

  return [
    '        <section class="libro-nube" id="coleccion" aria-label="Galería de libros">',
    marcadores,
    '            <a class="libro-coleccion-adhesivo" href="/coleccion/">ver coleccion<br>completa</a>',
    "        </section>",
  ].join("\n");
}

function actualizarIndex(seccionHtml) {
  const html = fs.readFileSync(INDEX_PATH, "utf8");
  const patron = / {8}<section class="libro-nube"[\s\S]*?\n {8}<\/section>/;

  if (!patron.test(html)) {
    throw new Error('No se encontró la sección <section class="libro-nube"> en index.html.');
  }

  fs.writeFileSync(INDEX_PATH, html.replace(patron, seccionHtml));
}

function generar() {
  const publicaciones = leerCatalogos();
  const codigosElegibles = leerCodigosElegibles();
  const libros = elegirLibros(publicaciones, codigosElegibles, CANTIDAD_LIBROS);

  if (libros.length < CANTIDAD_LIBROS) {
    throw new Error(
      `Solo hay ${libros.length} publicaciones elegibles en ${ELEGIBLES_PATH}; se necesitan ${CANTIDAD_LIBROS}.`
    );
  }

  actualizarIndex(generarSeccion(libros));
  console.log(`Actualizada la nube de libros en index.html con ${libros.length} publicaciones al azar.`);
}

module.exports = { generar };

if (require.main === module) generar();
