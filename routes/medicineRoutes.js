// routes/medicineRoutes.js
const express = require('express');
const router = express.Router();
const { addMedicine, getMedicines, deleteMedicine } = require('../controllers/medicineController');
const auth = require('../middleware/authMiddleware');

router.post('/add', auth, addMedicine);
router.get('/', auth, getMedicines);
router.delete('/:id', auth, deleteMedicine);

module.exports = router;
