const nameTF = document.getElementById('nameTF')
const passwordTF = document.getElementById('passwordTF')
const emailTF = document.getElementById('emailTF')
const deviceTF = document.getElementById('deviceTF')
const editBTN = document.getElementById('editBTN')
const addDevicesBTN = document.getElementById('addDevicesBTN')
const errorContainer = document.getElementById('errorContainer')
editBTN.addEventListener('click', editClient);
addDevicesBTN.addEventListener('click', addDevices);
const urlParams = new URLSearchParams(window.location.search);
const clienteId = urlParams.get('id');

if (clienteId) {
    document.getElementById('clientId').textContent = clienteId;
}

getClientData();
getUnlinkedDevices();

async function getClientData() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');

    if (!clientId) {
        alert('ID de cliente no válido');
        return;
    }

    let response = await fetch(`http://localhost:8080/admin/clients/${clientId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status == 200) {
        let clientData = await response.json();
        populateForm(clientData);
    } else {
        alert('Error al obtener los datos del cliente');
    }
}

function populateForm(clientData) {
    nameTF.value = clientData.name;
    emailTF.value = clientData.email;
}

async function editClient() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');

    if (!emailTF.value.trim()) {
        alert('Por favor ingrese su correo electrónico');
        return;
    }
    if (!nameTF.value.trim()) {
        alert('Por favor ingrese su nombre');
        return;
    }
    let email = emailTF.value;
    let name = nameTF.value;
    let updateRequest = {
        client: {
            name: name,
            email: email
        },
    };
    let json = JSON.stringify(updateRequest);
    let response = await fetch(`http://localhost:8080/admin/clients/update/${clientId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    });
    let data = await response.json();
    if (response.status == 200) {
        alert('Cliente actualizado con éxito.');
        window.location.href = 'editClient.html?id=' + clientId;
    } else {
        alert(data.message || 'Error al actualizar el cliente.');
    }
}

async function addDevices() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');
    if (!deviceTF.value.trim()) {
        alert('Por favor ingrese almenos un id de dispositivo');
        return;
    }
let deviceIds = deviceTF.value
        .split(";")                     
        .map(id => id.trim())            
        .filter(id => id.length > 0);     


    let json = JSON.stringify(deviceIds);
   let response = await fetch(`http://localhost:8080/admin/clients/addDevicetoClient/${clientId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    });

    let data = await response.json();
    if (response.status == 200) {
        alert('Dispositivos añadidos con éxito.');
        window.location.href = 'editClient.html?id=' + clientId;
    } else {
        alert(data.message || 'Error al añadir dispositivos.');
    }
}

async function getUnlinkedDevices() {
    const container = document.getElementById("idDeviceContainer");
    container.innerHTML = "";

    let response = await fetch("http://localhost:8080/admin/clients/unlinkedDevices", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });


    if (!response.ok) {
        throw new Error("Error al obtener dispositivos no vinculados");
    }

    let devices = await response.json();


    let div = document.createElement("div");
    div.style.height = "300px";
    div.style.overflow = "auto";
    div.style.width = "100%"; 
    div.style.display = "block";

    let table = document.createElement("table");
    table.id = "miTabla";
    table.style.width = "100%";
    table.style.borderCollapse = "separate";

    table.innerHTML = `
        <thead>
            <tr style="position: sticky; top: 0; background: #35ae51; z-index: 999;">
                <th style="text-align:center; padding:10px;">ID</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    devices.forEach(device => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center; padding:10px;">${device.id}</td>
        `;
        tbody.appendChild(tr);
    });

    div.appendChild(table);
    container.appendChild(div);
}

