# 🧸 BEANFUND.

> **"A minimalist, product-level crowdfunding platform for wild inventions, passion projects, and mischievous gadgets."**

---

[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19.2-black?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Parcel](https://img.shields.io/badge/Parcel-2.12.0-yellow?style=for-the-badge&logo=parcel&logoColor=white)](https://parceljs.org/)
[![CSS3](https://img.shields.io/badge/CSS3-Vanilla-red?style=for-the-badge&logo=css3&logoColor=white)](#design-aesthetics)

---

## 🎯 Purpose & Vision

**BeanFund** is a full-stack crowdfunding portal designed around the whimsical universe of **Mr. Bean**. The platform is dedicated to raising imaginary capital for quirky inventions, mischief technologies, and eccentric items (like gyroscopic stabilizer rigs for 3-wheelers or automated sandwich-making sofas). 

Built to demonstrate **modern full-stack practices**, the application features:
- A responsive, high-fidelity **Neubrutalism B&W Design System**.
- A reactive frontend built on **React 18** and bundled with **Parcel**.
- A robust **Node.js/Express REST API** with a smart **dual-database setup** (MongoDB with automated fallback to JSON filesystem storage).

---

## 🎨 Neubrutalism Design Philosophy

The application utilizes a premium **Neubrutalism Black & White** styling concept:
- **Thick Solid Borders**: Heavy `#000000` boundaries (`4px` borders).
- **High-Contrast Accents**: Vibrant neon green (`#adff2f`), canary yellow (`#ffd700`), and caution oranges.
- **Harsh Drop Shadows**: Deep blocky shadows for buttons and container cards (`box-shadow: 4px 4px 0px #000;`).
- **Interactive States**: Playful micro-animations and hover transitions that shift elements to give a tactile, desktop-app feel.
- **Mascot Integration**: Floating interactive avatar buttons and an embedded theme song engine.

---

## ✨ Key Features

*   📊 **Real-Time Global Dashboard**: Live tracking of total pledged dollars ($), total backer count, and fully funded projects counter.
*   🛒 **Interactive Campaign Engine**:
    *   **Live Funding Progress**: Smooth percentage-based progress bars reflecting live backer activity.
    *   **Interactive Tiers**: Choose between custom pledge values or pre-configured Reward Perks ($10, $50, $200).
    *   **Dynamic Stretch Goals**: Milestones (e.g. motorized updates) unlock automatically in real-time as pledge thresholds are crossed.
*   📣 **Community Backer Interaction**:
    *   **Guestbook Wall**: Backers can post custom messages, select an emoji avatar, and leave a permanent mark on the campaign's comments board.
    *   **Decision Polls**: Real-time voting on active campaign design choices (e.g. sweater color choices).
    *   **Creator Updates**: Read milestone update posts from inventors and leave quick emoji reactions.
*   🚀 **Creator Campaign Launchpad**: Create, configure, and publish your own campaigns with custom targets, categories, tags, and descriptions.

---

## 📂 Directory Structure



  
```
beanFund/
├── .env.example              # Template file for database, ports, and tokens
├── README.md                 # Interactive platform guide
├── client/                   # Frontend App (React + Parcel)
│   ├── package.json          # Client scripts, react dependencies & Parcel settings
│   ├── public/
│   │   ├── index.html        # Entry HTML layout
│   │   ├── mr-bean.png       # Theme mascot resource
│   │   └── mr-bean-theme.mp3 # Theme audio resource
│   └── src/
│       ├── App.js            # Core Crowdfunding Interface & Modal layouts
│       ├── App.css           # Custom B&W Neubrutalism Design System Styles
│       └── index.js          # Client entrypoint
└── server/                   # Backend Server (Node.js + Express)
    ├── server.js             # API routes, seeding cache & file persistent fallback
    ├── package.json          # Server scripts (Express, Mongoose, Nodemon)
    └── data/                 # JSON File Database fallback storage
        ├── campaigns.json    # Persistent campaign storage
        └── users.json        # Persistent user profiles database
```

---

## 🚀 Setup & Installation (Step-by-Step)

Follow these instructions to clone, install, configure, and run **BeanFund** locally on your computer.

### 📋 Prerequisites
Make sure you have [Node.js (v16+)](https://nodejs.org/) installed. 

---

### Step 1: Clone the Repository
Open a terminal (Command Prompt, PowerShell, or Git Bash) and execute:
```bash
git clone https://github.com/your-username/beanFund.git
cd beanFund
```

---

### Step 2: Configure Environment Variables
Copy the `.env.example` file to create a `.env` configuration file:
*   **On Windows (PowerShell):**
    ```powershell
    Copy-Item .env.example .env
    ```
*   **On macOS/Linux:**
    ```bash
    cp .env.example .env
    ```

> [!NOTE]
> **No database setup is required to run the app immediately!** 
> If `MONGO_URI` is left unconfigured or MongoDB is offline, the server automatically boots in **JSON-filesystem persistent fallback mode** (writing directly to `server/data/campaigns.json` and `server/data/users.json`).

---

### Step 3: Run the Backend API Server
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Boot the backend server:
   ```bash
   npm start
   ```
   *The API will start running on **[http://localhost:5000](http://localhost:5000)**.*

---

### Step 4: Run the Frontend Client Application
1. Open a **new, separate terminal** in the root of the project.
2. Navigate to the `client` folder:
   ```bash
   cd client
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development bundler:
   ```bash
   npm start
   ```
   *The website will start running on **[http://localhost:3002](http://localhost:3002)**.*

---

## 👤 Test Accounts (Pre-Seeded)

The database automatically initializes with three test accounts. You can log in with them inside the **Creator Studio** or Register a new user:

| Username | Password | Bio | Avatar |
| :--- | :--- | :--- | :--- |
| **`bean`** | `123` | Inventor of the companion Teddy 2.0 & Mini driver. | 🧸 |
| **`irma`** | `123` | Dedicated Teddy admirer and cinema lover. | ❤️ |
| **`wicket`** | `123` | Feisty landlord. Demands rent on time. | 😾 |

---

## ⚙️ REST API Endpoints Reference

### 🔐 Authentication Routes
*   `POST /api/auth/register` — Create a new user account.
*   `POST /api/auth/login` — Log in to an existing account.
*   `GET /api/users/:username` — Fetch user details, their creations, and pledge history.

### 🧸 Crowdfunding Routes
*   `GET /api/stats` — Fetch global platform statistics.
*   `GET /api/campaigns` — Fetch list of all crowdfunding campaigns.
*   `GET /api/campaigns/:id` — Get detailed metadata for a specific campaign.
*   `POST /api/campaigns` — Launch and publish a new campaign.
*   `POST /api/campaigns/:id/pledge` — Submit a pledge / back a project.
*   `POST /api/campaigns/:id/messages` — Add comments directly onto a campaign's feedback wall.
*   `POST /api/campaigns/:id/polls/:pollId/vote` — Cast a vote on active campaign design choices.
*   `POST /api/campaigns/:id/updates` — Publish inventor progress updates (Creators only).
*   `POST /api/campaigns/:id/updates/:updateId/react` — Add emoji reactions (`🧸`, `🔥`, `❤️`, `👍`, `😂`) to a progress update.

---

## 🛠️ Verification & Testing Checklists

To make sure your environment is fully healthy, try verifying these features:
1. Open the homepage at `http://localhost:3002` and ensure project counts are visible.
2. Click on a category pill like **Inventions** to see instant UI filtering.
3. Open a project detail modal, click the **Back This Project** button, and pledge `$50` to unlock rewards.
4. Go to the comments section on the project detail modal, and post a guestbook comment.
5. Log in as user `bean` (password `123`) and submit a new campaign using the **Launch Campaign** editor.
