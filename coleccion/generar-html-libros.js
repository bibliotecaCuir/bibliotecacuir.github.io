const fs = require("fs");
const path = require("path");
const {
  normalizar,
  escaparHTML,
  valorLista,
  esDato,
  imageUrl,
  imageUrlPreview,
  leerCatalogos,
} = require("./lib-catalogo.js");

const ROOT = __dirname;
const FICHAS_DIR = path.join(ROOT, "fichas");
const AUTORXS_DIR = path.join(ROOT, "autorxs");

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

function detalle(label, valor) {
  if (!esDato(valor)) return "";
  return `
    <div class="ficha-datos-fila">
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
    detalle("Traducido por", item.traducidoPor),
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
      <div class="ficha-nota">
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

function relatedCard(pub, basePath = "./") {
  const imagen = imageUrlPreview(pub.item, pub.caja);
  return `
    <a class="relacionados-tarjeta" href="${basePath}${pub.slug}.html">
      <figure class="relacionados-portada">
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
  if (largo > 78) return "titulo-muy-largo";
  if (largo > 42) return "titulo-largo";
  return "";
}

function headerGlobal(rutaColeccion = "/coleccion/") {
  return `
    <header class="cabecera-coleccion" aria-label="Biblioteca Cuir">
      <a class="logo-coleccion" href="/">
        <img class="logo-coleccion-blanco" src="https://bibliotecacuir.github.io/assets/logos/logo-biblio-blanco.png" alt="Biblioteca Cuir">
        <img class="logo-coleccion-negro" src="https://bibliotecacuir.github.io/assets/logos/logo-biblio-negro.png" alt="">
      </a>
    </header>

    <button class="menu-interruptor" type="button" aria-expanded="false" aria-controls="landing-menu">
      <span class="menu-interruptor-linea"></span>
      <span class="menu-interruptor-linea"></span>
      <span class="menu-interruptor-linea"></span>
      <span class="visualmente-solo">Abrir menú</span>
    </button>

    <nav class="menu-principal" id="landing-menu" aria-label="Menú principal">
      <a href="/manifiesto/">manifiesto</a>
      <a href="/#sobre-nosotres">sobre nosotres</a>
      <a href="${rutaColeccion}">coleccion</a>
      <a href="/portafolio/">portafolio</a>
      <a href="/#contacto">contacto</a>
    </nav>
  `;
}

function footer() {
  return `
    <footer class="sitio-pie" id="contacto" aria-label="Pie de página">
      <div class="pie-seguir">
        <a class="pie-seguir-enlace" href="https://www.instagram.com/bibliotecacuir/" target="_blank" rel="noreferrer">
          <span class="pie-seguir-icono" aria-hidden="true">+</span>
          <span>síguenos</span>
        </a>
        <a href="https://www.instagram.com/bibliotecacuir/" target="_blank" rel="noreferrer">@bibliotecacuir</a>
      </div>

      <div class="pie-contenedor">
        <h2>
          <span class="pie-titulo-linea">Refugio micropolitico y promiscuo para</span>
          <span class="pie-titulo-linea">las memorias y archivos disidentes</span>
        </h2>

        <div class="pie-contenido">
          <a class="pie-marca" href="/" aria-label="Biblioteca Cuir">
            <img src="/assets/logos/logo-biblio-blanco.png" alt="">
          </a>

          <div class="pie-columna pie-visita">
            <h3>visítanos</h3>
            <p>archivo cuir en circulación</p>
            <p>Santiago, Chile</p>
          </div>

          <nav class="pie-columna pie-enlaces" aria-label="Explorar">
            <h3>explora</h3>
            <a href="/manifiesto/">manifiesto</a>
            <a href="/coleccion/">publicaciones</a>
            <a href="/portafolio/">portafolio</a>
          </nav>

          <nav class="pie-columna pie-enlaces" aria-label="Aprender">
            <h3>aprende</h3>
            <a href="/dona/">protocola</a>
            <a href="/#sobre-nosotres">sobre nosotres</a>
            <a href="/#contacto">contacto</a>
          </nav>

          <div class="pie-columna pie-contacto">
            <h3>hablemos</h3>
            <p>preguntas, comentarios, colaboraciones:</p>
            <a href="mailto:hola@bibliotecacuir.cl">hola@bibliotecacuir.cl</a>
          </div>
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
  <link rel="stylesheet" href="/css/coleccion.css">
</head>
<body class="cuerpo-ficha">
  <a class="enlace-saltar" href="#contenido">Saltar al contenido</a>
  ${headerGlobal()}

  <div class="contenedor-ficha">
    <section class="ficha-encabezado">
      <aside class="ficha-portada-panel" aria-label="Portada">
        <figure class="ficha-portada-marco">
          ${imagen
            ? `<img src="${escaparHTML(imagen)}" alt="Portada de ${escaparHTML(titulo)}" crossorigin="anonymous" data-remove-white-bg decoding="async">`
            : `<span class="ficha-portada-marcador" aria-hidden="true">BC</span>`}
        </figure>
        <p class="ficha-portada-leyenda">${escaparHTML(item.codigo || caja)}</p>
      </aside>

      <main class="ficha-contenido" id="contenido">
        <a class="enlace-volver" href="../index.html">← colección</a>
        <p class="ficha-antetitulo">${escaparHTML([item.tipologia, item.agno].filter(Boolean).join(" · "))}</p>
        <h1${titleClass ? ` class="${titleClass}"` : ""}>${escaparHTML(tituloCaos)}</h1>
        ${autorxs ? `<p class="ficha-autorxs">${escaparHTML(autorxs)}</p>` : ""}

        <section class="ficha-descripcion" aria-label="Descripción">
          <p>${escaparHTML(descripcion)}</p>
        </section>

        <dl class="ficha-datos">
          ${camposFicha(item)}
        </dl>

        ${textoSecundario(item)}
      </main>
    </section>

    <section class="relacionados-seccion" aria-labelledby="related-title">
      <div class="relacionados-titulo">
        <h2 id="related-title">Títulos relacionados</h2>
        <a href="../index.html">Toda la colección →</a>
      </div>
      <div class="relacionados-grilla">
        ${relacionados.map((pub) => relatedCard(pub)).join("")}
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

function crearSlugAutor(nombre, slugsUsados) {
  const base = normalizar(nombre)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "autor";

  let slug = base;
  let sufijo = 2;
  while (slugsUsados.has(slug)) {
    slug = `${base}-${sufijo}`;
    sufijo += 1;
  }

  slugsUsados.add(slug);
  return slug;
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

  const slugsUsados = new Set();

  return [...mapa.values()]
    .map((autor) => ({
      ...autor,
      obras: [...autor.obras].sort((a, b) =>
        normalizar(a.item.titulo).localeCompare(normalizar(b.item.titulo))
      ),
    }))
    .sort((a, b) => normalizar(a.nombre).localeCompare(normalizar(b.nombre)))
    .map((autor) => ({ ...autor, slug: crearSlugAutor(autor.nombre, slugsUsados) }));
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
  const href = `./autorxs/${autor.slug}.html`;
  return `<li class="autor-nombre"><a href="${href}">${escaparHTML(autor.nombre)}</a></li>`;
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
  <link rel="stylesheet" href="/css/coleccion.css">
</head>
<body>
  <a class="enlace-saltar" href="#contenido">Saltar a autorxs</a>
  ${headerGlobal()}

  <main>
    <section class="catalogo-encabezado" aria-labelledby="autores-title">
      <div class="catalogo-introduccion">
        <div class="catalogo-presentacion">
          <a class="enlace-volver enlace-volver-encabezado" href="./index.html">← colección</a>
          <h1 id="autores-title">autorxs</h1>
          <p class="catalogo-descripcion">
            <span>Quienes escriben, dibujan y publican</span>
            <span>en la colección de la Biblioteca Cuir.</span>
          </p>
        </div>
        <div class="catalogo-controles">
          <p class="contador-piezas">${autores.length} autorxs</p>
          <nav class="catalogo-filtros" aria-label="Ir a letra">
            ${navegacionLetras(grupos)}
          </nav>
        </div>
      </div>
    </section>

    <section class="autores-seccion" id="contenido" aria-label="Listado de autorxs">
      ${grupos.map(seccionLetra).join("")}
    </section>
  </main>

  ${footer()}

  <script src="./js/menu.js"></script>
</body>
</html>
`;
}

function paginaAutor(autor) {
  const cantidad = autor.obras.length;
  const titleClass = claseTitulo(autor.nombre);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Obras de ${escaparHTML(autor.nombre)} en la colección de la Biblioteca Cuir.">
  <title>${escaparHTML(autor.nombre)} — autorxs — colección Biblioteca Cuir</title>
  <link rel="icon" type="image/png" href="/assets/imagenes/cola.png">
  <link rel="shortcut icon" href="/assets/imagenes/cola.png">
  <link rel="apple-touch-icon" href="/assets/imagenes/cola.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://bibliotecacuir.github.io">
  <link rel="preconnect" href="https://raw.githubusercontent.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/coleccion.css">
</head>
<body>
  <a class="enlace-saltar" href="#contenido">Saltar al contenido</a>
  ${headerGlobal()}

  <main>
    <section class="catalogo-encabezado" aria-labelledby="autor-title">
      <div class="catalogo-introduccion">
        <div class="catalogo-presentacion">
          <a class="enlace-volver enlace-volver-encabezado" href="../autorxs.html">← autorxs</a>
          <h1 id="autor-title"${titleClass ? ` class="${titleClass}"` : ""}>${escaparHTML(autor.nombre)}</h1>
          <p class="catalogo-descripcion">
            <span>${cantidad} ${cantidad === 1 ? "pieza" : "piezas"} en la colección</span>
          </p>
        </div>
      </div>
    </section>

    <section class="relacionados-seccion" aria-labelledby="obras-title" id="contenido">
      <div class="relacionados-titulo">
        <h2 id="obras-title">Obras</h2>
        <a href="../index.html">Toda la colección →</a>
      </div>
      <div class="relacionados-grilla">
        ${autor.obras.map((pub) => relatedCard(pub, "../fichas/")).join("")}
      </div>
    </section>
  </main>

  ${footer()}

  <script src="../js/menu.js"></script>
</body>
</html>
`;
}

function limpiarAutorxsGenerado() {
  if (!fs.existsSync(AUTORXS_DIR)) fs.mkdirSync(AUTORXS_DIR);
  fs.readdirSync(AUTORXS_DIR)
    .filter((file) => file.endsWith(".html"))
    .forEach((file) => fs.unlinkSync(path.join(AUTORXS_DIR, file)));
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

limpiarAutorxsGenerado();

autores.forEach((autor) => {
  fs.writeFileSync(path.join(AUTORXS_DIR, `${autor.slug}.html`), paginaAutor(autor));
});

console.log(`Generadas ${autores.length} páginas en autorxs/.`);
