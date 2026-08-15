const { generarSeccion } = require("./lib/generar-portafolio.js");

function generar() {
  generarSeccion("obras");
}

module.exports = { generar };

if (require.main === module) generar();
