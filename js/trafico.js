
let paginaActual = 1;
const FILAS_POR_PAGINA = 10;

function mostrarSidebarTrafico() {
    // 1. Mostrar sidebar
    $('#sidebar').removeClass('d-none');

    // 2. Inyectar formulario en sidebar-content
    $('#sidebar-content').html(`
        <h5>Tráfico Madrid</h5>
        <select id="select-zona" class="form-select mt-2">
            <option value="">-- Elige zona --</option>
            ${ZONAS_TRAFICO.map(z => `<option value="${z.id}">${z.nombre}</option>`).join('')}
        </select>
    `);

    // 3. Limpiar contenido central
    $('#main-content').html('');

    // 4. Escuchar cambios en el select
    $('#select-zona').on('change', function() {
        const zona = $(this).val();
        if (zona) cargarTablaTrafico(zona);
    });
}

//TODO modificar en la fase 2

function cargarTablaTrafico(zona) {
    paginaActual = 1;
    const datos = DATOS_TRAFICO[zona] || [];
    renderTabla(datos);
}

function renderTabla(datos) {
    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    const fin = inicio + FILAS_POR_PAGINA;
    const filasPagina = datos.slice(inicio, fin);
    const totalPaginas = Math.ceil(datos.length / FILAS_POR_PAGINA);

    const filasHTML = filasPagina.map(d => `
        <tr>
            <td>${d.punto}</td>
            <td>${d.intensidad}</td>
            <td>${d.velocidad} km/h</td>
            <td>${d.ocupacion}%</td>
        </tr>
    `).join('');

    $('#main-content').html(`
        <h4 class="mb-3">Concentración de tráfico</h4>
        <table class="table table-striped table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Punto</th>
                    <th>Intensidad (veh/h)</th>
                    <th>Velocidad</th>
                    <th>Ocupación</th>
                </tr>
            </thead>
            <tbody>${filasHTML}</tbody>
        </table>
        <div class="d-flex justify-content-between align-items-center">
            <span>Página ${paginaActual} de ${totalPaginas}</span>
            <div>
                <button class="btn btn-secondary btn-sm me-2" id="btn-anterior" 
                    ${paginaActual === 1 ? 'disabled' : ''}>Anterior</button>
                <button class="btn btn-secondary btn-sm" id="btn-siguiente"
                    ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente</button>
            </div>
        </div>
    `);

    // Botones paginación
    $('#btn-anterior').on('click', function() {
        paginaActual--;
        renderTabla(datos);
    });
    $('#btn-siguiente').on('click', function() {
        paginaActual++;
        renderTabla(datos);
    });
}

// Enganchar al botón del navbar
$('#nav-trafico').on('click', function() {
    mostrarSidebarTrafico();
});