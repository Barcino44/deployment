getUnlinkedDevices();

async function getUnlinkedDevices() {
    const container = document.getElementById("idDeviceContainer");
    container.innerHTML = "";

    let response = await fetch("https://back-production-5d7a.up.railway.app:8080/admin/clients/unlinkedDevices", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });


    if (!response.ok) {
        throw new Error("Error al obtener dispositivos no vinculados");
    }

    let devices = await response.json();



    // Crear el contenedor con scroll
    let div = document.createElement("div");
    div.style.height = "300px";
    div.style.overflow = "auto";
    div.style.display = "block";
    div.style.width = "100%"; 

    // Crear la tabla
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
    const selectedDevices = new Set();

    devices.forEach(device => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center; padding:10px;">${device.id}</td>
        `;
        tr.classList.add('clickable-row');

        tr.addEventListener("click", function () {
            if (selectedDevices.has(device.id)) {
                selectedDevices.delete(device.id);
                tr.style.backgroundColor = "";
                tr.style.color = "";
            } else {
                selectedDevices.add(device.id);
                tr.style.backgroundColor = "#28a745";
                tr.style.color = "white";
            }
        });
        tbody.appendChild(tr);
    });

    div.appendChild(table);
    container.appendChild(div);
    
    const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.innerHTML = `
            <button type="button" id="btnUnlink" class="btn-action btn-unlink">
                Eliminar Dispositivos
            </button>
        `;
        container.appendChild(buttonContainer);

        document.getElementById("btnUnlink").addEventListener("click", async function () {
            await deleteDevices(Array.from(selectedDevices));
        });
}

async function deleteDevices(deviceIds) {
    if (deviceIds.length === 0) {
        alert("Selecciona al menos un dispositivo para eliminar.");
        return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar a los dispositivos seleccionados?`)) {
        const response = await fetch("https://back-production-5d7a.up.railway.app:8080/admin/devices/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deviceIds)
        }).then(async response => {
            const result = await response.json();
            if (response.status == 200) {
                alert(result.message);
                window.location.reload();
            } else {
            alert(result.message);
            }
        });
    }
}
