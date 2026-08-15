const fs = require("fs");
const path = require("path");
const yaml = require("../../lib/js-yaml.min.js");

const ROOT = path.join(__dirname, "..", "..");

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
  const logo = CATEGORIAS_FONDO_CLARO.has(categoria) ? "logoBiblioNegro.png" : "logoBiblioBlanco.png";

  return `    <header class="portafolio-cabecera" aria-label="Biblioteca Cuir">
        <a class="portafolio-volver" href="/${categoria}.html">← ${categoria}</a>
        <a class="portafolio-logo" href="/">
            <img src="/assets/logos/${logo}" alt="Biblioteca Cuir">
        </a>
    </header>`;
}

function footer(categoria) {
  return `    <footer class="sitio-pie" id="contacto" aria-label="Pie de página">
        <div class="pie-seguir">
            <a class="pie-seguir-enlace" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <span class="pie-seguir-icono" aria-hidden="true">+</span>
                <span>síguenos</span>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">@bibliotecacuir</a>
        </div>

        <div class="pie-contenedor">
            <h2>
                <span class="pie-titulo-linea">Refugio micropolitico y promiscuo para</span>
                <span class="pie-titulo-linea">las memorias y archivos disidentes</span>
            </h2>

            <div class="pie-contenido">
                <a class="pie-marca" href="/" aria-label="Biblioteca Cuir">
                    <img class="pie-marca-blanco" src="/assets/logos/logoBiblioBlanco.png" alt="">
                    <img class="pie-marca-negro" src="/assets/logos/logoBiblioNegro.png" alt="">
                </a>

                <div class="pie-columna pie-visita">
                    <h3>visítanos</h3>
                    <p>archivo cuir en circulación</p>
                    <p>Santiago, Chile</p>
                </div>

                                <nav class="pie-columna pie-enlaces" aria-label="Explorar">
                    <h3>explora</h3>
                    <a href="/manifiesto.html">manifiesto</a>
                    <a href="/coleccion/">colección</a>
                    <a href="/portafolio.html">portafolio</a>
                </nav>

                                <nav class="pie-columna pie-enlaces" aria-label="Aprender">
                    <h3>aprende</h3>
                    <a href="/dona.html">protocola</a>
                    <a href="/#sobre-nosotres">sobre nosotres</a>
                    <a href="/#contacto">contacto</a>
                </nav>

                <div class="pie-columna pie-contacto">
                    <h3>hablemos</h3>
                    <p>preguntas, comentarios, colaboraciones:</p>
                    <a href="mailto:hola@bibliotecacuir.cl">hola@bibliotecacuir.cl</a>
                </div>

                <form class="pie-boletin" action="/" method="get">
                    <label for="footer-email-${categoria}">recibe novedades y publicaciones nuevas.</label>
                    <div class="pie-entrada-fila">
                        <input id="footer-email-${categoria}" type="email" name="email" placeholder="email" autocomplete="email">
                        <button type="submit" aria-label="Enviar correo">→</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="pie-legal">
            <span>Biblioteca Cuir</span>
            <nav aria-label="Legal">
                <a href="/">privacidad</a>
                <a href="/">términos</a>
            </nav>
            <span>instagram · correo</span>
        </div>
    </footer>`;
}

function pagina(categoria, proyecto, carpetaImagenesCategoria) {
  const imagenes = leerImagenes(carpetaImagenesCategoria, proyecto.slug);
  const titulo = proyecto.titulo || proyecto.slug;
  const claseH2 = claseTitulo(titulo);

  const linkHtml = proyecto.link_url
    ? `                <p class="portafolio-registro">Link: <a href="${escaparHTML(proyecto.link_url)}" target="_blank" rel="noreferrer">${escaparHTML(proyecto.link_texto || proyecto.link_url)}</a></p>\n`
    : "";

  const parrafosHtml = (proyecto.parrafos || [])
    .map((parrafo) => `                <p>${escaparHTML(parrafo)}</p>`)
    .join("\n");

  const imagenesHtml = imagenes
    .map(
      (archivo) =>
        `                    <img src="/assets/portafolio/${categoria}/${proyecto.slug}/${archivo}" alt="" loading="lazy" decoding="async">`
    )
    .join("\n");

  const claseMedia = imagenes.length === 1 ? "portafolio-multimedia portafolio-multimedia-unico" : "portafolio-multimedia";

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

        <section class="portafolio-contenido">
            <article class="portafolio-entrada portafolio-entrada-unico" id="${escaparHTML(proyecto.slug)}">
                <h2${claseH2 ? ` class="${claseH2}"` : ""}>${escaparHTML(titulo)}</h2>
${linkHtml}${parrafosHtml}
                <div class="${claseMedia}" aria-label="Registro visual de ${escaparHTML(titulo)}">
${imagenesHtml}
                </div>
            </article>
        </section>
    </main>

${footer(categoria)}
    <script src="/js/portfolio.js" defer></script>
    <script src="/js/site-motion.js" defer></script>
</body>
</html>
`;
}

function generarSeccion(categoria) {
  const YAML_PATH = path.join(ROOT, "datos", `${categoria}.yaml`);
  const IMAGENES_DIR = path.join(ROOT, "assets", "portafolio", categoria);
  const HTML_DIR = path.join(ROOT, "portafolio", categoria);

  const proyectos = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));

  if (!Array.isArray(proyectos)) {
    throw new Error(`datos/${categoria}.yaml no contiene una lista de proyectos.`);
  }

  if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR, { recursive: true });

  const archivosEsperados = new Set(proyectos.map((proyecto) => `${proyecto.slug}.html`));
  fs.readdirSync(HTML_DIR)
    .filter((archivo) => archivo.endsWith(".html") && !archivosEsperados.has(archivo))
    .forEach((archivo) => fs.unlinkSync(path.join(HTML_DIR, archivo)));

  proyectos.forEach((proyecto) => {
    fs.writeFileSync(path.join(HTML_DIR, `${proyecto.slug}.html`), pagina(categoria, proyecto, IMAGENES_DIR));
  });

  console.log(`Generadas ${proyectos.length} páginas en portafolio/${categoria}/.`);
}

module.exports = { generarSeccion };
