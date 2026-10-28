const JournalAction = require('../models/JournalAction');

exports.logAction = (module, action) => {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode < 400 && req.session && req.session.user) {
        setImmediate(async () => {
          try {
            await JournalAction.create({
              utilisateur: req.session.user.id,
              nomUtilisateur: (req.session.user.prenom || '') + ' ' + (req.session.user.nom || '') + ' (' + (req.session.user.username || '') + ')',
              action: action,
              module: module,
              details: `${req.method} ${req.originalUrl}`,
              ip: req.ip || (req.connection && req.connection.remoteAddress) || req.headers['x-forwarded-for'],
              userAgent: req.get ? req.get('User-Agent') : ''
            });
          } catch (err) {
            console.error('Erreur journalisation:', err.message);
          }
        });
      }
    });
    next();
  };
};
