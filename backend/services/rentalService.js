const Rental = require('../models/Rental');
const Item = require('../models/Item');
const Customer = require('../models/Customer');

class RentalService {
  async createRental(rentalData) {
    try {
      const rental = new Rental({
        rentalID: `RENTAL-${Date.now()}`,
        items: rentalData.items,
        customer: rentalData.customerId,
        dueDate: rentalData.dueDate,
        cashier: rentalData.cashierId,
        totalCost: rentalData.totalCost || 0,
        notes: rentalData.notes || '',
      });

      // Update inventory for each item
      for (const item of rentalData.items) {
        await Item.findOneAndUpdate(
          { itemID: item.itemID },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );
      }

      // Add to customer's outstanding rentals
      await Customer.findByIdAndUpdate(
        rentalData.customerId,
        {
          $push: {
            outstandingRentals: {
              rentalId: rental._id,
              itemID: rentalData.items[0].itemID,
              itemName: rentalData.items[0].itemName,
              dueDate: rental.dueDate,
            },
          },
        }
      );

      await rental.save();
      return rental;
    } catch (error) {
      throw error;
    }
  }

  async returnRental(rentalId, returnItems = null) {
    try {
      const rental = await Rental.findById(rentalId);
      if (!rental) throw new Error('Rental not found');

      const itemsToReturn = returnItems || rental.items;

      // Update inventory
      for (const item of itemsToReturn) {
        await Item.findOneAndUpdate(
          { itemID: item.itemID },
          { $inc: { stockQuantity: item.quantity } },
          { new: true }
        );
      }

      // Calculate late fees
      const daysOverdue = Math.max(0, Math.ceil((new Date() - new Date(rental.dueDate)) / (1000 * 60 * 60 * 24)));
      const lateFee = daysOverdue * 5; // $5 per day late

      rental.returnedDate = new Date();
      rental.status = 'returned';
      rental.lateFee = lateFee;

      // Remove from customer's outstanding rentals
      await Customer.findByIdAndUpdate(
        rental.customer,
        {
          $pull: { outstandingRentals: { rentalId: rental._id } },
        }
      );

      await rental.save();
      return rental;
    } catch (error) {
      throw error;
    }
  }

  async getOutstandingRentals(customerId) {
    return await Rental.find({
      customer: customerId,
      status: 'active',
    }).lean();
  }

  async checkOverdueRentals() {
    const now = new Date();
    const overdueRentals = await Rental.updateMany(
      {
        dueDate: { $lt: now },
        status: 'active',
      },
      { status: 'overdue' }
    );
    return overdueRentals;
  }

  async getRentalById(rentalId) {
    return await Rental.findById(rentalId)
      .populate('customer', 'firstName lastName phoneNumber')
      .populate('cashier', 'name username');
  }

  async getAllRentals(filters = {}) {
    const query = {};
    
    if (filters.customerId) query.customer = filters.customerId;
    if (filters.status) query.status = filters.status;
    
    return await Rental.find(query)
      .populate('customer', 'firstName lastName phoneNumber')
      .sort({ rentalDate: -1 })
      .lean();
  }
}

module.exports = new RentalService();
