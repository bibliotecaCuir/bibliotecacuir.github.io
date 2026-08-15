const landingMenuToggle = document.querySelector(".landing-menu-toggle");
const landingMenu = document.querySelector(".landing-menu");
const compactNavigationQuery = window.matchMedia("(min-width: 701px)");
let compactNavigationFrame = null;
let compactNavigationExitTimer = null;

function closeLandingMenu() {
  document.body.classList.remove("is-landing-menu-open");
  landingMenuToggle?.setAttribute("aria-expanded", "false");
}

function toggleLandingMenu() {
  const isOpen = document.body.classList.toggle("is-landing-menu-open");
  landingMenuToggle?.setAttribute("aria-expanded", String(isOpen));
}

function compactNavigationThreshold() {
  const hero = document.querySelector(".catalogo-hero, .book-hero");
  if (!hero) return Math.max(window.innerHeight * 0.35, 220);
  return hero.offsetTop + Math.min(hero.offsetHeight * 0.45, window.innerHeight * 0.7);
}

function clearCompactNavigationExit() {
  if (!compactNavigationExitTimer) return;
  window.clearTimeout(compactNavigationExitTimer);
  compactNavigationExitTimer = null;
}

function setCompactNavigation(shouldShow) {
  const isShowing = document.body.classList.contains("has-compact-nav");

  if (shouldShow) {
    clearCompactNavigationExit();
    document.body.classList.remove("is-compact-nav-leaving");
    document.body.classList.add("has-compact-nav");
    closeLandingMenu();
    return;
  }

  if (!isShowing) return;

  document.body.classList.add("is-compact-nav-leaving");
  clearCompactNavigationExit();
  compactNavigationExitTimer = window.setTimeout(() => {
    document.body.classList.remove("has-compact-nav", "is-compact-nav-leaving");
    compactNavigationExitTimer = null;
  }, 460);
}

function updateCompactNavigation() {
  compactNavigationFrame = null;

  if (!compactNavigationQuery.matches) {
    clearCompactNavigationExit();
    document.body.classList.remove("has-compact-nav", "is-compact-nav-leaving");
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
