let bikeMap; //variable para guardar el mapa

document.addEventListener('DOMContentLoaded',() =>{ //Se hace así para que el div con id bike-map ya exista cuando JavaScript intente crear el mapa
    bikeMap=L.map('bike-map').setView([40.4168, -3.7038],13); //aqui se crea el mapa dentro del div que tenemos 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(bikeMap);
});