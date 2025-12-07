const express = require('express');
const {
  createCoupon,
  getCouponByCode,
  getAllCoupons,
  updateCoupon,
  deactivateCoupon,
} = require('../controllers/couponController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('admin', 'manager'), createCoupon);
router.get('/', auth, getAllCoupons);
router.get('/:code', auth, getCouponByCode);
router.put('/:id', auth, authorize('admin', 'manager'), updateCoupon);
router.delete('/:id', auth, authorize('admin'), deactivateCoupon);

module.exports = router;
