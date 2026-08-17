const portafolioHero = document.querySelector(".portafolio-intro");
const portafolioDesktopNavigation = window.matchMedia("(min-width: 701px)");
let portafolioCompactFrame;
let portafolioCompactExitTimer;

function actualizarNavegacionCompactaPortafolio() {
    if (!portafolioHero || !portafolioDesktopNavigation.matches) {
        window.clearTimeout(portafolioCompactExitTimer);
        document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
        portafolioCompactFrame = undefined;
        return;
    }

    const umbralCompacto = portafolioHero.offsetTop + portafolioHero.offsetHeight / 2;
    const debeSerCompacta = window.scrollY >= umbralCompacto;

    if (debeSerCompacta) {
        window.clearTimeout(portafolioCompactExitTimer);
        document.body.classList.remove("esta-compacta-navegacion-saliendo");
        document.body.classList.add("tiene-compacta-navegacion");
        document.body.classList.remove("esta-portada-menu-abierto");
    } else if (
        document.body.classList.contains("tiene-compacta-navegacion")
        && !document.body.classList.contains("esta-compacta-navegacion-saliendo")
    ) {
        document.body.classList.add("esta-compacta-navegacion-saliendo");
        portafolioCompactExitTimer = window.setTimeout(() => {
            document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
        }, 220);
    }

    portafolioCompactFrame = undefined;
}

function solicitarActualizacionNavegacionCompactaPortafolio() {
    if (!portafolioCompactFrame) {
        portafolioCompactFrame = window.requestAnimationFrame(actualizarNavegacionCompactaPortafolio);
    }
}

actualizarNavegacionCompactaPortafolio();
window.addEventListener("scroll", solicitarActualizacionNavegacionCompactaPortafolio, { passive: true });
window.addEventListener("resize", solicitarActualizacionNavegacionCompactaPortafolio);
portafolioDesktopNavigation.addEventListener("change", solicitarActualizacionNavegacionCompactaPortafolio);
