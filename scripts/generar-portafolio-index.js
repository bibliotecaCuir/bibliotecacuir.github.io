const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");

const ROOT = path.join(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "portafolio", "index.html");

// Mismo repo hermano que usan generar-portafolio.js y cargar-portafolio.js para
// las imagenes; acá alcanza con la primera (01.webp), la tarjeta general no
// necesita el resto de la galería.
const IMAGENES_REPO_URL = "https://raw.githubusercontent.com/bibliotecaCuir/portafolio-imagenes/main";

// Orden de las secciones tal como se muestran en la grilla general (no es el
// mismo orden que los botones de filtro).
const CATEGORIAS = ["practicas", "activaciones", "obras", "otros"];

const PATRON_GRILLA = /(<section class="portafolio-grilla" aria-label="Todos los proyectos">\n)[\s\S]*?(\n {8}<\/section>)/;

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Las tarjetas muestran el título sin el "(AAAA)" final que sí llevan algunos
// títulos en el yaml (ej. "ProtoCola (2026)") — el año, si se conoce, va aparte
// en el campo opcional "anio" de cada entrada.
function tituloTarjeta(titulo) {
  return String(titulo || "").replace(/\s*\(\d{4}\)\s*$/, "");
}

function tarjeta(categoria, proyecto, numero) {
  const inclinacion = numero % 2 === 1 ? "2deg" : "-2deg";
  const numeroTexto = String(numero).padStart(2, "0");
  const anio = proyecto.anio || "s/f";
  const imagen = `${IMAGENES_REPO_URL}/${categoria}/${proyecto.slug}/01.webp`;

  return `            <a class="portafolio-tarjeta" data-categoria="${categoria}" href="/portafolio/${categoria}/${proyecto.slug}.html" style="--acento: var(--portafolio-color-${categoria}); --inclinacion: ${inclinacion}">
                <figure><img src="${imagen}" alt="" loading="lazy" decoding="async"></figure>
                <div>
                    <span>${numeroTexto} · ${categoria} · ${escaparHTML(anio)}</span>
                    <h2>${escaparHTML(tituloTarjeta(proyecto.titulo))}</h2>
                </div>
            </a>`;
}

function generar() {
  let numero = 0;
  const tarjetas = [];

  for (const categoria of CATEGORIAS) {
    const yamlPath = path.join(ROOT, "datos", `${categoria}.yaml`);
    const proyectos = yaml.load(fs.readFileSync(yamlPath, "utf8"));

    if (!Array.isArray(proyectos)) {
      throw new Error(`datos/${categoria}.yaml no contiene una lista de proyectos.`);
    }

    proyectos.forEach((proyecto) => {
      numero += 1;
      tarjetas.push(tarjeta(categoria, proyecto, numero));
    });
  }

  const html = fs.readFileSync(INDEX_PATH, "utf8");

  if (!PATRON_GRILLA.test(html)) {
    throw new Error('No se encontró la sección .portafolio-grilla en portafolio/index.html.');
  }

  const actualizado = html.replace(PATRON_GRILLA, `$1${tarjetas.join("\n")}$2`);
  fs.writeFileSync(INDEX_PATH, actualizado);
  console.log(`Generadas ${numero} tarjetas en portafolio/index.html.`);
}

generar();
