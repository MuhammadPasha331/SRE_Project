const express = require('express');
const {
  createRental,
  returnRental,
  getRentalById,
  getAllRentals,
  getOutstandingRentals,
  checkOverdueRentals,
} = require('../controllers/rentalController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('cashier', 'admin'), createRental);
router.post('/:rentalId/return', auth, authorize('cashier', 'admin'), returnRental);
router.get('/check-overdue', auth, checkOverdueRentals);
router.get('/', auth, getAllRentals);
router.get('/:id', auth, getRentalById);
router.get('/customer/:customerId', auth, getOutstandingRentals);

module.exports = router;
