const menuInterruptor = document.querySelector(".portada-menu-interruptor");
const menu = document.querySelector(".portada-menu");

function cerrarMenu() {
    document.body.classList.remove("esta-portada-menu-abierto");
    menuInterruptor?.setAttribute("aria-expanded", "false");
}

menuInterruptor?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("esta-portada-menu-abierto");

    menuInterruptor.setAttribute("aria-expanded", String(isOpen));
});

menu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        cerrarMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        cerrarMenu();
    }
});
