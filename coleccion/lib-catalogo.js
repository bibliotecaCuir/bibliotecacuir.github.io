const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");

const YAML_DIR = path.join(__dirname, "yaml");

const catalogosYaml = [
  "caja-01",
  "caja-02",
  "caja-03",
  "caja-04",
  "caja-05",
  "caja-06",
  "caja-07",
  "caja-08",
  "caja-09",
  "caja-10",
  "grafica-01",
  "grafica-02",
  "grafica-03",
  "grafica-04",
];

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function valorLista(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean).join(", ");
  return valor || "";
}

function esDato(valor) {
  const dato = normalizar(valor);
  return Boolean(dato && dato !== "no aplica" && dato !== "desconocido" && dato !== "s/f");
}

function crearSlug(item, caja, index) {
  const codigo = String(item.codigo || "").trim();
  const base = codigo && normalizar(codigo) !== "no aplica"
    ? `${codigo}-${index + 1}`
    : `${item.titulo || "pieza"}-${caja}-${index + 1}`;

  return normalizar(base)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `pieza-${caja}-${index + 1}`;
}

function clavePublicacion(item) {
  return [
    item.titulo,
    valorLista(item.autorxs),
    item.editorial || item.editoriales,
    item.agno,
  ]
    .map((valor) => normalizar(valor).replace(/[^a-z0-9]+/g, " "))
    .join("|");
}

function imageUrl(item, caja) {
  return item.imagen
    ? `https://raw.githubusercontent.com/bibliotecaCuir/coleccion-imagenes/main/${caja}/${item.imagen}`
    : "";
}

function imageUrlPreview(item, caja) {
  if (!item.imagen) return "";
  const nombreWebp = item.imagen.replace(/\.[^.]+$/, ".webp");
  return `https://raw.githubusercontent.com/bibliotecaCuir/coleccion-imagenes/main/webp/${caja}/${nombreWebp}`;
}

function leerCatalogos() {
  const publicaciones = new Map();

  catalogosYaml.forEach((caja) => {
    const filePath = path.join(YAML_DIR, `${caja}.yaml`);
    const data = yaml.load(fs.readFileSync(filePath, "utf8"));
    const articulos = data?.catalogo?.articulos || [];

    articulos.forEach((item, index) => {
      if (!String(item?.titulo || item?.codigo || "").trim()) return;
      if (item?.privado === true) return;
      const clave = clavePublicacion(item);
      if (!publicaciones.has(clave)) {
        publicaciones.set(clave, {
          item,
          caja,
          index,
          slug: crearSlug(item, caja, index),
        });
      }
    });
  });

  return [...publicaciones.values()];
}

module.exports = {
  catalogosYaml,
  normalizar,
  escaparHTML,
  valorLista,
  esDato,
  crearSlug,
  clavePublicacion,
  imageUrl,
  imageUrlPreview,
  leerCatalogos,
};
