const express = require('express');
const router = express.Router();
const User = require('../models/User');
const JournalAction = require('../models/JournalAction');
const { isGuest } = require('../middlewares/auth');

router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', { title: 'Connexion', error: null });
});

router.post('/login', isGuest, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.trim() });
    
    if (!user) {
      return res.render('auth/login', { title: 'Connexion', error: 'Identifiants incorrects' });
    }
    
    if (user.actif === false) {
      return res.render('auth/login', { title: 'Connexion', error: 'Compte désactivé' });
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render('auth/login', { title: 'Connexion', error: 'Identifiants incorrects' });
    }
    
    user.derniereConnexion = Date.now();
    await user.save();
    
    req.session.user = {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      username: user.username,
      role: user.role
    };
    
    req.session.save(() => {
      res.redirect('/dashboard');
    });
    return;
    
    try {
      await JournalAction.create({
        utilisateur: user._id,
        nomUtilisateur: user.prenom + ' ' + user.nom,
        action: 'CONNEXION',
        module: 'AUTH',
        details: 'Connexion au système',
        ip: req.ip
      });
    } catch(e) {}
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Connexion', error: 'Erreur serveur' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;
