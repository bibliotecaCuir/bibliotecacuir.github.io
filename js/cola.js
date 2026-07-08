const cola = document.getElementById("cola");

let x = 100;
let y = 100;

let dx = 3;
let dy = 2.5;

function animate() {

    x += dx;
    y += dy;

    const w = cola.offsetWidth;
    const h = cola.offsetHeight;

    if (x <= 0 || x + w >= window.innerWidth) {
        dx *= -5;
    }

    if (y <= 0 || y + h >= window.innerHeight) {
        dy *= -5;
    }

    cola.style.left = x + "px";
    logo.style.top = y + "px";
cola
    requestAnimationFrame(animate);
}

cola.onload = () => {
    animate();
};

window.addEventListener("resize", () => {
    x = Math.min(x, window.innerWidth - logo.offsetWidth);
    y = Math.min(y, window.innerHeight - logo.offsetHeight);
});