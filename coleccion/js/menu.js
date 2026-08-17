const landingMenuToggle = document.querySelector(".menu-interruptor");
const landingMenu = document.querySelector(".menu-principal");
const compactNavigationQuery = window.matchMedia("(min-width: 701px)");
let compactNavigationFrame = null;
let compactNavigationExitTimer = null;

function closeLandingMenu() {
  document.body.classList.remove("esta-menu-abierto");
  landingMenuToggle?.setAttribute("aria-expanded", "false");
}

function toggleLandingMenu() {
  const isOpen = document.body.classList.toggle("esta-menu-abierto");
  landingMenuToggle?.setAttribute("aria-expanded", String(isOpen));
}

function compactNavigationThreshold() {
  const hero = document.querySelector(".catalogo-encabezado, .ficha-encabezado");
  if (!hero) return Math.max(window.innerHeight * 0.35, 220);
  return hero.offsetTop + Math.min(hero.offsetHeight * 0.45, window.innerHeight * 0.7);
}

function clearCompactNavigationExit() {
  if (!compactNavigationExitTimer) return;
  window.clearTimeout(compactNavigationExitTimer);
  compactNavigationExitTimer = null;
}

function setCompactNavigation(shouldShow) {
  const isShowing = document.body.classList.contains("tiene-navegacion-compacta");

  if (shouldShow) {
    clearCompactNavigationExit();
    document.body.classList.remove("esta-navegacion-compacta-saliendo");
    document.body.classList.add("tiene-navegacion-compacta");
    closeLandingMenu();
    return;
  }

  if (!isShowing) return;

  document.body.classList.add("esta-navegacion-compacta-saliendo");
  clearCompactNavigationExit();
  compactNavigationExitTimer = window.setTimeout(() => {
    document.body.classList.remove("tiene-navegacion-compacta", "esta-navegacion-compacta-saliendo");
    compactNavigationExitTimer = null;
  }, 460);
}

function updateCompactNavigation() {
  compactNavigationFrame = null;

  if (!compactNavigationQuery.matches) {
    clearCompactNavigationExit();
    document.body.classList.remove("tiene-navegacion-compacta", "esta-navegacion-compacta-saliendo");
    return;
  }

  setCompactNavigation(window.scrollY >= compactNavigationThreshold());
}

function requestCompactNavigationUpdate() {
  if (compactNavigationFrame) return;
  compactNavigationFrame = window.requestAnimationFrame(updateCompactNavigation);
}

landingMenuToggle?.addEventListener("click", toggleLandingMenu);

landingMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeLandingMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLandingMenu();
});

window.addEventListener("scroll", requestCompactNavigationUpdate, { passive: true });
window.addEventListener("resize", requestCompactNavigationUpdate);
compactNavigationQuery.addEventListener("change", requestCompactNavigationUpdate);
requestCompactNavigationUpdate();
