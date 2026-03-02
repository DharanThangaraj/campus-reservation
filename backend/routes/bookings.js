const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

// helper for notifications
async function createNotification(userId, message) {
  const n = new Notification({ user: userId, message });
  await n.save();
}

// validation logic extracted from Java service
function validateBooking(user, request) {
  const start = new Date(request.startTime);
  const end = new Date(request.endTime);
  const durationMs = end - start;
  // 1. working hours
  if (start.getHours() < 9 || end.getHours() > 17 || (end.getHours() === 17 && end.getMinutes() > 0)) {
    const err = new Error('Select at working hours (9 AM - 5 PM)');
    err.status = 400;
    throw err;
  }
  // break times
  const toMinutes = (d) => d.getHours() * 60 + d.getMinutes();
  const isOverlap = (s, e, a, b) => s < b && a < e;
  if (isOverlap(toMinutes(start), toMinutes(end), 10 * 60 + 30, 11 * 60)) {
    const err = new Error('Booking overlaps with morning break (10:30 AM - 11:00 AM)');
    err.status = 400;
    throw err;
  }
  if (isOverlap(toMinutes(start), toMinutes(end), 12 * 60 + 30, 13 * 60 + 30)) {
    const err = new Error('Booking overlaps with lunch time (12:30 PM - 01:30 PM)');
    err.status = 400;
    throw err;
  }
  // role duration
  let maxHrs = 0;
  if (user.role === 'STUDENT') maxHrs = 2;
  else if (user.role === 'FACULTY') maxHrs = 3;
  else if (user.role === 'ADMIN') maxHrs = 8;
  if (durationMs > maxHrs * 60 * 60 * 1000) {
    const err = new Error(`Maximum duration for ${user.role} is ${maxHrs} hours`);
    err.status = 400;
    throw err;
  }
  // capacity
  const cap = request.participants;
  if (cap > user.resourceCapacity) {
    // this won't happen because we don't have resource object here; capacity check performed later
  }
}

// create booking
router.post('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const data = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resource = await Resource.findById(data.resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // run validation (some checks already enforced on frontend)
    // check participants vs capacity
    if (data.participants > resource.capacity) {
      return res.status(400).json({ message: `Booking participants (${data.participants}) exceed resource capacity (${resource.capacity})` });
    }
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const duration = (end - start) / (1000 * 60 * 60);
    if (start.getHours() < 9 || (end.getHours() > 17 || (end.getHours() === 17 && end.getMinutes() > 0))) {
      return res.status(400).json({ message: 'Select at working hours (9 AM - 5 PM)' });
    }
    const toMin = d => d.getHours() * 60 + d.getMinutes();
    const morningOverlap = (s,e) => s < 11*60 && e > 10*60+30;
    const lunchOverlap = (s,e) => s < 13*60+30 && e > 12*60+30;
    if (morningOverlap(start,end)) return res.status(400).json({ message: 'Booking overlaps with morning break (10:30 AM - 11:00 AM)' });
    if (lunchOverlap(start,end)) return res.status(400).json({ message: 'Booking overlaps with lunch time (12:30 PM - 01:30 PM)' });
    let maxHrs = 0;
    if (user.role === 'STUDENT') maxHrs = 2;
    else if (user.role === 'FACULTY') maxHrs = 3;
    else if (user.role === 'ADMIN') maxHrs = 8;
    if (duration > maxHrs) return res.status(400).json({ message: `Maximum duration for ${user.role} is ${maxHrs} hours` });

    const booking = new Booking({
      user: user._id,
      resource: resource._id,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      participants: data.participants
    });

    if (user.role === 'STUDENT') {
      booking.status = 'PENDING_FACULTY';
      const faculty = await User.find({ role: 'FACULTY' });
      await Promise.all(faculty.map(f => createNotification(f._id, `New booking request from student: ${user.name}`)));
    } else if (user.role === 'FACULTY') {
      booking.status = 'PENDING_ADMIN';
      const admins = await User.find({ role: 'ADMIN' });
      await Promise.all(admins.map(a => createNotification(a._id, `New booking request from faculty: ${user.name}`)));
    } else if (user.role === 'ADMIN') {
      booking.status = 'APPROVED';
    }

    const saved = await booking.save();
    res.status(201).json({
      id: saved._id,
      userId: saved.user,
      resourceId: saved.resource,
      startTime: saved.startTime,
      endTime: saved.endTime,
      purpose: saved.purpose,
      participants: saved.participants,
      status: saved.status,
      rejectionReason: saved.rejectionReason
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
});

// faculty approval
router.put('/:id/approve-faculty', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'PENDING_FACULTY') return res.status(400).json({ message: 'Booking is not pending faculty approval' });
    booking.status = 'PENDING_ADMIN';
    const updated = await booking.save();
    // notify admins
    const admins = await User.find({ role: 'ADMIN' });
    await Promise.all(admins.map(a => createNotification(a._id, `Faculty approved student booking: ${booking._id}`)));
    res.json({
      id: updated._id,
      userId: updated.user,
      resourceId: updated.resource,
      startTime: updated.startTime,
      endTime: updated.endTime,
      purpose: updated.purpose,
      participants: updated.participants,
      status: updated.status,
      rejectionReason: updated.rejectionReason
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// admin approval
router.put('/:id/approve-admin', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'PENDING_ADMIN') return res.status(400).json({ message: 'Booking is not pending admin approval' });
    booking.status = 'APPROVED';
    const updated = await booking.save();
    // notify requester
    await createNotification(booking.user, 'Your booking has been approved by admin.');
    // if student, notify all faculty
    const requester = await User.findById(booking.user);
    if (requester && requester.role === 'STUDENT') {
      const faculty = await User.find({ role: 'FACULTY' });
      await Promise.all(faculty.map(f => createNotification(f._id, `Admin approved student booking you recommended: ${booking._id}`)));
    }
    res.json({
      id: updated._id,
      userId: updated.user,
      resourceId: updated.resource,
      startTime: updated.startTime,
      endTime: updated.endTime,
      purpose: updated.purpose,
      participants: updated.participants,
      status: updated.status,
      rejectionReason: updated.rejectionReason
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// reject booking
router.put('/:id/reject', async (req, res) => {
  try {
    const reason = req.query.reason || req.body.reason;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'REJECTED';
    booking.rejectionReason = reason;
    const updated = await booking.save();
    await createNotification(booking.user, `Your booking has been rejected. Reason: ${reason}`);
    res.json({
      id: updated._id,
      userId: updated.user,
      resourceId: updated.resource,
      startTime: updated.startTime,
      endTime: updated.endTime,
      purpose: updated.purpose,
      participants: updated.participants,
      status: updated.status,
      rejectionReason: updated.rejectionReason
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// list all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user resource');
    const dtos = bookings.map(b => ({
      id: b._id,
      userId: b.user && b.user._id,
      resourceId: b.resource && b.resource._id,
      startTime: b.startTime,
      endTime: b.endTime,
      purpose: b.purpose,
      participants: b.participants,
      status: b.status,
      rejectionReason: b.rejectionReason
    }));
    res.json(dtos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
