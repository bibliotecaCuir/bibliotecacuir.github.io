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

if (!container) {
  throw new Error("No se encontró el contenedor #divCatalogo.");
}

container.innerHTML = "";

// Se conserva el preview global como contrato de clase, pero la imagen vive en cada tarjeta.
const preview = document.createElement("div");
preview.className = "previsualizacion-global";
preview.setAttribute("aria-hidden", "true");
preview.innerHTML = '<img class="previsualizacion-global-img" alt="" />';
document.body.appendChild(preview);

let totalArticulos = 0;
let revealObserver;

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

function quitarDuplicados(articulos) {
  const publicaciones = new Map();

  articulos.forEach(({ elemento, caja, index }) => {
    if (!String(elemento.titulo || elemento.codigo || "").trim()) return;
    const clave = clavePublicacion(elemento);
    if (!publicaciones.has(clave)) publicaciones.set(clave, { elemento, caja, index });
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

function crearArticulo(elemento, caja, index) {
  const article = document.createElement("article");
  article.className = "elemento revelar-elemento";
  article.dataset.categoria = obtenerCategoria(elemento.tipologia);

  const imagenUrl = elemento.imagen
    ? `https://raw.githubusercontent.com/bibliotecaCuir/${caja}/main/imagenes/${elemento.imagen}`
    : "";

  if (imagenUrl) article.dataset.imagen = imagenUrl;

  const autorxs = valorLista(elemento.autorxs);
  // Los YAML actuales usan "editorial"; se tolera "editoriales" para datos futuros.
  const editorial = valorLista(elemento.editorial || elemento.editoriales);
  const meta = [autorxs, editorial, elemento.estado || elemento.tipologia].filter(Boolean);
  const urlDetalle = `./html/${crearSlug(elemento, caja, index)}.html`;

  article.innerHTML = `
    <a class="elemento-enlace" href="${urlDetalle}">
      <figure class="elemento-imagen-contenedor">
        ${imagenUrl ? `
          <img class="catalogo-imagen" src="${escaparHTML(imagenUrl)}" alt="" cargando="lazy" decoding="async">
        ` : '<span class="elemento-sin-imagen" aria-hidden="true">BC</span>'}
        <span class="elemento-tinte" aria-hidden="true"></span>
      </figure>
      <div class="elemento-cuerpo">
        <h2 class="elemento-titulo">${escaparHTML(elemento.titulo || "Sin título")}</h2>
        <div class="elemento-identificacion">
          <span class="elemento-codigo">${escaparHTML(elemento.codigo || "s/c")}</span>
          <span class="elemento-agno">${escaparHTML(elemento.agno || "s/f")}</span>
        </div>
        <div class="elemento-meta-contenedor">
          <div class="elemento-meta">
            ${meta.map((dato, index) => `
              ${index ? '<span class="elemento-separador" aria-hidden="true">·</span>' : ""}
              <span>${escaparHTML(dato)}</span>
            `).join("")}
          </div>
        </div>
      </div>
    </a>
  `;

  return article;
}

function observarRevelado(elementos) {
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((elemento) => elemento.classList.add("esta-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entradas, observer) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("esta-visible");
          observer.unobserve(entrada.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
  }

  elementos.forEach((elemento) => {
    if (!elemento.hidden && !elemento.classList.contains("esta-visible")) {
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

function filtrarCatalogo(categoria) {
  let visibles = 0;
  const articulosVisibles = [];

  container.querySelectorAll(".elemento").forEach((article) => {
    const mostrar = categoria === "todas" || article.dataset.categoria === categoria;
    article.hidden = !mostrar;
    if (mostrar) {
      visibles += 1;
      articulosVisibles.push(article);
    }
  });

  filtrosEl?.querySelectorAll(".filtro-boton").forEach((boton) => {
    const activo = boton.dataset.filtro === categoria;
    boton.classList.toggle("activo", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });

  actualizarConteo(visibles);
  observarRevelado(articulosVisibles);
}

function crearFiltros() {
  if (!filtrosEl) return;

  const conteos = {};
  container.querySelectorAll(".elemento").forEach((article) => {
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
          class="filtro-boton${id === "todas" ? " activo" : ""}"
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
    filtrarCatalogo(boton.dataset.filtro);
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
        articulos.map((elemento, index) => ({ elemento, caja, index }))
      )
    );

    totalArticulos = publicaciones.length;
    publicaciones.forEach(({ elemento, caja, index }) => {
      fragment.appendChild(crearArticulo(elemento, caja, index));
    });

    container.appendChild(fragment);
    actualizarConteo(totalArticulos);
    crearFiltros();
    observarRevelado([...container.querySelectorAll(".elemento")]);
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
