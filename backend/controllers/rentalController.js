const rentalService = require('../services/rentalService');

exports.createRental = async (req, res) => {
  try {
    const rental = await rentalService.createRental(req.body);
    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.returnRental = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { returnItems } = req.body;
    const rental = await rentalService.returnRental(rentalId, returnItems);
    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const rental = await rentalService.getRentalById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await rentalService.getAllRentals(req.query);
    res.json(rentals);
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

exports.checkOverdueRentals = async (req, res) => {
  try {
    const result = await rentalService.checkOverdueRentals();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
