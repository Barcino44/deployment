const params = new URLSearchParams(window.location.search);
const deviceId = params.get("deviceId");
const btn = document.getElementById('exitButton');
let chart1;
let dps1 = [];
let chart2;
let dps2 = [];

document.addEventListener("DOMContentLoaded", () => {
  // inicializar charts vacíos
  chart1 = initChart(chart1, dps1, "chartContainer");
  chart2 = initChart(chart2, dps2, "chartContainer2");

  // cargar datos
  showTempMeasurements();
  showMoistureMeasurements();
  // mostrar ID del dispositivo
  document.getElementById('id-device').textContent = `Dispositivo ID: ${deviceId}`;
});

document.addEventListener('DOMContentLoaded', () => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // opcional si es <a href="#">
    window.location.href = '../HomeClient/HomeClient.html';
  });
});

function initChart(chart, dps, containerName) {
	chart = new CanvasJS.Chart(containerName, {
		backgroundColor: "white",  // fondo transparente
		animationEnabled: true,          // animación al cargar

		axisX: {
			title: "Hora",
			valueFormatString: "HH:mm",
			labelFontColor: "#000000ff",   // etiquetas visibles
			titleFontColor: "#0b0000ff",   // título eje X visible
			gridColor: "#444"
		},

		axisY: {
			title: "Valor",
			labelFontColor: "#0b0101ff",   // etiquetas visibles
			titleFontColor: "#0b0000ff",   // título eje Y visible
			gridColor: "#444"
		},

		toolTip: {
			shared: true,
			backgroundColor: "rgba(0,0,0,0.7)",
			fontColor: "#fff"
		},

		data: [{
			type: "line",
			lineColor: "#00ff91ff",          // color línea
			lineThickness: 3,              // grosor línea
			markerType: "circle",          // tipo de punto: "circle", "square", "triangle"
			markerSize: 8,                 // tamaño del punto
			markerColor: "#4766ffff",        // color del punto
			dataPoints: dps
		}]
	});

	chart.render();
	return chart;
}

// Llama esto al seleccionar un dispositivo
async function showTempMeasurements() {
	try {
		const response = await fetch(`https://back-production-5d7a.up.railway.app/device/get/tempMeasurements/${deviceId}`);
		if (!response.ok) throw new Error('Error al obtener mediciones');
		const measurements = await response.json();
		updateChartWithMeasurements(measurements, chart1, dps1);
	} catch (error) {
		console.error(error);
		updateChartWithMeasurements([], chart1, dps1);
	}
}
async function showMoistureMeasurements() {
	try {
		const response = await fetch(`https://back-production-5d7a.up.railway.app/device/get/moisMeasurements/${deviceId}`);
		if (!response.ok) throw new Error('Error al obtener mediciones');
		const measurements = await response.json();
		updateChartWithMeasurements(measurements, chart2, dps2);
	} catch (error) {
		console.error(error);
		updateChartWithMeasurements([], chart2, dps2);
	}
}

function updateChartWithMeasurements(measurements, chart, dps) {
	dps.length = 0; // limpiar
	// Suponiendo que measurements es un array de objetos con {id, type, value, time}
	measurements.forEach(m => {
		const date = new Date(m.time);
		// Formato: MM/DD HH:mm
		const label = `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
			`${date.getDate().toString().padStart(2, '0')} ` +
			`${date.getHours().toString().padStart(2, '0')}:` +
			`${date.getMinutes().toString().padStart(2, '0')}`;
		dps.push({
			x: date,
			y: m.value,
			label: label
		});
	});
	if (chart) chart.render();
}
