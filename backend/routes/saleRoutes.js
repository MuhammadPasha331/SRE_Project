const express = require('express');
const {
  createSale,
  getSaleById,
  getAllSales,
  calculateTotals,
} = require('../controllers/saleController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('cashier', 'admin'), createSale);
router.post('/calculate-totals', auth, calculateTotals);
router.get('/', auth, getAllSales);
router.get('/:id', auth, getSaleById);

module.exports = router;
