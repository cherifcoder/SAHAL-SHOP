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
    
    req.session.regenerate((err) => {
      if (err) {
        return res.render('auth/login', { title: 'Connexion', error: 'Erreur session' });
      }
      req.session.user = {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        username: user.username,
        role: user.role
      };
      req.session.save(async () => {
        try {
          await JournalAction.create({
            utilisateur: user._id,
            nomUtilisateur: (user.prenom || '') + ' ' + (user.nom || '') + ' (' + user.username + ')',
            action: 'CONNEXION',
            module: 'AUTH',
            details: 'Connexion au système',
            ip: req.ip || (req.headers && req.headers['x-forwarded-for']) || '',
            userAgent: req.get ? req.get('User-Agent') : ''
          });
        } catch (e) {
          console.error('Erreur log connexion:', e.message);
        }
        res.redirect('/dashboard');
      });
    });
    return;
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Connexion', error: 'Erreur serveur' });
  }
});

router.get('/logout', async (req, res) => {
  const user = req.session.user;
  try {
    if (user) {
      await JournalAction.create({
        utilisateur: user.id,
        nomUtilisateur: (user.prenom || '') + ' ' + (user.nom || '') + ' (' + user.username + ')',
        action: 'DECONNEXION',
        module: 'AUTH',
        details: 'Déconnexion du système',
        ip: req.ip || (req.headers && req.headers['x-forwarded-for']) || '',
        userAgent: req.get ? req.get('User-Agent') : ''
      });
    }
  } catch (e) {
    console.error('Erreur log déconnexion:', e.message);
  }
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
