// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  mobile: String,
  email: { type: String, required: true, unique: true },
  password: String,
  preferences: {
    sound: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('User', userSchema);
