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

function mostrarSidebarTrafico() {
    $('#sidebar').removeClass('d-none');
    $('.app-view').addClass('d-none');
    $('#traffic-view').removeClass('d-none');

    // Sidebar con el select de zonas
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
    const datos        = todosLosDatos[zona] || [];
    const inicio       = (paginaActual - 1) * FILAS_POR_PAGINA;
    const fin          = inicio + FILAS_POR_PAGINA;
    const filasPagina  = datos.slice(inicio, fin);
    const totalPaginas = Math.ceil(datos.length / FILAS_POR_PAGINA);
    const htmlFilas = plantillaTrafico({ filas: filasPagina });

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

    // Disabled en botones
    if (paginaActual === 1) $('#btn-anterior').prop('disabled', true);
    if (paginaActual === totalPaginas) $('#btn-siguiente').prop('disabled', true);

    // Paginación
    $('#btn-anterior').on('click', function() {
        paginaActual--;
        renderTabla(zona);
    });
    $('#btn-siguiente').on('click', function() {
        paginaActual++;
        renderTabla(zona);
    });
}