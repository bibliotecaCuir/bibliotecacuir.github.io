let navbar = `
<nav class="navegacion">


    <div class="nav-section">
        <h3><a href="/">inicio</a></h3>
    </div>

     <div class="nav-section">
        <h3><a href="/">archivo</a></h3>
    </div>

         <div class="nav-section">
        <h3><a href="/">proyectos</a></h3>
    </div>

         <div class="nav-section">
        <h3><a href="/">participa</a></h3>
    </div>


    <div class="nav-section">
        <h3><a href="/enlaces">acerca</a></h3>
    </div>

    <div class="nav-section">
        <h3><a href="/contacto">contacto</a></h3>
    </div>
</nav>
`;

let divMenu = document.getElementById('divMenu');
if (divMenu) {
    divMenu.innerHTML = navbar;
}

document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const content = trigger.nextElementSibling;
        const isOpen = content.style.display === 'block';
        document.querySelectorAll('.dropdown-content').forEach(el => el.style.display = 'none');
        content.style.display = isOpen ? 'none' : 'block';
    });
});

window.addEventListener('scroll', function() {
    const footer = document.querySelector('.colophon-banner');
    if (footer) {
        if (window.scrollY > 50) {
            footer.classList.add('visible');
        } else {
            footer.classList.remove('visible');
        }
    }
});

function detectImageOrientation() {
    const track = document.querySelector('.img-track');
    if (!track) return;

    const images = Array.from(track.querySelectorAll('img[src]'));
    if (images.length === 0) return;

    const buildSlides = () => {
        track.innerHTML = '';
        let i = 0;
        while (i < images.length) {
            const img = images[i];
            const isHorizontal = img.naturalWidth > img.naturalHeight;
            const nextImg = images[i + 1];
            const nextIsHorizontal = nextImg && nextImg.naturalWidth > nextImg.naturalHeight;

            if (isHorizontal && nextIsHorizontal) {
                const pair = document.createElement('div');
                pair.className = 'img-slide-pair';
                pair.appendChild(img);
                pair.appendChild(nextImg);
                track.appendChild(pair);
                i += 2;
            } else if (isHorizontal) {
                const slide = document.createElement('div');
                slide.className = 'img-slide-single-horizontal';
                slide.appendChild(img);
                track.appendChild(slide);
                i += 1;
            } else {
                const slide = document.createElement('div');
                slide.className = 'img-slide-single';
                slide.appendChild(img);
                track.appendChild(slide);
                i += 1;
            }
        }
    };

    let loaded = 0;
    images.forEach(img => {
        const onLoad = () => {
            loaded++;
            if (loaded === images.length) buildSlides();
        };
        if (img.complete && img.naturalWidth > 0) {
            onLoad();
        } else {
            img.addEventListener('load', onLoad);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    detectImageOrientation();

    if (document.querySelector('.split-layout')) {
        const footer = document.querySelector('.colophon-banner');
        if (footer) footer.classList.add('visible');
    }
});