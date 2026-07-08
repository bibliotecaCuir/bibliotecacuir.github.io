const cola = document.getElementById("cola");

let x = 50;
let y = 100;

let dx = 1;
let dy = 3;

function animate() {

    x += dx;
    y += dy;

    const w = cola.offsetWidth;
    const h = cola.offsetHeight;

    if (x <= 0 || x + w >= window.innerWidth) {
        dx *= -1;
    }

    if (y <= 0 || y + h >= window.innerHeight) {
        dy *= -1;
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