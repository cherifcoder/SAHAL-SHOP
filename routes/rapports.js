const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const Vente = require('../models/Vente');
const Depense = require('../models/Depense');
const LigneVente = require('../models/LigneVente');
const { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, subWeeks, subYears } = require('date-fns');

const { checkRole } = require('../middlewares/checkRole');
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    const debutMois = startOfMonth(today);
    const finMois = endOfMonth(today);
    
    const ventesMois = await Vente.find({ dateVente: { $gte: debutMois, $lte: finMois }, statut: 'VALIDEE' });
    const caMois = ventesMois.reduce((sum, v) => sum + v.total, 0);
    
    let beneficeMois = 0;
    for (let v of ventesMois) {
      const lignes = await LigneVente.find({ vente: v._id });
      for (let l of lignes) {
        beneficeMois += (l.prixUnitaire - l.prixAchatUnitaire) * l.quantite;
      }
    }
    
    const depensesMois = await Depense.find({ dateDepense: { $gte: debutMois, $lte: finMois } });
    const totalDepenses = depensesMois.reduce((sum, d) => sum + d.montant, 0);
    
    res.render('rapports/index', {
      title: 'Rapports & Graphiques',
      caMois,
      beneficeMois,
      totalDepenses,
      beneficeNet: beneficeMois - totalDepenses,
      nbVentes: ventesMois.length,
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.render('rapports/index', {
      title: 'Rapports & Graphiques',
      caMois: 0, beneficeMois: 0, totalDepenses: 0, beneficeNet: 0, nbVentes: 0,
      user: req.session.user
    });
  }
});

router.get('/details/benefice', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    const debutMois = startOfMonth(today);
    const finMois = endOfMonth(today);
    const ventes = await Vente.find({ dateVente: { $gte: debutMois, $lte: finMois }, statut: 'VALIDEE' }).populate('client');
    let details = [];
    for (let v of ventes) {
      const lignes = await LigneVente.find({ vente: v._id }).populate('article');
      for (let l of lignes) {
        details.push({
          facture: v.numeroFacture,
          article: l.designation,
          quantite: l.quantite,
          prixVente: l.prixUnitaire,
          prixAchat: l.prixAchatUnitaire,
          marge: (l.prixUnitaire - l.prixAchatUnitaire) * l.quantite
        });
      }
    }
    res.render('rapports/details-benefice', { title: 'Détail du Bénéfice', details, user: req.session.user });
  } catch (err) {
    res.redirect('/rapports');
  }
});

router.get('/details/ca', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    const debutMois = startOfMonth(today);
    const finMois = endOfMonth(today);
    const ventes = await Vente.find({ dateVente: { $gte: debutMois, $lte: finMois }, statut: 'VALIDEE' }).populate('client').populate('vendeur').sort({ dateVente: -1 });
    res.render('rapports/details-ca', { title: 'Détail du Chiffre d\'affaires', ventes, user: req.session.user });
  } catch (err) {
    res.redirect('/rapports');
  }
});

router.get('/details/benefice-net', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    const debutMois = startOfMonth(today);
    const finMois = endOfMonth(today);
    const ventes = await Vente.find({ dateVente: { $gte: debutMois, $lte: finMois }, statut: 'VALIDEE' });
    let beneficeBrut = 0;
    for (let v of ventes) {
      const lignes = await LigneVente.find({ vente: v._id });
      for (let l of lignes) {
        beneficeBrut += (l.prixUnitaire - l.prixAchatUnitaire) * l.quantite;
      }
    }
    const depenses = await Depense.find({ dateDepense: { $gte: debutMois, $lte: finMois } });
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
    res.render('rapports/details-benefice-net', { title: 'Détail Bénéfice Net', beneficeBrut, totalDepenses, beneficeNet: beneficeBrut - totalDepenses, depenses, user: req.session.user });
  } catch (err) {
    res.redirect('/rapports');
  }
});

router.get('/api/ventes', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    let debut, fin;
    let groupBy = 'day';
    
    if (req.query.type === 'semaine') {
      debut = startOfWeek(today, { weekStartsOn: 1 });
      fin = endOfWeek(today, { weekStartsOn: 1 });
    } else if (req.query.type === 'mois') {
      debut = startOfMonth(today);
      fin = endOfMonth(today);
    } else if (req.query.type === 'trimestre') {
      debut = new Date(today.getFullYear(), Math.floor(today.getMonth()/3)*3, 1);
      fin = new Date(today.getFullYear(), Math.floor(today.getMonth()/3)*3 + 3, 0);
    } else if (req.query.type === 'annee') {
      debut = startOfYear(today);
      fin = endOfYear(today);
    } else if (req.query.type === 'custom') {
      debut = new Date(req.query.debut);
      fin = new Date(req.query.fin);
    } else {
      debut = startOfMonth(today);
      fin = endOfMonth(today);
    }
    
    const ventes = await Vente.find({ dateVente: { $gte: debut, $lte: fin }, statut: 'VALIDEE' });
    const ca = ventes.reduce((sum, v) => sum + v.total, 0);
    
    let benefice = 0;
    for (let v of ventes) {
      const lignes = await LigneVente.find({ vente: v._id });
      for (let l of lignes) {
        benefice += (l.prixUnitaire - l.prixAchatUnitaire) * l.quantite;
      }
    }
    
    const labels = [];
    const values = [];
    const days = Math.ceil((fin - debut) / (1000*60*60*24)) + 1;
    for (let i = 0; i < Math.min(days, 31); i++) {
      const d = new Date(debut);
      d.setDate(d.getDate() + i);
      const dayVentes = ventes.filter(v => v.dateVente.toDateString() === d.toDateString());
      labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
      values.push(dayVentes.reduce((s,v) => s + v.total, 0));
    }
    
    res.json({ count: ventes.length, ca, benefice, labels, values });
  } catch (err) {
    res.json({ count: 0, ca: 0, benefice: 0, labels: [], values: [] });
  }
});

module.exports = router;
