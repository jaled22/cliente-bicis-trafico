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
  const modalElement = document.getElementById('bikeModal');

  console.log("Título:", modalTitle);
  console.log("Cuerpo:", modalBody);
  console.log("Modal:", modalElement);
  console.log("Bootstrap:", typeof bootstrap);

  modalTitle.textContent = station.name;
  modalBody.innerHTML = 
    `<p><strong>Nombre del punto:</strong> ${station.name}</p>
    <p><strong>Bicis disponibles:</strong> ${station.bikes}</p>`;
   

    const modal =new bootstrap.Modal(document.getElementById('bikeModal'));
    modal.show();
}

function getMarkerColor(bikes) {
  if (bikes <= 3) return "red";
  if (bikes <= 7) return "orange";
  return "green";
}

//Busca la ciudad, centra el mapa en esa ciudad y recorre sus estaciones y crea un marcador por cada una 
function loadBikeCity(cityName){
    const city =bikeCities[cityName];
    if (!city) return;

  bikeMap.setView(city.center, city.zoom);
  clearBikeMarkers();

  city.stations.forEach(station => {
    const marker = L.circleMarker(station.coords,{
        radius: 10, //tamaño circulo
        color: getMarkerColor(station.bikes), //pone el color del borde y del relleno segun el numero de bicis
        fillColor: getMarkerColor(station.bikes),
        fillOpacity: 0.8, 
        weight: 2
    }).addTo(bikeMap);
    
    marker.on('click',() =>{    //esto hace que cuando se pulse el marcador se ejecute showBikeModal
        showBikeModal(station);
    });

    bikeMarkers.push(marker);
  });
}

document.addEventListener('DOMContentLoaded',() =>{ //Se hace así para que el div con id bike-map ya exista cuando JavaScript intente crear el mapa
    bikeMap=L.map('bike-map').setView([40.4168, -3.7038],13); //aqui se crea el mapa dentro del div que tenemos 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(bikeMap);

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