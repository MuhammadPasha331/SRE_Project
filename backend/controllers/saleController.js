const saleService = require('../services/saleService');

exports.createSale = async (req, res) => {
  try {
    const sale = await saleService.createSale(req.body);
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await saleService.getAllSales(req.query);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.calculateTotals = async (req, res) => {
  try {
    const { items, discountPercent, couponId } = req.body;
    const totals = await saleService.calculateTotals(items, discountPercent, couponId);
    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
