import api from '../config/api';

export const createItem = (data) => {
  return api.post('/items', data);
};

export const getItems = (filters = {}) => {
  return api.get('/items', { params: filters });
};

export const getItemById = (id) => {
  return api.get(`/items/${id}`);
};

export const updateItem = (id, data) => {
  return api.put(`/items/${id}`, data);
};

export const deleteItem = (id) => {
  return api.delete(`/items/${id}`);
};

export const getLowStockItems = (threshold = 10) => {
  return api.get('/items/low-stock', { params: { threshold } });
};

export const getInventoryValue = () => {
  return api.get('/items/inventory-value');
};
