const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfund_db';

// Middleware
app.use(cors());
app.use(express.json());

// Rich initial seed data for crowdfunding campaigns
const defaultCampaigns = [
  {
    id: '1',
    title: 'Teddy 2.0: AI-Powered Autonomous Companion',
    tagline: 'The classic knitted teddy bear upgraded with voice recognition and zero attitude.',
    description: 'We are retrofitting the iconic 1990 knitted Teddy with state-of-the-art micro-controllers, soft velvet touch sensors, and a gentle humming engine to recreate Mr. Bean\'s loyal sidekick for the modern era. Backers get first-run prototypes!',
    category: 'Inventions',
    creator: 'bean',
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
    stretchGoals: [
      { value: 9000, label: 'Custom tweed bowtie selection', unlocked: false },
      { value: 12000, label: 'Integrate squeaker voice modules', unlocked: false },
      { value: 15000, label: 'Full motorized nod & wave gesture gear', unlocked: false }
    ],
    budgetBreakdown: [
      { label: 'Microcontrollers & Electronics', percentage: 40 },
      { label: 'Premium Brown Wool & Stuffing', percentage: 25 },
      { label: 'Stitchery Labor & Crafting', percentage: 20 },
      { label: 'Tea & Sandwich Rations', percentage: 15 }
    ],
    guestbook: [
      { id: 'm1', backerName: 'wicket', message: 'If that brown rag makes any noise after 9 PM, it is going in the incinerator!', emoji: '😾', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'm2', backerName: 'irma', message: 'Oh, this is absolutely lovely! I backed for the Tweed Patron. Make sure he is extra cuddly!', emoji: '❤️', createdAt: new Date(Date.now() - 43200000).toISOString() },
      { id: 'm3', backerName: 'Hubert', message: 'Fascinating use of voice-activated servos. A masterpiece of engineering.', emoji: '🤯', createdAt: new Date(Date.now() - 7200000).toISOString() }
    ],
    polls: [
      {
        id: 'p1',
        question: 'Which sweater style should Teddy ship with?',
        options: [
          { id: 'o1', label: 'Classic Red Bowtie (Original)', votes: 74 },
          { id: 'o2', label: 'British Royal Guard Uniform', votes: 41 },
          { id: 'o3', label: 'Little Tweed Raincoat & Cap', votes: 89 }
        ]
      }
    ],
    updates: [
      {
        id: 'u1',
        title: 'Teddy\'s Left Eye Successfully Sewn!',
        body: 'After three intense hours of tailoring, we have secured Teddy\'s signature yellow-and-black button eye. We hit a small snag when the sewing needle fell into the sofa cushions, but the voice sensor testing went smoothly!',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        reactions: { '🧸': 38, '❤️': 24, '😂': 15, '👍': 45 }
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'The Automatic Sandwich-Making Sofa',
    tagline: 'Make fresh buttered toast and tea without leaving your armchair during TV time.',
    description: 'Inspired by lazy Sunday afternoons. Built into a high-density memory foam sofa with built-in toaster slots, butter dispensers, and an automated teabag dropping mechanical arm. 100% fire-safe (mostly).',
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
    stretchGoals: [
      { value: 4500, label: 'Auto jam dispenser add-on', unlocked: true },
      { value: 6000, label: 'Dual teacup warming tray', unlocked: false }
    ],
    budgetBreakdown: [
      { label: 'Reupholstering & Memory Foam', percentage: 45 },
      { label: 'Heating Elements & Toast Trays', percentage: 30 },
      { label: 'Safety Cut-Off Microswitches', percentage: 15 },
      { label: 'Jam Valve Plumbing', percentage: 10 }
    ],
    guestbook: [
      { id: 'm4', backerName: 'Sofa Enthusiast', message: 'No more commercial-break sprints to the kitchen! This is humanity\'s peak achievement.', emoji: '🥪', createdAt: new Date(Date.now() - 259200000).toISOString() }
    ],
    polls: [
      {
        id: 'p2',
        question: 'Which spread type should the automated dispenser support first?',
        options: [
          { id: 'o4', label: 'Salted Dairy Butter', votes: 52 },
          { id: 'o5', label: 'Strawberry Marmalade', votes: 31 },
          { id: 'o6', label: 'English Mustard (Bold)', votes: 9 }
        ]
      }
    ],
    updates: [
      {
        id: 'u2',
        title: 'Safety Interlocks Complete!',
        body: 'We have integrated a carbon dioxide micro-release valve next to the toaster heating elements. If a slice of bread catches fire, it is instantly smothered in 0.4 seconds. No sofa fires on our watch!',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        reactions: { '🔥': 28, '🤯': 19, '👍': 37 }
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Reliant Robin 3-Wheel Stabilizer Rig',
    tagline: 'Prevent the iconic blue 3-wheeler from flipping over at every single intersection.',
    description: 'A revolutionary gyroscopic bumper extension engineered specifically to keep 3-wheeled vehicles right-side up, no matter how aggressively Mr. Bean overtakes them in his Mini. Easy clamp-on installation!',
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
    stretchGoals: [
      { value: 3000, label: 'Safety training wheels with suspension', unlocked: false },
      { value: 5000, label: 'Stealth quick-folding arms', unlocked: false }
    ],
    budgetBreakdown: [
      { label: 'Tubular Steel & Welding', percentage: 55 },
      { label: 'Gyroscopic Dampers', percentage: 30 },
      { label: 'Bumper Clamps & Fittings', percentage: 15 }
    ],
    guestbook: [
      { id: 'm5', backerName: 'RobinDriver33', message: 'I rolled my car twice last Tuesday just turning into the petrol station. Please build this before I run out of side mirrors!', emoji: '🚗', createdAt: new Date(Date.now() - 432000000).toISOString() }
    ],
    polls: [
      {
        id: 'p3',
        question: 'What color should the stabilizer rig ship in?',
        options: [
          { id: 'o7', label: 'Caution Yellow (Highly Visible)', votes: 29 },
          { id: 'o8', label: 'Robin Blue (Blends with Chassis)', votes: 14 },
          { id: 'o9', label: 'Stealth Black (Sleek)', votes: 47 }
        ]
      }
    ],
    updates: [
      {
        id: 'u3',
        title: 'Track Testing at 45 MPH!',
        body: 'We took our prototype stabilizer rig around the test track. We simulated three sharp corners. The car tilted, but the stabilizer arms caught it perfectly, keeping all three wheels safe! The blue car stands tall.',
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        reactions: { '🎉': 44, '🚗': 26, '👍': 38 }
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// Persistent File Storage Configuration
const DATA_DIR = path.join(__dirname, 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure database data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Database Cache
let campaigns = [];
let users = [];

// Helper functions for filesystem read/write
function saveCampaignsToDisk(data) {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write campaigns to disk:', err.message);
  }
}

function loadCampaignsFromDisk() {
  if (fs.existsSync(CAMPAIGNS_FILE)) {
    try {
      const content = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse campaigns.json from disk, loading defaults:', err.message);
    }
  }
  saveCampaignsToDisk(defaultCampaigns);
  return defaultCampaigns;
}

function saveUsersToDisk(data) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write users to disk:', err.message);
  }
}

function loadUsersFromDisk() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const content = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse users.json from disk, seeding defaults:', err.message);
    }
  }
  const defaultUsers = [
    {
      id: 'u_1',
      username: 'bean',
      password: '123',
      bio: 'Inventor, driver of the lime-green Mini, best friend of Teddy.',
      avatar: '🧸',
      backedPledges: [],
      createdCampaigns: ['1']
    },
    {
      id: 'u_2',
      username: 'irma',
      password: '123',
      bio: 'Enthusiastic Teddy admirer and local cinema fan.',
      avatar: '❤️',
      backedPledges: [
        { campaignId: '1', title: 'Teddy 2.0: AI-Powered Autonomous Companion', amount: 200, timestamp: new Date(Date.now() - 43200000).toISOString() }
      ],
      createdCampaigns: []
    },
    {
      id: 'u_3',
      username: 'wicket',
      password: '123',
      bio: 'Tough landlady. Demands quiet, rent on time, and Scrapper\'s food served hot.',
      avatar: '😾',
      backedPledges: [],
      createdCampaigns: []
    }
  ];
  saveUsersToDisk(defaultUsers);
  return defaultUsers;
}

// Load databases
campaigns = loadCampaignsFromDisk();
users = loadUsersFromDisk();

let isDbConnected = false;

// Attempt MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log('MongoDB connected successfully!');
  })
  .catch((err) => {
    console.log('MongoDB not connected (Running in fast JSON-filesystem persistent mode):', err.message);
  });

// REST API ENDPOINTS

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BEANFUND Crowdfunding Platform API',
    database: isDbConnected ? 'MongoDB Connected' : 'JSON File-System Persistent Cache'
  });
});

// AUTHENTICATION ENDPOINTS

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password, bio, avatar } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    username: username.trim(),
    password: password, // Plaintext for minimal demonstration simplicity
    bio: bio || 'Silly inventor in the making.',
    avatar: avatar || '⚙️',
    backedPledges: [],
    createdCampaigns: []
  };

  users.push(newUser);
  saveUsersToDisk(users);

  res.status(201).json({ success: true, user: newUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  res.json({ success: true, user });
});

// Get User Profile details
app.get('/api/users/:username', (req, res) => {
  const user = users.find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

// CROWDFUNDING ENDPOINTS

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
  const { amount, backerName, message, emoji, username } = req.body;
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

  // Add backer comments/doodle directly to the guestbook wall
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

  // Update Stretch Goals unlock status dynamically based on funding
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

  // Associate with logged-in user profile if provided
  if (username) {
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex !== -1) {
      if (!users[userIndex].backedPledges) users[userIndex].backedPledges = [];
      users[userIndex].backedPledges.unshift({
        campaignId: campaign.id,
        title: campaign.title,
        amount: pledgeAmount,
        timestamp: new Date().toISOString()
      });
      saveUsersToDisk(users);
    }
  }

  // Save changes to disk
  saveCampaignsToDisk(campaigns);

  res.json({
    success: true,
    message: `Successfully pledged $${pledgeAmount}! Thank you for backing ${campaign.title}.`,
    data: campaign
  });
});

// 6. POST Launch New Crowdfunding Campaign
app.post('/api/campaigns', (req, res) => {
  const { title, tagline, description, category, creator, targetAmount, daysLeft, rewards, stretchGoals, budgetBreakdown } = req.body;

  if (!title || !description || !targetAmount) {
    return res.status(400).json({ success: false, message: 'Title, description, and target amount are required.' });
  }

  const target = Number(targetAmount);

  // Auto-generate standard Mr. Bean-themed budget breakdown if not provided
  const defaultBudget = [
    { label: 'Materials & Assembly', percentage: 50 },
    { label: 'Design & Prototyping', percentage: 30 },
    { label: 'Mischief Insurance', percentage: 10 },
    { label: 'Emergency Tea Rations', percentage: 10 }
  ];

  // Auto-generate stretch goals based on target goal if not provided
  const defaultStretch = [
    { value: Math.round(target * 1.2), label: 'Unlock deluxe material finish', unlocked: false },
    { value: Math.round(target * 1.5), label: 'Add motorized auto-wiggle action', unlocked: false },
    { value: Math.round(target * 2.0), label: 'Complete integration with Teddy voice module', unlocked: false }
  ];

  const campaignId = Date.now().toString();

  const newCampaign = {
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

  campaigns.unshift(newCampaign);
  saveCampaignsToDisk(campaigns);

  // Link campaign to user profile if creator matches a registered username
  const userIndex = users.findIndex(u => u.username.toLowerCase() === creator.toLowerCase());
  if (userIndex !== -1) {
    if (!users[userIndex].createdCampaigns) users[userIndex].createdCampaigns = [];
    users[userIndex].createdCampaigns.push(campaignId);
    saveUsersToDisk(users);
  }

  res.status(201).json({ success: true, data: newCampaign });
});

// 7. POST Add Message to Guestbook directly
app.post('/api/campaigns/:id/messages', (req, res) => {
  const { name, message, emoji } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const campaignIndex = campaigns.findIndex((c) => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const campaign = campaigns[campaignIndex];
  const newMsg = {
    id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    backerName: name && name.trim() ? name.trim() : 'Anonymous Fan',
    message: message.trim(),
    emoji: emoji || '💬',
    createdAt: new Date().toISOString()
  };

  if (!campaign.guestbook) campaign.guestbook = [];
  campaign.guestbook.unshift(newMsg);

  saveCampaignsToDisk(campaigns);

  res.json({ success: true, data: newMsg });
});

// 8. POST Vote in a Poll
app.post('/api/campaigns/:id/polls/:pollId/vote', (req, res) => {
  const { optionId } = req.body;

  if (!optionId) {
    return res.status(400).json({ success: false, message: 'Option ID is required' });
  }

  const campaignIndex = campaigns.findIndex((c) => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const campaign = campaigns[campaignIndex];
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
  saveCampaignsToDisk(campaigns);

  res.json({ success: true, data: poll });
});

// 9. POST React to an Update
app.post('/api/campaigns/:id/updates/:updateId/react', (req, res) => {
  const { emoji } = req.body;

  if (!emoji) {
    return res.status(400).json({ success: false, message: 'Emoji is required' });
  }

  const campaignIndex = campaigns.findIndex((c) => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const campaign = campaigns[campaignIndex];
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
  saveCampaignsToDisk(campaigns);

  res.json({ success: true, data: update });
});

// 10. POST Post Creator Update
app.post('/api/campaigns/:id/updates', (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required' });
  }

  const campaignIndex = campaigns.findIndex((c) => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const campaign = campaigns[campaignIndex];
  const newUpdate = {
    id: 'u_' + Date.now(),
    title,
    body,
    createdAt: new Date().toISOString(),
    reactions: { '🧸': 0, '❤️': 0, '😂': 0, '🔥': 0, '👍': 0 }
  };

  if (!campaign.updates) campaign.updates = [];
  campaign.updates.unshift(newUpdate);

  saveCampaignsToDisk(campaigns);

  res.status(201).json({ success: true, data: campaign });
});

// 11. POST Post Creator Poll
app.post('/api/campaigns/:id/polls', (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ success: false, message: 'Question and at least 2 options are required' });
  }

  const campaignIndex = campaigns.findIndex((c) => c.id === req.params.id);
  if (campaignIndex === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const campaign = campaigns[campaignIndex];
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

  saveCampaignsToDisk(campaigns);

  res.status(201).json({ success: true, data: campaign });
});

// Start Server
app.listen(PORT, () => {
  console.log(`BEANFUND API Server running on http://localhost:${PORT}`);
});
