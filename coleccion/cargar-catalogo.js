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

const container = document.querySelector("#divCatalogo");
const countEl = document.querySelector("#totalCount");
const filtrosEl = document.querySelector("#catalogoFiltros");
const autorxInputEl = document.querySelector("#filtroAutorx");
const autorxDatalistEl = document.querySelector("#autorxsDatalist");

if (!container) {
  throw new Error("No se encontró el contenedor #divCatalogo.");
}

container.innerHTML = "";

// Se conserva el preview global como contrato de clase, pero la imagen vive en cada tarjeta.
const preview = document.createElement("div");
preview.className = "preview-global";
preview.setAttribute("aria-hidden", "true");
preview.innerHTML = '<img class="preview-global-img" alt="" />';
document.body.appendChild(preview);

let totalArticulos = 0;
let revealObserver;
let categoriaActual = "todas";
let autorxTexto = "";

const categorias = [
  {
    id: "fanzines",
    nombre: "fanzines",
    coincide: (tipo) => tipo.includes("fanzine"),
  },
  {
    id: "libros",
    nombre: "libros",
    coincide: (tipo) =>
      ["libro", "librillo", "librilllo", "fotolibro", "revista", "comic"].some(
        (valor) => tipo.includes(valor)
      ),
  },
  {
    id: "grafica",
    nombre: "gráfica",
    coincide: (tipo) =>
      ["grafica", "flyer", "sticker", "postal"].some((valor) => tipo.includes(valor)),
  },
  {
    id: "agendas",
    nombre: "agendas",
    coincide: (tipo) => tipo.includes("agenda"),
  },
  {
    id: "juegos-objetos",
    nombre: "juegos y objetos",
    coincide: (tipo) =>
      ["gincana", "rompecabezas", "lego", "caja de carton"].some((valor) =>
        tipo.includes(valor)
      ),
  },
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

function quitarDuplicados(articulos) {
  const publicaciones = new Map();

  articulos.forEach(({ item, caja, index }) => {
    if (!String(item.titulo || item.codigo || "").trim()) return;
    const clave = clavePublicacion(item);
    if (!publicaciones.has(clave)) publicaciones.set(clave, { item, caja, index });
  });

  return [...publicaciones.values()];
}

function obtenerCategoria(tipologia) {
  const tipo = normalizar(tipologia);
  const categoria = categorias.find(({ coincide }) => coincide(tipo));
  return categoria?.id || "otras";
}

function valorLista(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean).join(", ");
  return valor || "";
}

function crearArticulo(item, caja, index) {
  const article = document.createElement("article");
  article.className = "item reveal-item";
  article.dataset.categoria = obtenerCategoria(item.tipologia);

  const nombreWebp = item.imagen ? item.imagen.replace(/\.[^.]+$/, ".webp") : "";
  const imagenUrl = nombreWebp
    ? `https://raw.githubusercontent.com/bibliotecaCuir/coleccion-imagenes/main/webp/${caja}/${nombreWebp}`
    : "";

  if (imagenUrl) article.dataset.imagen = imagenUrl;

  article.dataset.autorxs = normalizar(valorLista(item.autorxs));

  const autorxs = valorLista(item.autorxs);
  // Los YAML actuales usan "editorial"; se tolera "editoriales" para datos futuros.
  const editorial = valorLista(item.editorial || item.editoriales);
  const meta = [autorxs, editorial, item.estado || item.tipologia].filter(Boolean);
  const urlDetalle = `./fichas/${crearSlug(item, caja, index)}.html`;

  article.innerHTML = `
    <a class="item-link" href="${urlDetalle}">
      <figure class="item-imagen-wrap">
        ${imagenUrl ? `
          <img class="catalogo-imagen" src="${escaparHTML(imagenUrl)}" alt="" loading="lazy" decoding="async">
        ` : '<span class="item-sin-imagen" aria-hidden="true">BC</span>'}
        <span class="item-tinte" aria-hidden="true"></span>
      </figure>
      <div class="item-body">
        <h2 class="item-titulo">${escaparHTML(item.titulo || "Sin título")}</h2>
        <div class="item-identificacion">
          <span class="item-codigo">${escaparHTML(item.codigo || "s/c")}</span>
          <span class="item-agno">${escaparHTML(item.agno || "s/f")}</span>
        </div>
        <div class="item-meta-wrap">
          <div class="item-meta">
            ${meta.map((dato) => `<span>${escaparHTML(dato)}</span>`).join("")}
          </div>
        </div>
      </div>
    </a>
  `;

  return article;
}

function observarRevelado(elementos) {
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((elemento) => elemento.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entradas, observer) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("is-visible");
          observer.unobserve(entrada.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
  }

  elementos.forEach((elemento) => {
    if (!elemento.hidden && !elemento.classList.contains("is-visible")) {
      revealObserver.observe(elemento);
    }
  });
}

function actualizarConteo(visibles) {
  if (!countEl) return;

  countEl.textContent =
    visibles === totalArticulos
      ? `${totalArticulos} ${totalArticulos === 1 ? "pieza" : "piezas"}`
      : `${visibles} de ${totalArticulos} piezas`;
}

function aplicarFiltros() {
  let visibles = 0;
  const articulosVisibles = [];

  container.querySelectorAll(".item").forEach((article) => {
    const coincideCategoria =
      categoriaActual === "todas" || article.dataset.categoria === categoriaActual;
    const coincideAutorx =
      !autorxTexto || (article.dataset.autorxs || "").includes(autorxTexto);
    const mostrar = coincideCategoria && coincideAutorx;
    article.hidden = !mostrar;
    if (mostrar) {
      visibles += 1;
      articulosVisibles.push(article);
    }
  });

  filtrosEl?.querySelectorAll(".filtro-boton").forEach((boton) => {
    const activo = boton.dataset.filtro === categoriaActual;
    boton.classList.toggle("active", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });

  actualizarConteo(visibles);
  observarRevelado(articulosVisibles);
}

function crearFiltros() {
  if (!filtrosEl) return;

  const conteos = {};
  container.querySelectorAll(".item").forEach((article) => {
    const categoria = article.dataset.categoria;
    conteos[categoria] = (conteos[categoria] || 0) + 1;
  });

  const opciones = [
    { id: "todas", nombre: "todas", cantidad: totalArticulos },
    ...categorias
      .filter(({ id }) => conteos[id])
      .map(({ id, nombre }) => ({ id, nombre, cantidad: conteos[id] })),
    ...(conteos.otras
      ? [{ id: "otras", nombre: "otras", cantidad: conteos.otras }]
      : []),
  ];

  filtrosEl.innerHTML = opciones
    .map(
      ({ id, nombre, cantidad }) => `
        <button
          class="filtro-boton${id === "todas" ? " active" : ""}"
          type="button"
          data-filtro="${id}"
          aria-pressed="${id === "todas"}"
        >
          ${nombre} <span>${cantidad}</span>
        </button>
      `
    )
    .join("");

  filtrosEl.addEventListener("click", (event) => {
    const boton = event.target.closest(".filtro-boton");
    if (!boton) return;
    categoriaActual = boton.dataset.filtro;
    aplicarFiltros();
  });
}

function poblarAutorxsDatalist(publicaciones) {
  if (!autorxDatalistEl) return;

  const nombres = new Map();
  publicaciones.forEach(({ item }) => {
    const lista = Array.isArray(item.autorxs) ? item.autorxs : [item.autorxs];
    lista.forEach((autorRaw) => {
      const nombre = String(autorRaw || "").trim();
      if (!nombre) return;
      const clave = normalizar(nombre);
      if (!nombres.has(clave)) nombres.set(clave, nombre);
    });
  });

  const ordenados = [...nombres.values()].sort((a, b) => normalizar(a).localeCompare(normalizar(b)));
  autorxDatalistEl.innerHTML = ordenados
    .map((nombre) => `<option value="${escaparHTML(nombre)}"></option>`)
    .join("");
}

function inicializarFiltroAutorx() {
  if (!autorxInputEl) return;

  const autorxUrl = new URLSearchParams(window.location.search).get("autor");
  if (autorxUrl) {
    autorxInputEl.value = autorxUrl;
    autorxTexto = normalizar(autorxUrl);
  }

  autorxInputEl.addEventListener("input", (event) => {
    autorxTexto = normalizar(event.target.value.trim());
    aplicarFiltros();
  });
}

Promise.all(
  catalogosYaml.map(async (caja) => {
    const response = await fetch(`./yaml/${caja}.yaml`);

    if (!response.ok) {
      throw new Error(`No se pudo cargar yaml/${caja}.yaml (${response.status}).`);
    }

    const yamlText = await response.text();
    const data = jsyaml.load(yamlText);
    const articulos = data?.catalogo?.articulos;

    if (!Array.isArray(articulos)) {
      throw new Error(`${caja}.yaml no contiene catalogo.articulos.`);
    }

    return { caja, articulos };
  })
)
  .then((catalogos) => {
    const fragment = document.createDocumentFragment();
    const publicaciones = quitarDuplicados(
      catalogos.flatMap(({ caja, articulos }) =>
        articulos
          .map((item, index) => ({ item, caja, index }))
          .filter(({ item }) => item?.privado !== true)
      )
    );

    totalArticulos = publicaciones.length;
    publicaciones.forEach(({ item, caja, index }) => {
      fragment.appendChild(crearArticulo(item, caja, index));
    });

    container.appendChild(fragment);
    actualizarConteo(totalArticulos);
    crearFiltros();
    poblarAutorxsDatalist(publicaciones);
    inicializarFiltroAutorx();
    if (autorxTexto) aplicarFiltros();
    observarRevelado([...container.querySelectorAll(".item")]);
  })
  .catch((error) => {
    console.error("Error al cargar la colección:", error);
    container.innerHTML = `
      <p class="catalogo-error">
        No pudimos cargar la colección. Intenta recargar la página.
      </p>
    `;

    if (countEl) countEl.textContent = "colección no disponible";
  });
