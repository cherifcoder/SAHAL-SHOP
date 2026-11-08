const mongoose = require('mongoose');

const JournalActionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  module: { type: String, enum: ['ARTICLES', 'CLIENTS', 'VENTES', 'CREDITS', 'STOCK', 'DEPENSES', 'RAPPORTS', 'SYSTEM'], required: true },
  details: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  dateAction: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JournalAction', JournalActionSchema);
