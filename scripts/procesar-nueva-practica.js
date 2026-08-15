const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");
const { generar } = require("./generar-practicas.js");

const ROOT = path.join(__dirname, "..");
const YAML_PATH = path.join(ROOT, "datos", "practicas.yaml");
const IMAGENES_DIR = path.join(ROOT, "assets", "portafolio", "practicas");

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

async function descargarImagenes(slug, urls) {
  const carpeta = path.join(IMAGENES_DIR, slug);
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

async function main() {
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
  const imagenesGuardadas = urls.length ? await descargarImagenes(slug, urls) : [];

  const entrada = {
    slug,
    titulo,
    carpeta_imagenes: `/assets/portafolio/practicas/${slug}`,
    parrafos,
  };

  if (esEdicion) {
    proyectos[indiceExistente] = entrada;
  } else {
    proyectos.push(entrada);
  }

  fs.writeFileSync(YAML_PATH, serializarYaml(proyectos));
  generar();

  await responder(
    `¡Listo! ${esEdicion ? "Actualicé" : "Agregué"} la práctica **${titulo}** ` +
      `(slug \`${slug}\`)${imagenesGuardadas.length ? ` con ${imagenesGuardadas.length} imagen(es) nueva(s)` : ""}. ` +
      "En unos minutos va a estar publicada en " +
      `https://bibliotecacuir.github.io/portafolio/practicas/${slug}.html`
  );
  await cerrarIssue({ token, repo, numero });

  escribirSalida("debe_commitear", "true");
  escribirSalida("slug", slug);
}

main().catch(async (error) => {
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
});
