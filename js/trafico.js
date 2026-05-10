const urlPlantilla = 'template/trafico.html';
const urlDatos     = 'json/trafico.json';

const ZONAS_TRAFICO = [
    { id: "centro",    nombre: "Centro" },
    { id: "retiro",    nombre: "Retiro" },
    { id: "salamanca", nombre: "Salamanca" },
];

let plantillaTrafico;
let todosLosDatos;
let paginaActual = 1;
const FILAS_POR_PAGINA = 10;

$(document).ready(function() {

    // 1. Cargar plantilla
    $.get(urlPlantilla)
        .done(function(data) {
            plantillaTrafico = Handlebars.compile($(data).html());

            // 2. Cargar datos JSON
            $.getJSON(urlDatos)
                .done(function(data) {
                    todosLosDatos = data;
                })
                .fail(function() {
                    console.error('Error al cargar datos trafico.json');
                });
        })
        .fail(function() {
            console.error('Error al cargar template/trafico.html');
        });

});

//función para mostrar el sidebar de tablas tráfico
function mostrarSidebarTrafico() {
    $('#sidebar').removeClass('d-none');
    $('.app-view').addClass('d-none');
    $('#traffic-view').removeClass('d-none');

    //sidebar con el select de zonas y map recorre el array de zonas
    $('#sidebar-content').html(`
        <h5 class="mb-3">Tráfico Madrid</h5>
        <label class="form-label">Selecciona una zona</label>
        <select id="select-zona" class="form-select">
            <option value="">-- Elige zona --</option>
            ${ZONAS_TRAFICO.map(z => `<option value="${z.id}">${z.nombre}</option>`).join('')}
        </select>
    `);

    $('#tabla-container').html('');

    $('#select-zona').on('change', function() {
        const zona = $(this).val();
        if (zona) {
            paginaActual = 1;
            renderTabla(zona);
        }
    });
}

function renderTabla(zona) {
    const datos        = todosLosDatos[zona] || []; //accede al array de la zona elegida y si no existe, devuelve un array vacío
    const inicio       = (paginaActual - 1) * FILAS_POR_PAGINA;
    const fin          = inicio + FILAS_POR_PAGINA;     //inicio y fin calculan el rango de filas a mostrar --> página 1: 0-10, página 2: 10-20
    const filasPagina  = datos.slice(inicio, fin);      //slice para "cortar" el array y obtener solo las filas de la página actual
    const totalPaginas = Math.ceil(datos.length / FILAS_POR_PAGINA);    //calcula el total de páginas redondeando hacia arriba
    const htmlFilas = plantillaTrafico({ filas: filasPagina });     //genera el HTML de las filas usando la plantilla Handlebars y pasando las filas de la página actual

    $('#tabla-container').html(`
        <table class="table table-striped table-bordered shadow-sm">
            <thead class="table-dark">
                <tr>
                    <th>Punto</th>
                    <th>Intensidad (veh/h)</th>
                    <th>Velocidad</th>
                    <th>Ocupación</th>
                </tr>
            </thead>
            <tbody>${htmlFilas}</tbody>
        </table>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="text-muted">Página ${paginaActual} de ${totalPaginas}</span>
            <div>
                <button class="btn btn-secondary btn-sm me-2" id="btn-anterior">Anterior</button>
                <button class="btn btn-secondary btn-sm" id="btn-siguiente">Siguiente</button>
            </div>
        </div>
    `);

    //botones para navegar en caso de que haya más contenido y no entre en 10 filas
    //disabled en botones en los extremos (primera y última página)
    if (paginaActual === 1) $('#btn-anterior').prop('disabled', true);
    if (paginaActual === totalPaginas) $('#btn-siguiente').prop('disabled', true);

    //paginación
    $('#btn-anterior').on('click', function() {
        paginaActual--;
        renderTabla(zona);
    });
    $('#btn-siguiente').on('click', function() {
        paginaActual++;
        renderTabla(zona);
    });
}