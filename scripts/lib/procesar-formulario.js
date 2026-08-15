const fs = require("fs");
const path = require("path");
const yaml = require("../../lib/js-yaml.min.js");
const { generarSeccion } = require("./generar-portafolio.js");

const ROOT = path.join(__dirname, "..", "..");

const EXTENSIONES_POR_TIPO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const ASOCIACIONES_CONFIABLES = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

function extraerCampo(body, etiqueta) {
  const escapada = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patron = new RegExp(`### ${escapada}\\s*\\n([\\s\\S]*?)(?=\\n### |$)`);
  const match = body.match(patron);
  const valor = match ? match[1].trim() : "";
  return valor === "_No response_" ? "" : valor;
}

function slugificar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extraerParrafos(texto) {
  return texto
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean);
}

function extraerUrlsImagenes(texto) {
  return [...texto.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g)].map((coincidencia) => coincidencia[1]);
}

function serializarYaml(proyectos) {
  const bruto = yaml.dump(proyectos, { lineWidth: -1, quotingType: '"', forceQuotes: true });
  return `${bruto.split(/\n(?=- )/).join("\n\n").trimEnd()}\n`;
}

async function descargarImagenes(imagenesDir, slug, urls) {
  const carpeta = path.join(imagenesDir, slug);
  fs.mkdirSync(carpeta, { recursive: true });

  const existentes = fs
    .readdirSync(carpeta)
    .filter((archivo) => /^\d+\.\w+$/.test(archivo))
    .map((archivo) => parseInt(archivo, 10));

  let siguiente = existentes.length ? Math.max(...existentes) + 1 : 1;
  const guardadas = [];

  for (const url of urls) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) continue;

    const tipo = (respuesta.headers.get("content-type") || "").split(";")[0].trim();
    const extension = EXTENSIONES_POR_TIPO[tipo];
    if (!extension) continue;

    const nombre = `${String(siguiente).padStart(2, "0")}.${extension}`;
    const buffer = Buffer.from(await respuesta.arrayBuffer());
    fs.writeFileSync(path.join(carpeta, nombre), buffer);
    guardadas.push(nombre);
    siguiente += 1;
  }

  return guardadas;
}

async function comentarEnIssue({ token, repo, numero, cuerpo }) {
  await fetch(`https://api.github.com/repos/${repo}/issues/${numero}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: cuerpo }),
  });
}

async function cerrarIssue({ token, repo, numero }) {
  await fetch(`https://api.github.com/repos/${repo}/issues/${numero}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ state: "closed" }),
  });
}

function escribirSalida(nombre, valor) {
  const archivoSalida = process.env.GITHUB_OUTPUT;
  if (archivoSalida) fs.appendFileSync(archivoSalida, `${nombre}=${valor}\n`);
}

// categoria: "practicas" | "activaciones" | ...
// nombreSingular: la palabra en español para los mensajes de vuelta en el issue, ej. "práctica" | "activación"
async function procesarFormulario(categoria, { nombreSingular }) {
  const YAML_PATH = path.join(ROOT, "datos", `${categoria}.yaml`);
  const IMAGENES_DIR = path.join(ROOT, "assets", "portafolio", categoria);

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const numero = process.env.ISSUE_NUMBER;
  const asociacion = process.env.ISSUE_AUTHOR_ASSOCIATION || "";
  const body = process.env.ISSUE_BODY || "";

  const responder = (cuerpo) => comentarEnIssue({ token, repo, numero, cuerpo });

  if (!ASOCIACIONES_CONFIABLES.has(asociacion)) {
    await responder(
      "Gracias por la propuesta. Como todavía no sos colaborador/a del repositorio, " +
        "esto va a quedar pendiente de que alguien del equipo lo revise y lo publique a mano."
    );
    escribirSalida("debe_commitear", "false");
    return;
  }

  const titulo = extraerCampo(body, "Título");
  const parrafosTexto = extraerCampo(body, "Párrafos");
  const slugInput = extraerCampo(body, "Slug (opcional)");
  const linkUrl = extraerCampo(body, "Link (opcional)");
  const linkTexto = extraerCampo(body, "Texto del link (opcional)");
  const imagenesTexto = extraerCampo(body, "Imágenes");

  const parrafos = extraerParrafos(parrafosTexto);

  if (!titulo || !parrafos.length) {
    await responder(
      "Faltan datos: hace falta un **Título** y al menos un párrafo en **Párrafos**. " +
        "Editá el issue completando esos campos y volvé a intentarlo."
    );
    escribirSalida("debe_commitear", "false");
    return;
  }

  const slug = slugificar(slugInput) || slugificar(titulo);

  if (!slug) {
    await responder("No pude generar un slug válido a partir del título. Completá el campo **Slug (opcional)** a mano.");
    escribirSalida("debe_commitear", "false");
    return;
  }

  const proyectos = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));
  const indiceExistente = proyectos.findIndex((proyecto) => proyecto.slug === slug);
  const esEdicion = indiceExistente !== -1;

  const urls = extraerUrlsImagenes(imagenesTexto);
  const imagenesGuardadas = urls.length ? await descargarImagenes(IMAGENES_DIR, slug, urls) : [];

  const entrada = {
    slug,
    titulo,
    carpeta_imagenes: `/assets/portafolio/${categoria}/${slug}`,
    ...(linkUrl && { link_url: linkUrl }),
    ...(linkUrl && linkTexto && { link_texto: linkTexto }),
    parrafos,
  };

  if (esEdicion) {
    proyectos[indiceExistente] = entrada;
  } else {
    proyectos.push(entrada);
  }

  fs.writeFileSync(YAML_PATH, serializarYaml(proyectos));
  generarSeccion(categoria);

  await responder(
    `¡Listo! ${esEdicion ? "Actualicé" : "Agregué"} la ${nombreSingular} **${titulo}** ` +
      `(slug \`${slug}\`)${imagenesGuardadas.length ? ` con ${imagenesGuardadas.length} imagen(es) nueva(s)` : ""}. ` +
      "En unos minutos va a estar publicada en " +
      `https://bibliotecacuir.github.io/portafolio/${categoria}/${slug}.html`
  );
  await cerrarIssue({ token, repo, numero });

  escribirSalida("debe_commitear", "true");
  escribirSalida("slug", slug);
}

async function ejecutar(categoria, opciones) {
  try {
    await procesarFormulario(categoria, opciones);
  } catch (error) {
    console.error(error);
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY;
    const numero = process.env.ISSUE_NUMBER;
    if (token && repo && numero) {
      await comentarEnIssue({
        token,
        repo,
        numero,
        cuerpo: `Algo falló al procesar este issue automáticamente: \`${error.message}\`. Alguien del equipo lo va a revisar a mano.`,
      }).catch(() => {});
    }
    escribirSalida("debe_commitear", "false");
    process.exitCode = 1;
  }
}

module.exports = { procesarFormulario, ejecutar };
