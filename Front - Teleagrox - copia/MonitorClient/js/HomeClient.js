const errorContainer = document.getElementById('errorContainer')
let selectedRow = null;
let selectedDevice = null;
const urlParams = new URLSearchParams(window.location.search);
const clienteId = urlParams.get('id');

if (clienteId) {
    document.getElementById('clientId').textContent = clienteId;
}

loadDeviceErrors();
showDeviceStatus()


async function loadDeviceErrors() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');
    let response = await fetch(`http://localhost:8080/admin/errors/${clientId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error("Error al obtener errores del dispositivo");
    }
        let errors = await response.json();
        if (errors.length !== 0) {
        let div = document.createElement("div");
        div.style.paddingTop = "0px";
        div.style.height = "300px";
        div.style.overflow = "auto";

        let table = document.createElement("table");
        table.id = "miTabla";
        table.style.width = "100%";
        table.style.borderCollapse = "separate";

        table.innerHTML = `
            <thead>
                <tr style="position: sticky; top: 0; background: #35ae51; z-index: 999; padding-bottom: 30px;">
                    <th style="text-align: center;">ID</th>
                    <th colspan="2" style="text-align: center;">MENSAJE</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;


        const tbody = table.querySelector('tbody');
        div.appendChild(table);
        errorContainer.appendChild(div);

        errors.forEach(error => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${error.id}</td>
                <td colspan="2">${error.message}</td>
            `;
            tbody.appendChild(tr);
        });
        document.getElementById("errorContainer").innerHTML = html;

        }

}

async function showDeviceStatus() {
    const deviceContainer = document.getElementById("deviceContainer");
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get("id");

    deviceContainer.innerHTML = "";

    let response = await fetch(`http://localhost:8080/admin/errors/${clientId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        throw new Error("Error al obtener errores del dispositivo");
    }

    let errors = await response.json();

    const deviceErrors = {};
    errors.forEach(error => {
        if (!deviceErrors[error.deviceId]) {
            deviceErrors[error.deviceId] = 0;
        }
        deviceErrors[error.deviceId]++;
    });
    if (Object.keys(deviceErrors).length !== 0) {
        const div = document.createElement("div");
        div.style.paddingTop = "0px";
        div.style.height = "300px";
        div.style.overflow = "auto";

        const table = document.createElement("table");
        table.id = "miTabla2";
        table.style.width = "100%";
        table.style.borderCollapse = "separate";


        const thead = document.createElement("thead");

        
        thead.innerHTML = `
            <tr style="position: sticky; top: 0; background: #35ae51; z-index: 999;">
                <th style="text-align: center; padding: 10px;">ID DISPOSITIVO</th>
                <th style="text-align: center; padding: 10px;">ESTADO</th>
            </tr>
        `;
        const tbody = document.createElement("tbody");
        const selectedDevices = new Set();

        // Generar filas
        for (const [deviceId, errorCount] of Object.entries(deviceErrors)) {
            const tr = document.createElement("tr");

            let icon = "✓";
            if (errorCount === 1) icon = "⚠";
            else if (errorCount > 1) icon = "✗";

            tr.innerHTML = `
                <td style="text-align: center; padding: 10px;">${deviceId}</td>
                <td style="text-align: center; padding: 10px; font-size: 24px;">${icon}</td>
            `;

            tr.classList.add("clickable-row");

            tr.addEventListener("click", function () {
                if (selectedDevices.has(deviceId)) {
                    selectedDevices.delete(deviceId);
                    tr.style.backgroundColor = "";
                    tr.style.color = "";
                } else {
                    selectedDevices.add(deviceId);
                    tr.style.backgroundColor = "#28a745";
                    tr.style.color = "white";
                }
            });

            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        div.appendChild(table);
        deviceContainer.appendChild(div);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.innerHTML = `
            <button type="button" id="btnUnlink" class="btn-action btn-unlink">
                Desvincular Dispositivos
            </button>
        `;
        deviceContainer.appendChild(buttonContainer);

        document.getElementById("btnUnlink").addEventListener("click", async function () {
            await deleteDevices(clientId, Array.from(selectedDevices));
            await showDeviceStatus();
        });
    }
}

async function deleteDevices(clientId, deviceIds) {
    if (deviceIds.length === 0) {
        alert("Selecciona al menos un dispositivo para desvincular.");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/admin/clients/unlinkDevice", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idClient: clientId,
                deviceIds: deviceIds
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message || "Dispositivos desvinculados exitosamente.");
            window.location.reload();
        } else {
            alert(result.message || "Error al desvincular dispositivos.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor.");
    }
}
