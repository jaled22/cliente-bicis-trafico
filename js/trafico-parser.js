//como no hay json directamente, pues parseo el xml

const URL_XML_TRAFICO = 'https://datos.madrid.es/dataset/202087-0-trafico-intensidad/resource/202087-0-trafico-intensidad/download/202087-0-trafico-intensidad.xml';

async function cargarDatosTraficoXML() {
    const response = await fetch(URL_XML_TRAFICO);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    const nodos = xmlDoc.querySelectorAll('pm');

    const datos = Array.from(nodos)
        .filter(pm => pm.querySelector('error')?.textContent.trim() === 'N') // descarta mediciones con error
        .map(pm => ({
            punto: pm.querySelector('descripcion')?.textContent.trim() || '—',
            intensidad: parseInt(pm.querySelector('intensidad')?.textContent) || 0,
            ocupacion: parseInt(pm.querySelector('ocupacion')?.textContent) || 0,
            carga: parseInt(pm.querySelector('carga')?.textContent) || 0,
        }))

    return datos;
}