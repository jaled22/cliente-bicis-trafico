$(document).ready(function() {

    // Oculto las secciones
    function hideAllViews() {
        $(".app-view").addClass("d-none"); 
        $("#sidebar").addClass("d-none");
    }

    // Si le damos al logo muestra la descripcion de la empresa y el manuel del usuario 
    $("#btn-logo").on("click", function(e) {
        e.preventDefault();
        hideAllViews();
        $("#inicio-view").removeClass("d-none");
    });

    // Alquiler de bicis
    $("#nav-bicis").on("click", function() {
        hideAllViews(); // Quita el manual de la pantalla
        $("#sidebar").removeClass("d-none"); 
        $("#bike-view").removeClass("d-none");

        // meter lo de bea
        $("#sidebar-content").html(`
            <h5>Bicicletas</h5>
            <label for="citySelect" class="form-label mt-3">Selecciona una ciudad</label>
            <select id="citySelect" class="form-select">
                <option value="">Elige una ciudad</option>
                <option value="Madrid">Madrid</option>
                <option value="Valencia">Valencia</option>
                <option value="Sevilla">Sevilla</option>
            </select>

            <div class="mt-4 p-3 bg-white border rounded shadow-sm">
                <h6 class="fw-bold mb-2">Disponibilidad de bicicletas</h6>
                <p class="text-muted small mb-3">
                    El color del marcador indica cuántas bicis hay disponibles en cada punto.
                </p>

                <div class="d-flex align-items-center mb-3">
                    <span style="width:16px; height:16px; border-radius:50%; background-color:red; display:inline-block; border:1px solid #333; margin-right:10px;"></span>

                    <div>
                        <div class="fw-semibold">Baja disponibilidad</div>
                        <div class="text-muted small">0 a 3 bicis disponibles</div>
                    </div>
                </div>

                <div class="d-flex align-items-center mb-3">
                    <span style="width:16px; height:16px; border-radius:50%; background-color:orange; display:inline-block; border:1px solid #333; margin-right:10px;"></span>
                    <div>
                        <div class="fw-semibold">Disponibilidad media</div>
                        <div class="text-muted small">4 a 7 bicis disponibles</div>
                    </div>
                </div>

                <div class="d-flex align-items-center">
                    <span style="width:16px; height:16px; border-radius:50%; background-color:green; display:inline-block; border:1px solid #333; margin-right:10px;"></span>
                    <div>
                        <div class="fw-semibold">Alta disponibilidad</div>
                        <div class="text-muted small">8 o más bicis disponibles</div>
                    </div>
                </div>
            </div>
        `);

        $("#citySelect").on("change", function() {
            const city = $(this).val();
            if (city && typeof loadBikeCity === "function") {
                loadBikeCity(city);
            }
         });

         if (bikeMap) {
            setTimeout(function() {
                bikeMap.invalidateSize();
            }, 200); // Le damos un margen de 200ms para que Bootstrap termine de mostrar el div
        }

        // Llamar a la función de bea
        if (typeof showBikeView === "function") {
            showBikeView();
        } else {
            $("#bike-view").removeClass("d-none");
        }
    });

    $("#nav-trafico").on("click", function() {
    hideAllViews();
    mostrarSidebarTrafico();
});

});