// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getDashboardData);

module.exports = router;
