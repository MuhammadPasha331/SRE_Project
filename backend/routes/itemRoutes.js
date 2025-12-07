const express = require('express');
const {
  createItem,
  getItemById,
  getAllItems,
  updateItem,
  deleteItem,
  getLowStockItems,
  getInventoryValue,
} = require('../controllers/itemController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('admin', 'manager'), createItem);
router.get('/', auth, getAllItems);
router.get('/low-stock', auth, getLowStockItems);
router.get('/inventory-value', auth, authorize('admin', 'manager'), getInventoryValue);
router.get('/:id', auth, getItemById);
router.put('/:id', auth, authorize('admin', 'manager'), updateItem);
router.delete('/:id', auth, authorize('admin'), deleteItem);

module.exports = router;
