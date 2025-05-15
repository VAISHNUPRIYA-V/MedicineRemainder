
const express = require('express');
const router = express.Router();
const { setReminder, getReminders, updateReminderStatus } = require('../controllers/reminderController');
const auth = require('../middleware/authMiddleware');

router.post('/set', auth, setReminder);
router.get('/', auth, getReminders);
router.put('/status', auth, updateReminderStatus);

module.exports = router;
