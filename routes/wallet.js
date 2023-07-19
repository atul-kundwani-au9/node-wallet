
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add funds to the user's balance
router.post('/add-funds', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { amount } = req.body;

    user.balance += amount;
    await user.save();

    res.json({ message: 'Funds added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Withdraw funds from the user's balance
router.post('/withdraw-funds', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { amount } = req.body;

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amount;
    await user.save();

    res.json({ message: 'Funds withdrawn successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send funds to another user
router.post('/send-funds', authenticateToken, async (req, res) => {
  try {
    const sender = await User.findById(req.user.userId);
    const { recipientEmail, amount } = req.body;

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(400).json({ message: 'Recipient not found' });
    }

    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    res.json({ message: 'Funds sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
