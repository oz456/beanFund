const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: { type: String, required: true },
  tagline: { type: String },
  description: { type: String, required: true },
  category: { type: String, default: 'Inventions' },
  creator: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  backersCount: { type: Number, default: 0 },
  daysLeft: { type: Number, default: 30 },
  status: { type: String, default: 'Active' },
  rewards: { type: Array, default: [] },
  stretchGoals: { type: Array, default: [] },
  budgetBreakdown: { type: Array, default: [] },
  guestbook: { type: Array, default: [] },
  polls: { type: Array, default: [] },
  updates: { type: Array, default: [] },
  createdAt: { type: String }
});

module.exports = mongoose.model('Campaign', campaignSchema);
