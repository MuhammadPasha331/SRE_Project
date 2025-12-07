const express = require('express');
const {
  createEmployee,
  getEmployeeById,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('admin'), createEmployee);
router.get('/', auth, getAllEmployees);
router.get('/:id', auth, getEmployeeById);
router.put('/:id', auth, authorize('admin'), updateEmployee);
router.delete('/:id', auth, authorize('admin'), deleteEmployee);

module.exports = router;
