let bikeMap; //variable para guardar el mapa
let bikeMarkers =[]; //guarda todos los marcadores que se van creando, para luego borrarlos. 

//Borra del mapa los marcadores anteriores y vacia el array
function clearBikeMarkers(){
    bikeMarkers.forEach(marker => bikeMap.removeLayer(marker));
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

function getMarkerColor(bikes) {
  if (bikes <= 3) return "red";
  if (bikes <= 7) return "orange";
  return "green";
}

//Busca la ciudad, centra el mapa en esa ciudad y recorre sus estaciones y crea un marcador por cada una 
async function loadBikeCity(cityName) {
    if (!bikeMap) return;

    clearBikeMarkers();

    try {
        const result = await getStationsByCity(cityName);

        const stations = result.stations.filter(station =>
            station.latitude != null && station.longitude != null
        );

        if (stations.length === 0) {
            alert(`No hay estaciones disponibles para ${cityName}`);
            return;
        }

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

            marker.on('click', () => {
                showBikeModal(station);
            });

            bikeMarkers.push(marker);
        });

    } catch (error) {
        console.error(`Error cargando datos de ${cityName}:`, error);
        alert(`Error cargando datos reales para ${cityName}`);
    }
}

// Cuando se muestra la vista de bicis, recalcula el tamaño del mapa
function showBikeView() {
    if (bikeMap) {
        setTimeout(() => {
            bikeMap.invalidateSize();
        }, 200);
    }
}

document.addEventListener('DOMContentLoaded',() =>{ //Se hace así para que el div con id bike-map ya exista cuando JavaScript intente crear el mapa
    bikeMap=L.map('bike-map').setView([40.4168, -3.7038],13); //aqui se crea el mapa dentro del div que tenemos 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(bikeMap);

    //testStationsByCity("Madrid");

    const citySelect = document.getElementById('citySelect');


    //detecta cuando se cambia la ciudad en el despegable
    citySelect.addEventListener('change', (e) => {
        const city = e.target.value;

        if (!city) {
            clearBikeMarkers();
            return;
        }

        loadBikeCity(city);
  });

});

function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

//busca en CityBikes que red corresponde a una ciudad
async function getNetworkByCity(cityName) {  
    const response = await fetch("https://api.citybik.es/v2/networks");

    if (!response.ok) {
        throw new Error("No se pudo obtener la lista de redes");
    }

    const data = await response.json();
    const wantedCity = normalizeText(cityName);

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

//Funcion de prueba para ver en consola las estaciones reales
async function testStationsByCity(cityName) {
    try {
        const result = await getStationsByCity(cityName);
        console.log(`Resultado completo para ${cityName}:`, result);
        console.log(`Nombre de la red:`, result.networkName);
        console.log(`Localización:`, result.location);
        console.log(`Estaciones:`, result.stations);
        console.log(`Número de estaciones:`, result.stations.length);
    } catch (error) {
        console.error(`Error obteniendo estaciones de ${cityName}:`, error);
    }
}


