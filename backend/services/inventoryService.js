const Item = require('../models/Item');

class InventoryService {
  async addItem(itemData) {
    try {
      const item = new Item({
        itemID: itemData.itemID,
        itemName: itemData.itemName,
        price: itemData.price,
        stockQuantity: itemData.stockQuantity || 0,
        description: itemData.description || '',
        category: itemData.category || 'General',
      });

      await item.save();
      return item;
    } catch (error) {
      throw error;
    }
  }

  async updateItem(itemId, updateData) {
    try {
      const item = await Item.findByIdAndUpdate(
        itemId,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      return item;
    } catch (error) {
      throw error;
    }
  }

  async updateStock(itemID, quantityChange) {
    try {
      const item = await Item.findOneAndUpdate(
        { itemID },
        { $inc: { stockQuantity: quantityChange }, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!item) throw new Error('Item not found');
      return item;
    } catch (error) {
      throw error;
    }
  }

  async getItemById(itemId) {
    return await Item.findById(itemId).lean();
  }

  async getItemByItemID(itemID) {
    return await Item.findOne({ itemID }).lean();
  }

  async getAllItems(filters = {}) {
    const query = { isActive: true };

    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$or = [
        { itemName: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return await Item.find(query).lean();
  }

  async getLowStockItems(threshold = 10) {
    return await Item.find({
      stockQuantity: { $lte: threshold },
      isActive: true,
    }).lean();
  }

  async deleteItem(itemId) {
    try {
      const item = await Item.findByIdAndUpdate(
        itemId,
        { isActive: false, updatedAt: Date.now() },
        { new: true }
      );
      return item;
    } catch (error) {
      throw error;
    }
  }

  async getInventoryValue() {
    const items = await Item.find({ isActive: true }).lean();
    return items.reduce((total, item) => total + (item.price * item.stockQuantity), 0);
  }
}

module.exports = new InventoryService();
