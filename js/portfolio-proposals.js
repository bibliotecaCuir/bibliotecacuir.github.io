const proposalMenuToggle = document.querySelector(".proposal-menu-toggle");
const proposalMenu = document.querySelector(".proposal-menu");

function closeProposalMenu() {
    document.body.classList.remove("is-landing-menu-open");
    proposalMenuToggle?.setAttribute("aria-expanded", "false");
}

proposalMenuToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("is-landing-menu-open");

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
