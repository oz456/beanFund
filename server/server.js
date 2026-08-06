const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDbStatus } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfund_db';

// Middleware
app.use(cors());
app.use(express.json());

// Attempt MongoDB Connection
connectDB(MONGO_URI);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BEANFUND Crowdfunding Platform API',
    database: getDbStatus() ? 'MongoDB Connected' : 'JSON File-System Persistent Cache'
  });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/stats', statsRoutes);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`BEANFUND API Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
