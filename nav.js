// ── Presentación de fondo ──────────────────────────────────────────────────

const rutaManifest = '/assets/imagenes/manifest.json';
const rutaBaseImagenes = '/assets/imagenes/';

function mezclarAleatorio(arreglo) {
    const copia = [...arreglo];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function iniciarPresentacion(listaImagenes) {
    const contenedorFondo = document.createElement('div');
    contenedorFondo.id = 'fondoPresentacion';
    Object.assign(contenedorFondo.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '-1',
        overflow: 'hidden',
    });

    const imagenFondo = document.createElement('img');
    Object.assign(imagenFondo.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
    });

    contenedorFondo.appendChild(imagenFondo);

    const capaRosada = document.createElement('div');
    capaRosada.id = 'capaRosada';
    Object.assign(capaRosada.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ff00c3',
        mixBlendMode: 'screen',
        zIndex: '0',
        pointerEvents: 'none',
    });

    const svgGranulado = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
        <filter id='grano'>
            <feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
        </filter>
        <rect width='400' height='400' filter='url(%23grano)'/>
    </svg>`;
    const urlGranulado = 'data:image/svg+xml,' + svgGranulado.replace(/\n\s*/g, ' ');

    const capaGranulado = document.createElement('div');
    capaGranulado.id = 'capaGranulado';
    Object.assign(capaGranulado.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundImage: `url("${urlGranulado}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        mixBlendMode: 'overlay',
        opacity: '100%',
        zIndex: '0',
        pointerEvents: 'none',
    });

    const capaLogo = document.createElement('div');
    capaLogo.id = 'capaLogo';
    Object.assign(capaLogo.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mixBlendMode: 'hard-light',
        zIndex: '2',
        pointerEvents: 'none',
    });

    const imagenLogo = document.createElement('img');
    imagenLogo.src = '/assets/logos/logoBiblioNegro.png';
    imagenLogo.alt = 'Biblioteca Cuir Logo';
    Object.assign(imagenLogo.style, {
        width: '45%',
        maxWidth: '700px',
        height: 'auto',
        pointerEvents: 'auto',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease',
        cursor: 'default',
    });

    imagenLogo.addEventListener('mouseenter', () => {
        imagenLogo.style.transform = 'scale(1.06)';
        imagenLogo.style.filter = 'brightness(0.85) contrast(1.2)';
    });
    imagenLogo.addEventListener('mouseleave', () => {
        imagenLogo.style.transform = 'scale(1)';
        imagenLogo.style.filter = '';
    });

    capaLogo.appendChild(imagenLogo);

    document.body.insertBefore(contenedorFondo, document.body.firstChild);
    document.body.insertBefore(capaRosada, document.body.children[1]);
    document.body.insertBefore(capaGranulado, document.body.children[2]);
    document.body.insertBefore(capaLogo, document.body.children[3]);

    let imagenesOrdenadas = mezclarAleatorio(listaImagenes);
    let indiceActual = 0;

    function mostrarSiguienteImagen() {
        if (indiceActual >= imagenesOrdenadas.length) {
            const ultimaMostrada = imagenesOrdenadas[imagenesOrdenadas.length - 1];
            do {
                imagenesOrdenadas = mezclarAleatorio(listaImagenes);
            } while (imagenesOrdenadas[0] === ultimaMostrada);
            indiceActual = 0;
        }
        imagenFondo.src = rutaBaseImagenes + imagenesOrdenadas[indiceActual];
        indiceActual++;
    }

    mostrarSiguienteImagen();
    setInterval(mostrarSiguienteImagen, 1500);
}

// ── Collage glosario ───────────────────────────────────────────────────────

const imagenesGlosario = [
    'ACOMPAÑAR.png','ACUERPAMIENTO.png','AFECCIÓN.png','AFECTIVA.png',
    'CAOS.png','CARNET.png','COMPILACIONES.png','CONSTELACIÓN.png',
    'CURSI.png','Diálogo Acrónico.png','ENREDO.png','ENTREGAR MI CARIÑO.png',
    'HOMOSEXXXUALES.png','INSTROSPECCIÓN(1).png','INSTROSPECCIÓN.png',
    'LEIBRE LIBRE.png','MATERIALIDADES DIVERSAS.png','METADATA.png',
    'MONSTRUO.png','PARÓDICAMENTE.png','PRÉSTAMO.png','QUIMERA.png',
    'REGISTRO.png','REPRODUCCIONES.png','RESISTE.png','SENSIBILIDAD.png',
    'SENSITIVA.png','SUBJETIVIDADES.png','TEMÁTICA.png','TRANSGENERACIÓN.png',
    'VIOLENCIA.png',
];

function aleatorio(min, max) {
    return Math.random() * (max - min) + min;
}

function crearCollage() {
    const CANTIDAD_SLOTS = 6;
    const DURACION_VISIBLE_MIN = 2000;
    const DURACION_VISIBLE_MAX = 5000;
    const DURACION_FADE = 700;

    const colaImagenes = mezclarAleatorio(imagenesGlosario);
    let indiceCola = 0;

    function siguienteNombre() {
        const nombre = colaImagenes[indiceCola];
        indiceCola = (indiceCola + 1) % colaImagenes.length;
        if (indiceCola === 0) colaImagenes.splice(0, colaImagenes.length, ...mezclarAleatorio(imagenesGlosario));
        return nombre;
    }

    function posicionarAleatoria(img) {
        const rotacion = aleatorio(-20, 20);
        const top      = aleatorio(5, 72);
        const left     = aleatorio(3, 78);
        img.style.top       = top + 'vh';
        img.style.left      = left + 'vw';
        img.style.transform = `rotate(${rotacion}deg)`;
    }

    function ciclarSlot(img) {
        img.src = '/assets/glosario/' + encodeURIComponent(siguienteNombre());
        posicionarAleatoria(img);

        img.style.transition = 'none';
        img.style.opacity = '0';

        requestAnimationFrame(() => requestAnimationFrame(() => {
            img.style.transition = `opacity ${DURACION_FADE}ms ease`;
            img.style.opacity = '1';

            const tiempoVisible = aleatorio(DURACION_VISIBLE_MIN, DURACION_VISIBLE_MAX);

            setTimeout(() => {
                img.style.opacity = '0';
                setTimeout(() => ciclarSlot(img), DURACION_FADE);
            }, tiempoVisible);
        }));
    }

    for (let i = 0; i < CANTIDAD_SLOTS; i++) {
        const img = document.createElement('img');
        img.className = 'imagenCollage';
        Object.assign(img.style, {
            position:   'fixed',
            height:     'auto',
            boxShadow:  '3px 4px 14px rgba(0,0,0,0.28)',
            zIndex:     '1',
            pointerEvents: 'none',
            opacity:    '0',
        });
        document.body.appendChild(img);

        setTimeout(() => ciclarSlot(img), aleatorio(0, 3000));
    }
}

// ── Menú ───────────────────────────────────────────────────────────────────

const itemsMenu = ['inicio', 'archivo', 'proyectos', 'participa', 'acerca', 'contacto'];
const fuenteGrotesca = "'Helvetica Neue', 'Arial Nova', Arial, 'Nimbus Sans', sans-serif";
const colorRosado = '#ff00c3';

function crearMenu() {
    const estilosAnimacion = document.createElement('style');
    estilosAnimacion.textContent = `
        @keyframes girarSalida {
            0%   { transform: scale(1) rotate(0deg);   opacity: 1; }
            50%  { transform: scale(0) rotate(180deg); opacity: 0; }
            100% { transform: scale(0) rotate(180deg); opacity: 0; }
        }
        @keyframes girarEntrada {
            0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
            50%  { transform: scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
        #botonMenu.animando {
            animation: girarSalida 0.3s ease forwards, girarEntrada 0.3s ease forwards;
            animation-delay: 0s, 0.15s;
        }
    `;
    document.head.appendChild(estilosAnimacion);

    const botonMenu = document.createElement('button');
    botonMenu.id = 'botonMenu';
    botonMenu.textContent = '✳';
    Object.assign(botonMenu.style, {
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: '100',
        background: 'none',
        border: 'none',
        padding: '0',
        color: 'transparent',
        webkitTextStroke: '1.5px #ffffff',
        fontFamily: fuenteGrotesca,
        fontSize: '2.5rem',
        lineHeight: '1',
        cursor: 'pointer',
    });

    const panelMenu = document.createElement('div');
    panelMenu.id = 'panelMenu';
    Object.assign(panelMenu.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        width: '260px',
        height: '100vh',
        background: colorRosado,
        zIndex: '99',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: '40px',
        boxSizing: 'border-box',
        transform: 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.77, 0, 0.175, 1)',
    });

    itemsMenu.forEach(item => {
        const entrada = document.createElement('span');
        entrada.textContent = item;
        Object.assign(entrada.style, {
            fontFamily: fuenteGrotesca,
            fontSize: '1.6rem',
            fontWeight: '400',
            color: '#fff',
            letterSpacing: '0.02em',
            textTransform: 'lowercase',
            marginBottom: '1.2rem',
            display: 'block',
        });
        panelMenu.appendChild(entrada);
    });

    let abierto = false;

    botonMenu.addEventListener('click', () => {
        abierto = !abierto;
        panelMenu.style.transform = abierto ? 'translateX(0)' : 'translateX(100%)';

        botonMenu.classList.remove('animando');
        void botonMenu.offsetWidth;
        botonMenu.classList.add('animando');

        setTimeout(() => {
            botonMenu.textContent = abierto ? '✕' : '✳';
            botonMenu.style.color = abierto ? '#ffffff' : 'transparent';
        }, 150);

        botonMenu.addEventListener('animationend', () => {
            botonMenu.classList.remove('animando');
        }, { once: true });
    });

    document.body.appendChild(panelMenu);
    document.body.appendChild(botonMenu);
}

function crearAvisoContruccion() {
    const aviso = document.createElement('p');
    aviso.textContent = 'web en construcción <3';
    Object.assign(aviso.style, {
        position: 'fixed',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '100',
        margin: '0',
        color: '#ffffff',
        fontFamily: fuenteGrotesca,
        fontSize: '0.85rem',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
    });
    document.body.appendChild(aviso);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch(rutaManifest)
        .then(respuesta => respuesta.json())
        .then(datos => iniciarPresentacion(datos.imagenes));
    crearCollage();
    crearAvisoContruccion();
    crearMenu();
});

// ── Navegación ─────────────────────────────────────────────────────────────

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