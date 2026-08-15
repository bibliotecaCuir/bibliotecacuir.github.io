const container = document.querySelector(".portafolio-proyecto-indice[data-categoria]");

if (!container) {
  throw new Error("No se encontró el contenedor .portafolio-proyecto-indice[data-categoria].");
}

const categoria = container.dataset.categoria;

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncar(texto, limite = 190) {
  const limpio = String(texto || "").trim();
  if (limpio.length <= limite) return limpio;
  return `${limpio.slice(0, limite).replace(/\s+\S*$/, "")}...`;
}

// Mismo umbral que scripts/lib/generar-portafolio.js: calibrado contra los títulos
// reales que ya usan portafolio-titulo-largo en el sitio.
function claseTitulo(titulo) {
  return String(titulo || "").length > 50 ? " class=\"portafolio-titulo-largo\"" : "";
}

function crearTarjeta(proyecto) {
  const resumen = truncar(proyecto.parrafos?.[0]);
  const imagen = `${proyecto.carpeta_imagenes}/01.webp`;

  const enlace = document.createElement("a");
  enlace.className = "portafolio-proyecto-tarjeta";
  enlace.href = `/portafolio/${categoria}/${proyecto.slug}.html`;
  enlace.innerHTML = `
    <figure><img src="${escaparHTML(imagen)}" alt="" loading="lazy" decoding="async"></figure>
    <div>
      <h2${claseTitulo(proyecto.titulo)}>${escaparHTML(proyecto.titulo)}</h2>
      <p>${escaparHTML(resumen)}</p>
    </div>
  `;

  return enlace;
}

fetch(`/datos/${categoria}.yaml`)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`No se pudo cargar datos/${categoria}.yaml (${response.status}).`);
    }
    return response.text();
  })
  .then((yamlText) => {
    const proyectos = jsyaml.load(yamlText);

    if (!Array.isArray(proyectos)) {
      throw new Error(`datos/${categoria}.yaml no contiene una lista de proyectos.`);
    }

    const fragment = document.createDocumentFragment();
    proyectos.forEach((proyecto) => fragment.appendChild(crearTarjeta(proyecto)));
    container.appendChild(fragment);
  })
  .catch((error) => {
    console.error(`Error al cargar ${categoria}:`, error);
    container.innerHTML = `
      <p class="portafolio-error">
        No pudimos cargar ${categoria}. Intenta recargar la página.
      </p>
    `;
  });
