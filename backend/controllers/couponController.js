const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res) => {
  try {
    const { couponCode, discountPercent, expiryDate, maxUses, isPercentage } = req.body;

    if (!couponCode || !discountPercent || !expiryDate) {
      return res.status(400).json({ message: 'Coupon code, discount, and expiry date required' });
    }

    const coupon = new Coupon({
      couponCode: couponCode.toUpperCase(),
      discountPercent,
      expiryDate,
      maxUses: maxUses || null,
      isPercentage: isPercentage !== false,
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ couponCode: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon is expired or no longer valid' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deactivateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
