import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as saleService from '../services/saleService';
import * as rentalService from '../services/rentalService';
import toast from '../services/toastService';
import '../styles/dashboard.css';

export default function Reports() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sales');
  const [sales, setSales] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'sales') {
      loadSales();
    } else if (activeTab === 'rentals') {
      loadRentals();
    }
  }, [activeTab, dateRange]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await saleService.getSales();
      setSales(response.data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalService.getRentals();
      setRentals(response.data || []);
    } catch (error) {
      console.error('Error loading rentals:', error);
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSales = () => sales.reduce((sum, s) => sum + s.total, 0);
  const calculateTotalTax = () => sales.reduce((sum, s) => sum + s.tax, 0);
  const calculateActiveRentals = () => rentals.filter(r => r.status === 'active').length;
  const calculateOverdueRentals = () => rentals.filter(r => r.status === 'overdue').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Reports & Analytics</h1>
        <div className="user-info">
          <span>👤 {user?.username} ({user?.position})</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Reports
        </button>
        <button 
          className={`tab ${activeTab === 'rentals' ? 'active' : ''}`}
          onClick={() => setActiveTab('rentals')}
        >
          Rental Reports
        </button>
      </div>

      {activeTab === 'sales' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Sales</h3>
              <p className="stat-value">${calculateTotalSales().toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Transactions</h3>
              <p className="stat-value">{sales.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Tax</h3>
              <p className="stat-value">${calculateTotalTax().toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Transaction</h3>
              <p className="stat-value">${(calculateTotalSales() / (sales.length || 1)).toFixed(2)}</p>
            </div>
          </div>

          <h3>Sales Transactions</h3>
          {sales.length === 0 ? (
            <p>No sales data available</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale._id}>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td>{sale.employeeID}</td>
                    <td>{sale.customerID || 'Walk-in'}</td>
                    <td>{sale.items.length}</td>
                    <td>${sale.subtotal.toFixed(2)}</td>
                    <td>${sale.tax.toFixed(2)}</td>
                    <td>${sale.discount.toFixed(2)}</td>
                    <td><strong>${sale.total.toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Active Rentals</h3>
              <p className="stat-value">{calculateActiveRentals()}</p>
            </div>
            <div className="stat-card">
              <h3>Overdue Rentals</h3>
              <p className="stat-value warning">{calculateOverdueRentals()}</p>
            </div>
            <div className="stat-card">
              <h3>Total Rentals</h3>
              <p className="stat-value">{rentals.length}</p>
            </div>
          </div>

          {calculateOverdueRentals() > 0 && (
            <div className="alert-box">
              <h4>⚠️ Overdue Rental Alert</h4>
              <p>{calculateOverdueRentals()} rentals are overdue</p>
            </div>
          )}

          <h3>Rental Transactions</h3>
          {rentals.length === 0 ? (
            <p>No rental data available</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Daily Rate</th>
                  <th>Late Fee</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map(rental => (
                  <tr key={rental._id} className={rental.status === 'overdue' ? 'overdue' : ''}>
                    <td>{new Date(rental.rentalDate).toLocaleDateString()}</td>
                    <td>{rental.itemID}</td>
                    <td>{rental.customerID}</td>
                    <td>{new Date(rental.dueDate).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${rental.status}`}>{rental.status}</span></td>
                    <td>${rental.dailyRate.toFixed(2)}</td>
                    <td>${rental.lateFee.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
