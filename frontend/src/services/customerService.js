import api from '../config/api';

export const findByPhoneNumber = (phoneNumber) => {
  return api.get('/customers/search', { params: { phoneNumber } });
};

export const createCustomer = (data) => {
  return api.post('/customers', data);
};

export const getCustomers = () => {
  return api.get('/customers');
};

export const getCustomerById = (id) => {
  return api.get(`/customers/${id}`);
};

export const updateCustomer = (id, data) => {
  return api.put(`/customers/${id}`, data);
};

export const getOutstandingRentals = (customerId) => {
  return api.get(`/customers/${customerId}/rentals`);
};
