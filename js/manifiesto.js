const manifestArtwork = document.querySelector(".manifiesto-fragmentado-cuerpo");
const manifestLoupe = document.querySelector(".manifiesto-lupa");
const manifestLoupeArt = document.querySelector(".manifiesto-lupa-ilustracion");
const manifestMaskImage = document.querySelector(".manifiesto-fragmentado-cuerpo > .manifiesto-cuerpo-capa");
const manifestCursorDot = document.querySelector(".manifiesto-cursor-punto");

if (manifestArtwork && manifestLoupe && manifestLoupeArt && manifestMaskImage) {
    const motion = {
        active: false,
        canvasReady: false,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        frame: null,
    };
    const maskCanvas = document.createElement("canvas");
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });

    function getZoomScale() {
        return Number.parseFloat(getComputedStyle(manifestArtwork).getPropertyValue("--loupe-scale")) || 2.85;
    }

    function syncLoupeSize() {
        const rect = manifestArtwork.getBoundingClientRect();

        manifestLoupeArt.style.setProperty("--manifest-art-width", `${rect.width}px`);
        manifestLoupeArt.style.setProperty("--manifest-art-height", `${rect.height}px`);
    }

    function prepareMask() {
        if (!maskContext || !manifestMaskImage.naturalWidth || !manifestMaskImage.naturalHeight) {
            return;
        }

        const maskWidth = Math.min(manifestMaskImage.naturalWidth, 1400);
        const maskHeight = Math.round(maskWidth / (manifestMaskImage.naturalWidth / manifestMaskImage.naturalHeight));

        maskCanvas.width = maskWidth;
        maskCanvas.height = maskHeight;
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskContext.drawImage(manifestMaskImage, 0, 0);
        motion.canvasReady = true;
    }

    function pointTouchesHotspot(clientX, clientY) {
        return [...manifestArtwork.querySelectorAll(":scope > .manifiesto-punto")].some((hotspot) => {
            const rect = hotspot.getBoundingClientRect();

            return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
        });
    }

    function pointTouchesArtwork(localX, localY, rect) {
        if (!motion.canvasReady || !maskContext) {
            return true;
        }

        const imageX = Math.round((localX / rect.width) * maskCanvas.width);
        const imageY = Math.round((localY / rect.height) * maskCanvas.height);
        const sampleRadius = 42;
        const sampleStep = 10;

        for (let y = -sampleRadius; y <= sampleRadius; y += sampleStep) {
            for (let x = -sampleRadius; x <= sampleRadius; x += sampleStep) {
                const sampleX = Math.min(Math.max(imageX + x, 0), maskCanvas.width - 1);
                const sampleY = Math.min(Math.max(imageY + y, 0), maskCanvas.height - 1);
                const [red, green, blue, alpha] = maskContext.getImageData(sampleX, sampleY, 1, 1).data;
                const isVisiblePixel = alpha > 18;
                const isWhiteSpace = alpha > 244 && red > 246 && green > 246 && blue > 246;

                if (isVisiblePixel && !isWhiteSpace) {
                    return true;
                }
            }
        }

        return false;
    }

    function pointTouchesComposition(localX, localY, rect) {
        const x = localX / rect.width;
        const y = localY / rect.height;
        const insideMainBody = x > 0.16 && x < 0.86 && y > 0.08 && y < 0.92;
        const insideRightText = x > 0.74 && x < 0.94 && y > 0.12 && y < 0.52;
        const insideLeftText = x > 0.07 && x < 0.24 && y > 0.16 && y < 0.76;
        const insideLowerText = x > 0.2 && x < 0.68 && y > 0.64 && y < 0.98;

        return insideMainBody || insideRightText || insideLeftText || insideLowerText;
    }

    function setLoupeActive(isActive) {
        motion.active = isActive;
        manifestArtwork.classList.toggle("esta-lupa-activo", isActive);

        if (isActive) {
            setCursorDotActive(false);
            startRendering();
        } else {
            stopRendering();
        }
    }

    function setCursorDotActive(isActive) {
        manifestArtwork.classList.toggle("esta-cursor-punto-activo", isActive);
    }

    function moveCursorDot(clientX, clientY) {
        if (!manifestCursorDot) {
            return;
        }

        manifestCursorDot.style.left = `${clientX}px`;
        manifestCursorDot.style.top = `${clientY}px`;
    }

    function renderLoupe() {
        const rect = manifestArtwork.getBoundingClientRect();
        const loupeWidth = manifestLoupe.offsetWidth;
        const loupeHeight = manifestLoupe.offsetHeight;
        const zoomScale = getZoomScale();
        const driftX = Math.sin(performance.now() / 760) * 4;
        const driftY = Math.cos(performance.now() / 910) * 4;

        motion.currentX += (motion.targetX - motion.currentX) * 0.16;
        motion.currentY += (motion.targetY - motion.currentY) * 0.16;

        const localX = motion.currentX - rect.left;
        const localY = motion.currentY - rect.top;
        const offsetX = (loupeWidth / 2) - (localX * zoomScale);
        const offsetY = (loupeHeight / 2) - (localY * zoomScale);

        manifestLoupe.style.left = `${motion.currentX + driftX}px`;
        manifestLoupe.style.top = `${motion.currentY + driftY}px`;
        manifestLoupeArt.style.transform = `matrix(${zoomScale}, 0, 0, ${zoomScale}, ${offsetX}, ${offsetY})`;
        motion.frame = window.requestAnimationFrame(renderLoupe);
    }

    function startRendering() {
        if (motion.frame) {
            return;
        }

        motion.frame = window.requestAnimationFrame(renderLoupe);
    }

    function stopRendering() {
        if (!motion.frame) {
            return;
        }

        window.cancelAnimationFrame(motion.frame);
        motion.frame = null;
    }

    function moveLoupe(event) {
        if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
            return;
        }

        const rect = manifestArtwork.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const isInside = localX >= 0 && localY >= 0 && localX <= rect.width && localY <= rect.height;

        if (!isInside) {
            setCursorDotActive(false);
            setLoupeActive(false);
            return;
        }

        const touchesContent = isInside && (
            pointTouchesArtwork(localX, localY, rect)
            || pointTouchesComposition(localX, localY, rect)
            || pointTouchesHotspot(event.clientX, event.clientY)
        );

        if (!touchesContent) {
            moveCursorDot(event.clientX, event.clientY);
            setCursorDotActive(true);
            setLoupeActive(false);
            return;
        }

        setCursorDotActive(false);
        motion.targetX = event.clientX;
        motion.targetY = event.clientY;

        if (!motion.active) {
            motion.currentX = event.clientX;
            motion.currentY = event.clientY;
            setLoupeActive(true);
        }
    }

    function leaveArtwork() {
        setCursorDotActive(false);
        setLoupeActive(false);
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stopRendering();
            setLoupeActive(false);
        } else if (motion.active) {
            startRendering();
        }
    }

    syncLoupeSize();

    if (manifestMaskImage.complete) {
        prepareMask();
    } else {
        manifestMaskImage.addEventListener("load", prepareMask, { once: true });
    }

    manifestArtwork.addEventListener("pointerenter", syncLoupeSize);
    manifestArtwork.addEventListener("pointermove", moveLoupe);
    manifestArtwork.addEventListener("pointerleave", leaveArtwork);
    window.addEventListener("resize", syncLoupeSize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
}
