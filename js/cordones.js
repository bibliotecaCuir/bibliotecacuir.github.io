const cordonLayer = document.querySelector(".background-cordons");
const projectGallery = document.querySelector(".project-gallery");
const siteFooter = document.querySelector(".site-footer");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const cordons = {};
const svgNamespace = "http://www.w3.org/2000/svg";

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function interpolatePoint(start, end, progress) {
    return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
    };
}

function pointsToSmoothPath(points) {
    if (points.length < 2) {
        return "";
    }

    const commands = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];

    for (let index = 0; index < points.length - 1; index += 1) {
        const previous = points[Math.max(index - 1, 0)];
        const current = points[index];
        const next = points[index + 1];
        const afterNext = points[Math.min(index + 2, points.length - 1)];
        const controlOne = {
            x: current.x + (next.x - previous.x) / 6,
            y: current.y + (next.y - previous.y) / 6,
        };
        const controlTwo = {
            x: next.x - (afterNext.x - current.x) / 6,
            y: next.y - (afterNext.y - current.y) / 6,
        };

        commands.push(
            `C ${controlOne.x.toFixed(2)} ${controlOne.y.toFixed(2)}, ${controlTwo.x.toFixed(2)} ${controlTwo.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`
        );
    }

    return commands.join(" ");
}

function pointsToLinePath(points) {
    if (points.length < 2) {
        return "";
    }

    const [firstPoint, ...remainingPoints] = points;
    const commands = [`M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)}`];

    remainingPoints.forEach((point) => {
        commands.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    });

    return commands.join(" ");
}

function samplePath(pathData, samples = 220) {
    const measuringPath = document.createElementNS(svgNamespace, "path");

    measuringPath.setAttribute("d", pathData);

    const length = measuringPath.getTotalLength();
    const sampledPoints = [];

    for (let index = 0; index <= samples; index += 1) {
        const point = measuringPath.getPointAtLength((length * index) / samples);

        sampledPoints.push({ x: point.x, y: point.y });
    }

    return sampledPoints;
}

function getPartialPoints(points, progress) {
    if (progress <= 0 || points.length < 2) {
        return [];
    }

    if (progress >= 1) {
        return points;
    }

    const scaledProgress = progress * (points.length - 1);
    const completePointIndex = Math.floor(scaledProgress);
    const segmentProgress = scaledProgress - completePointIndex;
    const partialPoints = points.slice(0, completePointIndex + 1);
    const current = points[completePointIndex];
    const next = points[Math.min(completePointIndex + 1, points.length - 1)];

    partialPoints.push(interpolatePoint(current, next, segmentProgress));

    return partialPoints;
}

function makeHorizontalPoints({ startX, endX, minY, maxY, points = 12 }) {
    const generatedPoints = [];

    for (let index = 0; index < points; index += 1) {
        const progress = index / (points - 1);
        const x = startX + (endX - startX) * progress;
        const wave = Math.sin(progress * Math.PI * randomBetween(1.15, 1.85)) * randomBetween(2.5, 8);
        const y = randomBetween(minY, maxY) + wave;

        generatedPoints.push({ x, y });
    }

    return generatedPoints;
}

function makeLoopingPoints() {
    const loopX = randomBetween(40, 55);
    const loopY = randomBetween(58, 68);
    const loopRadiusX = randomBetween(5, 8);
    const loopRadiusY = randomBetween(3.5, 5.5);
    const points = [
        { x: 109, y: randomBetween(42, 50) },
        { x: randomBetween(98, 102), y: randomBetween(45, 53) },
        { x: randomBetween(88, 94), y: randomBetween(50, 58) },
        { x: randomBetween(77, 84), y: randomBetween(56, 64) },
        { x: randomBetween(66, 73), y: randomBetween(61, 69) },
        { x: loopX + loopRadiusX, y: loopY },
    ];

    for (let index = 0; index <= 10; index += 1) {
        const angle = (Math.PI * 2 * index) / 10;

        points.push({
            x: loopX + Math.cos(angle) * loopRadiusX,
            y: loopY + Math.sin(angle) * loopRadiusY,
        });
    }

    points.push(
        { x: randomBetween(39, 46), y: randomBetween(66, 74) },
        { x: randomBetween(28, 34), y: randomBetween(71, 79) },
        { x: 8, y: randomBetween(74, 83) }
    );

    return points;
}

function setCordonPath(position, pathData) {
    document.querySelectorAll(`[data-cordon-path="${position}"], [data-cordon-shadow="${position}"]`).forEach((path) => {
        path.setAttribute("d", pathData);
    });
}

function randomizeCordonShapes() {
    cordons.left = samplePath(pointsToSmoothPath(makeHorizontalPoints({
        startX: -7,
        endX: 108,
        minY: 23,
        maxY: 40,
        points: 13,
    })));
    cordons.right = samplePath(pointsToSmoothPath(makeLoopingPoints()), 260);
    cordons.bottom = samplePath(pointsToSmoothPath(makeHorizontalPoints({
        startX: -8,
        endX: 108,
        minY: 76,
        maxY: 88,
        points: 12,
    })));
}

function getScrollProgress() {
    if (!projectGallery) {
        return 1;
    }

    const start = projectGallery.offsetTop - window.innerHeight * 0.7;
    const end = document.documentElement.scrollHeight - window.innerHeight;
    const distance = Math.max(end - start, 1);

    if (window.scrollY <= start) {
        return 0;
    }

    if (window.scrollY >= end) {
        return 1;
    }

    return Math.min((window.scrollY - start) / distance, 1);
}

function getChromeReductionStart() {
    return Math.max(window.innerHeight * 0.12, 80);
}

function updateScrolledState() {
    document.body.classList.toggle("is-scrolled", window.scrollY > getChromeReductionStart());

    if (!siteFooter) {
        return;
    }

    const footerTop = siteFooter.getBoundingClientRect().top;

    document.body.classList.toggle("is-at-footer", footerTop <= window.innerHeight - 24);

    if (document.body.classList.contains("is-at-footer")) {
        closeMobileMenu();
    }
}

function closeMobileMenu() {
    document.body.classList.remove("is-menu-open");

    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute("aria-expanded", "false");
    }
}

function toggleMobileMenu() {
    const isOpen = document.body.classList.toggle("is-menu-open");

    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    }
}

function setLayerVisibility(progress) {
    if (!cordonLayer) {
        return;
    }

    const visibility = reduceMotion.matches ? 1 : Math.min(progress * 1.8, 0.72);

    cordonLayer.style.setProperty("--cordon-visibility", visibility);
    cordonLayer.style.setProperty("--cordon-progress", progress);
}

function drawCordons(progress) {
    Object.entries(cordons).forEach(([position, points]) => {
        const partialPoints = getPartialPoints(points, progress);

        setCordonPath(position, pointsToLinePath(partialPoints));
    });
}

function updateCordons() {
    const progress = reduceMotion.matches ? 1 : getScrollProgress();
    const drawProgress = Math.min(progress * 1.18, 1);

    updateScrolledState();
    setLayerVisibility(progress);
    drawCordons(drawProgress);
}

let ticking = false;

function requestCordonUpdate() {
    if (ticking) {
        return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
        updateCordons();
        ticking = false;
    });
}

randomizeCordonShapes();
updateCordons();

window.addEventListener("scroll", requestCordonUpdate, { passive: true });
window.addEventListener("resize", () => {
    closeMobileMenu();
    requestCordonUpdate();
});
reduceMotion.addEventListener("change", requestCordonUpdate);

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", toggleMobileMenu);
}

if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });
}
