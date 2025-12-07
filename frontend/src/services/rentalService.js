import api from '../config/api';

export const createRental = (data) => {
  return api.post('/rentals', data);
};

export const returnRental = (rentalId, returnItems = null) => {
  return api.post(`/rentals/${rentalId}/return`, { returnItems });
};

export const getRentals = (filters = {}) => {
  return api.get('/rentals', { params: filters });
};

export const getRentalById = (id) => {
  return api.get(`/rentals/${id}`);
};

export const getOutstandingRentals = (customerId) => {
  return api.get(`/rentals/customer/${customerId}`);
};

export const checkOverdueRentals = () => {
  return api.get('/rentals/check-overdue');
};
