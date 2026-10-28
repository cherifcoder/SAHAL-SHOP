require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');
const flash = require('connect-flash');

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

let sessionStore;
try {
  sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  });
} catch (e) {
  sessionStore = new session.MemoryStore();
}

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'sahalshop_secret_2026',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 1000 * 60 * 60 * 8, secure: true, sameSite: 'lax', httpOnly: true }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.messages = req.flash();
  next();
});

app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/users', require('./routes/users'));
app.use('/articles', require('./routes/articles'));
app.use('/clients', require('./routes/clients'));
app.use('/ventes', require('./routes/ventes'));
app.use('/credits', require('./routes/credits'));
app.use('/stocks', require('./routes/stocks'));
app.use('/depenses', require('./routes/depenses'));
app.use('/rapports', require('./routes/rapports'));
app.use('/logs', require('./routes/logs'));

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page non trouvée', user: req.session.user });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
