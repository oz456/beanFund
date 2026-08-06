const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '🧸' },
  backedPledges: { type: Array, default: [] },
  createdCampaigns: { type: Array, default: [] }
});

module.exports = mongoose.model('User', userSchema);
