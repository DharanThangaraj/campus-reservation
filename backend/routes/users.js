const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // hash password before storing
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    const saved = await user.save();
    // do not return password, expose `id` property instead of `_id`
    const dto = {
      id: saved._id,
      name: saved.name,
      email: saved.email,
      role: saved.role
    };
    res.status(201).json(dto);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const dto = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    res.json(dto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const dtos = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role
    }));
    res.json(dtos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
