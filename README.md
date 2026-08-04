# BEANFUND. — Full-Stack Crowdfunding Platform

A unique, minimalist, product-level crowdfunding platform for wild inventions, passion projects, and mischievous gadgets built with **React**, **Node.js/Express**, and **MongoDB**.

## Features
- **Real-Time Platform Dashboard**: Dynamic tracking of total pledged dollars ($), total backers, and funded projects count.
- **Interactive Campaign Funding Engine**:
  - Live progress bars showing percentage funded (`87% Funded`).
  - Real-time pledge submission modal updating total funds raised (`POST /api/campaigns/:id/pledge`).
  - Tiered Backer Perks ($10, $50, $200 rewards).
- **Launch Project Flow**: Creators can publish new crowdfunding campaigns with custom target goals, deadlines, and categories.
- **Filters & Search**: Live filtering by category (*Inventions, Home & Gadgets, Automotive, Mischief Tech*) and campaign status (*Active vs. Fully Funded*).
- **Signature Mascot Touch**: Floating round Mr. Bean real PNG avatar toggle button playing the theme song on loop.

## Architecture

```
crowdsource/
├── .env.example             # Environment template (MongoDB URI, PORT, Secrets)
├── client/                  # React Frontend (Parcel bundler)
│   ├── public/
│   │   ├── index.html
│   │   ├── mr-bean.png
│   │   └── mr-bean-theme.mp3
│   └── src/
│       ├── App.js           # Live Crowdfunding Engine & Modals
│       ├── App.css          # Minimal Neubrutalism B&W Design System
│       └── index.js
├── server/                  # Node.js + Express Backend REST API
│   ├── server.js            # Express API endpoints & MongoDB / In-memory store
│   └── package.json
└── README.md
```

## How to Run

### 1. Backend API Server
```bash
cd server
npm install
npm start
```
*Runs on `http://localhost:5000`*

### 2. Frontend App
```bash
cd client
npm install
npm start
```
*Runs on `http://localhost:3002`*
