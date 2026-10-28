const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const { logAction } = require('../middlewares/logger');

router.get('/', isAuthenticated, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('users/index', { title: 'Gestion des Utilisateurs', users, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/ajouter', isAuthenticated, checkRole('admin', 'superadmin'), (req, res) => {
  res.render('users/add', { title: 'Ajouter un Utilisateur', user: req.session.user });
});

router.post('/ajouter', isAuthenticated, checkRole('admin', 'superadmin'), logAction('USERS', 'AJOUT_UTILISATEUR'), async (req, res) => {
  try {
    const { nom, prenom, username, email, telephone, password, role } = req.body;
    await User.create({ nom, prenom, username, email, telephone, password, role });
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    res.redirect('/users/ajouter');
  }
});

router.get('/modifier/:id', isAuthenticated, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const userEdit = await User.findById(req.params.id);
    res.render('users/edit', { title: 'Modifier un Utilisateur', userEdit, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.redirect('/users');
  }
});

router.put('/modifier/:id', isAuthenticated, checkRole('admin', 'superadmin'), logAction('USERS', 'MODIFICATION_UTILISATEUR'), async (req, res) => {
  try {
    const userEdit = await User.findById(req.params.id);
    userEdit.nom = req.body.nom;
    userEdit.prenom = req.body.prenom;
    userEdit.email = req.body.email;
    userEdit.telephone = req.body.telephone;
    userEdit.role = req.body.role;
    userEdit.actif = req.body.actif === 'on';
    if (req.body.password && req.body.password.trim() !== '') {
      userEdit.password = req.body.password;
    }
    userEdit.updatedAt = Date.now();
    await userEdit.save();
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    res.redirect('/users');
  }
});

router.delete('/supprimer/:id', isAuthenticated, checkRole('admin', 'superadmin'), logAction('USERS', 'SUPPRESSION_UTILISATEUR'), async (req, res) => {
  try {
    if (req.params.id === req.session.user.id) {
      return res.redirect('/users');
    }
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    res.redirect('/users');
  }
});

module.exports = router;
