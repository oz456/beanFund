const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure database data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

// In-Memory Database Cache object to preserve reference bindings
const db = {
  campaigns: [],
  users: []
};

function saveCampaignsToDisk() {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(db.campaigns, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write campaigns to disk:', err.message);
  }
}

function loadCampaignsFromDisk() {
  if (fs.existsSync(CAMPAIGNS_FILE)) {
    try {
      const content = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      db.campaigns = JSON.parse(content);
      return db.campaigns;
    } catch (err) {
      console.error('Failed to parse campaigns.json from disk, loading defaults:', err.message);
    }
  }
  db.campaigns = JSON.parse(JSON.stringify(defaultCampaigns));
  saveCampaignsToDisk();
  return db.campaigns;
}

function saveUsersToDisk() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(db.users, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write users to disk:', err.message);
  }
}

function loadUsersFromDisk() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const content = fs.readFileSync(USERS_FILE, 'utf8');
      db.users = JSON.parse(content);
      return db.users;
    } catch (err) {
      console.error('Failed to parse users.json from disk, seeding defaults:', err.message);
    }
  }
  db.users = JSON.parse(JSON.stringify(defaultUsers));
  saveUsersToDisk();
  return db.users;
}

// Load databases immediately
loadCampaignsFromDisk();
loadUsersFromDisk();

module.exports = {
  db,
  saveCampaignsToDisk,
  saveUsersToDisk,
  defaultCampaigns,
  defaultUsers,
  loadUsersFromDisk
};
