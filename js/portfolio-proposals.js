const proposalMenuToggle = document.querySelector(".propuesta-menu-interruptor");
const proposalMenu = document.querySelector(".propuesta-menu");

function closeProposalMenu() {
    document.body.classList.remove("esta-portada-menu-abierto");
    proposalMenuToggle?.setAttribute("aria-expanded", "false");
}

proposalMenuToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("esta-portada-menu-abierto");

    proposalMenuToggle.setAttribute("aria-expanded", String(isOpen));
});

proposalMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        closeProposalMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeProposalMenu();
    }
});
