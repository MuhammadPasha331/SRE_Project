import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as couponService from '../services/couponService';
import toast from '../services/toastService';
import '../styles/dashboard.css';

export default function CouponManagement() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    expiryDate: '',
    maxUses: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        expiryDate: formData.expiryDate,
        maxUses: parseInt(formData.maxUses) || 0,
      };
      await couponService.createCoupon({
        couponCode: payload.code,
        discountPercent: payload.discountValue,
        expiryDate: payload.expiryDate,
        maxUses: payload.maxUses || null,
        isPercentage: payload.discountType === 'percentage',
      });
      toast.success(`Coupon "${payload.code}" created successfully`);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        maxUses: '',
      });
      setShowForm(false);
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || 'Error creating coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deactivateCoupon(couponId);
        toast.success('Coupon deleted successfully');
        loadCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Error deleting coupon');
      }
    }
  };

  const getActiveCoupons = () => coupons.filter(c => {
    const expiry = new Date(c.expiryDate);
    return expiry > new Date();
  });

  const getExpiredCoupons = () => coupons.filter(c => {
    const expiry = new Date(c.expiryDate);
    return expiry <= new Date();
  });

  return (
    <div className="dashboard">
      <h1>Coupon Management</h1>
      <div className="tab-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Coupons</h3>
            <p className="stat-value">{coupons.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Coupons</h3>
            <p className="stat-value">{getActiveCoupons().length}</p>
          </div>
          <div className="stat-card">
            <h3>Expired Coupons</h3>
            <p className="stat-value">{getExpiredCoupons().length}</p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>

        {showForm && (
          <form onSubmit={handleCreateCoupon} className="form">
            <h3>Create New Coupon</h3>
            <input
              type="text"
              placeholder="Coupon Code (e.g., SAVE10)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
            <input
              type="number"
              placeholder="Discount Value"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              step="0.01"
              required
            />
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Max Uses (0 for unlimited)"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            />
            <button type="submit" className="btn-success">Create Coupon</button>
          </form>
        )}

        <h3>Active Coupons</h3>
        {getActiveCoupons().length === 0 ? (
          <p>No active coupons</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Expiry Date</th>
                <th>Uses</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getActiveCoupons().map(coupon => (
                <tr key={coupon._id}>
                  <td><strong>{coupon.couponCode}</strong></td>
                  <td>{coupon.isPercentage ? '%' : '$'}</td>
                  <td>{coupon.discountPercent}</td>
                  <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td>{coupon.usedCount || 0} / {coupon.maxUses || '∞'}</td>
                  <td>
                    <button 
                      className="btn-danger btn-small"
                      onClick={() => handleDeleteCoupon(coupon._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Expired Coupons</h3>
        {getExpiredCoupons().length === 0 ? (
          <p>No expired coupons</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Expired Date</th>
                <th>Uses</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getExpiredCoupons().map(coupon => (
                <tr key={coupon._id} style={{ opacity: 0.6 }}>
                  <td><strong>{coupon.couponCode}</strong></td>
                  <td>{coupon.isPercentage ? '%' : '$'}</td>
                  <td>{coupon.discountPercent}</td>
                  <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td>{coupon.usedCount || 0} / {coupon.maxUses || '∞'}</td>
                  <td>
                    <button 
                      className="btn-danger btn-small"
                      onClick={() => handleDeleteCoupon(coupon._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
