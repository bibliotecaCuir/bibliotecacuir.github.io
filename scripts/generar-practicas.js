const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");

const ROOT = path.join(__dirname, "..");
const YAML_PATH = path.join(ROOT, "datos", "practicas.yaml");
const IMAGENES_DIR = path.join(ROOT, "assets", "portafolio", "practicas");
const HTML_DIR = path.join(ROOT, "portafolio", "practicas");

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function leerImagenes(slug) {
  const carpeta = path.join(IMAGENES_DIR, slug);
  if (!fs.existsSync(carpeta)) return [];

  return fs
    .readdirSync(carpeta)
    .filter((archivo) => /\.(webp|jpg|jpeg|png)$/i.test(archivo))
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
}

function headerGlobal() {
  return `    <header class="portfolio-header" aria-label="Biblioteca Cuir">
        <a class="portfolio-back" href="/practicas.html">← practicas</a>
        <a class="portfolio-logo" href="/">
            <img src="/assets/logos/logoBiblioBlanco.png" alt="Biblioteca Cuir">
        </a>
    </header>`;
}

function footer() {
  return `    <footer class="site-footer" id="contacto" aria-label="Pie de página">
        <div class="footer-follow">
            <a class="footer-follow-link" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <span class="footer-follow-icon" aria-hidden="true">+</span>
                <span>síguenos</span>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">@bibliotecacuir</a>
        </div>

        <div class="footer-main">
            <h2>
                <span class="footer-title-line">Refugio micropolitico y promiscuo para</span>
                <span class="footer-title-line">las memorias y archivos disidentes</span>
            </h2>

            <div class="footer-content">
                <a class="footer-mark" href="/" aria-label="Biblioteca Cuir">
                    <img class="footer-mark-white" src="/assets/logos/logoBiblioBlanco.png" alt="">
                    <img class="footer-mark-black" src="/assets/logos/logoBiblioNegro.png" alt="">
                </a>

                <div class="footer-column footer-visit">
                    <h3>visítanos</h3>
                    <p>archivo cuir en circulación</p>
                    <p>Santiago, Chile</p>
                </div>

                                <nav class="footer-column footer-links" aria-label="Explorar">
                    <h3>explora</h3>
                    <a href="/manifiesto.html">manifiesto</a>
                    <a href="/coleccion/">colección</a>
                    <a href="/portafolio.html">portafolio</a>
                </nav>

                                <nav class="footer-column footer-links" aria-label="Aprender">
                    <h3>aprende</h3>
                    <a href="/dona.html">protocola</a>
                    <a href="/#sobre-nosotres">sobre nosotres</a>
                    <a href="/#contacto">contacto</a>
                </nav>

                <div class="footer-column footer-contact">
                    <h3>hablemos</h3>
                    <p>preguntas, comentarios, colaboraciones:</p>
                    <a href="mailto:hola@bibliotecacuir.cl">hola@bibliotecacuir.cl</a>
                </div>

                <form class="footer-newsletter" action="/" method="get">
                    <label for="footer-email-practicas">recibe novedades y publicaciones nuevas.</label>
                    <div class="footer-input-row">
                        <input id="footer-email-practicas" type="email" name="email" placeholder="email" autocomplete="email">
                        <button type="submit" aria-label="Enviar correo">→</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="footer-legal">
            <span>Biblioteca Cuir</span>
            <nav aria-label="Legal">
                <a href="/">privacidad</a>
                <a href="/">términos</a>
            </nav>
            <span>instagram · correo</span>
        </div>
    </footer>`;
}

function pagina(proyecto) {
  const imagenes = leerImagenes(proyecto.slug);
  const titulo = proyecto.titulo || proyecto.slug;

  const parrafosHtml = (proyecto.parrafos || [])
    .map((parrafo) => `                <p>${escaparHTML(parrafo)}</p>`)
    .join("\n");

  const imagenesHtml = imagenes
    .map(
      (archivo) =>
        `                    <img src="/assets/portafolio/practicas/${proyecto.slug}/${archivo}" alt="" loading="lazy" decoding="async">`
    )
    .join("\n");

  const claseMedia = imagenes.length === 1 ? "portfolio-media portfolio-media-single" : "portfolio-media";

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
<body class="portfolio-page portfolio-section portfolio-practicas portfolio-project-page">
${headerGlobal()}

    <main class="portfolio-detail portfolio-project-detail">
        <section class="portfolio-detail-hero" aria-labelledby="page-title">
            <h1 id="page-title">practicas</h1>
        </section>

        <section class="portfolio-content">
            <article class="portfolio-entry portfolio-entry-single" id="${escaparHTML(proyecto.slug)}">
                <h2>${escaparHTML(titulo)}</h2>
${parrafosHtml}
                <div class="${claseMedia}" aria-label="Registro visual de ${escaparHTML(titulo)}">
${imagenesHtml}
                </div>
            </article>
        </section>
    </main>

${footer()}
    <script src="/js/portfolio.js" defer></script>
    <script src="/js/site-motion.js" defer></script>
</body>
</html>
`;
}

function generar() {
  const proyectos = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));

  if (!Array.isArray(proyectos)) {
    throw new Error("datos/practicas.yaml no contiene una lista de proyectos.");
  }

  if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR, { recursive: true });

  const archivosEsperados = new Set(proyectos.map((proyecto) => `${proyecto.slug}.html`));
  fs.readdirSync(HTML_DIR)
    .filter((archivo) => archivo.endsWith(".html") && !archivosEsperados.has(archivo))
    .forEach((archivo) => fs.unlinkSync(path.join(HTML_DIR, archivo)));

  proyectos.forEach((proyecto) => {
    fs.writeFileSync(path.join(HTML_DIR, `${proyecto.slug}.html`), pagina(proyecto));
  });

  console.log(`Generadas ${proyectos.length} páginas en portafolio/practicas/.`);
}

module.exports = { generar };

if (require.main === module) generar();
