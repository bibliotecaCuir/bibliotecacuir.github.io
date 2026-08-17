const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");

const ROOT = __dirname;
const YAML_DIR = path.join(ROOT, "yaml");
const FICHAS_DIR = path.join(ROOT, "fichas");

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

function crearSlug(item, caja, index) {
  const codigo = String(item.codigo || "").trim();
  const base = codigo && normalizar(codigo) !== "no aplica"
    ? `${codigo}-${index + 1}`
    : `${item.titulo || "pieza"}-${caja}-${index + 1}`;

  return normalizar(base)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `pieza-${caja}-${index + 1}`;
}

function clavePublicacion(item) {
  return [
    item.titulo,
    valorLista(item.autorxs),
    item.editorial || item.editoriales,
    item.agno,
  ]
    .map((valor) => normalizar(valor).replace(/[^a-z0-9]+/g, " "))
    .join("|");
}

function imageUrl(item, caja) {
  return item.imagen
    ? `https://raw.githubusercontent.com/bibliotecaCuir/coleccion-imagenes/main/${caja}/${item.imagen}`
    : "";
}

function imageUrlPreview(item, caja) {
  if (!item.imagen) return "";
  const nombreWebp = item.imagen.replace(/\.[^.]+$/, ".webp");
  return `https://raw.githubusercontent.com/bibliotecaCuir/coleccion-imagenes/main/webp/${caja}/${nombreWebp}`;
}

function leerCatalogos() {
  const publicaciones = new Map();

  catalogosYaml.forEach((caja) => {
    const filePath = path.join(YAML_DIR, `${caja}.yaml`);
    const data = yaml.load(fs.readFileSync(filePath, "utf8"));
    const articulos = data?.catalogo?.articulos || [];

    articulos.forEach((item, index) => {
      if (!String(item?.titulo || item?.codigo || "").trim()) return;
      if (item?.privado === true) return;
      const clave = clavePublicacion(item);
      if (!publicaciones.has(clave)) {
        publicaciones.set(clave, {
          item,
          caja,
          index,
          slug: crearSlug(item, caja, index),
        });
      }
    });
  });

  return [...publicaciones.values()];
}

function detalle(label, valor) {
  if (!esDato(valor)) return "";
  return `
    <div class="book-data-row">
      <dt>${escaparHTML(label)}</dt>
      <dd>${escaparHTML(valor)}</dd>
    </div>
  `;
}

function camposFicha(item) {
  const dimensiones = [item.altura, item.ancho, item.profundidad]
    .filter(esDato)
    .join(" x ");
  const dimensionesTexto = dimensiones ? `${dimensiones} cm` : "";

  return [
    detalle("Código", item.codigo),
    detalle("Autorxs", valorLista(item.autorxs)),
    detalle("Editorial", valorLista(item.editorial || item.editoriales)),
    detalle("Año", item.agno),
    detalle("Origen", item.origen),
    detalle("Tipología", item.tipologia),
    detalle("Material", item.material),
    detalle("Dimensiones", dimensionesTexto),
    detalle("Copias", item.copias),
    detalle("Ubicación", item.ubicacionActual || item.ubicacionPreferente),
    detalle("Donante", item.donante),
  ].join("");
}

function textoSecundario(item) {
  return [
    ["Título de conjunto", item.tituloConjunto],
    ["Otros", item.otros],
    ["Notas de registro", item.notasRegistro],
  ]
    .filter(([, valor]) => esDato(valor))
    .map(([label, valor]) => `
      <div class="book-note">
        <h3>${escaparHTML(label)}</h3>
        <p>${escaparHTML(valor)}</p>
      </div>
    `)
    .join("");
}

function categoriaRelacion(item) {
  const tipo = normalizar(item.tipologia);
  if (tipo.includes("fanzine")) return "fanzine";
  if (["libro", "librillo", "fotolibro", "revista", "comic", "cómic"].some((valor) => tipo.includes(valor))) return "libro";
  if (["grafica", "gráfica", "flyer", "sticker", "postal", "afiche"].some((valor) => tipo.includes(valor))) return "grafica";
  if (tipo.includes("agenda")) return "agenda";
  return tipo || "otras";
}

function obtenerRelacionados(publicacion, publicaciones) {
  const actual = publicacion.slug;
  const categoriaActual = categoriaRelacion(publicacion.item);
  const autorxsActual = normalizar(valorLista(publicacion.item.autorxs));
  const editorialActual = normalizar(valorLista(publicacion.item.editorial || publicacion.item.editoriales));

  const puntuados = publicaciones
    .filter((pub) => pub.slug !== actual)
    .map((pub) => {
      let puntos = 0;
      if (categoriaRelacion(pub.item) === categoriaActual) puntos += 4;
      if (autorxsActual && normalizar(valorLista(pub.item.autorxs)) === autorxsActual) puntos += 3;
      if (editorialActual && normalizar(valorLista(pub.item.editorial || pub.item.editoriales)) === editorialActual) puntos += 2;
      if (normalizar(pub.item.origen) === normalizar(publicacion.item.origen)) puntos += 1;
      return { ...pub, puntos };
    })
    .sort((a, b) => b.puntos - a.puntos || a.slug.localeCompare(b.slug));

  return puntuados.slice(0, 5);
}

function relatedCard(pub) {
  const imagen = imageUrlPreview(pub.item, pub.caja);
  return `
    <a class="related-card" href="./${pub.slug}.html">
      <figure class="related-cover">
        ${imagen
          ? `<img src="${escaparHTML(imagen)}" alt="" loading="lazy" decoding="async">`
          : `<span aria-hidden="true">BC</span>`}
      </figure>
      <strong>${escaparHTML(pub.item.titulo || "Sin título")}</strong>
      <span>${escaparHTML([valorLista(pub.item.autorxs), pub.item.agno].filter(Boolean).join(" · "))}</span>
    </a>
  `;
}

function claseTitulo(titulo) {
  const largo = String(titulo || "").length;
  if (largo > 78) return "book-title-xlong";
  if (largo > 42) return "book-title-long";
  return "";
}

function headerGlobal(rutaColeccion = "/coleccion/") {
  return `
    <header class="site-header" aria-label="Biblioteca Cuir">
      <a class="site-logo" href="/">
        <img class="site-logo-white" src="https://bibliotecacuir.github.io/assets/logos/logo-biblio-blanco.png" alt="Biblioteca Cuir">
        <img class="site-logo-black" src="https://bibliotecacuir.github.io/assets/logos/logo-biblio-negro.png" alt="">
      </a>
    </header>

    <button class="landing-menu-toggle" type="button" aria-expanded="false" aria-controls="landing-menu">
      <span class="landing-menu-line"></span>
      <span class="landing-menu-line"></span>
      <span class="landing-menu-line"></span>
      <span class="sr-only">Abrir menú</span>
    </button>

    <nav class="landing-menu" id="landing-menu" aria-label="Menú principal">
      <a href="/#contacto">contacto</a>
      <a href="/manifiesto/">manifiesto</a>
      <a href="/#sobre-nosotres">sobre nosotres</a>
      <a href="/portafolio/">portafolio</a>
      <a href="${rutaColeccion}">coleccion</a>
    </nav>
  `;
}

function footer() {
  return `
    <footer class="site-footer" id="contacto" aria-label="Pie de página">
      <div class="footer-follow">
        <a class="footer-follow-link" href="https://www.instagram.com/bibliotecacuir/" target="_blank" rel="noreferrer">
          <span class="footer-follow-icon" aria-hidden="true">+</span>
          <span>síguenos</span>
        </a>
        <a href="https://www.instagram.com/bibliotecacuir/" target="_blank" rel="noreferrer">@bibliotecacuir</a>
      </div>

      <div class="footer-main">
        <h2>
          <span class="footer-title-line">Refugio micropolitico y promiscuo para</span>
          <span class="footer-title-line">las memorias y archivos disidentes</span>
        </h2>

        <div class="footer-content">
          <a class="footer-mark" href="/" aria-label="Biblioteca Cuir">
            <img src="/assets/logos/logo-biblio-blanco.png" alt="">
          </a>

          <div class="footer-column footer-visit">
            <h3>visítanos</h3>
            <p>archivo cuir en circulación</p>
            <p>Santiago, Chile</p>
          </div>

          <nav class="footer-column footer-links" aria-label="Explorar">
            <h3>explora</h3>
            <a href="/manifiesto/">manifiesto</a>
            <a href="/coleccion/">publicaciones</a>
            <a href="/portafolio/">portafolio</a>
          </nav>

          <nav class="footer-column footer-links" aria-label="Aprender">
            <h3>aprende</h3>
            <a href="/dona/">protocola</a>
            <a href="/#sobre-nosotres">sobre nosotres</a>
            <a href="/#contacto">contacto</a>
          </nav>

          <div class="footer-column footer-contact">
            <h3>hablemos</h3>
            <p>preguntas, comentarios, colaboraciones:</p>
            <a href="mailto:hola@bibliotecacuir.cl">hola@bibliotecacuir.cl</a>
          </div>
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
    </footer>
  `;
}

function pagina(publicacion, publicaciones) {
  const { item, caja } = publicacion;
  const imagen = imageUrl(item, caja);
  const relacionados = obtenerRelacionados(publicacion, publicaciones);
  const titulo = item.titulo || "Sin título";
  const tituloCaos = evitarViuda(textoCaos(titulo));
  const autorxs = valorLista(item.autorxs);
  const descripcion = item.descripcion || "Ficha en proceso de descripción.";
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
  <link rel="stylesheet" href="../css/estilo.css">
</head>
<body class="book-detail-body">
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  ${headerGlobal()}

  <div class="book-page-shell">
    <section class="book-hero">
      <aside class="book-cover-panel" aria-label="Portada">
        <figure class="book-cover-frame">
          ${imagen
            ? `<img src="${escaparHTML(imagen)}" alt="Portada de ${escaparHTML(titulo)}" crossorigin="anonymous" data-remove-white-bg decoding="async">`
            : `<span class="book-cover-placeholder" aria-hidden="true">BC</span>`}
        </figure>
        <p class="book-cover-caption">${escaparHTML(item.codigo || caja)}</p>
      </aside>

      <main class="book-content" id="contenido">
        <a class="back-link" href="../index.html">← colección</a>
        <p class="book-eyebrow">${escaparHTML([item.tipologia, item.agno].filter(Boolean).join(" · "))}</p>
        <h1${titleClass ? ` class="${titleClass}"` : ""}>${escaparHTML(tituloCaos)}</h1>
        ${autorxs ? `<p class="book-authors">${escaparHTML(autorxs)}</p>` : ""}

        <section class="book-description" aria-label="Descripción">
          <p>${escaparHTML(descripcion)}</p>
        </section>

        <dl class="book-data">
          ${camposFicha(item)}
        </dl>

        ${textoSecundario(item)}
      </main>
    </section>

    <section class="related-section" aria-labelledby="related-title">
      <div class="related-heading">
        <h2 id="related-title">Títulos relacionados</h2>
        <a href="../index.html">Toda la colección →</a>
      </div>
      <div class="related-grid">
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

function construirAutores(publicaciones) {
  const mapa = new Map();

  publicaciones.forEach((publicacion) => {
    const autorxs = publicacion.item.autorxs;
    const lista = Array.isArray(autorxs) ? autorxs : [autorxs];

    lista.forEach((autorRaw) => {
      const nombre = String(autorRaw || "").trim();
      if (!nombre) return;
      const clave = normalizar(nombre);
      if (!mapa.has(clave)) mapa.set(clave, { nombre, obras: [] });
      mapa.get(clave).obras.push(publicacion);
    });
  });

  return [...mapa.values()]
    .map((autor) => ({
      ...autor,
      obras: [...autor.obras].sort((a, b) =>
        normalizar(a.item.titulo).localeCompare(normalizar(b.item.titulo))
      ),
    }))
    .sort((a, b) => normalizar(a.nombre).localeCompare(normalizar(b.nombre)));
}

function letraDe(nombre) {
  const letra = normalizar(nombre).charAt(0).toUpperCase();
  return /[A-Z]/.test(letra) ? letra : "#";
}

function idLetra(letra) {
  return letra === "#" ? "otros" : `letra-${letra.toLowerCase()}`;
}

function agruparPorLetra(autores) {
  const grupos = new Map();
  autores.forEach((autor) => {
    const letra = letraDe(autor.nombre);
    if (!grupos.has(letra)) grupos.set(letra, []);
    grupos.get(letra).push(autor);
  });
  return [...grupos.entries()];
}

function autorBloque(autor) {
  return `<li class="autor-nombre">${escaparHTML(autor.nombre)}</li>`;
}

function seccionLetra([letra, autores]) {
  const id = idLetra(letra);
  return `
    <section class="autores-grupo" id="${id}" aria-labelledby="${id}-titulo">
      <h2 class="autores-letra-titulo" id="${id}-titulo">${letra}</h2>
      <ul class="autores-lista">
        ${autores.map(autorBloque).join("")}
      </ul>
    </section>
  `;
}

function navegacionLetras(grupos) {
  return grupos
    .map(([letra]) => `<a class="filtro-boton" href="#${idLetra(letra)}">${letra}</a>`)
    .join("");
}

function paginaAutores(autores) {
  const grupos = agruparPorLetra(autores);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Autorxs de la colección de la Biblioteca Cuir.">
  <title>autorxs — colección Biblioteca Cuir</title>
  <link rel="icon" type="image/png" href="/assets/imagenes/cola.png">
  <link rel="shortcut icon" href="/assets/imagenes/cola.png">
  <link rel="apple-touch-icon" href="/assets/imagenes/cola.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./css/estilo.css">
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar a autorxs</a>
  ${headerGlobal()}

  <main>
    <section class="catalogo-hero" aria-labelledby="autores-title">
      <div class="catalogo-intro">
        <div class="catalogo-presentacion">
          <h1 id="autores-title">autorxs</h1>
          <p class="catalogo-descripcion">
            <span>Quienes escriben, dibujan y publican</span>
            <span>en la colección de la Biblioteca Cuir.</span>
          </p>
        </div>
        <div class="catalogo-controls">
          <p class="header-count">${autores.length} autorxs</p>
          <nav class="catalogo-filtros" aria-label="Ir a letra">
            ${navegacionLetras(grupos)}
          </nav>
        </div>
      </div>
    </section>

    <section class="autores-section" id="contenido" aria-label="Listado de autorxs">
      ${grupos.map(seccionLetra).join("")}
    </section>
  </main>

  ${footer()}

  <script src="./js/menu.js"></script>
</body>
</html>
`;
}

function limpiarHtmlGenerado() {
  if (!fs.existsSync(FICHAS_DIR)) fs.mkdirSync(FICHAS_DIR);
  fs.readdirSync(FICHAS_DIR)
    .filter((file) => file.endsWith(".html"))
    .forEach((file) => fs.unlinkSync(path.join(FICHAS_DIR, file)));
}

const publicaciones = leerCatalogos();
limpiarHtmlGenerado();

publicaciones.forEach((publicacion) => {
  fs.writeFileSync(
    path.join(FICHAS_DIR, `${publicacion.slug}.html`),
    pagina(publicacion, publicaciones)
  );
});

console.log(`Generadas ${publicaciones.length} páginas en fichas/.`);

const autores = construirAutores(publicaciones);
fs.writeFileSync(path.join(ROOT, "autorxs.html"), paginaAutores(autores));

console.log(`Generada autorxs.html con ${autores.length} autorxs.`);
