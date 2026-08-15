# colección

Repositorio de la colección en línea de Biblioteca Cuir.

- `index.html`: catálogo principal.
- `yaml/`: datos fuente de la colección.
- `html/`: fichas estáticas generadas para cada publicación.
- `generar-html-libros.js`: generador de fichas desde los YAML.

Para regenerar las fichas:

```sh
node generar-html-libros.js
```
