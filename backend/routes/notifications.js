const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

// get notifications for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// mark single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (n) {
      n.isRead = true;
      await n.save();
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// mark all as read for user
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Notification.updateMany({ user: user._id, isRead: false }, { isRead: true });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;