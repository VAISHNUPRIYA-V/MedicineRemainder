// models/Medicine.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String,
  dosage: String,
  frequency: Number,
  times: [String], 
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Medicine', medicineSchema);
