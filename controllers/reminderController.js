
const Reminder = require('../models/Reminder');
const History = require('../models/History');
const moment = require('moment');


exports.setReminder = async (req, res) => {
  try {
    const { medicineId, reminderTime, note } = req.body; 
    const userId = req.user.id;

    const newReminder = new Reminder({
      userId,
      medicineId,
      reminderTime,
      note,
      status: 'Pending', 
    });

    await newReminder.save();

    res.status(200).json({ message: 'Reminder set successfully', reminder: newReminder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






exports.updateReminderStatus = async (req, res) => {
  try {
    const { reminderId, status } = req.body;
    const userId = req.user.id; 

   
    console.log("Updating reminder with ID:", reminderId);
    console.log("User ID from token:", userId);
    
    
    const reminder = await Reminder.findOne({ _id: reminderId, userId });
    
    
    

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    
    reminder.status = status;
    await reminder.save();

    
    await History.create({
      userId,
      medicineId: reminder.medicineId,
      status,
      time: moment().format('HH:mm'),
      date: new Date(),
    });

   
    res.status(200).json({
      message: 'Reminder status updated successfully',
      reminder: reminder,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
