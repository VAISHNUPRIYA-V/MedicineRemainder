// controllers/historyController.js
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
