const mongoose = require('mongoose');
const Medication = require('../models/Medication');
const User = require('../models/User');
// const sendSMS = require('./sendSMS'); // Optional: Twilio function

const checkMedications = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  const meds = await Medication.find({});
  for (let med of meds) {
    const times = med.times.split(',');
    if (times.includes(currentTime)) {
      const user = await User.findById(med.userId);
      console.log(`Send alert for ${med.name} to ${user.phone}`);

      // Uncomment to send actual SMS:
      // await sendSMS(user.phone, `Time to take your medication: ${med.name}`);
    }
  }

  mongoose.connection.close();
};

// Run this every minute via cron or setInterval in server.js
module.exports = checkMedications;
