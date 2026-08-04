const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfund_db';

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Crowdfunding Campaigns Database (Product-Level Initial Seed)
let campaigns = [
  {
    id: '1',
    title: 'Teddy 2.0: AI-Powered Autonomous Companion',
    tagline: 'The classic knitted teddy bear upgraded with voice recognition and zero attitude.',
    description: 'We are retrofitting the iconic 1990 knitted Teddy with state-of-the-art micro-controllers, soft velvet sensors, and a gentle humming engine to recreate Mr. Bean\'s loyal sidekick for the modern era.',
    category: 'Inventions',
    creator: 'Bean Robotics Lab',
    targetAmount: 10000,
    raisedAmount: 8750,
    backersCount: 142,
    daysLeft: 12,
    status: 'Active',
    rewards: [
      { id: 'r1', title: 'Teddy\'s Nod', minPledge: 10, perk: 'Digital certificate signed by Teddy' },
      { id: 'r2', title: 'Stitched Edition', minPledge: 50, perk: 'Custom woven Teddy badge + Early Backer credit' },
      { id: 'r3', title: 'The Tweed Patron', minPledge: 200, perk: '1x Physical Teddy 2.0 Prototype + Executive Producer credit' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'The Automatic Sandwich-Making Sofa',
    tagline: 'Make fresh buttered toast and tea without leaving your armchair during TV time.',
    description: 'Inspired by lazy Sunday afternoons. Built into a high-density memory foam sofa with built-in toaster slots, jam dispensers, and an automated teabag dropping arm.',
    category: 'Home & Gadgets',
    creator: 'Living Room Engineers',
    targetAmount: 5000,
    raisedAmount: 5120,
    backersCount: 98,
    daysLeft: 0,
    status: 'Funded',
    rewards: [
      { id: 'r4', title: 'Toast Lover', minPledge: 15, perk: 'Branded sofa mug + Butter knife' },
      { id: 'r5', title: 'Sofa Pioneer', minPledge: 150, perk: 'Early bird sofa unit voucher' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Reliant Robin 3-Wheel Stabilizer Rig',
    tagline: 'Prevent the iconic blue 3-wheeler from flipping over at every single intersection.',
    description: 'A revolutionary gyroscopic bumper extension engineered specifically to keep 3-wheeled vehicles right-side up, no matter how aggressively Mr. Bean overtakes them in his Mini.',
    category: 'Automotive',
    creator: 'Blue Car Defense Squad',
    targetAmount: 3500,
    raisedAmount: 2400,
    backersCount: 64,
    daysLeft: 18,
    status: 'Active',
    rewards: [
      { id: 'r6', title: 'Support Sticker', minPledge: 5, perk: 'Anti-Flipper bumper sticker' },
      { id: 'r7', title: 'Mechanic Pack', minPledge: 75, perk: 'Full stabilizer kit with instructions' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'The Water Bucket Alarm Clock',
    tagline: 'Guaranteed 100% wake-up rate for heavy sleepers. No snooze button.',
    description: 'Connects directly to your morning alarm. If you don\'t stand up within 10 seconds of the alarm ringing, an overhead bucket tips 2 liters of ice water.',
    category: 'Mischief Tech',
    creator: 'Mrs. Wicket Innovations',
    targetAmount: 2000,
    raisedAmount: 1850,
    backersCount: 41,
    daysLeft: 5,
    status: 'Active',
    rewards: [
      { id: 'r8', title: 'Early Bird Waker', minPledge: 25, perk: 'Complete bucket mechanism + Waterproof towel' }
    ],
    createdAt: new Date().toISOString()
  }
];

let isDbConnected = false;

// Attempt MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log('MongoDB connected successfully!');
  })
  .catch((err) => {
    console.log('MongoDB not connected (Running in fast In-Memory fallback mode):', err.message);
  });

// REST API ENDPOINTS

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BEANFUND Crowdfunding Platform API',
    database: isDbConnected ? 'MongoDB Connected' : 'In-Memory Mode'
  });
});

// 2. GET Platform Stats Summary
app.get('/api/stats', (req, res) => {
  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalBackers = campaigns.reduce((acc, c) => acc + c.backersCount, 0);
  const totalCampaigns = campaigns.length;
  const fundedCampaigns = campaigns.filter((c) => c.status === 'Funded' || c.raisedAmount >= c.targetAmount).length;

  res.json({
    success: true,
    data: {
      totalRaised,
      totalBackers,
      totalCampaigns,
      fundedCampaigns
    }
  });
});

// 3. GET All Crowdfunding Campaigns
app.get('/api/campaigns', (req, res) => {
  res.json({
    success: true,
    count: campaigns.length,
    data: campaigns
  });
});

// 4. GET Single Campaign Details
app.get('/api/campaigns/:id', (req, res) => {
  const campaign = campaigns.find((c) => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }
  res.json({ success: true, data: campaign });
});

// 5. POST Back / Pledge to a Campaign
app.post('/api/campaigns/:id/pledge', (req, res) => {
  const { amount, backerName } = req.body;
  const pledgeAmount = Number(amount);

  if (!pledgeAmount || pledgeAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid pledge amount' });
  }

  const campaignIndex = campaigns.findIndex((c) => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const campaign = campaigns[campaignIndex];
  campaign.raisedAmount += pledgeAmount;
  campaign.backersCount += 1;

  if (campaign.raisedAmount >= campaign.targetAmount) {
    campaign.status = 'Funded';
  }

  res.json({
    success: true,
    message: `Successfully pledged $${pledgeAmount}! Thank you for backing ${campaign.title}.`,
    data: campaign
  });
});

// 6. POST Launch New Crowdfunding Campaign
app.post('/api/campaigns', (req, res) => {
  const { title, tagline, description, category, creator, targetAmount, daysLeft, rewards } = req.body;

  if (!title || !description || !targetAmount) {
    return res.status(400).json({ success: false, message: 'Title, description, and target amount are required.' });
  }

  const newCampaign = {
    id: Date.now().toString(),
    title,
    tagline: tagline || title,
    description,
    category: category || 'Inventions',
    creator: creator || 'Anonymous Backer',
    targetAmount: Number(targetAmount) || 1000,
    raisedAmount: 0,
    backersCount: 0,
    daysLeft: Number(daysLeft) || 30,
    status: 'Active',
    rewards: rewards || [
      { id: 'r_new', title: 'Early Backer', minPledge: 10, perk: 'Special Thank You credit on campaign page' }
    ],
    createdAt: new Date().toISOString()
  };

  campaigns.unshift(newCampaign);
  res.status(201).json({ success: true, data: newCampaign });
});

// Start Server
app.listen(PORT, () => {
  console.log(`BEANFUND API Server running on http://localhost:${PORT}`);
});
