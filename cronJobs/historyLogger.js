const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const History = require('../models/History');
const moment = require('moment');

const logMedicationEvents = async () => {
    try {
        const now = moment.utc();
        const todayStart = now.clone().startOf('day');
        const todayEnd = now.clone().endOf('day');

        console.log(`Cron job running at UTC: ${now.format('YYYY-MM-DD HH:mm:ss')}`);

        const activeMeds = await Medicine.find({
            userId: '6813ba915de5066087cef007', // Focus on this user for debugging
            endDate: { $gte: todayStart.toDate() },
            times: { $exists: true, $not: { $size: 0 } },
            startDate: { $lte: todayEnd.toDate() }
        });

        console.log(`Found ${activeMeds.length} active medications for user`);

        for (const med of activeMeds) {
            const startDate = moment.utc(med.startDate);
            const endDate = moment.utc(med.endDate);

            console.log(`Processing medication: ${med.name}, Start: ${startDate.format()}, End: ${endDate.format()}, Times: ${med.times}`);

            for (let currentDate = startDate.clone(); currentDate.isSameOrBefore(endDate); currentDate.add(1, 'day')) {
                for (const time of med.times) {
                    const scheduledTimeMoment = moment.utc(time, 'HH:mm');
                    const scheduledDateTime = currentDate.clone().set({
                        hour: scheduledTimeMoment.hour(),
                        minute: scheduledTimeMoment.minute(),
                        second: 0,
                        millisecond: 0
                    });

                    console.log(`  Checking schedule for ${currentDate.format('YYYY-MM-DD')} at ${scheduledDateTime.format('HH:mm')} UTC`);
                    console.log(`  Current UTC time: ${now.format('YYYY-MM-DD HH:mm')}`);

                    if (scheduledDateTime.isBefore(now)) {
                        console.log(`    Scheduled time is in the past.`);
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
                            console.log(`    Logged history: ${med.name} on ${scheduledDateTime.format('YYYY-MM-DD HH:mm')}`);
                        } else {
                            console.log(`    Already logged: ${med.name} on ${scheduledDateTime.format('YYYY-MM-DD HH:mm')}`);
                        }
                    } else {
                        console.log(`    Scheduled time is in the future.`);
                    }
                }
            }
        }

        console.log("Medication schedule history logging finished.");
    } catch (err) {
        console.error("Error logging history:", err.message);
    }
};

const startHistoryLogger = () => {
    cron.schedule('*/1 * * * *', logMedicationEvents);
    logMedicationEvents();
};

module.exports = startHistoryLogger;