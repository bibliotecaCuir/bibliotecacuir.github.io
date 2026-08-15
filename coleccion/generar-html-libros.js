const fs = require("fs");
const path = require("path");
const yaml = require("./lib/js-yaml.min.js");

const ROOT = __dirname;
const YAML_DIR = path.join(ROOT, "yaml");
const HTML_DIR = path.join(ROOT, "html");

const catalogosYaml = [
  "caja-01",
  "caja-02",
  "caja-03",
  "caja-04",
  "caja-05",
  "caja-06",
  "caja-07",
  "caja-08",
  "caja-09",
  "caja-10",
  "grafica-01",
  "grafica-02",
  "grafica-03",
  "grafica-04",
];

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textoCaos(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function evitarViuda(valor) {
  return String(valor || "")
    .trim()
    .replace(/\s+([^\s]+)$/, "\u00a0$1");
}

function valorLista(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean).join(", ");
  return valor || "";
}

function esDato(valor) {
  const dato = normalizar(valor);
  return Boolean(dato && dato !== "no aplica" && dato !== "desconocido" && dato !== "s/f");
}

function crearSlug(elemento, caja, index) {
  const codigo = String(elemento.codigo || "").trim();
  const base = codigo && normalizar(codigo) !== "no aplica"
    ? `${codigo}-${index + 1}`
    : `${elemento.titulo || "pieza"}-${caja}-${index + 1}`;

  return normalizar(base)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `pieza-${caja}-${index + 1}`;
}

function clavePublicacion(elemento) {
  return [
    elemento.titulo,
    valorLista(elemento.autorxs),
    elemento.editorial || elemento.editoriales,
    elemento.agno,
  ]
    .map((valor) => normalizar(valor).replace(/[^a-z0-9]+/g, " "))
    .join("|");
}

function imageUrl(elemento, caja) {
  return elemento.imagen
    ? `https://raw.githubusercontent.com/bibliotecaCuir/${caja}/main/imagenes/${elemento.imagen}`
    : "";
}

function leerCatalogos() {
  const publicaciones = new Map();

  catalogosYaml.forEach((caja) => {
    const filePath = path.join(YAML_DIR, `${caja}.yaml`);
    const data = yaml.load(fs.readFileSync(filePath, "utf8"));
    const articulos = data?.catalogo?.articulos || [];

    articulos.forEach((elemento, index) => {
      if (!String(elemento?.titulo || elemento?.codigo || "").trim()) return;
      const clave = clavePublicacion(elemento);
      if (!publicaciones.has(clave)) {
        publicaciones.set(clave, {
          elemento,
          caja,
          index,
          slug: crearSlug(elemento, caja, index),
        });
      }
    });
  });

  return [...publicaciones.values()];
}

function detalle(label, valor) {
  if (!esDato(valor)) return "";
  return `    <div class="libro-datos-fila">
      <dt>${escaparHTML(label)}</dt>
      <dd>${escaparHTML(valor)}</dd>
    </div>
`;
}

function camposFicha(elemento) {
  const dimensiones = [elemento.altura, elemento.ancho, elemento.profundidad]
    .filter(esDato)
    .join(" x ");
  const dimensionesTexto = dimensiones ? `${dimensiones} cm` : "";

  return [
    detalle("Código", elemento.codigo),
    detalle("Autorxs", valorLista(elemento.autorxs)),
    detalle("Editorial", valorLista(elemento.editorial || elemento.editoriales)),
    detalle("Año", elemento.agno),
    detalle("Origen", elemento.origen),
    detalle("Ubicación", elemento.ubicacionActual || elemento.ubicacionPreferente),
    detalle("Donante", elemento.donante),
  ].join("");
}

function camposFisicos(elemento) {
  const dimensiones = [elemento.altura, elemento.ancho, elemento.profundidad]
    .filter(esDato)
    .join(" x ");
  const dimensionesTexto = dimensiones ? `${dimensiones} cm` : "";

  return [
    detalle("Tipología", elemento.tipologia),
    detalle("Material", elemento.material),
    detalle("Dimensiones", dimensionesTexto),
    detalle("Copias", elemento.copias),
  ].join("");
}

function textoSecundario(elemento) {
  return [
    ["Título de conjunto", elemento.tituloConjunto],
    ["Otros", elemento.otros],
    ["Notas de registro", elemento.notasRegistro],
  ]
    .filter(([, valor]) => esDato(valor))
    .map(([label, valor]) => `
      <div class="libro-nota">
        <h3>${escaparHTML(label)}</h3>
        <p>${escaparHTML(valor)}</p>
      </div>
    `)
    .join("");
}

function categoriaRelacion(elemento) {
  const tipo = normalizar(elemento.tipologia);
  if (tipo.includes("fanzine")) return "fanzine";
  if (["libro", "librillo", "fotolibro", "revista", "comic", "cómic"].some((valor) => tipo.includes(valor))) return "libro";
  if (["grafica", "gráfica", "flyer", "sticker", "postal", "afiche"].some((valor) => tipo.includes(valor))) return "grafica";
  if (tipo.includes("agenda")) return "agenda";
  return tipo || "otras";
}

function obtenerRelacionados(publicacion, publicaciones) {
  const actual = publicacion.slug;
  const categoriaActual = categoriaRelacion(publicacion.elemento);
  const autorxsActual = normalizar(valorLista(publicacion.elemento.autorxs));
  const editorialActual = normalizar(valorLista(publicacion.elemento.editorial || publicacion.elemento.editoriales));

  const puntuados = publicaciones
    .filter((pub) => pub.slug !== actual)
    .map((pub) => {
      let puntos = 0;
      if (categoriaRelacion(pub.elemento) === categoriaActual) puntos += 4;
      if (autorxsActual && normalizar(valorLista(pub.elemento.autorxs)) === autorxsActual) puntos += 3;
      if (editorialActual && normalizar(valorLista(pub.elemento.editorial || pub.elemento.editoriales)) === editorialActual) puntos += 2;
      if (normalizar(pub.elemento.origen) === normalizar(publicacion.elemento.origen)) puntos += 1;
      return { ...pub, puntos };
    })
    .sort((a, b) => b.puntos - a.puntos || a.slug.localeCompare(b.slug));

  return puntuados.slice(0, 5);
}

function relatedCard(pub) {
  const imagen = imageUrl(pub.elemento, pub.caja);
  return `
    <a class="relacionados-tarjeta" href="./${pub.slug}.html">
      <figure class="relacionados-portada">
        ${imagen
          ? `<img src="${escaparHTML(imagen)}" alt="" cargando="lazy" decoding="async">`
          : `<span aria-hidden="true">BC</span>`}
      </figure>
      <strong>${escaparHTML(pub.elemento.titulo || "Sin título")}</strong>
      <span>${escaparHTML([valorLista(pub.elemento.autorxs), pub.elemento.agno].filter(Boolean).join(" · "))}</span>
    </a>
  `;
}

function claseTitulo(titulo) {
  const largo = String(titulo || "").length;
  if (largo > 78) return "libro-titulo-xlargo";
  if (largo > 42) return "libro-titulo-largo";
  return "";
}

function headerGlobal(rutaColeccion = "/coleccion/") {
  return `
    <header class="sitio-cabecera" aria-label="Biblioteca Cuir">
      <a class="sitio-logo" href="/">
        <img class="sitio-logo-blanco" src="https://bibliotecacuir.github.io/assets/logos/logoBiblioBlanco.png" alt="Biblioteca Cuir">
        <img class="sitio-logo-negro" src="https://bibliotecacuir.github.io/assets/logos/logoBiblioNegro.png" alt="">
      </a>
    </header>

    <button class="portada-menu-interruptor" type="button" aria-expanded="false" aria-controls="portada-menu">
      <span class="portada-menu-linea"></span>
      <span class="portada-menu-linea"></span>
      <span class="portada-menu-linea"></span>
      <span class="visualmente-solo">Abrir menú</span>
    </button>

    <nav class="portada-menu" id="portada-menu" aria-label="Menú principal">
      <a href="/#contacto">contacto</a>
      <a href="/#manifiesto">manifiesto</a>
      <a href="/#sobre-nosotres">sobre nosotres</a>
      <a href="/portafolio/">portafolio</a>
      <a href="${rutaColeccion}" data-compact-label="colección">coleccion</a>
      <a href="/dona.html" data-compact-label="dona aquí">dona aqui</a>
    </nav>
  `;
}

function footer() {
  return `
    <footer class="sitio-pie" id="contacto" aria-label="Pie de página">
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
            <img src="/assets/logos/logoBiblioBlanco.png" alt="">
          </a>

          <div class="pie-columna pie-visita">
            <h3>visítanos</h3>
            <p>archivo cuir en circulación</p>
            <p>Santiago, Chile</p>
          </div>

          <nav class="pie-columna pie-enlaces" aria-label="Explorar">
            <h3>explora</h3>
            <a href="/manifiesto/">manifiesto</a>
            <a href="/coleccion/">colección</a>
            <a href="/portafolio/">portafolio</a>
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
            <label for="pie-email">recibe novedades y publicaciones nuevas.</label>
            <div class="pie-entrada-fila">
              <input id="pie-email" type="email" name="email" placeholder="email" autocomplete="email">
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
    </footer>
  `;
}

function pagina(publicacion, publicaciones) {
  const { elemento, caja } = publicacion;
  const imagen = imageUrl(elemento, caja);
  const relacionados = obtenerRelacionados(publicacion, publicaciones);
  const titulo = elemento.titulo || "Sin título";
  const tituloCaos = evitarViuda(textoCaos(titulo));
  const autorxs = valorLista(elemento.autorxs);
  const descripcion = elemento.descripcion || "Ficha en proceso de descripción.";
  const titleClass = claseTitulo(titulo);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escaparHTML(descripcion)}">
  <title>${escaparHTML(titulo)} — colección Biblioteca Cuir</title>
  <link rel="icon" type="image/png" href="/assets/imagenes/cola.png">
  <link rel="shortcut icon" href="/assets/imagenes/cola.png">
  <link rel="apple-touch-icon" href="/assets/imagenes/cola.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://bibliotecacuir.github.io">
  <link rel="preconnect" href="https://raw.githubusercontent.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../css/coleccion.css">
</head>
<body class="libro-detalle-cuerpo">
  <a class="saltar-enlace" href="#contenido">Saltar al contenido</a>
  ${headerGlobal()}

  <div class="libro-pagina-contenedor">
    <section class="libro-principal">
      <aside class="libro-portada-panel" aria-label="Portada">
        <figure class="libro-portada-marco">
          ${imagen
            ? `<img src="${escaparHTML(imagen)}" alt="Portada de ${escaparHTML(titulo)}" crossorigin="anonymous" data-remove-white-bg decoding="async">`
            : `<span class="libro-portada-marcador" aria-hidden="true">BC</span>`}
        </figure>
        <p class="libro-portada-leyenda">${escaparHTML(elemento.codigo || caja)}</p>
      </aside>

      <main class="libro-contenido" id="contenido">
        <a class="volver-enlace" href="../index.html">← colección</a>
        <p class="libro-antetitulo">${escaparHTML([elemento.tipologia, elemento.agno].filter(Boolean).join(" · "))}</p>
        <h1${titleClass ? ` class="${titleClass}"` : ""}>${escaparHTML(tituloCaos)}</h1>
        ${autorxs ? `<p class="libro-autores">${escaparHTML(autorxs)}</p>` : ""}

        <section class="libro-fisico" aria-label="Características físicas">
          <h2>Caracteristicas fisicas</h2>
          <dl class="libro-datos libro-fisico-datos">
${camposFisicos(elemento)}
          </dl>
        </section>

        <section class="libro-descripcion" aria-label="Descripción">
          <h2>Descripcion</h2>
          <p>${escaparHTML(descripcion)}</p>
        </section>

        <section class="libro-registro" aria-label="Ficha de registro">
          <h2>Ficha</h2>
          <dl class="libro-datos">
${camposFicha(elemento)}
          </dl>
        </section>

        ${textoSecundario(elemento)}
      </main>
    </section>

    <section class="relacionados-seccion" aria-labelledby="titulo-relacionados">
      <div class="relacionados-titulo">
        <h2 id="titulo-relacionados">Títulos relacionados</h2>
        <a href="../index.html">Toda la colección →</a>
      </div>
      <div class="relacionados-grilla">
        ${relacionados.map(relatedCard).join("")}
      </div>
    </section>

    ${footer()}
  </div>

  <script src="../js/menu.js"></script>
  <script src="../js/detalle-libro.js"></script>
</body>
</html>
`;
}

function limpiarHtmlGenerado() {
  if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR);
  fs.readdirSync(HTML_DIR)
    .filter((file) => file.endsWith(".html"))
    .forEach((file) => fs.unlinkSync(path.join(HTML_DIR, file)));
}

const publicaciones = leerCatalogos();
limpiarHtmlGenerado();

publicaciones.forEach((publicacion) => {
  fs.writeFileSync(
    path.join(HTML_DIR, `${publicacion.slug}.html`),
    pagina(publicacion, publicaciones)
  );
});

console.log(`Generadas ${publicaciones.length} páginas en html/.`);
