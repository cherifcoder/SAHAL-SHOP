const mongoose = require('mongoose');

const MouvementStockSchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  typeMouvement: { type: String, enum: ['ENTREE', 'SORTIE', 'AJUSTEMENT', 'CORRECTION'], required: true },
  quantite: { type: Number, required: true },
  stockAvant: { type: Number, required: true },
  stockApres: { type: Number, required: true },
  motif: { type: String, required: true, trim: true },
  reference: { type: String, trim: true },
  vente: { type: mongoose.Schema.Types.ObjectId, ref: 'Vente' },
  dateMouvement: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MouvementStock', MouvementStockSchema);
