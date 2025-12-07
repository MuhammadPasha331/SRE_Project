const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  saleID: {
    type: String,
    unique: true,
  },
  items: [
    {
      itemID: Number,
      itemName: String,
      price: Number,
      quantity: Number,
      subtotal: Number,
    },
  ],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'check'],
    default: 'cash',
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  couponUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
  notes: String,
});

// Pre-save hook: Calculate tax and total
saleSchema.pre('save', function(next) {
  const TAX_RATE = 0.06;
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.discount = this.subtotal * (this.discountPercent / 100);
  const taxableAmount = this.subtotal - this.discount;
  this.tax = taxableAmount * TAX_RATE;
  this.total = taxableAmount + this.tax;
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
