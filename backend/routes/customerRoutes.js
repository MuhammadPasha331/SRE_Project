const express = require('express');
const {
  findByPhoneNumber,
  createCustomer,
  getCustomerById,
  getAllCustomers,
  updateCustomer,
  getOutstandingRentals,
} = require('../controllers/customerController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createCustomer);
router.get('/search', auth, findByPhoneNumber);
router.get('/', auth, getAllCustomers);
router.get('/:id', auth, getCustomerById);
router.put('/:id', auth, updateCustomer);
router.get('/:customerId/rentals', auth, getOutstandingRentals);

module.exports = router;
