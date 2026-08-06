const { getDbStatus } = require('../config/db');
const User = require('../models/User');
const { db, saveUsersToDisk } = require('../services/diskStorage');

exports.register = async (req, res) => {
  const { username, password, bio, avatar } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const existing = await User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }

      const newUser = new User({
        id: 'u_' + Date.now(),
        username: username.trim(),
        password: password,
        bio: bio || 'Silly inventor in the making.',
        avatar: avatar || '⚙️',
        backedPledges: [],
        createdCampaigns: []
      });

      await newUser.save();
      res.status(201).json({ success: true, user: newUser });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const existing = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const newUser = {
      id: 'u_' + Date.now(),
      username: username.trim(),
      password: password,
      bio: bio || 'Silly inventor in the making.',
      avatar: avatar || '⚙️',
      backedPledges: [],
      createdCampaigns: []
    };

    db.users.push(newUser);
    saveUsersToDisk();
    res.status(201).json({ success: true, user: newUser });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const user = await User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') }, password });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    res.json({ success: true, user });
  }
};

exports.getProfile = async (req, res) => {
  const isDbConnected = getDbStatus();
  if (isDbConnected) {
    try {
      const user = await User.findOne({ username: { $regex: new RegExp('^' + req.params.username + '$', 'i') } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    const user = db.users.find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  }
};
