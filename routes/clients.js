const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { logAction } = require('../middlewares/logger');

router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.render('clients/index', { title: 'Gestion des Clients', clients });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/ajouter', (req, res) => {
  res.render('clients/add', { title: 'Ajouter un Client' });
});

router.post('/ajouter', logAction('CLIENTS', 'AJOUT_CLIENT'), async (req, res) => {
  try {
    const { nom, prenom, telephone, email, adresse, ville, plafondCredit, autoriserCredit } = req.body;
    await Client.create({
      nom,
      prenom,
      telephone,
      email,
      adresse,
      ville,
      plafondCredit: parseFloat(plafondCredit) || 0,
      autoriserCredit: autoriserCredit === 'on'
    });
    res.redirect('/clients');
  } catch (err) {
    console.error(err);
    res.redirect('/clients/ajouter');
  }
});

router.get('/modifier/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    res.render('clients/edit', { title: 'Modifier un Client', client });
  } catch (err) {
    console.error(err);
    res.redirect('/clients');
  }
});

router.put('/modifier/:id', logAction('CLIENTS', 'MODIFICATION_CLIENT'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    const { nom, prenom, telephone, email, adresse, ville, plafondCredit, autoriserCredit, actif } = req.body;
    
    client.nom = nom;
    client.prenom = prenom;
    client.telephone = telephone;
    client.email = email;
    client.adresse = adresse;
    client.ville = ville;
    client.plafondCredit = parseFloat(plafondCredit) || 0;
    client.autoriserCredit = autoriserCredit === 'on';
    client.actif = actif === 'on';
    client.updatedAt = Date.now();
    
    await client.save();
    res.redirect('/clients');
  } catch (err) {
    console.error(err);
    res.redirect('/clients');
  }
});

router.delete('/supprimer/:id', logAction('CLIENTS', 'SUPPRESSION_CLIENT'), async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.redirect('/clients');
  } catch (err) {
    console.error(err);
    res.redirect('/clients');
  }
});

module.exports = router;
