let bikeMap; //variable para guardar el mapa
let bikeMarkers =[]; //guarda todos los marcadores que se van creando, para luego borrarlos. 

//Borra del mapa los marcadores anteriores y vacia el array
function clearBikeMarkers(){
    if (bikeMap) {
        bikeMarkers.forEach(marker => bikeMap.removeLayer(marker));
    }
    bikeMarkers =[];
}

//Recibe un aestacion y pone su nombre en el titulo del modal y la informacion en el cuerpo
function showBikeModal(station){
  const modalTitle = document.getElementById('bikeModalLabel');
  const modalBody = document.getElementById('bikeModalBody');
  //const modalElement = document.getElementById('bikeModal');

  modalTitle.textContent = station.name;
  modalBody.innerHTML = 
    `<p><strong>Nombre del punto:</strong> ${station.name}</p>
    <p><strong>Bicis disponibles:</strong> ${station.free_bikes ?? "No disponibles"}</p>
    <p><strong>Huecos libres:</strong> ${station.empty_slots ?? "No disponible"}</p>
    `;
   
    const modal =new bootstrap.Modal(document.getElementById('bikeModal'));
    modal.show();
}
//Devuelve un color segun el numero de bicis disponibles
function getMarkerColor(bikes) {
  if (bikes <= 3) return "red";
  if (bikes <= 7) return "orange";
  return "green";
}

function initBikeMap() {
    if (!bikeMap && document.getElementById('bike-map')) {
        bikeMap = L.map('bike-map').setView([40.4168, -3.7038], 13); 

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(bikeMap);
    }
}

// Cuando se muestra la vista de bicis, recalcula el tamaño del mapa
function showBikeView() {
    initBikeMap();
    if (bikeMap) {
        setTimeout(() => {
            bikeMap.invalidateSize();
        }, 200); 
    }
}

//Busca la ciudad, centra el mapa en esa ciudad y recorre sus estaciones y crea un marcador por cada una 
async function loadBikeCity(cityName) {
    initBikeMap();
    if (!bikeMap) return;

    clearBikeMarkers();

    try {

        //llama a la funcion que pregunta a CityBikes y devuelve las estaciones reales
        const result = await getStationsByCity(cityName);

        //crea un array con lat y long para saber donde poner el marcador
        const stations = result.stations.filter(station =>
            station.latitude != null && station.longitude != null
        );

        if (stations.length === 0) {
            alert(`No hay estaciones disponibles para ${cityName}`);
            return;
        }
        //coge la primera estacion y centra el mapa ahi
        const firstStation = stations[0];
        bikeMap.setView([firstStation.latitude, firstStation.longitude], 13);

        stations.forEach(station => {
            const bikes = station.free_bikes ?? 0;

            const marker = L.circleMarker([station.latitude, station.longitude], {
                radius: 10,
                color: getMarkerColor(bikes),
                fillColor: getMarkerColor(bikes),
                fillOpacity: 0.8,
                weight: 2
            }).addTo(bikeMap);

            //click para abrir el modal de las estaciones
            marker.on('click', () => {
                showBikeModal(station);
            });
            //mete el marcador en el array, para luego poder borrarlo 
            bikeMarkers.push(marker);
        });

    } catch (error) {
        console.error(`Error cargando datos de ${cityName}:`, error);
        alert(`Error cargando datos reales para ${cityName}`);
    }
}

//normaliza el texto por si acaso en vez de madrid es Madrid o algo asi 
function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

//busca en CityBikes que red corresponde a una ciudad
async function getNetworkByCity(cityName) {  
    //peticion a la API para obtener la lista de redes
    const response = await fetch("https://api.citybik.es/v2/networks");

    if (!response.ok) {
        throw new Error("No se pudo obtener la lista de redes");
    }
    //convierte el JSON recibido en un objeto JS
    const data = await response.json();
    const wantedCity = normalizeText(cityName);
    //Busca una red que coincida con la ciudad elegida
    const network = data.networks.find(n => {
        const apiCity = normalizeText(n.location?.city);
        return apiCity.includes(wantedCity) || wantedCity.includes(apiCity);
    });

    if (!network) {
        throw new Error(`No se encontró una red para ${cityName}`);
    }

    return network;
}

//Pide a CitiBikes las estaciones reales de la ciudad
async function getStationsByCity(cityName) {  
    const network = await getNetworkByCity(cityName);

    const response = await fetch(`https://api.citybik.es${network.href}?fields=stations,location,name`);

    if (!response.ok) {
        throw new Error("No se pudo obtener la red seleccionada");
    }

    const data = await response.json();

    return {
        networkName: data.network?.name,
        location: data.network?.location,
        stations: data.network?.stations || []
    };
}




