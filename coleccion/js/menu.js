const landingMenuToggle = document.querySelector(".portada-menu-interruptor");
const landingMenu = document.querySelector(".portada-menu");
const compactNavigationQuery = window.matchMedia("(min-width: 701px)");
let compactNavigationFrame = null;
let compactNavigationExitTimer = null;

function normalizeCaosText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N");
}

function stripAccentsFromCaosElements() {
  document.querySelectorAll("body *").forEach((element) => {
    const family = window.getComputedStyle(element).fontFamily.toLowerCase();

    if (!family.includes("caosmarika")) return;

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = normalizeCaosText(node.textContent);
      }
    });
  });
}

function closeLandingMenu() {
  document.body.classList.remove("esta-portada-menu-abierto");
  landingMenuToggle?.setAttribute("aria-expanded", "false");
}

function toggleLandingMenu() {
  const isOpen = document.body.classList.toggle("esta-portada-menu-abierto");
  landingMenuToggle?.setAttribute("aria-expanded", String(isOpen));
}

function compactNavigationThreshold() {
  const hero = document.querySelector(".catalogo-principal, .libro-principal");
  if (!hero) return Math.max(window.innerHeight * 0.35, 220);
  return hero.offsetTop + Math.min(hero.offsetHeight * 0.45, window.innerHeight * 0.7);
}

function clearCompactNavigationExit() {
  if (!compactNavigationExitTimer) return;
  window.clearTimeout(compactNavigationExitTimer);
  compactNavigationExitTimer = null;
}

function setCompactNavigation(shouldShow) {
  const isShowing = document.body.classList.contains("tiene-compacta-navegacion");

  if (shouldShow) {
    clearCompactNavigationExit();
    document.body.classList.remove("esta-compacta-navegacion-saliendo");
    document.body.classList.add("tiene-compacta-navegacion");
    closeLandingMenu();
    return;
  }

  if (!isShowing) return;

  document.body.classList.add("esta-compacta-navegacion-saliendo");
  clearCompactNavigationExit();
  compactNavigationExitTimer = window.setTimeout(() => {
    document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
    compactNavigationExitTimer = null;
  }, 460);
}

function updateCompactNavigation() {
  compactNavigationFrame = null;

  if (!compactNavigationQuery.matches) {
    clearCompactNavigationExit();
    document.body.classList.remove("tiene-compacta-navegacion", "esta-compacta-navegacion-saliendo");
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
stripAccentsFromCaosElements();
requestCompactNavigationUpdate();
