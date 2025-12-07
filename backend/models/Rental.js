const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  rentalID: {
    type: String,
    unique: true,
  },
  items: [
    {
      itemID: Number,
      itemName: String,
      quantity: Number,
    },
  ],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  rentalDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnedDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active',
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  lateFee: {
    type: Number,
    default: 0,
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  notes: String,
});

// Calculate days overdue
rentalSchema.methods.getDaysOverdue = function() {
  if (this.returnedDate || this.status !== 'overdue') {
    return 0;
  }
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const daysMs = today - dueDate;
  return Math.max(0, Math.ceil(daysMs / (1000 * 60 * 60 * 24)));
};

module.exports = mongoose.model('Rental', rentalSchema);
