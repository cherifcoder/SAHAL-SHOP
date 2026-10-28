exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    const userRole = req.session.user.role;
    if (userRole === 'superadmin') {
      return next();
    }
    if (!roles.includes(userRole)) {
      if (req.flash) req.flash('error', 'Accès non autorisé pour ce rôle');
      return res.status(403).render('errors/403', { title: 'Accès refusé', user: req.session.user });
    }
    next();
  };
};
