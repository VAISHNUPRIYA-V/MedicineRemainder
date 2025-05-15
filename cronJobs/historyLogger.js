// cronJobs/historyLogger.js
const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const History = require('../models/History');
const moment = require('moment');

const logMedicationEvents = async () => {
  try {
    const now = moment();
    const todayStart = now.clone().startOf('day');
    const todayEnd = now.clone().endOf('day');

    // Log "Missed" for expired medications (existing logic)
    const expiredMeds = await Medicine.find({
      userId: { $exists: true }, // Ensure it belongs to a user
      endDate: { $lt: todayStart.toDate() }
    });

    for (const med of expiredMeds) {
      const alreadyLogged = await History.findOne({
        medicineId: med._id,
        userId: med.userId,
        date: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() },
        status: 'Missed'
      });
      if (!alreadyLogged) {
        const newHistory = new History({
          userId: med.userId,
          medicineId: med._id,
          date: todayStart.toDate(),
          time: now.format('HH:mm'),
          status: 'Missed'
        });
        await newHistory.save();
      }
    }

    // Log "Missed" for scheduled doses not marked as "Taken"
    const activeMeds = await Medicine.find({
      userId: { $exists: true },
      endDate: { $gte: todayStart.toDate() },
      scheduledTime: { $exists: true, $ne: null } // Assuming you have a scheduledTime field
    });

    for (const med of activeMeds) {
      const scheduledMoment = moment(med.scheduledTime, 'HH:mm'); // Assuming 'HH:mm' format
      const scheduledToday = scheduledMoment.clone().set({
        year: now.year(),
        month: now.month(),
        date: now.date()
      });

      // Check if the scheduled time has passed and it hasn't been marked as taken today
      if (now.isAfter(scheduledToday)) {
        const alreadyLoggedTaken = await History.findOne({
          medicineId: med._id,
          userId: med.userId,
          date: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() },
          status: 'Taken',
          time: { $gte: scheduledMoment.clone().subtract(30, 'minutes').format('HH:mm'), $lte: scheduledMoment.clone().add(30, 'minutes').format('HH:mm') } // Check within a window
        });

        const alreadyLoggedMissed = await History.findOne({
          medicineId: med._id,
          userId: med.userId,
          date: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() },
          status: 'Missed',
          time: { $gte: scheduledMoment.clone().subtract(30, 'minutes').format('HH:mm'), $lte: scheduledMoment.clone().add(30, 'minutes').format('HH:mm') }
        });

        if (!alreadyLoggedTaken && !alreadyLoggedMissed) {
          const newHistory = new History({
            userId: med.userId,
            medicineId: med._id,
            date: todayStart.toDate(),
            time: scheduledMoment.format('HH:mm'),
            status: 'Missed'
          });
          await newHistory.save();
        }
      }
    }

    console.log("Medication event history logged.");
  } catch (err) {
    console.error("Error logging history:", err.message);
  }
};

const startHistoryLogger = () => {
  cron.schedule('*/15 * * * *', logMedicationEvents); // Run every 15 minutes
};

module.exports = startHistoryLogger;