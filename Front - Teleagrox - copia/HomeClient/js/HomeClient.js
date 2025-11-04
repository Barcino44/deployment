const client = JSON.parse(localStorage.getItem('client'));
const clientId = Number(client.id);
let deviceStatus = {};
document.addEventListener('DOMContentLoaded', function() {
	getDeviceStatus();
	getDevicesAndRender();
});

async function getDevicesAndRender() {
	const deviceList = document.querySelector('.deviceList');
	if (!deviceList) {
		console.error('No se encontró el elemento .deviceList en el DOM.');
		return;
	}
	try {
		const response = await fetch(`https://back-production-5d7a.up.railway.app/client/get/devices/${clientId}`);
		if (!response.ok) throw new Error('Error al obtener dispositivos');
		const data = await response.json();
		renderDevices(data);
	} catch (error) {
		console.error(error);
		renderDevices([]);
	}
}
async function getDeviceStatus() {
	const response = await fetch(`https://back-production-5d7a.up.railway.app/client/device/get/status/${clientId}`);
	if (!response.ok) throw new Error('Error al obtener el estado del dispositivo');
	deviceStatus = await response.json();
}
function renderDevices(devices) {
    const deviceList = document.querySelector('.deviceList');
    if (!deviceList) return;
    
    deviceList.innerHTML = '';
    
    // Crear contenedor con scroll
    const scrollContainer = document.createElement('div');
    scrollContainer.style.maxHeight = '500px';
	scrollContainer.style.width = '1200px';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.overflowX = 'auto';
    scrollContainer.style.border = '2px solid #666';
    scrollContainer.style.borderRadius = '5px';
    
    // Crear tabla
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.style.backgroundColor = '#1a1a1a';
    
    // Crear encabezado
    table.innerHTML = `
        <thead>
            <tr style="position: sticky; top: 0; background: #2a2a2a; z-index: 999; color: white;">
                <th style="padding: 15px; text-align: center; border-bottom: 2px solid #444; font-weight: bold; text-transform: uppercase; font-size: 18px;">ID</th>
                <th style="padding: 15px; text-align: center; border-bottom: 2px solid #444; font-weight: bold; text-transform: uppercase; font-size: 18px;">Estado</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    devices.forEach((device, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('tabindex', '0');
        tr.setAttribute('data-device-id', device.id);
        tr.style.backgroundColor = index % 2 === 0 ? '#2a2a2a' : '#333333';
        tr.style.color = 'white';
        tr.style.transition = 'all 0.3s ease';
        tr.style.cursor = 'pointer';
        
        const status = deviceStatus[device.id] || 'Desconocido';
        const statusColor = status === 'Conectado' ? '#35ae51' : '#dc3545';
        
        tr.innerHTML = `
            <td style="padding: 15px; text-align: center; border-bottom: 1px solid #444; font-weight: bold;">ID de dispositivo: ${device.id}</td>
            <td style="padding: 15px; text-align: center; border-bottom: 1px solid #444; font-weight: bold; color: ${statusColor};">${status}</td>
        `;
        
        // Hover effect
        tr.addEventListener('mouseenter', function() {
            if (!tr.classList.contains('selected')) {
                tr.style.backgroundColor = '#3a3a3a';
            }
        });
        
        tr.addEventListener('mouseleave', function() {
            if (!tr.classList.contains('selected')) {
                tr.style.backgroundColor = index % 2 === 0 ? '#2a2a2a' : '#333333';
            }
        });
        
        // Click event
        tr.addEventListener('click', function() {
            handleDeviceSelect(device.id, tr);
        });
        
        // Keyboard event (Enter or Space)
        tr.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDeviceSelect(device.id, tr);
            }
        });
        
        tbody.appendChild(tr);
    });
    
    scrollContainer.appendChild(table);
    deviceList.appendChild(scrollContainer);
}

// Variable para almacenar la fila seleccionada
let selectedDeviceRow = null;
async function handleDeviceSelect(deviceId) {
	window.location.href = `../deviceView/index.html?deviceId=${deviceId}`;
}

// Renderizar dispositivos al cargar la página
