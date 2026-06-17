const cajas = ["caja-01"];

const container = document.querySelector("#divCatalogo");
const countEl = document.querySelector("#totalCount");
const filtrosEl = document.querySelector("#catalogoFiltros");

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

  articulos.forEach(({ item, caja }) => {
    const clave = clavePublicacion(item);
    if (!publicaciones.has(clave)) publicaciones.set(clave, { item, caja });
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

function crearArticulo(item, caja) {
  const article = document.createElement("article");
  article.className = "item reveal-item";
  article.dataset.categoria = obtenerCategoria(item.tipologia);

  const imagenUrl = item.imagen
    ? `https://raw.githubusercontent.com/bibliotecaCuir/${caja}/main/imagenes/${item.imagen}`
    : "";

  if (imagenUrl) article.dataset.imagen = imagenUrl;

  const autorxs = valorLista(item.autorxs);
  // Los YAML actuales usan "editorial"; se tolera "editoriales" para datos futuros.
  const editorial = valorLista(item.editorial || item.editoriales);
  const meta = [autorxs, editorial, item.estado || item.tipologia].filter(Boolean);

  article.innerHTML = `
    <figure class="item-imagen-wrap">
      ${imagenUrl ? `
        <img class="catalogo-imagen" src="${imagenUrl}" alt="" loading="lazy" decoding="async">
      ` : '<span class="item-sin-imagen" aria-hidden="true">BC</span>'}
      <span class="item-tinte" aria-hidden="true"></span>
      <h2 class="item-titulo">${item.titulo || "Sin título"}</h2>
    </figure>
    <div class="item-body">
      <div class="item-identificacion">
        <span class="item-codigo">${item.codigo || "s/c"}</span>
        <span class="item-agno">${item.agno || "s/f"}</span>
      </div>
      <div class="item-meta-wrap">
        <div class="item-meta">
          ${meta.map((dato, index) => `
            ${index ? '<span class="item-sep" aria-hidden="true">·</span>' : ""}
            <span>${dato}</span>
          `).join("")}
        </div>
      </div>
    </div>
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

function filtrarCatalogo(categoria) {
  let visibles = 0;
  const articulosVisibles = [];

  container.querySelectorAll(".item").forEach((article) => {
    const mostrar = categoria === "todas" || article.dataset.categoria === categoria;
    article.hidden = !mostrar;
    if (mostrar) {
      visibles += 1;
      articulosVisibles.push(article);
    }
  });

  filtrosEl?.querySelectorAll(".filtro-boton").forEach((boton) => {
    const activo = boton.dataset.filtro === categoria;
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
    filtrarCatalogo(boton.dataset.filtro);
  });
}

Promise.all(
  cajas.map(async (caja) => {
    const response = await fetch(`./${caja}.yaml`);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${caja}.yaml (${response.status}).`);
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
        articulos.map((item) => ({ item, caja }))
      )
    );

    totalArticulos = publicaciones.length;
    publicaciones.forEach(({ item, caja }) => {
      fragment.appendChild(crearArticulo(item, caja));
    });

    container.appendChild(fragment);
    actualizarConteo(totalArticulos);
    crearFiltros();
    observarRevelado([...container.querySelectorAll(".item")]);
  })
  .catch((error) => {
    console.error("Error al cargar el catálogo:", error);
    container.innerHTML = `
      <p class="catalogo-error">
        No pudimos cargar el catálogo. Intenta recargar la página.
      </p>
    `;

    if (countEl) countEl.textContent = "Catálogo no disponible";
  });
