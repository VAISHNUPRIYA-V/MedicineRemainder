// controllers/reminderController.js
const Reminder = require('../models/Reminder');
const History = require('../models/History');
const moment = require('moment');
// controllers/reminderController.js

exports.setReminder = async (req, res) => {
  try {
    const { medicineId, reminderTime, note } = req.body; // adjust fields as needed
    const userId = req.user.id;

    const newReminder = new Reminder({
      userId,
      medicineId,
      reminderTime,
      note,
      status: 'Pending', // or default status
    });

    await newReminder.save();

    res.status(200).json({ message: 'Reminder set successfully', reminder: newReminder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/reminderController.js




exports.updateReminderStatus = async (req, res) => {
  try {
    const { reminderId, status } = req.body;
    const userId = req.user.id; // User extracted from authentication middleware

    // Log the incoming request data for debugging
    console.log("Updating reminder with ID:", reminderId);
    console.log("User ID from token:", userId);
    
    // Find the reminder by reminderId and userId
    const reminder = await Reminder.findOne({ _id: reminderId, userId });
    
    // Log the reminder found (if any)
    console.log("Reminder found:", reminder);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Update the status of the reminder
    reminder.status = status;
    await reminder.save();

    // Optionally, record this action in the History model
    await History.create({
      userId,
      medicineId: reminder.medicineId,
      status,
      time: moment().format('HH:mm'),
      date: new Date(),
    });

    // Return updated reminder
    res.status(200).json({
      message: 'Reminder status updated successfully',
      reminder: reminder,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// controllers/reminderController.js

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
