const express = require('express');
const router = express.Router();
const Depense = require('../models/Depense');
const { logAction } = require('../middlewares/logger');

router.get('/', async (req, res) => {
  try {
    const depenses = await Depense.find().sort({ dateDepense: -1 });
    const total = depenses.reduce((sum, d) => sum + d.montant, 0);
    res.render('depenses/index', { title: 'Gestion des Dépenses', depenses, total });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/ajouter', (req, res) => {
  res.render('depenses/add', { title: 'Ajouter une Dépense' });
});

router.post('/ajouter', logAction('DEPENSES', 'AJOUT_DEPENSE'), async (req, res) => {
  try {
    const { libelle, categorie, montant, beneficiaire, modePaiement, dateDepense, observations } = req.body;
    await Depense.create({
      libelle,
      categorie,
      montant: parseFloat(montant),
      beneficiaire,
      modePaiement,
      dateDepense: dateDepense || Date.now(),
      observations
    });
    res.redirect('/depenses');
  } catch (err) {
    console.error(err);
    res.redirect('/depenses/ajouter');
  }
});

router.delete('/supprimer/:id', logAction('DEPENSES', 'SUPPRESSION_DEPENSE'), async (req, res) => {
  try {
    await Depense.findByIdAndDelete(req.params.id);
    res.redirect('/depenses');
  } catch (err) {
    console.error(err);
    res.redirect('/depenses');
  }
});

module.exports = router;
