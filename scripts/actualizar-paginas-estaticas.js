// Regenera el boton+nav principal y el pie de pagina de las paginas estaticas
// (index.html, manifiesto/, dona/, portafolio/, coleccion/) a partir de las
// plantillas compartidas en scripts/lib/plantillas-sitio.js. Buscar los marcadores
// <!-- nav-principal:... --> / <!-- pie-pagina:... --> en cada archivo y reemplaza
// lo que hay entre ellos.

const fs = require("fs");
const path = require("path");
const { botonYNavPrincipal, piePagina } = require("./lib/plantillas-sitio.js");

const ROOT = path.join(__dirname, "..");

const PAGINAS = [
  {
    archivo: "index.html",
    nav: { id: "portada-menu", activo: null, esInicio: true, propuesta: false },
    pie: { idCorreo: "footer-email" },
  },
  {
    archivo: "manifiesto/index.html",
    nav: { id: "manifest-menu", activo: "manifiesto", esInicio: false, propuesta: true },
    pie: null,
  },
  {
    archivo: "dona/index.html",
    nav: { id: "donation-menu", activo: "dona", esInicio: false, propuesta: true },
    pie: { idCorreo: "footer-email-dona" },
  },
  {
    archivo: "portafolio/index.html",
    nav: { id: "portafolio-menu", activo: "portafolio", esInicio: false, propuesta: true },
    pie: { idCorreo: "footer-email-portafolio" },
  },
  {
    archivo: "coleccion/index.html",
    nav: { id: "portada-menu", activo: "coleccion", esInicio: false, propuesta: false },
    pie: { idCorreo: "pie-email" },
  },
];

function reemplazarEntreMarcadores(contenido, marcador, bloqueNuevo) {
  const inicio = `<!-- ${marcador}:inicio -->`;
  const fin = `<!-- ${marcador}:fin -->`;
  const patron = new RegExp(`${inicio}[\\s\\S]*?${fin}`);

  if (!patron.test(contenido)) {
    throw new Error(`No se encontraron los marcadores ${inicio} / ${fin}`);
  }

  return contenido.replace(patron, `${inicio}\n${bloqueNuevo}\n    ${fin}`);
}

function actualizar() {
  PAGINAS.forEach(({ archivo, nav, pie }) => {
    const rutaArchivo = path.join(ROOT, archivo);
    let contenido = fs.readFileSync(rutaArchivo, "utf8");

    contenido = reemplazarEntreMarcadores(contenido, "nav-principal", botonYNavPrincipal(nav));

    if (pie) {
      contenido = reemplazarEntreMarcadores(contenido, "pie-pagina", piePagina(pie));
    }

    fs.writeFileSync(rutaArchivo, contenido);
  });

  console.log(`Actualizadas ${PAGINAS.length} paginas estaticas.`);
}

module.exports = { actualizar };

if (require.main === module) actualizar();
