function loadClientsPage() {
    
    loadClients();
}

function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const tableBody = document.getElementById('clientsTable');
    tableBody.innerHTML = '';
    
    if (clients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucun client enregistré</td></tr>';
        return;
    }
    
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.nom}</td>
            <td>${client.prenom}</td>
            <td>${client.telephone}</td>
            <td>${client.email || '-'}</td>
            <td>${client.adresse || '-'}</td>
            <td class="actions">
                <button class="btn-warning" onclick="editClient(${client.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteClient(${client.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openClientModal(client = null) {
    document.getElementById('clientModal').classList.add('active');
    if (client) {
        document.getElementById('modalTitleClient').textContent = 'Modifier un Client';
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientNom').value = client.nom;
        document.getElementById('clientPrenom').value = client.prenom;
        document.getElementById('clientTelephone').value = client.telephone;
        document.getElementById('clientEmail').value = client.email || '';
        document.getElementById('clientAdresse').value = client.adresse || '';
    } else {
        document.getElementById('modalTitleClient').textContent = 'Ajouter un Client';
        document.getElementById('clientId').value = '';
        document.getElementById('clientNom').value = '';
        document.getElementById('clientPrenom').value = '';
        document.getElementById('clientTelephone').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAdresse').value = '';
    }
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('active');
}

function saveClient() {
    const id = document.getElementById('clientId').value;
    const nom = document.getElementById('clientNom').value;
    const prenom = document.getElementById('clientPrenom').value;
    const telephone = document.getElementById('clientTelephone').value;
    const email = document.getElementById('clientEmail').value;
    const adresse = document.getElementById('clientAdresse').value;
    
    if (!nom || !prenom || !telephone) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const nextIdData = JSON.parse(localStorage.getItem('nextId'));
    
    if (id) {
        const index = clients.findIndex(c => c.id == id);
        if (index !== -1) {
            clients[index] = {
                ...clients[index],
                nom,
                prenom,
                telephone,
                email,
                adresse
            };
        }
    } else {
        const newClient = {
            id: nextIdData.clients,
            nom,
            prenom,
            telephone,
            email,
            adresse,
            dateAjout: new Date().toISOString()
        };
        clients.push(newClient);
        nextIdData.clients++;
        localStorage.setItem('nextId', JSON.stringify(nextIdData));
    }
    
    localStorage.setItem('clients', JSON.stringify(clients));
    closeClientModal();
    loadClients();
}

function editClient(id) {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const client = clients.find(c => c.id == id);
    if (client) {
        openClientModal(client);
    }
}

function deleteClient(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        let clients = JSON.parse(localStorage.getItem('clients')) || [];
        clients = clients.filter(c => c.id != id);
        localStorage.setItem('clients', JSON.stringify(clients));
        loadClients();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadClientsPage();
});
