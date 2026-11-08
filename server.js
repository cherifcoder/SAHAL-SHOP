require('dotenv').config();
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

try {
  connectDB();
} catch (e) {
  console.error(e);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use('/dashboard', require('./routes/dashboard'));
app.use('/articles', require('./routes/articles'));
app.use('/clients', require('./routes/clients'));
app.use('/ventes', require('./routes/ventes'));
app.use('/credits', require('./routes/credits'));
app.use('/stocks', require('./routes/stocks'));
app.use('/depenses', require('./routes/depenses'));
app.use('/rapports', require('./routes/rapports'));
app.use('/logs', require('./routes/logs'));

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page non trouvée' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
