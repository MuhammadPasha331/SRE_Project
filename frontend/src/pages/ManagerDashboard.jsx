import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as itemService from '../services/itemService';
import * as employeeService from '../services/employeeService';
import * as saleService from '../services/saleService';
import toast from '../services/toastService';
import '../styles/dashboard.css';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      loadInventory();
    } else if (activeTab === 'employees') {
      loadEmployees();
    }
  }, [activeTab]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await itemService.getItems();
      setItems(response.data);
      
      // Filter low stock items (less than 5)
      const lowStock = response.data.filter(item => item.stockQuantity < 5);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const calculateInventoryValue = () => {
    return items.reduce((total, item) => total + (item.price * item.stockQuantity), 0);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <div className="user-info">
          <span>👤 {user?.username} ({user?.position})</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Overview
        </button>
        <button 
          className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Staff Management
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Items</h3>
              <p className="stat-value">{items.length}</p>
            </div>
            <div className="stat-card">
              <h3>Low Stock Items</h3>
              <p className="stat-value warning">{lowStockItems.length}</p>
            </div>
            <div className="stat-card">
              <h3>Inventory Value</h3>
              <p className="stat-value">${calculateInventoryValue().toFixed(2)}</p>
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div className="alert-box">
              <h4>⚠️ Low Stock Alert</h4>
              <ul>
                {lowStockItems.map(item => (
                  <li key={item._id}>
                    <strong>{item.itemName}</strong> - Only {item.stockQuantity} in stock
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3>Full Inventory</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className={item.stockQuantity < 5 ? 'low-stock' : ''}>
                  <td>{item.itemID}</td>
                  <td>{item.itemName}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.stockQuantity}</td>
                  <td>{item.category}</td>
                  <td>${(item.price * item.stockQuantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="tab-content">
          <h3>Staff List</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Position</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td>{emp.username}</td>
                  <td>{emp.name}</td>
                  <td>{emp.position}</td>
                  <td><span className={`badge badge-${emp.position}`}>{emp.position}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
