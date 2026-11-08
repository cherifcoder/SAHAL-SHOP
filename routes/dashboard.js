const express = require('express');
const router = express.Router();
const Vente = require('../models/Vente');
const Article = require('../models/Article');
const Client = require('../models/Client');
const Credit = require('../models/Credit');
const Depense = require('../models/Depense');
const LigneVente = require('../models/LigneVente');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns');

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const debutJour = startOfDay(today);
    const finJour = endOfDay(today);
    const debutMois = startOfMonth(today);
    const finMois = endOfMonth(today);
    
    const [ventesJour, ventesMois, articles, clients, credits, depensesMois] = await Promise.all([
      Vente.find({ dateVente: { $gte: debutJour, $lte: finJour }, statut: 'VALIDEE' }),
      Vente.find({ dateVente: { $gte: debutMois, $lte: finMois }, statut: 'VALIDEE' }),
      Article.find({ actif: true }),
      Client.find({ actif: true }),
      Credit.find({ statut: { $in: ['OUVERT', 'PARTIEL'] } }),
      Depense.find({ dateDepense: { $gte: debutMois, $lte: finMois } })
    ]);
    
    const caJour = ventesJour.reduce((sum, v) => sum + v.total, 0);
    const caMois = ventesMois.reduce((sum, v) => sum + v.total, 0);
    
    let beneficeJour = 0;
    for (let v of ventesJour) {
      const lignes = await LigneVente.find({ vente: v._id });
      for (let l of lignes) {
        beneficeJour += (l.prixUnitaire - l.prixAchatUnitaire) * l.quantite;
      }
    }
    
    const totalCreances = credits.reduce((sum, c) => sum + c.montantRestant, 0);
    const totalDepensesMois = depensesMois.reduce((sum, d) => sum + d.montant, 0);
    const beneficeNetMois = caMois - totalDepensesMois;
    
    const stockFaible = articles.filter(a => a.stockActuel <= a.stockMin);
    const valeurStock = articles.reduce((sum, a) => sum + (a.stockActuel * a.prixAchat), 0);
    
    const ventesRecentes = await Vente.find({ statut: 'VALIDEE' })
      .sort({ dateVente: -1 })
      .limit(5)
      .populate('client');
    
    res.render('dashboard/index', {
      title: 'Tableau de Bord',
      caJour,
      caMois,
      beneficeJour,
      beneficeNetMois,
      nbVentesJour: ventesJour.length,
      nbVentesMois: ventesMois.length,
      nbArticles: articles.length,
      nbClients: clients.length,
      totalCreances,
      stockFaible: stockFaible.length,
      valeurStock,
      stockFaibleList: stockFaible.slice(0, 10),
      ventesRecentes
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard/index', {
      title: 'Tableau de Bord',
      caJour: 0, caMois: 0, beneficeJour: 0, beneficeNetMois: 0,
      nbVentesJour: 0, nbVentesMois: 0, nbArticles: 0, nbClients: 0,
      totalCreances: 0, stockFaible: 0, valeurStock: 0,
      stockFaibleList: [], ventesRecentes: []
    });
  }
});

module.exports = router;
