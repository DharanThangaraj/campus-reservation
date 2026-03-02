const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  purpose: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING_FACULTY', 'PENDING_ADMIN', 'APPROVED', 'REJECTED'],
    default: 'PENDING_FACULTY'
  },
  rejectionReason: { type: String },
  participants: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
