function loadArticlesPage() {
    
    loadArticles();
}

function loadArticles() {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const tableBody = document.getElementById('articlesTable');
    tableBody.innerHTML = '';
    
    if (articles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucun article enregistré</td></tr>';
        return;
    }
    
    articles.forEach(article => {
        const marge = article.prixVente - article.prixAchat;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${article.reference}</td>
            <td>${article.nom}</td>
            <td>${article.categorie || '-'}</td>
            <td>${article.quantite}</td>
            <td>${article.prixAchat.toLocaleString()} FCFA</td>
            <td>${article.prixVente.toLocaleString()} FCFA</td>
            <td>${marge.toLocaleString()} FCFA</td>
            <td class="actions">
                <button class="btn-warning" onclick="editArticle(${article.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteArticle(${article.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openArticleModal(article = null) {
    document.getElementById('articleModal').classList.add('active');
    if (article) {
        document.getElementById('modalTitle').textContent = 'Modifier un Article';
        document.getElementById('articleId').value = article.id;
        document.getElementById('articleRef').value = article.reference;
        document.getElementById('articleNom').value = article.nom;
        document.getElementById('articleCategorie').value = article.categorie || '';
        document.getElementById('articleQuantite').value = article.quantite;
        document.getElementById('articlePrixAchat').value = article.prixAchat;
        document.getElementById('articlePrixVente').value = article.prixVente;
        document.getElementById('articleDescription').value = article.description || '';
    } else {
        document.getElementById('modalTitle').textContent = 'Ajouter un Article';
        document.getElementById('articleId').value = '';
        document.getElementById('articleRef').value = '';
        document.getElementById('articleNom').value = '';
        document.getElementById('articleCategorie').value = '';
        document.getElementById('articleQuantite').value = '';
        document.getElementById('articlePrixAchat').value = '';
        document.getElementById('articlePrixVente').value = '';
        document.getElementById('articleDescription').value = '';
    }
}

function closeArticleModal() {
    document.getElementById('articleModal').classList.remove('active');
}

function saveArticle() {
    const id = document.getElementById('articleId').value;
    const reference = document.getElementById('articleRef').value;
    const nom = document.getElementById('articleNom').value;
    const categorie = document.getElementById('articleCategorie').value;
    const quantite = parseInt(document.getElementById('articleQuantite').value);
    const prixAchat = parseFloat(document.getElementById('articlePrixAchat').value);
    const prixVente = parseFloat(document.getElementById('articlePrixVente').value);
    const description = document.getElementById('articleDescription').value;
    
    if (!reference || !nom || isNaN(quantite) || isNaN(prixAchat) || isNaN(prixVente)) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const nextIdData = JSON.parse(localStorage.getItem('nextId'));
    
    if (id) {
        // Modifier
        const index = articles.findIndex(a => a.id == id);
        if (index !== -1) {
            articles[index] = {
                ...articles[index],
                reference,
                nom,
                categorie,
                quantite,
                prixAchat,
                prixVente,
                description
            };
        }
    } else {
        // Ajouter
        const newArticle = {
            id: nextIdData.articles,
            reference,
            nom,
            categorie,
            quantite,
            prixAchat,
            prixVente,
            description,
            dateAjout: new Date().toISOString()
        };
        articles.push(newArticle);
        nextIdData.articles++;
        localStorage.setItem('nextId', JSON.stringify(nextIdData));
    }
    
    localStorage.setItem('articles', JSON.stringify(articles));
    closeArticleModal();
    loadArticles();
}

function editArticle(id) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const article = articles.find(a => a.id == id);
    if (article) {
        openArticleModal(article);
    }
}

function deleteArticle(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        let articles = JSON.parse(localStorage.getItem('articles')) || [];
        articles = articles.filter(a => a.id != id);
        localStorage.setItem('articles', JSON.stringify(articles));
        loadArticles();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadArticlesPage();
});
