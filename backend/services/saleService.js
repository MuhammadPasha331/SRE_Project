const Sale = require('../models/Sale');
const Item = require('../models/Item');
const Coupon = require('../models/Coupon');
const Customer = require('../models/Customer');

class SaleService {
  async createSale(saleData) {
    try {
      // Calculate item subtotals
      const items = saleData.items.map(item => ({
        ...item,
        subtotal: item.price * item.quantity,
      }));

      // Create sale object
      const sale = new Sale({
        saleID: `SALE-${Date.now()}`,
        items,
        cashier: saleData.cashierId,
        customer: saleData.customerId || null,
        paymentMethod: saleData.paymentMethod,
        couponUsed: saleData.couponId || null,
        discountPercent: saleData.discountPercent || 0,
        notes: saleData.notes || '',
      });

      // Update inventory for each item
      for (const item of items) {
        await Item.findOneAndUpdate(
          { itemID: item.itemID },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );
      }

      // If coupon used, increment usage count
      if (saleData.couponId) {
        await Coupon.findByIdAndUpdate(
          saleData.couponId,
          { $inc: { usedCount: 1 } }
        );
      }

      // If customer exists, update total spent
      if (saleData.customerId) {
        await Customer.findByIdAndUpdate(
          saleData.customerId,
          { $inc: { totalSpent: sale.total } }
        );
      }

      await sale.save();
      return sale;
    } catch (error) {
      throw error;
    }
  }

  async getSaleById(saleId) {
    return await Sale.findById(saleId)
      .populate('cashier', 'name username')
      .populate('customer', 'firstName lastName phoneNumber')
      .populate('couponUsed', 'couponCode discountPercent');
  }

  async getAllSales(filters = {}) {
    const query = {};
    
    if (filters.cashierId) query.cashier = filters.cashierId;
    if (filters.customerId) query.customer = filters.customerId;
    if (filters.dateFrom || filters.dateTo) {
      query.saleDate = {};
      if (filters.dateFrom) query.saleDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.saleDate.$lte = new Date(filters.dateTo);
    }

    return await Sale.find(query)
      .populate('cashier', 'name username')
      .populate('customer', 'firstName lastName phoneNumber')
      .sort({ saleDate: -1 })
      .lean();
  }

  async calculateTotals(items, discountPercent = 0, couponId = null) {
    let subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = (subtotal * discountPercent) / 100;

    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (coupon && coupon.isValid()) {
        if (coupon.isPercentage) {
          discount = (subtotal * coupon.discountPercent) / 100;
        } else {
          discount = coupon.discountAmount;
        }
      }
    }

    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.06; // 6% tax
    const total = taxableAmount + tax;

    return { subtotal, discount, tax, total };
  }
}

module.exports = new SaleService();
