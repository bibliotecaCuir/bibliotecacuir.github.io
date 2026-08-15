const donationNavQuery = window.matchMedia("(min-width: 701px)");
const donationMenuToggle = document.querySelector(".landing-menu-toggle");
let donationNavFrame = null;
let donationNavExitTimer = null;

function closeDonationMenu() {
    document.body.classList.remove("is-landing-menu-open");
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
    const isShowing = document.body.classList.contains("has-compact-nav");

    if (shouldShow) {
        clearDonationNavExit();
        document.body.classList.remove("is-compact-nav-leaving");
        document.body.classList.add("has-compact-nav");
        closeDonationMenu();
        return;
    }

    if (!isShowing) {
        return;
    }

    document.body.classList.add("is-compact-nav-leaving");
    clearDonationNavExit();
    donationNavExitTimer = window.setTimeout(() => {
        document.body.classList.remove("has-compact-nav", "is-compact-nav-leaving");
        donationNavExitTimer = null;
    }, 220);
}

function updateDonationCompactNav() {
    donationNavFrame = null;

    if (!donationNavQuery.matches) {
        clearDonationNavExit();
        document.body.classList.remove("has-compact-nav", "is-compact-nav-leaving");
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
