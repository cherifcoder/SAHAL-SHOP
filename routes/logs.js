const express = require('express');
const router = express.Router();
const JournalAction = require('../models/JournalAction');
const { isAuthenticated } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

router.get('/', isAuthenticated, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const logs = await JournalAction.find()
      .populate('utilisateur', 'nom prenom username')
      .sort({ dateAction: -1 })
      .limit(200)
      .lean();
    res.render('logs/index', { title: 'Journal d\'activité', logs, user: req.session.user });
  } catch (err) {
    console.error('Erreur logs:', err);
    try {
      const logs = await JournalAction.find().sort({ dateAction: -1 }).limit(200).lean();
      res.render('logs/index', { title: 'Journal d\'activité', logs, user: req.session.user });
    } catch (e2) {
      console.error('Erreur logs fallback:', e2);
      res.status(500).render('errors/500', { title: 'Erreur', user: req.session.user });
    }
  }
});

module.exports = router;
