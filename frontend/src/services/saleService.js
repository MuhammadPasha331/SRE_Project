import api from '../config/api';

export const createSale = (data) => {
  return api.post('/sales', data);
};

export const getSales = (filters = {}) => {
  return api.get('/sales', { params: filters });
};

export const getSaleById = (id) => {
  return api.get(`/sales/${id}`);
};

export const calculateTotals = (items, discountPercent = 0, couponId = null) => {
  return api.post('/sales/calculate-totals', { 
    items, 
    discountPercent, 
    couponId 
  });
};
