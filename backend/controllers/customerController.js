const Customer = require('../models/Customer');
const rentalService = require('../services/rentalService');

exports.findByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number required' });
    }

    let customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found', customer: null });
    } else {
      res.json(customer);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { phoneNumber, firstName, lastName, email } = req.body;

    if (!phoneNumber || !firstName || !lastName) {
      return res.status(400).json({ message: 'Phone, first name, and last name required' });
    }

    const existingCustomer = await Customer.findOne({ phoneNumber });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const customer = new Customer({
      phoneNumber,
      firstName,
      lastName,
      email: email || '',
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOutstandingRentals = async (req, res) => {
  try {
    const { customerId } = req.params;
    const rentals = await rentalService.getOutstandingRentals(customerId);
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
