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