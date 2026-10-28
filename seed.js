require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    await User.deleteOne({ username: 'admin' });
    await User.create({
      nom: 'SUPER',
      prenom: 'ADMIN',
      username: 'admin',
      password: 'admin123password4',
      role: 'superadmin',
      email: 'admin@sahalshop.local',
      actif: true
    });
    console.log('✅ SuperAdmin créé avec succès!');
    console.log('   Username: admin');
    console.log('   Password: admin123password4');
    process.exit();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

seedAdmin();
