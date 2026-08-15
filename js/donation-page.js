const donationNavQuery = window.matchMedia("(min-width: 701px)");
const donationMenuToggle = document.querySelector(".portada-menu-interruptor");
let donationNavFrame = null;
let donationNavExitTimer = null;

function closeDonationMenu() {
    document.body.classList.remove("esta-portada-menu-abierto");
    donationMenuToggle?.setAttribute("aria-expanded", "false");
}

function clearDonationNavExit() {
    if (!donationNavExitTimer) {
        return;
    }

    window.clearTimeout(donationNavExitTimer);
    donationNavExitTimer = null;
}

function setDonationCompactNav(shouldShow) {
    const isShowing = document.body.classList.contains("tiene-compacta-navegacion");

    if (shouldShow) {
        clearDonationNavExit();
        document.body.classList.remove("esta-compacta-navegacion-saliendo");
        document.body.classList.add("tiene-compacta-navegacion");
        closeDonationMenu();
        return;
    }

    if (!isShowing) {
        return;
    }

    document.body.classList.add("esta-compacta-navegacion-saliendo");
    clearDonationNavExit();
    donationNavExitTimer = window.setTimeout(() => {
        document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
        donationNavExitTimer = null;
    }, 220);
}

function updateDonationCompactNav() {
    donationNavFrame = null;

    if (!donationNavQuery.matches) {
        clearDonationNavExit();
        document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
        return;
    }

    setDonationCompactNav(window.scrollY > Math.max(window.innerHeight * 0.28, 220));
}

function requestDonationCompactNavUpdate() {
    if (donationNavFrame) {
        return;
    }

    donationNavFrame = window.requestAnimationFrame(updateDonationCompactNav);
}

window.addEventListener("scroll", requestDonationCompactNavUpdate, { passive: true });
window.addEventListener("resize", requestDonationCompactNavUpdate);
donationNavQuery.addEventListener("change", requestDonationCompactNavUpdate);
requestDonationCompactNavUpdate();
