const urlPlantilla = 'template/trafico.html';
const urlDatos = 'json/trafico.json'; //https://datos.madrid.es/dataset/202087-0-trafico-intensidad/resource/202087-0-trafico-intensidad/download/202087-0-trafico-intensidad.xml

const ZONAS_TRAFICO = [
    { id: "centro", nombre: "Centro" },
    { id: "retiro", nombre: "Retiro" },
    { id: "salamanca", nombre: "Salamanca" },
];

const ZONAS_KEYWORDS = {
    centro: ["Gran Via", "Sol", "Mayor", "Alcala", "Sevilla", "Barquillo", "Montera", "Preciados", "Arenal", "Fuencarral"],
    retiro: ["Retiro", "Menendez Pelayo", "Ibiza", "Pacifico", "O'Donnell", "Doctor Esquerdo", "Narvaez", "Sainz de Baranda"],
    salamanca: ["Serrano", "Goya", "Velazquez", "Principe Vergara", "Hermosilla", "Lagasca", "Jorge Juan", "Ayala", "Castelló", "Lista"]
};

let plantillaTrafico;
let todosLosDatos = [];
let paginaActual = 1;
const FILAS_POR_PAGINA = 10;

/**
$(document).ready(function () {

    // 1. Cargar plantilla
    $.get(urlPlantilla)
        .done(function (data) {
            plantillaTrafico = Handlebars.compile($(data).html());

            // 2. Cargar datos JSON
            $.getJSON(urlDatos)
                .done(function (data) {
                    todosLosDatos = data;
                })
                .fail(function () {
                    console.error('Error al cargar datos trafico.json');
                });
        })
        .fail(function () {
            console.error('Error al cargar template/trafico.html');
        });

});
*/

//cargar plantilla
$(document).ready(function () {
    $.get(urlPlantilla)
        .done(function (data) {
            plantillaTrafico = Handlebars.compile($(data).html());
        })
        .fail(function () {
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
        <p id="estado-carga" class="text-muted small mt-2"></p>  <!-- estado de carga -->
    `);

    $('#tabla-container').html('');

    // Cargar datos solo si aún no se han pedido
    if (todosLosDatos.length === 0) {
        $('#estado-carga').text('Cargando datos en tiempo real...');
        cargarDatosTraficoXML()
            .then(datos => {
                todosLosDatos = datos;
                $('#estado-carga').text(`${datos.length} sensores cargados.`);
            })
            .catch(err => {
                console.error('Error al cargar XML:', err);
                $('#estado-carga').text('Error al cargar los datos.');
            });
    }

    $('#select-zona').on('change', function () {
        const zona = $(this).val();
        if (zona) {
            paginaActual = 1;
            renderTabla(zona);
        }
    });
}

function filtrarPorZona(zona) {
    const keywords = ZONAS_KEYWORDS[zona] || [];
    return todosLosDatos.filter(d =>
        keywords.some(kw => d.punto.toLowerCase().includes(kw.toLowerCase()))
    );
}


function renderTabla(zona) {
    //const datos = todosLosDatos[zona] || []; //accede al array de la zona elegida y si no existe, devuelve un array vacío
    const datos = filtrarPorZona(zona);
    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    const fin = inicio + FILAS_POR_PAGINA;     //inicio y fin calculan el rango de filas a mostrar --> página 1: 0-10, página 2: 10-20
    const filasPagina = datos.slice(inicio, fin);      //slice para "cortar" el array y obtener solo las filas de la página actual
    const totalPaginas = Math.ceil(datos.length / FILAS_POR_PAGINA);    //calcula el total de páginas redondeando hacia arriba
    const htmlFilas = plantillaTrafico({ filas: filasPagina });     //genera el HTML de las filas usando la plantilla Handlebars y pasando las filas de la página actual

    $('#tabla-container').html(`
        <table class="table table-striped table-bordered shadow-sm">
            <thead class="table-dark">
                <tr>
                    <th>Punto</th>
                    <th>Intensidad (veh/h)</th>
                    <th>Ocupación (%)</th>
                    <th>Carga (%)</th>
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
    $('#btn-anterior').on('click', function () {
        paginaActual--;
        renderTabla(zona);
    });
    $('#btn-siguiente').on('click', function () {
        paginaActual++;
        renderTabla(zona);
    });
}