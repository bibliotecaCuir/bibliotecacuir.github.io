const landingBackground = document.querySelector(".landing-background");
const landingBackgroundImage = document.querySelector(".landing-background-image");
const backgroundToggle = document.querySelector(".background-toggle");
const reduceBackgroundMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function isTypingTarget(target) {
    return Boolean(target?.closest("input, textarea, select, [contenteditable='true']"));
}

function toggleLandingLettering() {
    document.body.classList.toggle("is-lettering-hidden");
}

function updateBackgroundToggle(isHidden) {
    if (!backgroundToggle) {
        return;
    }

    backgroundToggle.setAttribute("aria-pressed", String(isHidden));
    backgroundToggle.textContent = isHidden ? "mostrar maqueta" : "ocultar maqueta";
}

function toggleLandingBackgroundVisibility() {
    const isHidden = document.body.classList.toggle("is-background-hidden");

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
updateBackgroundToggle(document.body.classList.contains("is-background-hidden"));

const ovalCarousel = document.querySelector(".oval-carousel");
const ovalCarouselContent = [
    "Archivo colectivo",
    "Mesa de trabajo",
    "Publicación cuir",
    "Escrituras",
    "Taller abierto",
    "Memoria viva",
];

function addOvalCarouselInfo() {
    if (!ovalCarousel) {
        return;
    }

    [...ovalCarousel.querySelectorAll(".oval-carousel-item")].forEach((item, index) => {
        const title = ovalCarouselContent[index % ovalCarouselContent.length];
        const caption = document.createElement("figcaption");

        caption.className = "oval-carousel-info";
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

    const originalItems = [...ovalCarousel.querySelectorAll(".oval-carousel-item")];
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

const ovalCarouselItems = [...document.querySelectorAll(".oval-carousel-item")];
const fullRotation = Math.PI * 2;
const ovalRotationSpeed = fullRotation / 24000;
let ovalAnimationFrame;
let ovalRotation = 0;
let ovalLastTimestamp;
let ovalTargetRotation;
let ovalTargetStartRotation;
let ovalTargetStartTime;
let ovalHoverExitTimer;

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
        const activeScale = item.classList.contains("is-active") ? 1.42 : 1;
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
            .slice(0, 9)
            .map(({ item }) => item)
    );

    ovalCarouselItems.forEach((item) => {
        const isFront = frontItems.has(item);

        item.classList.toggle("is-front", isFront);
        item.tabIndex = isFront ? 0 : -1;
    });
}

function updateOvalCarousel(timestamp) {
    if (!ovalCarousel || ovalCarouselItems.length === 0 || reduceBackgroundMotion.matches) {
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

    if (!reduceBackgroundMotion.matches) {
        ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
    } else {
        renderOvalCarousel(ovalRotation);
    }
}

function moveOvalItemToCenter(item) {
    if (!item || reduceBackgroundMotion.matches) {
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
    if (reduceBackgroundMotion.matches) {
        return;
    }

    window.cancelAnimationFrame(ovalAnimationFrame);
    ovalTargetRotation = undefined;
    ovalLastTimestamp = undefined;
    ovalAnimationFrame = window.requestAnimationFrame(updateOvalCarousel);
}

syncOvalCarouselMotion();
reduceBackgroundMotion.addEventListener("change", syncOvalCarouselMotion);
ovalCarousel?.addEventListener("pointerover", (event) => {
    const activeItem = event.target.closest(".oval-carousel-item.is-front");

    if (!activeItem || activeItem.contains(event.relatedTarget)) {
        return;
    }

    window.clearTimeout(ovalHoverExitTimer);
    pauseOvalCarousel();
    ovalCarousel.querySelector(".oval-carousel-item.is-active")?.classList.remove("is-active");
    activeItem.classList.add("is-active");
    renderOvalCarousel(ovalRotation);
});
ovalCarousel?.addEventListener("pointerout", (event) => {
    const activeItem = event.target.closest(".oval-carousel-item.is-active");

    if (!activeItem || activeItem.contains(event.relatedTarget)) {
        return;
    }

    window.clearTimeout(ovalHoverExitTimer);
    ovalHoverExitTimer = window.setTimeout(() => {
        activeItem.classList.remove("is-active");
        resumeOvalCarousel();
    }, 520);
});
ovalCarousel?.addEventListener("focusin", (event) => {
    const activeItem = event.target.closest(".oval-carousel-item.is-front");

    if (activeItem && !activeItem.classList.contains("is-active")) {
        ovalCarousel.querySelector(".oval-carousel-item.is-active")?.classList.remove("is-active");
        activeItem.classList.add("is-active");
        moveOvalItemToCenter(activeItem);
    }
});
ovalCarousel?.addEventListener("focusout", (event) => {
    if (!ovalCarousel.contains(event.relatedTarget)) {
        ovalCarousel.querySelector(".oval-carousel-item.is-active")?.classList.remove("is-active");
        resumeOvalCarousel();
    }
});

const constellationScene = document.querySelector(".image-constellation-scene");
const constellationImages = [
    "/assets/imagenes/placeholders/298E7282-A865-4A06-973C-A12E5C7D5854-458-0000000D62AEE563.jpg",
    "/assets/imagenes/placeholders/7EFA4360-3C97-42A4-B189-951E62B01425-458-0000000DE96DBA70.jpg",
    "/assets/imagenes/placeholders/6b4ada26-2405-4f33-b422-344e687f77b9.jpg",
    "/assets/imagenes/placeholders/42f7e0f9-fc70-4b12-9615-1ac82b6d8185.jpg",
    "/assets/imagenes/placeholders/c8e15996-6af2-4405-bc0c-0196aa9f6bf3.jpg",
    "/assets/imagenes/placeholders/ca23fd02-b71b-4e47-ac8b-60265df1209b.jpg",
];
const constellationLayout = [
    [-3, 18, 7.2], [10, 8, 6.6], [24, 18, 5.4], [38, 8, 6.2], [54, 5, 5.2], [70, 9, 6.1], [86, 13, 7.4], [101, 8, 5.8],
    [4, 36, 5.2], [16, 31, 6.8], [28, 39, 5.8], [40, 28, 5.1], [49, 38, 9.8], [61, 29, 5.6], [74, 31, 11.8], [89, 35, 6.2], [99, 29, 5.4],
    [8, 55, 9.4], [22, 52, 5.1], [34, 57, 6.5], [44, 53, 10.6], [56, 58, 6.2], [68, 51, 5.7], [80, 57, 7.1], [94, 53, 5.2],
    [-2, 77, 7.5], [13, 82, 5.8], [29, 76, 6.3], [43, 82, 5.1], [57, 76, 6.7], [72, 82, 10.2], [88, 76, 6.4], [102, 84, 7.2],
    [7, 96, 5.1], [24, 94, 7.6], [41, 98, 5.8], [63, 95, 6.4], [82, 96, 5.3], [96, 94, 7.5],
];

function buildImageConstellation() {
    if (!constellationScene || constellationScene.children.length > 0) {
        return;
    }

    const fragment = document.createDocumentFragment();
    const columns = 8;
    const rows = 5;
    const randomizedCells = constellationLayout
        .map((_, index) => index)
        .sort(() => Math.random() - 0.5);

    constellationLayout.forEach(([, , size], index) => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        const cell = randomizedCells[index];
        const column = cell % columns;
        const row = Math.floor(cell / columns) % rows;
        const x = 7 + column * (86 / (columns - 1)) + (Math.random() - 0.5) * 4;
        const y = 8 + row * (84 / (rows - 1)) + (Math.random() - 0.5) * 6;
        const depth = Math.round(Math.random() * 320 - 150);
        const layer = Math.round(depth + 180);
        const randomizedSize = size * (0.86 + Math.random() * 0.3);

        figure.className = "constellation-image";
        figure.style.setProperty("--image-x", `${x.toFixed(2)}%`);
        figure.style.setProperty("--image-y", `${y.toFixed(2)}%`);
        figure.style.setProperty("--image-size", `${randomizedSize.toFixed(2)}vw`);
        figure.style.setProperty("--image-depth", `${depth}px`);
        figure.style.setProperty("--image-layer", String(layer));
        figure.style.setProperty("--image-ratio", Math.random() > 0.72 ? "4 / 5" : "16 / 11");
        figure.style.setProperty("--image-shadow", (Math.random() * 0.18).toFixed(2));

        image.src = constellationImages[index % constellationImages.length];
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";

        figure.append(image);
        fragment.append(figure);
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
window.addEventListener("pointermove", requestConstellationPointerUpdate, { passive: true });

const landingMenuToggle = document.querySelector(".landing-menu-toggle");
const landingMenu = document.querySelector(".landing-menu");

function closeLandingMenu() {
    document.body.classList.remove("is-landing-menu-open");
    landingMenuToggle?.setAttribute("aria-expanded", "false");
}

function toggleLandingMenu() {
    const isOpen = document.body.classList.toggle("is-landing-menu-open");

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

const landingPresentation = document.querySelector(".landing-presentation");
const desktopNavigation = window.matchMedia("(min-width: 701px)");
let compactNavigationFrame;
let compactNavigationExitTimer;

function updateCompactNavigation() {
    if (!landingPresentation || !desktopNavigation.matches) {
        window.clearTimeout(compactNavigationExitTimer);
        document.body.classList.remove("has-compact-nav", "is-compact-nav-leaving");
        compactNavigationFrame = undefined;
        return;
    }

    const compactThreshold = landingPresentation.offsetTop + landingPresentation.offsetHeight / 2;
    const shouldUseCompactNavigation = window.scrollY >= compactThreshold;

    if (shouldUseCompactNavigation) {
        window.clearTimeout(compactNavigationExitTimer);
        document.body.classList.remove("is-compact-nav-leaving");
        document.body.classList.add("has-compact-nav");
        closeLandingMenu();
    } else if (
        document.body.classList.contains("has-compact-nav")
        && !document.body.classList.contains("is-compact-nav-leaving")
    ) {
        document.body.classList.add("is-compact-nav-leaving");
        compactNavigationExitTimer = window.setTimeout(() => {
            document.body.classList.remove("has-compact-nav", "is-compact-nav-leaving");
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
