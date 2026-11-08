const mongoose = require('mongoose');

const VenteSchema = new mongoose.Schema({
  numeroFacture: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  typeVente: { type: String, enum: ['COMPTANT', 'CREDIT'], required: true, default: 'COMPTANT' },
  lignes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LigneVente' }],
  sousTotal: { type: Number, required: true, min: 0 },
  remise: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  montantPaye: { type: Number, default: 0, min: 0 },
  resteAPayer: { type: Number, default: 0, min: 0 },
  statut: { type: String, enum: ['EN_ATTENTE', 'VALIDEE', 'ANNULEE'], default: 'VALIDEE' },
  modePaiement: { type: String, enum: ['ESPECES', 'MOBILE_MONEY', 'CARTE', 'CHEQUE', 'AUTRE'], default: 'ESPECES' },
  dateVente: { type: Date, default: Date.now },
  observations: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vente', VenteSchema);
