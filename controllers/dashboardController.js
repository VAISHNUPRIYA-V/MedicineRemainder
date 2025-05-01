// controllers/dashboardController.js
const Medicine = require('../models/Medicine');
const History = require('../models/History');
const moment = require('moment');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf('day');
    const endOfDay = moment().endOf('day');

    // Today’s Medications
    const todayMeds = await Medicine.find({
      userId,
      startDate: { $lte: endOfDay.toDate() },
      endDate: { $gte: today.toDate() },
    });

    // Upcoming Reminders: within next 24 hours
    const upcoming = await History.find({
      userId,
      date: { $gte: new Date(), $lte: moment().add(1, 'days').toDate() },
      status: 'Missed',
    }).populate('medicineId');

    // Summary: missed/skipped
    const summaryStats = await History.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      Taken: 0,
      Skipped: 0,
      Missed: 0,
    };
    summaryStats.forEach((item) => {
      summary[item._id] = item.count;
    });

    res.json({
      todayMeds,
      upcoming,
      summary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
