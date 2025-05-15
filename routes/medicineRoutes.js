const express = require('express');
const router = express.Router();
const {
  addMedicine,
  getMedicines,
  deleteMedicine,
  getTodaysMedicines, 
} = require('../controllers/medicineController');
const auth = require('../middleware/authMiddleware');
router.post('/add', auth, addMedicine);
router.get('/', auth, getMedicines);
router.delete('/:id', auth, deleteMedicine);
router.get('/today', auth, getTodaysMedicines);

module.exports = router;
