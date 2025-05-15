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

            // Check if the scheduled time for today has passed
            if (now.isAfter(scheduledToday)) {
                // Check if a history record already exists for this medicine, user, and scheduled time today
                const alreadyLogged = await History.findOne({
                    medicineId: med._id,
                    userId: med.userId,
                    date: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() },
                    time: scheduledMoment.format('HH:mm')
                });

                if (!alreadyLogged) {
                    const newHistory = new History({
                        userId: med.userId,
                        medicineId: med._id,
                        date: todayStart.toDate(),
                        time: scheduledMoment.format('HH:mm'),
                        status: 'Scheduled' // You can set a default status like 'Scheduled'
                    });
                    await newHistory.save();
                }
            }
        }

        console.log("Medication schedule history logged.");
    } catch (err) {
        console.error("Error logging history:", err.message);
    }
};

const startHistoryLogger = () => {
    cron.schedule('*/5 * * * *', logMedicationEvents); // Run every 15 minutes
};

module.exports = startHistoryLogger;