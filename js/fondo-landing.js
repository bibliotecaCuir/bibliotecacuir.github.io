const landingBackground = document.querySelector(".portada-fondo");
const landingBackgroundImage = document.querySelector(".portada-fondo-imagen");
const backgroundToggle = document.querySelector(".fondo-interruptor");
const reduceBackgroundMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function isTypingTarget(target) {
    return Boolean(target?.closest("input, textarea, select, [contenteditable='true']"));
}

function toggleLandingLettering() {
    document.body.classList.toggle("esta-lettering-oculto");
}

function updateBackgroundToggle(isHidden) {
    if (!backgroundToggle) {
        return;
    }

    backgroundToggle.setAttribute("aria-pressed", String(isHidden));
    backgroundToggle.textContent = isHidden ? "mostrar maqueta" : "ocultar maqueta";
}

function toggleLandingBackgroundVisibility() {
    const isHidden = document.body.classList.toggle("esta-fondo-oculto");

    updateBackgroundToggle(isHidden);
}

function updateLandingBackground() {
    if (!landingBackground || !landingBackgroundImage) {
        return;
    }

    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    const backgroundTravel = Math.max(landingBackgroundImage.offsetHeight - window.innerHeight, 0);
    const backgroundOffset = reduceBackgroundMotion.matches
        ? -backgroundTravel / 2
        : -Math.min(Math.max(scrollProgress, 0), 1) * backgroundTravel;

    landingBackground.style.setProperty("--background-offset", `${backgroundOffset}px`);
}

let backgroundTicking = false;

function requestBackgroundUpdate() {
    if (backgroundTicking) {
        return;
    }

    backgroundTicking = true;

    window.requestAnimationFrame(() => {
        updateLandingBackground();
        backgroundTicking = false;
    });
}

updateLandingBackground();

window.addEventListener("scroll", requestBackgroundUpdate, { passive: true });
window.addEventListener("resize", requestBackgroundUpdate);
reduceBackgroundMotion.addEventListener("change", requestBackgroundUpdate);
backgroundToggle?.addEventListener("click", toggleLandingBackgroundVisibility);
updateBackgroundToggle(document.body.classList.contains("esta-fondo-oculto"));

const presentationSlides = [...document.querySelectorAll(".presentacion-diapositiva")];
let presentationIndex = Math.max(0, presentationSlides.findIndex((slide) => slide.classList.contains("esta-activo")));
let presentationTimer;
let presentationCleanupTimer;

function preparePresentationSlide(index) {
    const slide = presentationSlides[index];

    if (!slide) {
        return;
    }

    if (slide.decode) {
        slide.decode().catch(() => {});
    }
}

function showPresentationSlide(nextIndex) {
    if (
        presentationSlides.length < 2
        || reduceBackgroundMotion.matches
        || document.hidden
    ) {
        return;
    }

    const currentSlide = presentationSlides[presentationIndex];
    const nextSlide = presentationSlides[nextIndex % presentationSlides.length];

    if (!currentSlide || !nextSlide || currentSlide === nextSlide) {
        return;
    }

    window.clearTimeout(presentationCleanupTimer);
    presentationSlides.forEach((slide) => {
        if (slide !== currentSlide && slide !== nextSlide) {
            slide.classList.remove("esta-activo", "esta-saliendo");
            slide.style.zIndex = "";
        }
    });

    currentSlide.classList.remove("esta-activo");
    currentSlide.classList.add("esta-saliendo");
    currentSlide.style.zIndex = "1";

    nextSlide.classList.remove("esta-saliendo");
    nextSlide.style.zIndex = "2";

    window.requestAnimationFrame(() => {
        nextSlide.classList.add("esta-activo");
    });

    presentationIndex = presentationSlides.indexOf(nextSlide);
    preparePresentationSlide((presentationIndex + 1) % presentationSlides.length);

    presentationCleanupTimer = window.setTimeout(() => {
        currentSlide.classList.remove("esta-saliendo");
        currentSlide.style.zIndex = "";
    }, 1500);
}

function startPresentationSlides() {
    window.clearInterval(presentationTimer);

    if (presentationSlides.length < 2 || reduceBackgroundMotion.matches || document.hidden) {
        return;
    }

    presentationTimer = window.setInterval(() => {
        showPresentationSlide(presentationIndex + 1);
    }, 3000);
}

function syncPresentationMotion() {
    window.clearInterval(presentationTimer);

    if (presentationSlides.length === 0) {
        return;
    }

    if (reduceBackgroundMotion.matches) {
        presentationSlides.forEach((slide, index) => {
            slide.classList.toggle("esta-activo", index === presentationIndex);
            slide.classList.remove("esta-saliendo");
            slide.style.zIndex = "";
        });
        return;
    }

    preparePresentationSlide((presentationIndex + 1) % presentationSlides.length);
    startPresentationSlides();
}

if (presentationSlides.length > 0) {
    presentationSlides[presentationIndex].classList.add("esta-activo");
    preparePresentationSlide(presentationIndex);
    preparePresentationSlide((presentationIndex + 1) % presentationSlides.length);
    syncPresentationMotion();
    document.addEventListener("visibilitychange", syncPresentationMotion);
    reduceBackgroundMotion.addEventListener("change", syncPresentationMotion);
}

const ovalCarousel = document.querySelector(".ovalo-carrusel");
const ovalCarouselContent = [
    "Animita",
    "Archivo de besos",
    "Buzo Mochi",
    "Buzo Torta",
    "Consigna",
    "Coso CCLM",
    "Glossy",
    "Guantes",
    "Kiki",
    "Lentes Act",
    "Marikarpa",
    "MASP",
    "Pierna",
    "Poleras Consigna",
    "Protocoso",
];

function addOvalCarouselInfo() {
    if (!ovalCarousel) {
        return;
    }

    [...ovalCarousel.querySelectorAll(".ovalo-carrusel-elemento")].forEach((item, index) => {
        const title = ovalCarouselContent[index % ovalCarouselContent.length];
        const caption = document.createElement("figcaption");

        caption.className = "ovalo-carrusel-info";
        caption.innerHTML = `<strong>${title}</strong>`;
        item.tabIndex = -1;
        item.append(caption);
    });
}

addOvalCarouselInfo();

function fillOvalCarousel() {
    if (!ovalCarousel) {
        return;
    }

    const originalItems = [...ovalCarousel.querySelectorAll(".ovalo-carrusel-elemento")];
    let itemIndex = originalItems.length;

    while (itemIndex < 10) {
        originalItems.forEach((item) => {
            if (itemIndex < 20) {
                ovalCarousel.append(item.cloneNode(true));
                itemIndex += 1;
            }
        });
    }
}

fillOvalCarousel();

const ovalCarouselItems = [...document.querySelectorAll(".ovalo-carrusel-elemento")];
const fullRotation = Math.PI * 2;
const ovalRotationSpeed = fullRotation / 24000;
let ovalAnimationFrame;
let ovalRotation = 0;
let ovalLastTimestamp;
let ovalTargetRotation;
let ovalTargetStartRotation;
let ovalTargetStartTime;
let ovalHoveredItem;
let ovalCarouselIsVisible = !("IntersectionObserver" in window);

function canAnimateOvalCarousel() {
    return ovalCarouselIsVisible && !reduceBackgroundMotion.matches;
}

function renderOvalCarousel(rotation) {
    if (!ovalCarousel || ovalCarouselItems.length === 0) {
        return;
    }

    const radiusX = ovalCarousel.clientWidth * 0.46;
    const radiusY = ovalCarousel.clientHeight * 0.27;
    const verticalOffset = ovalCarousel.clientHeight * 0.03;
    const itemDepths = [];

    ovalCarouselItems.forEach((item, index) => {
        const angle = rotation + (index / ovalCarouselItems.length) * fullRotation;
        const depth = (Math.sin(angle) + 1) / 2;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY + verticalOffset;
        const z = -150 + depth * 300;
        const activeScale = item.classList.contains("esta-activo") ? 1.42 : 1;
        const scale = (0.64 + depth * 0.58) * activeScale;
        const opacity = 0.58 + depth * 0.42;
        const brightness = 0.7 + depth * 0.3;

        item.style.setProperty("--orbit-x", x.toFixed(2));
        item.style.setProperty("--orbit-y", y.toFixed(2));
        item.style.setProperty("--orbit-depth", z.toFixed(2));
        item.style.setProperty("--orbit-scale", scale.toFixed(3));
        item.style.setProperty("--orbit-opacity", opacity.toFixed(3));
        item.style.setProperty("--orbit-brightness", brightness.toFixed(3));
        item.style.zIndex = String(Math.round(depth * 100));
        itemDepths.push({ item, depth });
    });

    const frontItems = new Set(
        itemDepths
            .sort((first, second) => second.depth - first.depth)
            .slice(0, 5)
            .map(({ item }) => item)
    );

    ovalCarouselItems.forEach((item) => {
        const isFront = frontItems.has(item);

        item.classList.toggle("esta-frontal", isFront);
        item.tabIndex = isFront ? 0 : -1;
    });
}

function updateOvalCarousel(timestamp) {
    if (!ovalCarousel || ovalCarouselItems.length === 0 || !canAnimateOvalCarousel()) {
        return;
    }

    if (ovalTargetRotation !== undefined) {
        const targetDuration = 460;
        const progress = Math.min((timestamp - ovalTargetStartTime) / targetDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        ovalRotation = ovalTargetStartRotation
            + (ovalTargetRotation - ovalTargetStartRotation) * easedProgress;
        renderOvalCarousel(ovalRotation);

        if (progress < 1) {
            ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
        } else {
            ovalRotation = ovalTargetRotation;
            ovalTargetRotation = undefined;
            ovalLastTimestamp = undefined;
        }

        return;
    }

    if (ovalLastTimestamp !== undefined) {
        ovalRotation += (timestamp - ovalLastTimestamp) * ovalRotationSpeed;
    }

    ovalLastTimestamp = timestamp;
    renderOvalCarousel(ovalRotation);

    ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
}

function syncOvalCarouselMotion() {
    window.cancelAnimationFrame(ovalAnimationFrame);
    ovalLastTimestamp = undefined;
    ovalTargetRotation = undefined;

    if (canAnimateOvalCarousel()) {
        ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
    } else {
        renderOvalCarousel(ovalRotation);
    }
}

function moveOvalItemToCenter(item) {
    if (!item || !canAnimateOvalCarousel()) {
        return;
    }

    window.cancelAnimationFrame(ovalAnimationFrame);
    const itemIndex = ovalCarouselItems.indexOf(item);
    const currentItemAngle = ovalRotation + (itemIndex / ovalCarouselItems.length) * fullRotation;
    const desiredItemAngle = Math.PI / 2;
    const shortestTurn = Math.atan2(
        Math.sin(desiredItemAngle - currentItemAngle),
        Math.cos(desiredItemAngle - currentItemAngle)
    );

    ovalTargetStartRotation = ovalRotation;
    ovalTargetRotation = ovalRotation + shortestTurn;
    ovalTargetStartTime = performance.now();
    ovalLastTimestamp = undefined;
    ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
}

function pauseOvalCarousel() {
    window.cancelAnimationFrame(ovalAnimationFrame);
    ovalTargetRotation = undefined;
    ovalLastTimestamp = undefined;
}

function resumeOvalCarousel() {
    if (!canAnimateOvalCarousel()) {
        return;
    }

    window.cancelAnimationFrame(ovalAnimationFrame);
    ovalTargetRotation = undefined;
    ovalLastTimestamp = undefined;
    ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
}

function getOvalHoveredImageItem(event) {
    if (!(event.target instanceof Element)) {
        return null;
    }

    const image = event.target.closest(".ovalo-carrusel-elemento.esta-frontal img");

    if (!image) {
        return null;
    }

    const imageBounds = image.getBoundingClientRect();
    const edgeInset = Math.min(6, imageBounds.width * 0.04, imageBounds.height * 0.04);
    const isInsideImage =
        event.clientX >= imageBounds.left + edgeInset
        && event.clientX <= imageBounds.right - edgeInset
        && event.clientY >= imageBounds.top + edgeInset
        && event.clientY <= imageBounds.bottom - edgeInset;

    if (!isInsideImage) {
        return null;
    }

    return image.closest(".ovalo-carrusel-elemento.esta-frontal");
}

function clearOvalHoveredItem() {
    if (!ovalHoveredItem) {
        return;
    }

    ovalHoveredItem.classList.remove("esta-activo");
    ovalHoveredItem = undefined;
    resumeOvalCarousel();
}

if (ovalCarousel && "IntersectionObserver" in window) {
    const ovalCarouselObserver = new IntersectionObserver((entries) => {
        ovalCarouselIsVisible = entries.some((entry) => entry.isIntersecting);

        if (!ovalCarouselIsVisible) {
            pauseOvalCarousel();
            renderOvalCarousel(ovalRotation);
            return;
        }

        resumeOvalCarousel();
    }, { threshold: 0.08 });

    ovalCarouselObserver.observe(ovalCarousel);
}

syncOvalCarouselMotion();
reduceBackgroundMotion.addEventListener("change", syncOvalCarouselMotion);
ovalCarousel?.addEventListener("pointermove", (event) => {
    const activeItem = getOvalHoveredImageItem(event);

    if (activeItem === ovalHoveredItem) {
        return;
    }

    ovalCarousel.querySelector(".ovalo-carrusel-elemento.esta-activo")?.classList.remove("esta-activo");
    ovalHoveredItem = activeItem;

    if (!activeItem) {
        resumeOvalCarousel();
        return;
    }

    pauseOvalCarousel();
    activeItem.classList.add("esta-activo");
    renderOvalCarousel(ovalRotation);
});
ovalCarousel?.addEventListener("pointerleave", clearOvalHoveredItem);
ovalCarousel?.addEventListener("focusin", (event) => {
    const activeItem = event.target.closest(".ovalo-carrusel-elemento.esta-frontal");

    if (activeItem && !activeItem.classList.contains("esta-activo")) {
        ovalCarousel.querySelector(".ovalo-carrusel-elemento.esta-activo")?.classList.remove("esta-activo");
        activeItem.classList.add("esta-activo");
        moveOvalItemToCenter(activeItem);
    }
});
ovalCarousel?.addEventListener("focusout", (event) => {
    if (!ovalCarousel.contains(event.relatedTarget)) {
        ovalCarousel.querySelector(".ovalo-carrusel-elemento.esta-activo")?.classList.remove("esta-activo");
        resumeOvalCarousel();
    }
});

const constellationScene = document.querySelector(".imagen-constelacion-escena");
const constellationItems = [
    {
        title: "Asambleas",
        image: "/assets/portafolio/practicas/asambleas/01.webp",
        href: "/portafolio/practicas/asambleas.html",
    },
    {
        title: "Jornadas Hormigonas",
        image: "/assets/portafolio/practicas/jornadas-hormigonas/01.webp",
        href: "/portafolio/practicas/jornadas-hormigonas.html",
    },
    {
        title: "Glossy",
        image: "/assets/portafolio/practicas/glossy/01.webp",
        href: "/portafolio/practicas/glossy.html",
    },
    {
        title: "Bachillerato marika para no olvidar",
        image: "/assets/portafolio/practicas/bachillerato-marika-para-no-olvidar/01.webp",
        href: "/portafolio/practicas/bachillerato-marika-para-no-olvidar.html",
    },
    {
        title: "Sopa de letras",
        image: "/assets/portafolio/practicas/sopa-de-letras/01.webp",
        href: "/portafolio/practicas/sopa-de-letras.html",
    },
    {
        title: "Archivo de besos",
        image: "/assets/portafolio/practicas/archivo-de-besos/01.webp",
        href: "/portafolio/practicas/archivo-de-besos.html",
    },
    {
        title: "Somos un cuerpo mutante - taller",
        image: "/assets/portafolio/activaciones/somos-un-cuerpo-mutante/01.webp",
        href: "/portafolio/activaciones/somos-un-cuerpo-mutante.html",
    },
    {
        title: "Contagio gráfico - encuentro gráfico",
        image: "/assets/portafolio/activaciones/contagio-grafico/01.webp",
        href: "/portafolio/activaciones/contagio-grafico.html",
    },
    {
        title: "Bajubá a jerga marika chilena - taller",
        image: "/assets/portafolio/activaciones/bajuba-a-jerga-marika-chilena/01.webp",
        href: "/portafolio/activaciones/bajuba-a-jerga-marika-chilena.html",
    },
    {
        title: "Convite marika - encuentro",
        image: "/assets/portafolio/activaciones/convite-marika/01.webp",
        href: "/portafolio/activaciones/convite-marika.html",
    },
    {
        title: "Y la que soporte - taller",
        image: "/assets/portafolio/activaciones/y-la-que-soporte/01.webp",
        href: "/portafolio/activaciones/y-la-que-soporte.html",
    },
    {
        title: "Cruising de lectura",
        image: "/assets/portafolio/activaciones/cruising-de-lectura/01.webp",
        href: "/portafolio/activaciones/cruising-de-lectura.html",
    },
    {
        title: "ProtoCola",
        image: "/assets/portafolio/obras/protocola/01.webp",
        href: "/portafolio/obras/protocola.html",
    },
    {
        title: "Biblioteca Cuir: imaginar otros archivos posibles - Sesiones Arde",
        image: "/assets/portafolio/obras/biblioteca-cuir-imaginar-otros-archivos-posibles-sesiones-arde/01.webp",
        href: "/portafolio/obras/biblioteca-cuir-imaginar-otros-archivos-posibles-sesiones-arde.html",
    },
    {
        title: "MARIKARPA Vol. 1",
        image: "/assets/portafolio/obras/marikarpa-vol-1/01.webp",
        href: "/portafolio/obras/marikarpa-vol-1.html",
    },
    {
        title: "Otro delirio de la Biblioteca Cuir",
        image: "/assets/imagenes/maqueta-bc.jpg",
        href: "/portafolio/obras/otro-delirio-de-la-biblioteca-cuir.html",
    },
    {
        title: "Historias LGBTQI+ - MASP",
        image: "/assets/portafolio/obras/historias-lgbtqi-masp/01.webp",
        href: "/portafolio/obras/historias-lgbtqi-masp.html",
    },
    {
        title: "Somos una maniobra marika para resistir - CCE",
        image: "/assets/portafolio/obras/somos-una-maniobra-marika-para-resistir-cce/01.webp",
        href: "/portafolio/obras/somos-una-maniobra-marika-para-resistir-cce.html",
    },
    {
        title: "Re vueltas Gráficas. Multitudes para cambiar la vida - CCLM",
        image: "/assets/portafolio/obras/re-vueltas-graficas-multitudes-para-cambiar-la-vida-cclm/01.webp",
        href: "/portafolio/obras/re-vueltas-graficas-multitudes-para-cambiar-la-vida-cclm.html",
    },
    {
        title: "Bachillerato marika para no olvidar",
        image: "/assets/portafolio/obras/bachillerato-marika-para-no-olvidar/01.webp",
        href: "/portafolio/obras/bachillerato-marika-para-no-olvidar.html",
    },
    {
        title: "Archivar para encontrarnos, ¿como construir archivos comunitarios? - encuentro",
        image: "/assets/portafolio/otros/archivar-para-encontrarnos-como-construir-archivos-comunitarios/01.webp",
        href: "/portafolio/otros/archivar-para-encontrarnos-como-construir-archivos-comunitarios.html",
    },
    {
        title: "Primer Laboratorio Nacional de Archivos de Arte - Redes y Enlaces de Arte Latinoamericano",
        image: "/assets/portafolio/otros/primer-laboratorio-nacional-de-archivos-de-arte/01.webp",
        href: "/portafolio/otros/primer-laboratorio-nacional-de-archivos-de-arte.html",
    },
    {
        title: "Artículo Revista Sobre",
        image: "/assets/portafolio/otros/articulo-revista-sobre/01.webp",
        href: "/portafolio/otros/articulo-revista-sobre.html",
    },
    {
        title: "Simbiosis - coloquio",
        image: "/assets/portafolio/otros/simbiosis-coloquio/01.webp",
        href: "/portafolio/otros/simbiosis-coloquio.html",
    },
    {
        title: "Piensa en mi como soy - seminario visibilidad artística",
        image: "/assets/portafolio/otros/piensa-en-mi-como-soy-seminario-visibilidad-artistica/01.webp",
        href: "/portafolio/otros/piensa-en-mi-como-soy-seminario-visibilidad-artistica.html",
    },
    {
        title: "Armarios Abiertos - CCE",
        image: "/assets/portafolio/otros/armarios-abiertos-cce/01.webp",
        href: "/portafolio/otros/armarios-abiertos-cce.html",
    },
];
const constellationLayout = [
    [4, 13, 8.6], [19, 9, 7.8], [35, 15, 7.2], [53, 8, 8.1], [70, 14, 7.4], [88, 10, 8.6],
    [11, 31, 7.4], [28, 35, 8.8], [45, 28, 7.5], [62, 34, 10.6], [81, 30, 8.2], [96, 36, 7.4],
    [3, 52, 8.9], [20, 58, 7.2], [38, 51, 9.5], [56, 58, 7.7], [73, 52, 8.4], [91, 57, 7.1],
    [10, 77, 7.8], [27, 73, 8.5], [44, 80, 7.3], [61, 74, 8.7], [78, 79, 7.5], [94, 75, 8.4],
    [34, 88, 7.4], [68, 87, 8.2],
];

function buildImageConstellation() {
    if (!constellationScene || constellationScene.children.length > 0) {
        return;
    }

    const fragment = document.createDocumentFragment();
    const visibleConstellationItems = constellationItems
        .slice(0, constellationLayout.length)
        .sort(() => Math.random() - 0.5);

    visibleConstellationItems.forEach((item, index) => {
        const [layoutX, layoutY, size] = constellationLayout[index];
        const link = document.createElement("a");
        const image = document.createElement("img");
        const title = document.createElement("span");
        const x = layoutX + (Math.random() - 0.5) * 3.2;
        const y = layoutY + (Math.random() - 0.5) * 3;
        const depth = Math.round(Math.random() * 320 - 150);
        const layer = Math.round(depth + 180);
        const randomizedSize = size * (0.86 + Math.random() * 0.3);

        link.className = "constelacion-imagen";
        link.href = item.href;
        link.style.setProperty("--image-x", `${x.toFixed(2)}%`);
        link.style.setProperty("--image-y", `${y.toFixed(2)}%`);
        link.style.setProperty("--image-size", `${randomizedSize.toFixed(2)}vw`);
        link.style.setProperty("--image-depth", `${depth}px`);
        link.style.setProperty("--image-layer", String(layer));
        link.style.setProperty("--image-ratio", Math.random() > 0.72 ? "4 / 5" : "16 / 11");
        link.style.setProperty("--image-shadow", (Math.random() * 0.18).toFixed(2));

        image.src = item.image;
        image.alt = item.title;
        image.loading = "lazy";
        image.decoding = "async";
        title.className = "constelacion-imagen-titulo";
        title.textContent = item.title;

        link.append(image, title);
        fragment.append(link);
    });

    constellationScene.append(fragment);
}

let constellationPointerFrame;
let constellationPointerX = 0;
let constellationPointerY = 0;

function updateConstellationPointer() {
    if (!constellationScene || reduceBackgroundMotion.matches) {
        return;
    }

    constellationScene.style.setProperty("--constellation-move-x", `${(constellationPointerX * -280).toFixed(2)}px`);
    constellationScene.style.setProperty("--constellation-move-y", `${(constellationPointerY * -190).toFixed(2)}px`);
    constellationPointerFrame = undefined;
}

function requestConstellationPointerUpdate(event) {
    if (!constellationScene || reduceBackgroundMotion.matches) {
        return;
    }

    constellationPointerX = event.clientX / window.innerWidth - 0.5;
    constellationPointerY = event.clientY / window.innerHeight - 0.5;

    if (!constellationPointerFrame) {
        constellationPointerFrame = window.requestAnimationFrame(updateConstellationPointer);
    }
}

buildImageConstellation();
if (constellationScene) {
    window.addEventListener("pointermove", requestConstellationPointerUpdate, { passive: true });
}

const landingMenuToggle = document.querySelector(".portada-menu-interruptor");
const landingMenu = document.querySelector(".portada-menu");

function closeLandingMenu() {
    document.body.classList.remove("esta-portada-menu-abierto");
    landingMenuToggle?.setAttribute("aria-expanded", "false");
}

function toggleLandingMenu() {
    const isOpen = document.body.classList.toggle("esta-portada-menu-abierto");

    landingMenuToggle?.setAttribute("aria-expanded", String(isOpen));
}

landingMenuToggle?.addEventListener("click", toggleLandingMenu);
landingMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        closeLandingMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "x" && !event.repeat && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget(event.target)) {
        toggleLandingLettering();
    }

    if (event.key === "Escape") {
        closeLandingMenu();
    }
});

const landingPresentation = document.querySelector(".portada-presentacion");
const desktopNavigation = window.matchMedia("(min-width: 701px)");
let compactNavigationFrame;
let compactNavigationExitTimer;

function updateCompactNavigation() {
    if (!landingPresentation || !desktopNavigation.matches) {
        window.clearTimeout(compactNavigationExitTimer);
        document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
        compactNavigationFrame = undefined;
        return;
    }

    const compactThreshold = landingPresentation.offsetTop + landingPresentation.offsetHeight / 2;
    const shouldUseCompactNavigation = window.scrollY >= compactThreshold;

    if (shouldUseCompactNavigation) {
        window.clearTimeout(compactNavigationExitTimer);
        document.body.classList.remove("esta-compacta-navegacion-saliendo");
        document.body.classList.add("tiene-compacta-navegacion");
        closeLandingMenu();
    } else if (
        document.body.classList.contains("tiene-compacta-navegacion")
        && !document.body.classList.contains("esta-compacta-navegacion-saliendo")
    ) {
        document.body.classList.add("esta-compacta-navegacion-saliendo");
        compactNavigationExitTimer = window.setTimeout(() => {
            document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
        }, 220);
    }

    compactNavigationFrame = undefined;
}

function requestCompactNavigationUpdate() {
    if (!compactNavigationFrame) {
        compactNavigationFrame = window.requestAnimationFrame(updateCompactNavigation);
    }
}

updateCompactNavigation();
window.addEventListener("scroll", requestCompactNavigationUpdate, { passive: true });
window.addEventListener("resize", requestCompactNavigationUpdate);
desktopNavigation.addEventListener("change", requestCompactNavigationUpdate);
