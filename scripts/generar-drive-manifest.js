const fs = require("fs");
const path = require("path");
const yaml = require("../lib/js-yaml.min.js");

const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "assets", "portafolio", "drive-manifest.json");

const CATEGORIAS = ["practicas", "activaciones", "obras", "otros"];

function generar() {
  const entries = {};

  CATEGORIAS.forEach((categoria) => {
    const yamlPath = path.join(ROOT, "datos", `${categoria}.yaml`);
    const proyectos = yaml.load(fs.readFileSync(yamlPath, "utf8"));

    proyectos.forEach((proyecto) => {
      entries[`${categoria}/${proyecto.slug}`] = { title: proyecto.titulo || proyecto.slug };
    });
  });

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify({ entries }, null, 2)}\n`);
  console.log(`Generado assets/portafolio/drive-manifest.json con ${Object.keys(entries).length} entradas.`);
}

module.exports = { generar };

if (require.main === module) generar();
