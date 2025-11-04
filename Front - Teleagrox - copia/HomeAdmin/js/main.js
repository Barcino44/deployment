const clientContainer = document.getElementById("clientsContainer");
const errorContainer = document.getElementById("errorContainer");
let selectedRow = null;
let selectedClient = null;

getClientList();
loadClientErrors();

async function getClientList() {
    let response = await fetch("https://back-production-5d7a.up.railway.app/admin/clients", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    let clients = await response.json();
    clientContainer.innerHTML = '';

    if (response.status == 200) {
        if (clients.length === 0) {
            return;
        }
        let div = document.createElement("div");
        div.style.height = "275px";
        div.style.overflow = "auto";

        let table = document.createElement("table");
        table.id = "miTabla";
        table.style.width = "100%";
        table.style.borderCollapse = "separate";

        table.innerHTML = `
            <thead>
                <tr style="position: sticky; top: 0; background: #35ae51; z-index: 999;">
                    <th>ID</th><th>NOMBRE</th><th colspan="2">CORREO</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        div.appendChild(table);
        clientContainer.appendChild(div);

        clients.forEach(client => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${client.id}</td>
                <td>${client.name}</td>
                <td colspan="2">${client.email}</td>
            `;
            tr.classList.add('clickable-row');
            tr.addEventListener('click', function () {
                if (selectedRow) {
                    selectedRow.classList.remove('selected');
                    selectedRow.style.backgroundColor = '';
                    selectedRow.style.color = '';
                }
                selectedRow = tr;
                selectedClient = client;
                tr.classList.add('selected');
                tr.style.backgroundColor = '#28a745'; 
                tr.style.color = 'white'; 
            });
            tbody.appendChild(tr);
        });

        let buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.innerHTML = `
            <button type="button" id="btnEdit" class="btn-action btn-edit">Editar</button>
            <button type="button" id="btnMonitor" class="btn-action btn-monitor">Monitorear</button>
            <button type="button" id="btnDelete" class="btn-action btn-delete">Eliminar</button>
        `;
        clientContainer.appendChild(buttonContainer);

        document.getElementById("btnEdit").addEventListener("click", function () {
            editClient(selectedClient);
        });

        document.getElementById("btnMonitor").addEventListener("click", function () {
            monitorClient(selectedClient);
        });

        document.getElementById("btnDelete").addEventListener("click", function () {
            if (!selectedClient) {
                alert("Selecciona un cliente antes de eliminar.");
                return;
            }
            deleteClient(selectedClient);
        });

    } else {
        clientContainer.innerHTML = '<p style="color:red;">No se pudieron cargar los clientes.</p>';
    }
}

async function deleteClient(selectedClient) {
    if (!selectedClient) {
        alert('Por favor seleccione un cliente para eliminar.');
        return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar al cliente ${selectedClient.name}?`)) {
        fetch(`https://back-production-5d7a.up.railway.app/admin/clients/delete/${selectedClient.email}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status == 200) {
                alert('Cliente eliminado con éxito.');
                window.location.reload();
            } else {
                alert('Error al eliminar el cliente.');
            }
        });
    }
}

async function editClient(selectedClient) {
    if (!selectedClient) {
        alert('Por favor seleccione un cliente para editar.');
        return;
    }
    window.location.href = `../EditClient/editClient.html?id=${selectedClient.id}`;
}

async function monitorClient(selectedClient) {
    if (!selectedClient) {
        alert('Por favor seleccione un cliente para monitorear.');
        return;
    }
    window.location.href = `../MonitorClient/monitorClient.html?id=${selectedClient.id}`;
}

async function loadClientErrors() {
    let response = await fetch("https://back-production-5d7a.up.railway.app/admin/errors", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Error al obtener errores del dispositivo");
    }

    let errors = await response.json();

    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = "";

    if (errors.length !== 0) {
        let div = document.createElement("div");
        div.style.paddingTop = "0px";
        div.style.height = "350px";
        div.style.overflow = "auto";

        let table = document.createElement("table");
        table.id = "miTabla1";
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
                <td style="text-align: center;">${error.id}</td>
                <td colspan="2">${error.message}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    

}
