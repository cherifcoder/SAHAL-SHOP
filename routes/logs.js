const express = require('express');
const router = express.Router();
const JournalAction = require('../models/JournalAction');

router.get('/', async (req, res) => {
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
    res.render('logs/index', { title: 'Journal d\'activité', logs });
  } catch (err) {
    console.error('Erreur logs:', err.message);
    return res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
