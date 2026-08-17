const ENLACES_NAV_PRINCIPAL = [
  { clave: "contacto", ancla: "contacto", etiqueta: "contacto" },
  { clave: "manifiesto", ruta: "/manifiesto/", etiqueta: "manifiesto" },
  { clave: "sobre-nosotres", ancla: "sobre-nosotres", etiqueta: "sobre nosotres" },
  { clave: "portafolio", ruta: "/portafolio/", etiqueta: "portafolio" },
  { clave: "coleccion", ruta: "/coleccion/", etiqueta: "coleccion", compacta: "colección" },
  { clave: "dona", ruta: "/dona/", etiqueta: "dona aqui", compacta: "dona aquí" },
];

// El menu principal tiene dos variantes: la simple (portada-menu, usada por index.html,
// coleccion/index.html) y la "propuesta" (agrega propuesta-menu-interruptor/propuesta-menu,
// que es lo que js/portfolio-proposals.js busca para abrir/cerrar el menu en manifiesto,
// dona y portafolio).
function botonYNavPrincipal({ id, activo = null, esInicio = false, propuesta = false }) {
  const claseNav = propuesta ? "portada-menu propuesta-menu" : "portada-menu";
  const claseBoton = propuesta
    ? "portada-menu-interruptor propuesta-menu-interruptor"
    : "portada-menu-interruptor";

  const enlaces = ENLACES_NAV_PRINCIPAL.map(({ clave, ruta, ancla, etiqueta, compacta }) => {
    const href = ruta || (esInicio ? `#${ancla}` : `/#${ancla}`);
    const actual = clave === activo ? ` aria-current="page"` : "";
    const compactaAttr = compacta ? ` data-compact-label="${compacta}"` : "";
    return `        <a href="${href}"${actual}${compactaAttr}>${etiqueta}</a>`;
  }).join("\n");

  return `    <button class="${claseBoton}" type="button" aria-expanded="false" aria-controls="${id}">
        <span class="portada-menu-linea"></span>
        <span class="portada-menu-linea"></span>
        <span class="portada-menu-linea"></span>
        <span class="visualmente-solo">Abrir menú</span>
    </button>

    <nav class="${claseNav}" id="${id}" aria-label="Menú principal">
${enlaces}
    </nav>`;
}

// coleccion/ no usa este pie compartido — tiene su propio header/footer en
// coleccion/generar-html-libros.js.
function piePagina() {
  return `    <footer class="sitio-pie" id="contacto" aria-label="Pie de página">
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
                    <img class="pie-marca-blanco" src="/assets/logos/logo-biblio-blanco.png" alt="">
                    <img class="pie-marca-negro" src="/assets/logos/logo-biblio-negro.png" alt="">
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
    </footer>`;
}

module.exports = { botonYNavPrincipal, piePagina };
