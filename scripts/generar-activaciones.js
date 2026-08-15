const { generarSeccion } = require("./lib/generar-portafolio.js");

function generar() {
  generarSeccion("activaciones");
}

module.exports = { generar };

if (require.main === module) generar();
