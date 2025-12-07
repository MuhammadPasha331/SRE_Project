const inventoryService = require('../services/inventoryService');

exports.createItem = async (req, res) => {
  try {
    const item = await inventoryService.addItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await inventoryService.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await inventoryService.getAllItems(req.query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await inventoryService.deleteItem(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowStockItems = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const items = await inventoryService.getLowStockItems(parseInt(threshold));
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInventoryValue = async (req, res) => {
  try {
    const value = await inventoryService.getInventoryValue();
    res.json({ totalInventoryValue: value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
