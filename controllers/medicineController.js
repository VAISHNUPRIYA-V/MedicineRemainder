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
