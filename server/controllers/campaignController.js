const { getDbStatus } = require('../config/db');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { db, saveCampaignsToDisk, saveUsersToDisk } = require('../services/diskStorage');

// GET All Campaigns
exports.getCampaigns = async (req, res) => {
  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const allCampaigns = await Campaign.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        count: allCampaigns.length,
        data: allCampaigns
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    res.json({
      success: true,
      count: db.campaigns.length,
      data: db.campaigns
    });
  }
};

// GET Single Campaign Details
exports.getCampaignById = async (req, res) => {
  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
      res.json({ success: true, data: campaign });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaign = db.campaigns.find((c) => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  }
};

// POST Back / Pledge to a Campaign
exports.pledgeCampaign = async (req, res) => {
  const { amount, backerName, message, emoji, username } = req.body;
  const pledgeAmount = Number(amount);

  if (!pledgeAmount || pledgeAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid pledge amount' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      campaign.raisedAmount += pledgeAmount;
      campaign.backersCount += 1;

      const cleanBackerName = (backerName && backerName.trim()) ? backerName.trim() : 'Anonymous Patron';
      const newMsg = {
        id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        backerName: cleanBackerName,
        message: message && message.trim() ? message.trim() : `Pledged $${pledgeAmount} to support this ridiculous project!`,
        emoji: emoji || '🤝',
        createdAt: new Date().toISOString()
      };

      if (!campaign.guestbook) campaign.guestbook = [];
      campaign.guestbook.unshift(newMsg);

      if (campaign.stretchGoals) {
        campaign.stretchGoals = campaign.stretchGoals.map(goal => {
          if (campaign.raisedAmount >= goal.value) {
            return { ...goal, unlocked: true };
          }
          return goal;
        });
      }

      if (campaign.raisedAmount >= campaign.targetAmount) {
        campaign.status = 'Funded';
      }

      campaign.markModified('guestbook');
      campaign.markModified('stretchGoals');
      await campaign.save();

      if (username) {
        const user = await User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } });
        if (user) {
          if (!user.backedPledges) user.backedPledges = [];
          user.backedPledges.unshift({
            campaignId: campaign.id,
            title: campaign.title,
            amount: pledgeAmount,
            timestamp: new Date().toISOString()
          });
          user.markModified('backedPledges');
          await user.save();
        }
      }

      res.json({
        success: true,
        message: `Successfully pledged $${pledgeAmount}! Thank you for backing ${campaign.title}.`,
        data: campaign
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaignIndex = db.campaigns.findIndex((c) => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = db.campaigns[campaignIndex];
    campaign.raisedAmount += pledgeAmount;
    campaign.backersCount += 1;

    const cleanBackerName = (backerName && backerName.trim()) ? backerName.trim() : 'Anonymous Patron';
    const newMsg = {
      id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      backerName: cleanBackerName,
      message: message && message.trim() ? message.trim() : `Pledged $${pledgeAmount} to support this ridiculous project!`,
      emoji: emoji || '🤝',
      createdAt: new Date().toISOString()
    };

    if (!campaign.guestbook) campaign.guestbook = [];
    campaign.guestbook.unshift(newMsg);

    if (campaign.stretchGoals) {
      campaign.stretchGoals = campaign.stretchGoals.map(goal => {
        if (campaign.raisedAmount >= goal.value) {
          return { ...goal, unlocked: true };
        }
        return goal;
      });
    }

    if (campaign.raisedAmount >= campaign.targetAmount) {
      campaign.status = 'Funded';
    }

    if (username) {
      const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
      if (userIndex !== -1) {
        if (!db.users[userIndex].backedPledges) db.users[userIndex].backedPledges = [];
        db.users[userIndex].backedPledges.unshift({
          campaignId: campaign.id,
          title: campaign.title,
          amount: pledgeAmount,
          timestamp: new Date().toISOString()
        });
        saveUsersToDisk();
      }
    }

    saveCampaignsToDisk();

    res.json({
      success: true,
      message: `Successfully pledged $${pledgeAmount}! Thank you for backing ${campaign.title}.`,
      data: campaign
    });
  }
};

// POST Launch New Crowdfunding Campaign
exports.createCampaign = async (req, res) => {
  const { title, tagline, description, category, creator, targetAmount, daysLeft, rewards, stretchGoals, budgetBreakdown } = req.body;

  if (!title || !description || !targetAmount) {
    return res.status(400).json({ success: false, message: 'Title, description, and target amount are required.' });
  }

  const target = Number(targetAmount);

  const defaultBudget = [
    { label: 'Materials & Assembly', percentage: 50 },
    { label: 'Design & Prototyping', percentage: 30 },
    { label: 'Mischief Insurance', percentage: 10 },
    { label: 'Emergency Tea Rations', percentage: 10 }
  ];

  const defaultStretch = [
    { value: Math.round(target * 1.2), label: 'Unlock deluxe material finish', unlocked: false },
    { value: Math.round(target * 1.5), label: 'Add motorized auto-wiggle action', unlocked: false },
    { value: Math.round(target * 2.0), label: 'Complete integration with Teddy voice module', unlocked: false }
  ];

  const campaignId = Date.now().toString();

  const newCampaignData = {
    id: campaignId,
    title,
    tagline: tagline || title,
    description,
    category: category || 'Inventions',
    creator: creator || 'Anonymous Backer',
    targetAmount: target,
    raisedAmount: 0,
    backersCount: 0,
    daysLeft: Number(daysLeft) || 30,
    status: 'Active',
    rewards: rewards || [
      { id: 'r_new_1', title: 'Teddy Approved Backer', minPledge: 10, perk: 'Special Thank You credit on our community board!' },
      { id: 'r_new_2', title: 'Deluxe Stitched Maker', minPledge: 45, perk: 'Early access assembly blueprints + Digital Badge' },
      { id: 'r_new_3', title: 'The Ultimate Mischief Patron', minPledge: 150, perk: 'A hand-crafted prototype + your name sewn inside Teddy!' }
    ],
    stretchGoals: stretchGoals || defaultStretch,
    budgetBreakdown: budgetBreakdown || defaultBudget,
    guestbook: [],
    polls: [
      {
        id: 'p_' + Date.now(),
        question: 'Which color variant of the prototype would you prefer?',
        options: [
          { id: 'o1', label: 'Classic Tweed Grey', votes: 0 },
          { id: 'o2', label: 'Neon Cyberpunk Green', votes: 0 },
          { id: 'o3', label: 'Bright Sunflower Yellow', votes: 0 }
        ]
      }
    ],
    updates: [
      {
        id: 'u_' + Date.now(),
        title: 'Project officially launched!',
        body: 'Welcome everyone! We have officially kicked off our crowdfunding campaign. Feel free to leave comments, vote on the launch poll, and pledge to unlock our custom stretch goals!',
        createdAt: new Date().toISOString(),
        reactions: { '🧸': 1, '❤️': 1, '👍': 1 }
      }
    ],
    createdAt: new Date().toISOString()
  };

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const newCampaign = new Campaign(newCampaignData);
      await newCampaign.save();

      const user = await User.findOne({ username: { $regex: new RegExp('^' + newCampaignData.creator + '$', 'i') } });
      if (user) {
        if (!user.createdCampaigns) user.createdCampaigns = [];
        user.createdCampaigns.push(campaignId);
        user.markModified('createdCampaigns');
        await user.save();
      }

      res.status(201).json({ success: true, data: newCampaign });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    db.campaigns.unshift(newCampaignData);
    saveCampaignsToDisk();

    const userIndex = db.users.findIndex(u => u.username.toLowerCase() === newCampaignData.creator.toLowerCase());
    if (userIndex !== -1) {
      if (!db.users[userIndex].createdCampaigns) db.users[userIndex].createdCampaigns = [];
      db.users[userIndex].createdCampaigns.push(campaignId);
      saveUsersToDisk();
    }

    res.status(201).json({ success: true, data: newCampaignData });
  }
};

// POST Add Message to Guestbook directly
exports.addGuestbookMessage = async (req, res) => {
  const { name, message, emoji } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const newMsg = {
        id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        backerName: name && name.trim() ? name.trim() : 'Anonymous Fan',
        message: message.trim(),
        emoji: emoji || '💬',
        createdAt: new Date().toISOString()
      };

      if (!campaign.guestbook) campaign.guestbook = [];
      campaign.guestbook.unshift(newMsg);
      campaign.markModified('guestbook');
      await campaign.save();

      res.json({ success: true, data: newMsg });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaignIndex = db.campaigns.findIndex((c) => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = db.campaigns[campaignIndex];
    const newMsg = {
      id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      backerName: name && name.trim() ? name.trim() : 'Anonymous Fan',
      message: message.trim(),
      emoji: emoji || '💬',
      createdAt: new Date().toISOString()
    };

    if (!campaign.guestbook) campaign.guestbook = [];
    campaign.guestbook.unshift(newMsg);

    saveCampaignsToDisk();
    res.json({ success: true, data: newMsg });
  }
};

// POST Vote in a Poll
exports.votePoll = async (req, res) => {
  const { optionId } = req.body;

  if (!optionId) {
    return res.status(400).json({ success: false, message: 'Option ID is required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
      if (!campaign.polls) {
        return res.status(404).json({ success: false, message: 'Polls not found' });
      }

      const poll = campaign.polls.find(p => p.id === req.params.pollId);
      if (!poll) {
        return res.status(404).json({ success: false, message: 'Poll not found' });
      }

      const option = poll.options.find(o => o.id === optionId);
      if (!option) {
        return res.status(404).json({ success: false, message: 'Option not found' });
      }

      option.votes += 1;
      campaign.markModified('polls');
      await campaign.save();

      res.json({ success: true, data: poll });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaignIndex = db.campaigns.findIndex((c) => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = db.campaigns[campaignIndex];
    if (!campaign.polls) {
      return res.status(404).json({ success: false, message: 'Polls not found' });
    }

    const poll = campaign.polls.find(p => p.id === req.params.pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    const option = poll.options.find(o => o.id === optionId);
    if (!option) {
      return res.status(404).json({ success: false, message: 'Option not found' });
    }

    option.votes += 1;
    saveCampaignsToDisk();

    res.json({ success: true, data: poll });
  }
};

// POST React to an Update
exports.reactUpdate = async (req, res) => {
  const { emoji } = req.body;

  if (!emoji) {
    return res.status(400).json({ success: false, message: 'Emoji is required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
      if (!campaign.updates) {
        return res.status(404).json({ success: false, message: 'Updates not found' });
      }

      const update = campaign.updates.find(u => u.id === req.params.updateId);
      if (!update) {
        return res.status(404).json({ success: false, message: 'Update not found' });
      }

      if (!update.reactions) {
        update.reactions = {};
      }

      update.reactions[emoji] = (update.reactions[emoji] || 0) + 1;
      campaign.markModified('updates');
      await campaign.save();

      res.json({ success: true, data: update });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaignIndex = db.campaigns.findIndex((c) => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = db.campaigns[campaignIndex];
    if (!campaign.updates) {
      return res.status(404).json({ success: false, message: 'Updates not found' });
    }

    const update = campaign.updates.find(u => u.id === req.params.updateId);
    if (!update) {
      return res.status(404).json({ success: false, message: 'Update not found' });
    }

    if (!update.reactions) {
      update.reactions = {};
    }

    update.reactions[emoji] = (update.reactions[emoji] || 0) + 1;
    saveCampaignsToDisk();

    res.json({ success: true, data: update });
  }
};

// POST Post Creator Update
exports.createUpdate = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const newUpdate = {
        id: 'u_' + Date.now(),
        title,
        body,
        createdAt: new Date().toISOString(),
        reactions: { '🧸': 0, '❤️': 0, '😂': 0, '🔥': 0, '👍': 0 }
      };

      if (!campaign.updates) campaign.updates = [];
      campaign.updates.unshift(newUpdate);
      campaign.markModified('updates');
      await campaign.save();

      res.status(201).json({ success: true, data: campaign });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaignIndex = db.campaigns.findIndex((c) => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = db.campaigns[campaignIndex];
    const newUpdate = {
      id: 'u_' + Date.now(),
      title,
      body,
      createdAt: new Date().toISOString(),
      reactions: { '🧸': 0, '❤️': 0, '😂': 0, '🔥': 0, '👍': 0 }
    };

    if (!campaign.updates) campaign.updates = [];
    campaign.updates.unshift(newUpdate);

    saveCampaignsToDisk();
    res.status(201).json({ success: true, data: campaign });
  }
};

// POST Post Creator Poll
exports.createPoll = async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ success: false, message: 'Question and at least 2 options are required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const campaign = await Campaign.findOne({ id: req.params.id });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const newPoll = {
        id: 'p_' + Date.now(),
        question,
        options: options.map((opt, index) => ({
          id: 'o_' + index + '_' + Date.now(),
          label: opt.trim(),
          votes: 0
        }))
      };

      if (!campaign.polls) campaign.polls = [];
      campaign.polls.unshift(newPoll);
      campaign.markModified('polls');
      await campaign.save();

      res.status(201).json({ success: true, data: campaign });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const campaignIndex = db.campaigns.findIndex((c) => c.id === req.params.id);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaign = db.campaigns[campaignIndex];
    const newPoll = {
      id: 'p_' + Date.now(),
      question,
      options: options.map((opt, index) => ({
        id: 'o_' + index + '_' + Date.now(),
        label: opt.trim(),
        votes: 0
      }))
    };

    if (!campaign.polls) campaign.polls = [];
    campaign.polls.unshift(newPoll);

    saveCampaignsToDisk();
    res.status(201).json({ success: true, data: campaign });
  }
};
