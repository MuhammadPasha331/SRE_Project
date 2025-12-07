const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  isPercentage: {
    type: Boolean,
    default: true,
  },
  maxUses: {
    type: Number,
    default: null,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if coupon is still valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  const expired = this.expiryDate < now;
  const maxUsesReached = this.maxUses && this.usedCount >= this.maxUses;
  return this.isActive && !expired && !maxUsesReached;
};

module.exports = mongoose.model('Coupon', couponSchema);
