// controllers/medicineController.js
const Medicine = require('../models/Medicine');

exports.addMedicine = async (req, res) => {
  try {
    const { name, dosage, frequency, times, startDate, endDate } = req.body;

    const medicine = await Medicine.create({
      userId: req.user.id,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
    });

    res.status(201).json({ message: 'Medicine saved successfully', medicine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!med) return res.status(404).json({ message: 'Medicine not found' });

    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get today's medicines
exports.getTodaysMedicines = async (req, res) => {
  try {
    const userId = req.user.id;

    // Set time to start of today (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set time to start of tomorrow (for end boundary)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysMeds = await Medicine.find({
      userId,
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    res.status(200).json(todaysMeds);
  } catch (err) {
    res.status(500).json({ message: "Error fetching today's medicines", error: err.message });
  }
};

