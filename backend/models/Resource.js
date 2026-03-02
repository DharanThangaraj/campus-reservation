const mongoose = require('mongoose');
const { Schema } = mongoose;

const ResourceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true }
});

module.exports = mongoose.model('Resource', ResourceSchema);
