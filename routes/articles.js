const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const upload = require('../middlewares/upload');
const { logAction } = require('../middlewares/logger');

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.render('articles/index', { title: 'Gestion des Articles', articles });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/ajouter', (req, res) => {
  res.render('articles/add', { title: 'Ajouter un Article' });
});

router.post('/ajouter', upload.array('images', 5), logAction('ARTICLES', 'AJOUT_ARTICLE'), async (req, res) => {
  try {
    let { reference, designation, description, categorie, marque, prixAchat, prixVente, stockActuel, stockMin, unite, fournisseur, emplacement } = req.body;
    
    if (!reference || reference.trim() === '') {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth()+1).padStart(2,'0');
      const day = String(date.getDate()).padStart(2,'0');
      const rand = Math.floor(10000 + Math.random() * 90000);
      reference = 'ART-' + year + month + day + '-' + rand;
    }
    
    const images = req.files ? req.files.map(f => f.filename) : [];
    
    await Article.create({
      reference,
      designation,
      description,
      categorie,
      marque,
      prixAchat: parseFloat(prixAchat),
      prixVente: parseFloat(prixVente),
      stockActuel: parseInt(stockActuel) || 0,
      stockMin: parseInt(stockMin) || 5,
      unite,
      images,
      fournisseur,
      emplacement
    });
    
    res.redirect('/articles');
  } catch (err) {
    console.error(err);
    res.redirect('/articles/ajouter');
  }
});

router.get('/modifier/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { title: 'Modifier un Article', article });
  } catch (err) {
    console.error(err);
    res.redirect('/articles');
  }
});

router.put('/modifier/:id', upload.array('images', 5), logAction('ARTICLES', 'MODIFICATION_ARTICLE'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    const { reference, designation, description, categorie, marque, prixAchat, prixVente, stockMin, unite, fournisseur, emplacement, actif } = req.body;
    
    article.reference = reference;
    article.designation = designation;
    article.description = description;
    article.categorie = categorie;
    article.marque = marque;
    article.prixAchat = parseFloat(prixAchat);
    article.prixVente = parseFloat(prixVente);
    article.stockMin = parseInt(stockMin);
    article.unite = unite;
    article.fournisseur = fournisseur;
    article.emplacement = emplacement;
    article.actif = actif === 'on';
    article.updatedAt = Date.now();
    
    if (req.files && req.files.length > 0) {
      article.images = req.files.map(f => f.filename);
    }
    
    await article.save();
    res.redirect('/articles');
  } catch (err) {
    console.error(err);
    res.redirect('/articles');
  }
});

router.delete('/supprimer/:id', logAction('ARTICLES', 'SUPPRESSION_ARTICLE'), async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/articles');
  } catch (err) {
    console.error(err);
    res.redirect('/articles');
  }
});

module.exports = router;
