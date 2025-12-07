const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemID: {
    type: Number,
    required: true,
    unique: true,
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);
