const nameTF = document.getElementById('nameTF')
const passwordTF = document.getElementById('passwordTF')
const emailTF = document.getElementById('emailTF')
const deviceTF = document.getElementById('deviceTF')
const RegisterBTN = document.getElementById('loginBTN')
RegisterBTN.addEventListener('click', register);

getUnlinkedDevices();

async function register() {
if (!emailTF.value.trim()) {
        alert('Por favor ingrese su correo electrónico');
        return;
    }

    if (!passwordTF.value.trim()) {
        alert('Por favor ingrese su contraseña');
        return;
    }

    if (!nameTF.value.trim()) {
        alert('Por favor ingrese su nombre');
        return;
    }

    let email = emailTF.value.trim();
    let password = passwordTF.value.trim();
    let name = nameTF.value.trim();
    let deviceIds = deviceTF.value
        .split(";")                     
        .map(id => id.trim())            
        .filter(id => id.length > 0);     

    let registerRequest = {
        client: {
            name: name,
            email: email,
            password: password
        },
        idDevices: deviceIds 
    };
    let json = JSON.stringify(registerRequest);
    let response = await fetch(`https://back-production-5d7a.up.railway.app/admin/registerClient`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    });
    let data = await response.json();
    if (response.status == 200) {
        alert(data.message || 'cliente registrado con éxito.');
        window.location.href = '../HomeAdmin/home.html';
    } else {
        alert(data.message || 'Error al registrar el cliente.');
    }
}

async function getUnlinkedDevices() {
    const container = document.getElementById("idDeviceContainer");
    container.innerHTML = "";

    let response = await fetch("https://back-production-5d7a.up.railway.app/admin/clients/unlinkedDevices", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error("Error al obtener dispositivos no vinculados");
    }

    let devices = await response.json();

    // Si llega vacío aunque sea 200
    if (!devices || devices.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#35ae51; padding:20px;">✓ No hay dispositivos sin asignar</p>';
        return;
    }

    // Crear el contenedor con scroll
    let div = document.createElement("div");
    div.style.height = "300px";
    div.style.overflow = "auto";
    div.style.display = "block";
    div.style.width = "100%"; 

    // Crear la tabla
    let table = document.createElement("table");
    table.id = "miTabla";
    table.style.borderCollapse = "separate";
    table.style.width = "100%";

    table.innerHTML = `
        <thead>
            <tr style="position: sticky; top: 0; background: #35ae51; z-index: 999;">
                <th style="text-align:center; padding:10px;">ID</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    // Agregar filas
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
