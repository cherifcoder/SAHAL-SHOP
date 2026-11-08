function loadDashboard() {
    // Charger les statistiques
    loadStatistics();
    
    // Charger les ventes récentes
    loadRecentSales();
    
    // Charger le graphique
    loadSalesChart();
}

function loadStatistics() {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
    
    const today = new Date().toISOString().split('T')[0];
    
    // Articles totaux
    document.getElementById('totalArticles').textContent = articles.length;
    
    // Ventes du jour
    const ventesJour = ventes.filter(v => v.date.startsWith(today));
    document.getElementById('totalVentes').textContent = ventesJour.length;
    
    // Chiffre d'affaires du jour
    const caJour = ventesJour.reduce((sum, v) => sum + v.total, 0);
    document.getElementById('chiffreAffaires').textContent = caJour.toLocaleString() + ' FCFA';
    
    // Bénéfice du jour
    let beneficeJour = 0;
    ventesJour.forEach(vente => {
        vente.lignes.forEach(ligne => {
            const article = articles.find(a => a.id == ligne.articleId);
            if (article) {
                beneficeJour += (ligne.prixVente - article.prixAchat) * ligne.quantite;
            }
        });
    });
    // Soustraire les dépenses du jour
    const depensesJour = depenses.filter(d => d.date.startsWith(today));
    const totalDepensesJour = depensesJour.reduce((sum, d) => sum + d.montant, 0);
    beneficeJour -= totalDepensesJour;
    
    document.getElementById('beneficeJour').textContent = beneficeJour.toLocaleString() + ' FCFA';
}

function loadRecentSales() {
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const tableBody = document.getElementById('ventesRecentesTable');
    tableBody.innerHTML = '';
    
    // Prendre les 5 dernières ventes
    const recentVentes = ventes.slice(-5).reverse();
    
    if (recentVentes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Aucune vente enregistrée</td></tr>';
        return;
    }
    
    recentVentes.forEach(vente => {
        const client = clients.find(c => c.id == vente.clientId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vente.numeroFacture}</td>
            <td>${client ? client.nom + ' ' + client.prenom : 'Client inconnu'}</td>
            <td>${new Date(vente.date).toLocaleDateString('fr-FR')}</td>
            <td>${vente.total.toLocaleString()} FCFA</td>
            <td class="actions">
                <button class="btn-success" onclick="genererFacturePDF(${vente.id})" title="Générer facture PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadSalesChart() {
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    const ctx = document.getElementById('ventesChart').getContext('2d');
    
    // Obtenir les 7 derniers jours
    const jours = [];
    const ventesParJour = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        jours.push(date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
        
        const ventesJour = ventes.filter(v => v.date.startsWith(dateStr));
        const totalJour = ventesJour.reduce((sum, v) => sum + v.total, 0);
        ventesParJour.push(totalJour);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: jours,
            datasets: [{
                label: 'Chiffre d\'affaires (FCFA)',
                data: ventesParJour,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' FCFA';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' FCFA';
                        }
                    }
                }
            }
        }
    });
}

function genererFacturePDF(venteId) {
    alert('Fonctionnalité de génération PDF en cours de développement. Utilisez jsPDF pour l\'implémenter.');
}

document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});
