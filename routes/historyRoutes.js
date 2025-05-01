// routes/historyRoutes.js
const express = require('express');
const router = express.Router();
const { getHistory, addHistory } = require('../controllers/historyController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getHistory);
router.post('/add', auth, addHistory);

module.exports = router;
