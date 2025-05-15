// models/History.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
    },
    date: Date,
    time: String,
    status: {
        type: String,
        enum: ['Taken', 'Skipped', 'Missed', 'Scheduled'], // Added 'Scheduled' to the enum
        default: 'Missed',
    },
});

module.exports = mongoose.model('History', historySchema);