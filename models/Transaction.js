const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['spend', 'income'], required: true },
  amount: { type: Number, required: true },
  bank: { type: String, required: true },
  category: { type: String, required: true },
  customReason: { type: String }, // For when "Others" is selected
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);