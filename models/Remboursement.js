const mongoose = require('mongoose');

const RemboursementSchema = new mongoose.Schema({
  credit: { type: mongoose.Schema.Types.ObjectId, ref: 'Credit', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  montant: { type: Number, required: true, min: 1 },
  modePaiement: { type: String, enum: ['ESPECES', 'MOBILE_MONEY', 'CARTE', 'CHEQUE', 'AUTRE'], default: 'ESPECES' },
  reference: { type: String },
  observations: { type: String, trim: true },
  dateRemboursement: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Remboursement', RemboursementSchema);
