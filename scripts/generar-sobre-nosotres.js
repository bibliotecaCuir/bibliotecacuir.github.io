// Genera sobre-nosotres/index.html a partir de datos/sobre-nosotres.yaml
// (titulo, parrafos y financiamiento) y las imagenes que haya en
// assets/sobre-nosotres/ (se muestran todas, en orden alfabetico, sin
// listarlas en el YAML). LOGO_FINANCIAMIENTO es un nombre de archivo fijo
// dentro de esa carpeta: si existe, se muestra junto al texto de
// financiamiento (no como una foto mas de la galeria).

const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");
const { botonYNavPrincipal, piePagina } = require("./lib/plantillas-sitio.js");

const ROOT = path.join(__dirname, "..");
const YAML_PATH = path.join(ROOT, "datos", "sobre-nosotres.yaml");
const IMAGENES_DIR = path.join(ROOT, "assets", "sobre-nosotres");
const HTML_PATH = path.join(ROOT, "sobre-nosotres", "index.html");
const LOGO_FINANCIAMIENTO = "logo-ministerio.png";

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// La fuente Caos Marika (var(--font-proyecto)) no tiene vocales acentuadas,
// asi que todo texto que se muestre con ella tiene que ir sin tildes.
function quitarTildes(texto) {
  return String(texto || "")
    .replace(/[áÁ]/g, "a")
    .replace(/[éÉ]/g, "e")
    .replace(/[íÍ]/g, "i")
    .replace(/[óÓ]/g, "o")
    .replace(/[úÚüÜ]/g, "u");
}

// Los numeros tampoco se ven bien en Caos Marika, asi que van en la
// tipografia comun (var(--font-texto)) — mismo criterio que coleccion,
// donde el año de cada ficha va fuera del titulo en Caos Marika.
function resaltarNumeros(html) {
  return html.replace(/\d+/g, (numero) => `<span class="sobre-nosotres-financiamiento-numero">${numero}</span>`);
}

function leerImagenes() {
  if (!fs.existsSync(IMAGENES_DIR)) return [];

  return fs
    .readdirSync(IMAGENES_DIR)
    .filter((archivo) => /\.(webp|jpg|jpeg|png)$/i.test(archivo))
    .filter((archivo) => archivo !== LOGO_FINANCIAMIENTO)
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
}

function pagina(datos, imagenes) {
  const titulo = datos.titulo || "sobre nosotres";

  const parrafosHtml = (datos.parrafos || [])
    .map((parrafo) => `                <p>${escaparHTML(parrafo)}</p>`)
    .join("\n");

  const galeriaHtml = imagenes.length
    ? `
        <div class="sobre-nosotres-galeria">
${imagenes
  .map(
    (archivo) =>
      `            <img src="/assets/sobre-nosotres/${archivo}" alt="" loading="lazy" decoding="async">`
  )
  .join("\n")}
        </div>`
    : "";

  const logoFinanciamientoExiste = fs.existsSync(path.join(IMAGENES_DIR, LOGO_FINANCIAMIENTO));

  // financiamiento puede ser una lista de lineas (para controlar los saltos
  // de linea a mano, como quedan mejor al lado del logo chico) o un string.
  const lineasFinanciamiento = Array.isArray(datos.financiamiento)
    ? datos.financiamiento
    : datos.financiamiento
      ? [datos.financiamiento]
      : [];

  const textoFinanciamientoHtml = lineasFinanciamiento
    .map((linea) => resaltarNumeros(escaparHTML(quitarTildes(linea))))
    .join("<br>");

  const financiamientoHtml = lineasFinanciamiento.length
    ? `
        <div class="sobre-nosotres-financiamiento">
${
  logoFinanciamientoExiste
    ? `            <img class="sobre-nosotres-financiamiento-logo" src="/assets/sobre-nosotres/${LOGO_FINANCIAMIENTO}" alt="" loading="lazy" decoding="async">\n`
    : ""
}            <p class="sobre-nosotres-financiamiento-texto">${textoFinanciamientoHtml}</p>
        </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/assets/imagenes/cola-icon.png">
    <link rel="shortcut icon" href="/assets/imagenes/cola-icon.png">
    <link rel="apple-touch-icon" href="/assets/imagenes/cola-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/css/estilo.css">
    <title>${escaparHTML(titulo)} | Biblioteca Cuir</title>
</head>
<body class="portafolio-pagina sobre-nosotres-pagina">
    <header class="sitio-cabecera" aria-label="Biblioteca Cuir">
        <a class="sitio-logo" href="/">
            <img class="sitio-logo-blanco" src="/assets/logos/logo-biblio-blanco.webp" alt="Biblioteca Cuir">
            <img class="sitio-logo-negro" src="/assets/logos/logo-biblio-negro.webp" alt="">
        </a>
    </header>

${botonYNavPrincipal({ id: "sobre-nosotres-menu", activo: "sobre-nosotres", esInicio: false })}

    <main class="sobre-nosotres-contenedor">
        <section class="sobre-nosotres-principal" aria-labelledby="page-title">
            <h1 id="page-title">${escaparHTML(titulo)}</h1>
${parrafosHtml}${galeriaHtml}${financiamientoHtml}
        </section>
    </main>

${piePagina()}
    <script src="/js/menu-subpaginas.js"></script>
    <script src="/js/site-motion.js" defer></script>
</body>
</html>
`;
}

function generar() {
  const datos = yaml.load(fs.readFileSync(YAML_PATH, "utf8")) || {};
  const imagenes = leerImagenes();

  fs.mkdirSync(path.dirname(HTML_PATH), { recursive: true });
  fs.writeFileSync(HTML_PATH, pagina(datos, imagenes));

  console.log("Generado sobre-nosotres/index.html.");
}

module.exports = { generar };

if (require.main === module) generar();
