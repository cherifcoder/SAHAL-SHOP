const express = require('express');
const router = express.Router();
const Depense = require('../models/Depense');
const { isAuthenticated } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const { logAction } = require('../middlewares/logger');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const depenses = await Depense.find().populate('effectuePar').sort({ dateDepense: -1 });
    const total = depenses.reduce((sum, d) => sum + d.montant, 0);
    res.render('depenses/index', { title: 'Gestion des Dépenses', depenses, total, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/ajouter', isAuthenticated, checkRole('admin', 'manager', 'superadmin'), (req, res) => {
  res.render('depenses/add', { title: 'Ajouter une Dépense', user: req.session.user });
});

router.post('/ajouter', isAuthenticated, checkRole('admin', 'manager', 'superadmin'), logAction('DEPENSES', 'AJOUT_DEPENSE'), async (req, res) => {
  try {
    const { libelle, categorie, montant, beneficiaire, modePaiement, dateDepense, observations } = req.body;
    await Depense.create({
      libelle,
      categorie,
      montant: parseFloat(montant),
      beneficiaire,
      modePaiement,
      effectuePar: req.session.user.id,
      dateDepense: dateDepense || Date.now(),
      observations
    });
    res.redirect('/depenses');
  } catch (err) {
    console.error(err);
    res.redirect('/depenses/ajouter');
  }
});

router.delete('/supprimer/:id', isAuthenticated, checkRole('admin', 'superadmin'), logAction('DEPENSES', 'SUPPRESSION_DEPENSE'), async (req, res) => {
  try {
    await Depense.findByIdAndDelete(req.params.id);
    res.redirect('/depenses');
  } catch (err) {
    console.error(err);
    res.redirect('/depenses');
  }
});

module.exports = router;
