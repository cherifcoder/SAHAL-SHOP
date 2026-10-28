const express = require('express');
const router = express.Router();
const JournalAction = require('../models/JournalAction');
const { isAuthenticated } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

router.get('/', isAuthenticated, async (req, res) => {
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'superadmin') {
    return res.status(403).render('errors/403', { title: 'Accès refusé', user: req.session.user });
  }
  try {
    let logs = [];
    try {
      logs = await JournalAction.find()
        .sort({ dateAction: -1 })
        .limit(200)
        .lean();
    } catch (e) {
      logs = [];
    }
    res.render('logs/index', { title: 'Journal d\'activité', logs, user: req.session.user });
  } catch (err) {
    console.error('Erreur logs:', err.message);
    return res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
