const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

// create resource
router.post('/', async (req, res) => {
  try {
    const resource = new Resource(req.body);
    const saved = await resource.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// stats
router.get('/stats', async (req, res) => {
  try {
    const all = await Resource.find();
    const approvedBookings = await Booking.find({ status: 'APPROVED' }).populate('resource user');
    const bookedResourceIds = new Set(approvedBookings.map(b => b.resource && b.resource._id.toString()));

    const available = all.filter(r => !bookedResourceIds.has(r._id.toString()));
    const bookedDTOs = approvedBookings.map(b => ({
      id: b._id,
      userId: b.user?._id,
      resourceId: b.resource?._id,
      startTime: b.startTime,
      endTime: b.endTime,
      purpose: b.purpose,
      participants: b.participants,
      status: b.status,
      rejectionReason: b.rejectionReason
    }));

    res.json({
      totalResources: all.length,
      availableResources: available.length,
      bookedResources: bookedResourceIds.size,
      totalList: all,
      availableList: available,
      bookedList: bookedDTOs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;