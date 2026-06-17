fetch('./caja-01.yaml')
  .then(response => response.text())
  .then(yamlText => {
    const data = jsyaml.load(yamlText);
    const container = document.querySelector('#divCatalogo');
    const countEl = document.querySelector('#totalCount');
    container.innerHTML = '';

    const articulos = data.catalogo.articulos;
    if (countEl) countEl.textContent = `${articulos.length} piezas`;

    // Preview flotante global
    const preview = document.createElement('div');
    preview.className = 'preview-global';
    preview.innerHTML = '<img class="preview-global-img" alt="" />';
    document.body.appendChild(preview);
    const previewImg = preview.querySelector('.preview-global-img');

    articulos.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'item';

      if (item.imagenes && item.imagenes.length > 0) {
        article.dataset.imagen = item.imagenes[0];
      }

      const codigo = item.codigo;
      const autorxs = item.autorxs ? item.autorxs.join(', ') : '';
      const editoriales = item.editoriales ? item.editoriales.join(', ') : '';

      article.innerHTML = `
        <span class="item-codigo">${codigo}</span>
        <div class="item-body">
          <h2 class="item-titulo">${item.titulo}</h2>
          <div class="item-meta-wrap">
            <div class="item-meta">
              <span class="item-autorxs">${autorxs}</span>
              <span class="item-sep">—</span>
              <span class="item-editorial">${editoriales}</span>
              <span class="item-sep">·</span>
              <span class="item-estado">${item.estado}</span>
            </div>
          </div>
        </div>
        <div class="item-aside">
          <span class="item-agno">${item.agno}</span>
          <div class="item-imagen-wrap"></div>
          <span class="item-ver">ver →</span>
        </div>
      `;

      container.appendChild(article);

      // Mostrar preview grande al hacer hover
      article.addEventListener('mouseenter', () => {

        const urlBaseCaja01 =
  'https://raw.githubusercontent.com/bibliotecaCuir/caja-01/main/';

        const imgPath = article.dataset.imagen;
        if (!imgPath) return;
        previewImg.src = urlBaseCaja01 + imgPath;
        const rect = article.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const half = preview.offsetHeight / 2;
        const clampedY = Math.max(half + 16, Math.min(centerY, window.innerHeight - half - 16));
        preview.style.top = clampedY + 'px';
        preview.classList.add('active');
      });

      article.addEventListener('mouseleave', () => {
        preview.classList.remove('active');
      });

      if (item.imagenes) {
        const imgWrap = article.querySelector('.item-imagen-wrap');
        item.imagenes.slice(0, 1).forEach(imagen => {
          const imgElement = document.createElement('img');
          imgElement.src = `./imagenes/${imagen}`;
          imgElement.alt = item.titulo;
          imgElement.className = 'catalogo-imagen';
          imgElement.loading = 'lazy';
          imgElement.onload = () => {
            const run = () => resizeImage(imgElement, 800, 0.6);
            'requestIdleCallback' in window ? requestIdleCallback(run) : setTimeout(run, 200);
          };
          imgWrap.appendChild(imgElement);
        });
      }
    });
  })
  .catch(error => console.error('Error al cargar el YAML:', error));


function resizeImage(imgElement, maxWidth = 150, quality = 0.7) {
  const lienzo = document.createElement('canvas');
  const escala = maxWidth / imgElement.naturalWidth;
  lienzo.width = maxWidth;
  lienzo.height = imgElement.naturalHeight * escala;
  const ctx = lienzo.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, lienzo.width, lienzo.height);
  imgElement.src = lienzo.toDataURL('image/webp', quality);
}
