import api from '../config/api';

export const createCoupon = (data) => {
  return api.post('/coupons', data);
};

export const getCouponByCode = (code) => {
  return api.get(`/coupons/${code}`);
};

export const getCoupons = () => {
  return api.get('/coupons');
};

export const updateCoupon = (id, data) => {
  return api.put(`/coupons/${id}`, data);
};

export const deactivateCoupon = (id) => {
  return api.delete(`/coupons/${id}`);
};
