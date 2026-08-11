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

        const controls = document.createElement('div');
        controls.className = 'portfolio-carousel-controls';

        const previousButton = document.createElement('button');
        previousButton.type = 'button';
        previousButton.setAttribute('aria-label', 'Imagen anterior');
        previousButton.textContent = '←';

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.setAttribute('aria-label', 'Imagen siguiente');
        nextButton.textContent = '→';

        controls.append(previousButton, nextButton);
        media.append(track, controls);

        const showSlide = (index) => {
            currentSlide = (index + slides.length) % slides.length;
            slideItems.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === currentSlide);
            });
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        const start = () => {
            if (!prefersReducedMotion && !timer) {
                timer = window.setInterval(() => showSlide(currentSlide + 1), 3800);
            }
        };

        previousButton.addEventListener('click', () => {
            stop();
            showSlide(currentSlide - 1);
            start();
        });

        nextButton.addEventListener('click', () => {
            stop();
            showSlide(currentSlide + 1);
            start();
        });

        media.addEventListener('mouseenter', stop);
        media.addEventListener('mouseleave', start);
        media.addEventListener('focusin', stop);
        media.addEventListener('focusout', start);

        showSlide(currentSlide);
        start();
    });

    fitSingleLineTitles();
    if (document.fonts) {
        document.fonts.ready.then(fitSingleLineTitles);
    }
    window.addEventListener('resize', fitSingleLineTitles);
});
