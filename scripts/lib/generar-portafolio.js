const fs = require("fs");
const path = require("path");
const yaml = require("../../lib/js-yaml.min.js");
const { piePagina } = require("./plantillas-sitio.js");

const ROOT = path.join(__dirname, "..", "..");

// Los originales y las previews .webp viven en el repo hermano portafolio-imagenes
// (github.com/bibliotecaCuir/portafolio-imagenes), no en este repo, para que este
// repo no acumule binarios. leerImagenes() necesita un checkout local de ese repo
// para poder listar los archivos: por defecto un hermano de este repo
// ("../portafolio-imagenes", como lo tiene clonado el usuario), o la ruta que
// indique PORTAFOLIO_IMAGENES_DIR (asi lo usa CI, que no puede checkoutear fuera
// del workspace del repo).
const IMAGENES_REPO_URL = "https://raw.githubusercontent.com/bibliotecaCuir/portafolio-imagenes/main";
const IMAGENES_REPO_LOCAL = process.env.PORTAFOLIO_IMAGENES_DIR
  ? path.resolve(process.env.PORTAFOLIO_IMAGENES_DIR)
  : path.join(ROOT, "..", "portafolio-imagenes");

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Umbral calibrado contra los títulos reales que ya usan portafolio-titulo-largo en el sitio:
// los de 47 caracteres o menos nunca la llevan, los de 61 o más siempre la llevan.
function claseTitulo(titulo) {
  return String(titulo || "").length > 50 ? "portafolio-titulo-largo" : "";
}

// A los títulos (renderizados en Caos Marika, var(--font-proyecto)) les puede
// faltar algún dígito en la fuente (ej. "ProtoCola (2026)"); .portafolio-titulo-numero
// en css/portafolio.css compensa la diferencia de altura contra el fallback.
function formatearTitulo(titulo) {
  return escaparHTML(titulo).replace(/\d+/g, (numero) => `<span class="portafolio-titulo-numero">${numero}</span>`);
}

function leerImagenes(carpetaImagenesCategoria, slug) {
  const carpeta = path.join(carpetaImagenesCategoria, slug);
  if (!fs.existsSync(carpeta)) return [];

  return fs
    .readdirSync(carpeta)
    .filter((archivo) => /\.(webp|jpg|jpeg|png)$/i.test(archivo))
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
}

// portafolio-activaciones es la única sección con fondo claro (ver --portafolio-color-activaciones
// en css/estilo.css); necesita el logo oscuro para tener contraste, el resto usa el logo blanco.
const CATEGORIAS_FONDO_CLARO = new Set(["activaciones"]);

function headerGlobal(categoria) {
  const logo = CATEGORIAS_FONDO_CLARO.has(categoria) ? "logo-biblio-negro.png" : "logo-biblio-blanco.png";

  return `    <header class="portafolio-cabecera" aria-label="Biblioteca Cuir">
        <a class="portafolio-volver" href="/portafolio/${categoria}/">← ${categoria}</a>
        <a class="portafolio-logo" href="/">
            <img src="/assets/logos/${logo}" alt="Biblioteca Cuir">
        </a>
    </header>`;
}

function footer() {
  return piePagina();
}

function pagina(categoria, proyecto, carpetaImagenesCategoria) {
  const imagenes = leerImagenes(carpetaImagenesCategoria, proyecto.slug);
  const titulo = proyecto.titulo || proyecto.slug;
  const claseH2 = claseTitulo(titulo);

  const linkHtml = proyecto.link_url
    ? `                    <p class="portafolio-registro">Link: <a href="${escaparHTML(proyecto.link_url)}" target="_blank" rel="noreferrer">${escaparHTML(proyecto.link_texto || proyecto.link_url)}</a></p>\n`
    : "";

  const parrafosHtml = (proyecto.parrafos || [])
    .map((parrafo) => `                    <p>${escaparHTML(parrafo)}</p>`)
    .join("\n");

  const filasImagenesHtml = imagenes
    .map(
      (archivo) =>
        `            <div class="portafolio-fila portafolio-fila-imagen">\n` +
        `                <div class="portafolio-fila-interior">\n` +
        `                    <img src="${IMAGENES_REPO_URL}/${categoria}/${proyecto.slug}/${archivo}" alt="" loading="lazy" decoding="async">\n` +
        `                </div>\n` +
        `            </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/assets/imagenes/cola.png">
    <link rel="shortcut icon" href="/assets/imagenes/cola.png">
    <link rel="apple-touch-icon" href="/assets/imagenes/cola.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/css/estilo.css">
    <title>${escaparHTML(titulo)} | Biblioteca Cuir</title>
</head>
<body class="portafolio-pagina portafolio-seccion portafolio-${categoria} portafolio-proyecto-pagina">
${headerGlobal(categoria)}

    <main class="portafolio-detalle portafolio-proyecto-detalle">
        <section class="portafolio-detalle-principal" aria-labelledby="page-title">
            <h1 id="page-title">${categoria}</h1>
        </section>

        <section class="portafolio-contenido portafolio-filas" id="${escaparHTML(proyecto.slug)}">
            <div class="portafolio-fila portafolio-fila-texto">
                <div class="portafolio-fila-interior">
                    <h2${claseH2 ? ` class="${claseH2}"` : ""}>${formatearTitulo(titulo)}</h2>
${linkHtml}${parrafosHtml}
                </div>
            </div>
${filasImagenesHtml}
        </section>
    </main>

${footer()}
    <script src="/js/portfolio.js" defer></script>
    <script src="/js/site-motion.js" defer></script>
</body>
</html>
`;
}

function generarSeccion(categoria) {
  const YAML_PATH = path.join(ROOT, "datos", `${categoria}.yaml`);
  const IMAGENES_DIR = path.join(IMAGENES_REPO_LOCAL, categoria);
  const HTML_DIR = path.join(ROOT, "portafolio", categoria);

  if (!fs.existsSync(IMAGENES_REPO_LOCAL)) {
    throw new Error(
      `No se encontro el repo portafolio-imagenes en ${IMAGENES_REPO_LOCAL}. ` +
        "Cloná github.com/bibliotecaCuir/portafolio-imagenes como hermano de este repo para poder generar las paginas."
    );
  }

  const proyectos = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));

  if (!Array.isArray(proyectos)) {
    throw new Error(`datos/${categoria}.yaml no contiene una lista de proyectos.`);
  }

  if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR, { recursive: true });

  const archivosEsperados = new Set(proyectos.map((proyecto) => `${proyecto.slug}.html`));
  fs.readdirSync(HTML_DIR)
    .filter((archivo) => archivo.endsWith(".html") && archivo !== "index.html" && !archivosEsperados.has(archivo))
    .forEach((archivo) => fs.unlinkSync(path.join(HTML_DIR, archivo)));

  proyectos.forEach((proyecto) => {
    fs.writeFileSync(path.join(HTML_DIR, `${proyecto.slug}.html`), pagina(categoria, proyecto, IMAGENES_DIR));
  });

  console.log(`Generadas ${proyectos.length} páginas en portafolio/${categoria}/.`);
}

module.exports = { generarSeccion };
