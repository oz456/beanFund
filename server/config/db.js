const mongoose = require('mongoose');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { defaultCampaigns, defaultUsers } = require('../services/diskStorage');

let isDbConnected = false;

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    isDbConnected = true;
    console.log('MongoDB connected successfully!');
    
    // Seed default data if MongoDB collections are empty
    try {
      const campaignCount = await Campaign.countDocuments();
      if (campaignCount === 0) {
        console.log('Seeding default campaigns to MongoDB...');
        await Campaign.insertMany(defaultCampaigns);
      }
      
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Seeding default users to MongoDB...');
        await User.insertMany(defaultUsers);
      }
    } catch (seedErr) {
      console.error('Error seeding database:', seedErr.message);
    }
    
    return true;
  } catch (err) {
    isDbConnected = false;
    console.log('MongoDB not connected (Running in fast JSON-filesystem persistent mode):', err.message);
    return false;
  }
};

const getDbStatus = () => isDbConnected;

module.exports = {
  connectDB,
  getDbStatus
};
