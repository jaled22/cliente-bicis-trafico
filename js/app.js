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

        // Llamar a la función de bea
        if (typeof showBikeView === "function") {
            showBikeView();
        } else {
            $("#bike-view").removeClass("d-none");
        }
    });

    // Tráfico (Jaled)
    $("#nav-trafico").on("click", function() {
        hideAllViews();
        $("#sidebar").removeClass("d-none");

        // Meter lo de Jaled aqui 
        $("#sidebar-content").html(`
            <h5>Tráfico</h5>
            <label class="form-label mt-3">Selecciona una zona</label>
            <select id="trafficZoneSelect" class="form-select">
                <option value="centro">Madrid Centro</option>
                <option value="m30">M-30</option>
            </select>
            <button class="btn btn-success mt-3 w-100">Ver tráfico</button>
        `);

        $("#traffic-view").removeClass("d-none");
    });

});