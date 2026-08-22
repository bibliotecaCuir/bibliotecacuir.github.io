const { generarSeccion } = require("./lib/generar-portafolio.js");

function generar() {
  generarSeccion("otros");
}

module.exports = { generar };

if (require.main === module) generar();
