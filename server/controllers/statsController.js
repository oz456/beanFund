const { getDbStatus } = require('../config/db');
const Campaign = require('../models/Campaign');
const { db } = require('../services/diskStorage');

exports.getStats = async (req, res) => {
  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const allCampaigns = await Campaign.find();
      const totalRaised = allCampaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
      const totalBackers = allCampaigns.reduce((acc, c) => acc + c.backersCount, 0);
      const totalCampaigns = allCampaigns.length;
      const fundedCampaigns = allCampaigns.filter((c) => c.status === 'Funded' || c.raisedAmount >= c.targetAmount).length;

      res.json({
        success: true,
        data: { totalRaised, totalBackers, totalCampaigns, fundedCampaigns }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const totalRaised = db.campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
    const totalBackers = db.campaigns.reduce((acc, c) => acc + c.backersCount, 0);
    const totalCampaigns = db.campaigns.length;
    const fundedCampaigns = db.campaigns.filter((c) => c.status === 'Funded' || c.raisedAmount >= c.targetAmount).length;

    res.json({
      success: true,
      data: { totalRaised, totalBackers, totalCampaigns, fundedCampaigns }
    });
  }
};
