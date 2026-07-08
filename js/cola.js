const cola = document.getElementById("cola");

if (cola) {
    let x = 64;
    let y = 120;
    let dx = 2.4;
    let dy = 1.8;

    function keepColaInViewport() {
        x = Math.min(Math.max(x, 0), window.innerWidth - cola.offsetWidth);
        y = Math.min(Math.max(y, 0), window.innerHeight - cola.offsetHeight);
    }

    function animateCola() {
        x += dx;
        y += dy;

        const width = cola.offsetWidth;
        const height = cola.offsetHeight;

        if (x <= 0 || x + width >= window.innerWidth) {
            dx *= -1;
            x = Math.min(Math.max(x, 0), window.innerWidth - width);
        }

        if (y <= 0 || y + height >= window.innerHeight) {
            dy *= -1;
            y = Math.min(Math.max(y, 0), window.innerHeight - height);
        }

        cola.style.left = `${x}px`;
        cola.style.top = `${y}px`;

        window.requestAnimationFrame(animateCola);
    }

    function startColaAnimation() {
        keepColaInViewport();
        animateCola();
    }

    if (cola.complete) {
        startColaAnimation();
    } else {
        cola.addEventListener("load", startColaAnimation, { once: true });
    }

    window.addEventListener("resize", keepColaInViewport);
}
