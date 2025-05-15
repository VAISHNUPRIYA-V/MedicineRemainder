const History = require('../models/History');
const Medicine = require('../models/Medicine');
const moment = require('moment');

exports.getHistory = async (req, res) => {
  try {
    const { medicineName, startDate, endDate } = req.query;
    const userId = req.user.id;

    let filter = { userId };

    if (medicineName) {
      const medicine = await Medicine.findOne({ name: new RegExp(medicineName, 'i'), userId });
      if (medicine) {
        filter.medicineId = medicine._id;
      } else {
        return res.status(404).json({ message: 'Medicine not found' });
      }
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate(),
      };
    }

    const history = await History.find(filter).populate('medicineId');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addHistory = async (req, res) => {
  try {
    const { date, time } = req.body; // Expecting date and time to check against Medicine schedule
    const userId = req.user.id;

    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    // Find all medicines scheduled for the given date and time for the user
    const scheduledMedicines = await Medicine.find({
      userId: userId,
      scheduled: true,
      'schedule.time': time,
      'schedule.dates': {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (scheduledMedicines.length === 0) {
      return res.status(200).json({ message: "No medicines scheduled for this date and time." });
    }

    const historyEntriesToCreate = scheduledMedicines.map(medicine => ({
      userId: userId,
      medicineId: medicine._id,
      date: date,
      time: time,
      status: 'scheduled', // You can set a default status like 'scheduled'
    }));

    const newHistoryEntries = await History.insertMany(historyEntriesToCreate);
    res.status(201).json({ message: `${newHistoryEntries.length} history records added for scheduled medicines.`, historyEntries: newHistoryEntries });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};