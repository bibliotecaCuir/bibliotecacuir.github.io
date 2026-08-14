document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const portfolioImages = document.querySelectorAll('.portfolio-media img');
    const mediaBlocks = document.querySelectorAll('.portfolio-media:not(.portfolio-media-single)');
    const singleLineTitlePages = document.body.classList.contains('portfolio-practicas') ||
        document.body.classList.contains('portfolio-activaciones');
    const singleLineTitles = singleLineTitlePages ?
        Array.from(document.querySelectorAll('.portfolio-content .portfolio-entry h2')) :
        [];
    const pageTitle = document.querySelector('.portfolio-section .portfolio-detail-hero h1');
    const fittedTitles = pageTitle ? [...singleLineTitles, pageTitle] : singleLineTitles;
    const isProjectPage = document.body.classList.contains('portfolio-project-page');
    const projectEntry = document.querySelector('.portfolio-entry-single[id]');

    const categoryColorBases = {
        practicas: { hue: 258, saturation: 10, lightness: 18, foreground: '#f1f1f1', lineAlpha: 0.28 },
        obras: { hue: 244, saturation: 94, lightness: 60, foreground: '#f1f1f1', lineAlpha: 0.32 },
        activaciones: { hue: 166, saturation: 18, lightness: 92, foreground: '#202020', lineAlpha: 0.32 },
        otros: { hue: 309, saturation: 92, lightness: 66, foreground: '#f1f1f1', lineAlpha: 0.32 },
    };

    const getProjectCategory = () => {
        const match = Array.from(document.body.classList).find((className) => className.startsWith('portfolio-') &&
            Object.prototype.hasOwnProperty.call(categoryColorBases, className.replace('portfolio-', '')));

        return match ? match.replace('portfolio-', '') : null;
    };

    const getProjectHueOffset = (value) => {
        let hash = 0;

        for (let index = 0; index < value.length; index += 1) {
            hash = (hash * 31 + value.charCodeAt(index)) % 997;
        }

        return ((hash % 15) - 7) * 4;
    };

    const applyProjectColor = () => {
        if (!isProjectPage || !projectEntry) {
            return;
        }

        const category = getProjectCategory();
        const base = category ? categoryColorBases[category] : null;

        if (!base) {
            return;
        }

        const offset = getProjectHueOffset(`${category}-${projectEntry.id}`);
        const hue = (base.hue + offset + 360) % 360;
        const background = `hsl(${hue} ${base.saturation}% ${base.lightness}%)`;
        const line = base.foreground === '#202020'
            ? `hsla(${hue} ${Math.max(base.saturation - 8, 0)}% 20% / ${base.lineAlpha})`
            : `hsla(${hue} ${Math.min(base.saturation + 10, 100)}% 96% / ${base.lineAlpha})`;

        document.body.style.setProperty('--portfolio-bg', background);
        document.body.style.setProperty('--portfolio-fg', base.foreground);
        document.body.style.setProperty('--portfolio-line', line);
        document.body.style.setProperty('--project-accent', `hsl(${(hue + 22) % 360} ${base.saturation}% ${base.lightness}%)`);
    };

    const fitSingleLineTitles = () => {
        fittedTitles.forEach((title) => {
            title.style.fontSize = '';

            if (window.innerWidth > 760) {
                return;
            }

            let size = parseFloat(window.getComputedStyle(title).fontSize);
            const minSize = title === pageTitle ? 54 : 18;

            while (title.scrollWidth > title.clientWidth && size > minSize) {
                size -= 1;
                title.style.fontSize = `${size}px`;
            }
        });
    };

    const setImageOrientation = (image) => {
        if (!image.naturalWidth || !image.naturalHeight) {
            return;
        }

        image.classList.toggle('portfolio-image-portrait', image.naturalHeight > image.naturalWidth);
        image.classList.toggle('portfolio-image-landscape', image.naturalWidth >= image.naturalHeight);
    };

    portfolioImages.forEach((image) => {
        if (image.complete) {
            setImageOrientation(image);
            return;
        }

        image.addEventListener('load', () => setImageOrientation(image), { once: true });
    });

    mediaBlocks.forEach((media) => {
        const slides = Array.from(media.querySelectorAll('img'));

        if (slides.length < 2) {
            return;
        }

        let currentSlide = 0;
        let timer = null;
        let firstTimer = null;

        media.classList.add('portfolio-carousel');

        const track = document.createElement('div');
        track.className = 'portfolio-carousel-track';
        const slideItems = slides.map((image) => {
            const slide = document.createElement('div');
            slide.className = 'portfolio-carousel-slide';
            slide.append(image);
            return slide;
        });
        track.append(...slideItems);

        media.append(track);

        const showSlide = (index) => {
            currentSlide = (index + slides.length) % slides.length;
            slideItems.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === currentSlide);
            });
        };

        const stop = () => {
            if (firstTimer) {
                window.clearTimeout(firstTimer);
                firstTimer = null;
            }

            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        const start = (delay = 650) => {
            if (prefersReducedMotion || timer || firstTimer) {
                return;
            }

            firstTimer = window.setTimeout(() => {
                showSlide(currentSlide + 1);
                firstTimer = null;
                timer = window.setInterval(() => showSlide(currentSlide + 1), 3000);
            }, delay);
        };

        media.addEventListener('mouseenter', stop);
        media.addEventListener('mouseleave', start);
        media.addEventListener('focusin', stop);
        media.addEventListener('focusout', start);

        showSlide(currentSlide);
        start();
    });

    const normalizePath = (path) => {
        const url = new URL(path, window.location.origin);
        return url.pathname.replace(/\/index\.html$/, '/');
    };

    const createProjectNeighborLink = (project, direction) => {
        const link = document.createElement('a');
        const label = document.createElement('span');
        const title = document.createElement('strong');
        const category = document.createElement('small');

        link.className = `project-neighbor-link project-neighbor-link-${direction}`;
        link.href = project.href;
        label.textContent = direction === 'previous' ? 'proyecto anterior' : 'siguiente proyecto';
        title.textContent = project.title;
        category.textContent = project.category;

        link.append(label, title, category);
        return link;
    };

    const setupProjectNavigation = async () => {
        if (!isProjectPage) {
            return;
        }

        const detail = document.querySelector('.portfolio-project-detail');
        const content = document.querySelector('.portfolio-project-detail .portfolio-content');

        if (!detail || !content) {
            return;
        }

        try {
            const response = await fetch('/assets/portafolio/drive-manifest.json');

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            const projects = Object.entries(data.entries || {}).map(([key, entry]) => {
                const [category] = key.split('/');

                return {
                    href: `/portafolio/${key}.html`,
                    title: entry.title,
                    category,
                };
            });
            const currentPath = normalizePath(window.location.pathname);
            const currentIndex = projects.findIndex((project) => normalizePath(project.href) === currentPath);

            if (currentIndex < 0 || projects.length < 2) {
                return;
            }

            const previousProject = projects[(currentIndex - 1 + projects.length) % projects.length];
            const nextProject = projects[(currentIndex + 1) % projects.length];
            const nav = document.createElement('nav');

            nav.className = 'project-neighbors';
            nav.setAttribute('aria-label', 'Navegacion entre proyectos');
            nav.append(
                createProjectNeighborLink(previousProject, 'previous'),
                createProjectNeighborLink(nextProject, 'next')
            );
            content.insertAdjacentElement('afterend', nav);
        } catch (error) {
            // Project pages should still render if the local manifest is unavailable.
        }
    };

    setupProjectNavigation();
    applyProjectColor();

    fitSingleLineTitles();
    if (document.fonts) {
        document.fonts.ready.then(fitSingleLineTitles);
    }
    window.addEventListener('resize', fitSingleLineTitles);
});
