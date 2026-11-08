const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const Client = require('../models/Client');
const Remboursement = require('../models/Remboursement');
const { logAction } = require('../middlewares/logger');

router.get('/', async (req, res) => {
  try {
    const credits = await Credit.find({ statut: { $in: ['OUVERT', 'PARTIEL'] } })
      .populate('client')
      .populate('vente')
      .sort({ createdAt: -1 });
    res.render('credits/index', { title: 'Crédits Clients', credits });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/rembourser/:id', async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id).populate('client').populate('vente');
    const remboursements = await Remboursement.find({ credit: credit._id }).sort({ dateRemboursement: -1 });
    res.render('credits/rembourser', { title: 'Rembourser un crédit', credit, remboursements });
  } catch (err) {
    console.error(err);
    res.redirect('/credits');
  }
});

router.post('/rembourser/:id', logAction('CREDITS', 'REMBOURSEMENT'), async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id).populate('client');
    const montant = parseFloat(req.body.montant);
    const { modePaiement, observations } = req.body;
    
    if (montant <= 0 || montant > credit.montantRestant) {
      return res.redirect(`/credits/rembourser/${credit._id}`);
    }
    
    await Remboursement.create({
      credit: credit._id,
      client: credit.client._id,
      montant,
      modePaiement,
      observations
    });
    
    credit.montantPaye += montant;
    credit.montantRestant -= montant;
    
    if (credit.montantRestant <= 0) {
      credit.statut = 'SOLDE';
      credit.montantRestant = 0;
    } else {
      credit.statut = 'PARTIEL';
    }
    
    credit.updatedAt = Date.now();
    await credit.save();
    
    if (credit.client) {
      credit.client.soldeCredit -= montant;
      await credit.client.save();
    }
    
    res.redirect('/credits');
  } catch (err) {
    console.error(err);
    res.redirect('/credits');
  }
});

module.exports = router;
