document.addEventListener('DOMContentLoaded', function () {
    var formulario = document.getElementById('donacion-formulario');
    if (!formulario) return;

    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        var nombre = formulario.donante_nombre.value.trim();
        var correo = formulario.donante_email.value.trim();
        var tipo = formulario.tipo_donacion.value;
        var queDonar = formulario.que_donar.value.trim();
        var tipoTexto = tipo === 'directa' ? 'Donación directa' : 'Donación indirecta';

        var asunto = 'Donación: ' + nombre;
        var cuerpo = [
            'Nombre: ' + nombre,
            'Correo: ' + correo,
            'Tipo de donación: ' + tipoTexto,
            '',
            '¿Qué quiere donar?',
            queDonar
        ].join('\n');

        window.location.href = 'mailto:bibliotecacuir@gmail.com'
            + '?subject=' + encodeURIComponent(asunto)
            + '&body=' + encodeURIComponent(cuerpo);
    });
});
