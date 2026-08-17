const filtrosEl = document.querySelector("#portafolioFiltros");
const tarjetas = document.querySelectorAll(".portafolio-tarjeta[data-categoria]");

if (filtrosEl && tarjetas.length) {
    filtrosEl.addEventListener("click", (event) => {
        const boton = event.target.closest(".portafolio-filtro-boton");
        if (!boton) return;

        const filtro = boton.dataset.filtro;

        filtrosEl.querySelectorAll(".portafolio-filtro-boton").forEach((el) => {
            const activo = el === boton;
            el.classList.toggle("activo", activo);
            el.setAttribute("aria-pressed", String(activo));
        });

        tarjetas.forEach((tarjeta) => {
            tarjeta.hidden = filtro !== "todas" && tarjeta.dataset.categoria !== filtro;
        });
    });
}
