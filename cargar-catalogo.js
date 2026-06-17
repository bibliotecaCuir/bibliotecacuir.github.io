const cajas = ["caja-01"]

const container = document.querySelector('#divCatalogo');
const countEl = document.querySelector('#totalCount');
container.innerHTML = '';

for (const caja of cajas) {
  fetch(caja + '.yaml')
    .then(response => response.text())
    .then(yamlText => {

      const data = jsyaml.load(yamlText);

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

        if (item.imagen) {
          article.dataset.imagen = item.imagen;
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
            <span class="item-ver">ver →</span>
          </div>
        `;

        container.appendChild(article);

        // Mostrar preview grande al hacer hover
        article.addEventListener('mouseenter', () => {

          const urlBase = 'https://raw.githubusercontent.com/bibliotecaCuir/' + caja + '/main/imagenes/';

          const imgPath = article.dataset.imagen;
          if (!imgPath) return;
          previewImg.src = urlBase + imgPath;
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

      });
    })
    .catch(error => console.error('Error al cargar el YAML:', error));


}


