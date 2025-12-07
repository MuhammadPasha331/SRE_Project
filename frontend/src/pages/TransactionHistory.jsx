import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as saleService from '../services/saleService';
import toast from '../services/toastService';
import '../styles/dashboard.css';

export default function TransactionHistory() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filterDate, filterEmployee]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await saleService.getSales();
      const sales = response.data || [];
      setTransactions(sales);
      
      // Extract unique employees
      const uniqueEmployees = [...new Set(sales.map(s => s.employeeID))];
      setEmployees(uniqueEmployees);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterDate) {
      filtered = filtered.filter(t => {
        const transDate = new Date(t.date).toLocaleDateString();
        const filterDateObj = new Date(filterDate).toLocaleDateString();
        return transDate === filterDateObj;
      });
    }

    if (filterEmployee) {
      filtered = filtered.filter(t => t.employeeID === filterEmployee);
    }

    setFilteredTransactions(filtered);
  };

  const calculateStats = () => {
    return {
      totalTransactions: filteredTransactions.length,
      totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
      totalTax: filteredTransactions.reduce((sum, t) => sum + t.tax, 0),
      totalItems: filteredTransactions.reduce((sum, t) => sum + t.items.length, 0),
    };
  };

  const stats = calculateStats();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Transaction History</h1>
        <div className="user-info">
          <span>👤 {user?.username} ({user?.position})</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="tab-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Transactions</h3>
            <p className="stat-value">{stats.totalTransactions}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Items Sold</h3>
            <p className="stat-value">{stats.totalItems}</p>
          </div>
          <div className="stat-card">
            <h3>Total Tax</h3>
            <p className="stat-value">${stats.totalTax.toFixed(2)}</p>
          </div>
        </div>

        <div className="filter-section">
          <h3>Filters</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label>Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              {filterDate && (
                <button 
                  className="btn-small"
                  onClick={() => setFilterDate('')}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="filter-group">
              <label>Filter by Employee:</label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
              {filterEmployee && (
                <button 
                  className="btn-small"
                  onClick={() => setFilterEmployee('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <h3>Transactions</h3>
        {loading ? (
          <p>Loading...</p>
        ) : filteredTransactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Employee</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.date).toLocaleString()}</td>
                  <td>{transaction._id.substring(0, 8)}...</td>
                  <td>{transaction.employeeID}</td>
                  <td>{transaction.customerID || 'Walk-in'}</td>
                  <td>{transaction.items.length}</td>
                  <td>${transaction.subtotal.toFixed(2)}</td>
                  <td>${transaction.discount.toFixed(2)}</td>
                  <td>${transaction.tax.toFixed(2)}</td>
                  <td><strong>${transaction.total.toFixed(2)}</strong></td>
                  <td>{transaction.paymentMethod || 'Cash'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
