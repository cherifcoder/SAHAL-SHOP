const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI manquant');
      if (require.main === module) process.exit(1);
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connecté`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    if (require.main === module) process.exit(1);
  }
};

module.exports = connectDB;
