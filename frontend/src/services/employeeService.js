import api from '../config/api';

export const createEmployee = (data) => {
  return api.post('/employees', data);
};

export const getEmployees = () => {
  return api.get('/employees');
};

export const getEmployeeById = (id) => {
  return api.get(`/employees/${id}`);
};

export const updateEmployee = (id, data) => {
  return api.put(`/employees/${id}`, data);
};

export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`);
};
