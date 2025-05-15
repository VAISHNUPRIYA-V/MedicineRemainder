const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const History = require('../models/History');
const moment = require('moment');

const logMedicationEvents = async () => {
    try {
        const now = moment.utc(); // Use UTC for consistency
        const todayStart = now.clone().startOf('day');
        const todayEnd = now.clone().endOf('day');

        const activeMeds = await Medicine.find({
            userId: { $exists: true },
            endDate: { $gte: todayStart.toDate() }, // Consider meds active today or in the future
            times: { $exists: true, $not: { $size: 0 } }, // Ensure there are times
            startDate: { $lte: todayEnd.toDate() } // Ensure the medication started by today
        });

        for (const med of activeMeds) {
            const startDate = moment.utc(med.startDate); // Use UTC
            const endDate = moment.utc(med.endDate);     // Use UTC

            // Iterate through each date from startDate to endDate
            for (let currentDate = startDate.clone(); currentDate.isSameOrBefore(endDate); currentDate.add(1, 'day')) {
                // Iterate through each scheduled time
                for (const time of med.times) {
                    const scheduledTimeMoment = moment.utc(time, 'HH:mm'); // Parse time in UTC
                    const scheduledDateTime = currentDate.clone().set({
                        hour: scheduledTimeMoment.hour(),
                        minute: scheduledTimeMoment.minute(),
                        second: 0,
                        millisecond: 0
                    });

                    // Check if the scheduled time is in the past
                    if (scheduledDateTime.isBefore(now)) {
                        const alreadyLogged = await History.findOne({
                            userId: med.userId,
                            medicineId: med._id,
                            date: scheduledDateTime.clone().startOf('day').toDate(),
                            time: scheduledDateTime.format('HH:mm')
                        });

                        if (!alreadyLogged) {
                            const newHistory = new History({
                                userId: med.userId,
                                medicineId: med._id,
                                date: scheduledDateTime.clone().startOf('day').toDate(),
                                time: scheduledDateTime.format('HH:mm'),
                                status: 'Scheduled'
                            });
                            await newHistory.save();
                            console.log(`Logged past schedule: ${med.name} on ${scheduledDateTime.format('YYYY-MM-DD HH:mm')}`);
                        }
                    }
                }
            }
        }

        console.log("Medication schedule history logged.");
    } catch (err) {
        console.error("Error logging history:", err.message);
    }
};

const startHistoryLogger = () => {
    cron.schedule('*/1 * * * *', logMedicationEvents);
    logMedicationEvents();
};

module.exports = startHistoryLogger;