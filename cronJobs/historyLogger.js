const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const History = require('../models/History');
const moment = require('moment');

const logExpiredMedications = async () => {
  try {
    const today = moment().startOf('day');

    const expiredMeds = await Medicine.find({
      endDate: { $lt: today.toDate() }
    });

    for (const med of expiredMeds) {
      const alreadyLogged = await History.findOne({
        medicineId: med._id,
        userId: med.userId,
        date: {
          $gte: today.toDate(),
          $lt: moment(today).endOf('day').toDate()
        },
        status: 'Missed'
      });

      if (!alreadyLogged) {
        const newHistory = new History({
          userId: med.userId,
          medicineId: med._id,
          date: today.toDate(),
          time: moment().format('HH:mm'),
          status: 'Missed'
        });

        await newHistory.save();
      }
    }

    console.log("History logged for expired medications.");
  } catch (err) {
    console.error("Error logging history:", err.message);
  }
};
const startHistoryLogger = () => {
  cron.schedule('5 0 * * *', logExpiredMedications);
};

module.exports = startHistoryLogger;
