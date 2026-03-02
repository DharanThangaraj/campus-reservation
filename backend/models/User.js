const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['STUDENT', 'FACULTY', 'ADMIN'],
    default: 'STUDENT'
  }
});

module.exports = mongoose.model('User', UserSchema);
