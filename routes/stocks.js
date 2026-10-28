const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const Article = require('../models/Article');
const MouvementStock = require('../models/MouvementStock');
const { logAction } = require('../middlewares/logger');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const articles = await Article.find({ actif: true }).sort({ designation: 1 });
    res.render('stocks/index', { title: 'Gestion des Stocks', articles, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/mouvement', isAuthenticated, checkRole('admin', 'manager', 'superadmin'), async (req, res) => {
  try {
    const articles = await Article.find({ actif: true }).sort({ designation: 1 });
    res.render('stocks/mouvement', { title: 'Mouvement de Stock', articles, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.redirect('/stocks');
  }
});

router.post('/mouvement', isAuthenticated, checkRole('admin', 'manager', 'superadmin'), logAction('STOCK', 'MOUVEMENT_STOCK'), async (req, res) => {
  try {
    const { articleId, typeMouvement, quantite, motif, reference } = req.body;
    const article = await Article.findById(articleId);
    if (!article) return res.redirect('/stocks/mouvement');
    
    const qty = parseInt(quantite);
    const stockAvant = article.stockActuel;
    let stockApres = stockAvant;
    
    if (typeMouvement === 'ENTREE') {
      stockApres = stockAvant + qty;
    } else if (typeMouvement === 'SORTIE') {
      stockApres = stockAvant - qty;
    } else if (typeMouvement === 'AJUSTEMENT') {
      stockApres = qty;
    } else if (typeMouvement === 'CORRECTION') {
      stockApres = qty;
    }
    
    article.stockActuel = stockApres;
    await article.save();
    
    await MouvementStock.create({
      article: article._id,
      typeMouvement,
      quantite: typeMouvement === 'AJUSTEMENT' || typeMouvement === 'CORRECTION' ? Math.abs(stockApres - stockAvant) : qty,
      stockAvant,
      stockApres,
      motif,
      reference,
      effectuePar: req.session.user.id
    });
    
    res.redirect('/stocks');
  } catch (err) {
    console.error(err);
    res.redirect('/stocks/mouvement');
  }
});

router.get('/journal', isAuthenticated, async (req, res) => {
  try {
    const mouvements = await MouvementStock.find()
      .populate('article')
      .populate('effectuePar')
      .sort({ dateMouvement: -1 })
      .limit(300);
    res.render('stocks/journal', { title: 'Journal des Mouvements de Stock', mouvements, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.redirect('/stocks');
  }
});

module.exports = router;
