const mongoose = require('mongoose');

const DepenseSchema = new mongoose.Schema({
  libelle: { type: String, required: true, trim: true },
  categorie: { type: String, enum: ['SALAIRE', 'LOYER', 'ELECTRICITE', 'EAU', 'ACHAT_DIVERS', 'TRANSPORT', 'REPARATION', 'AUTRE'], required: true },
  montant: { type: Number, required: true, min: 0 },
  beneficiaire: { type: String, trim: true },
  modePaiement: { type: String, enum: ['ESPECES', 'MOBILE_MONEY', 'CARTE', 'CHEQUE', 'AUTRE'], default: 'ESPECES' },
  dateDepense: { type: Date, default: Date.now },
  justificatif: { type: String },
  observations: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Depense', DepenseSchema);
