import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as employeeService from '../services/employeeService';
import * as itemService from '../services/itemService';
import toast from '../services/toastService';
import EmployeeList from '../components/EmployeeList';
import InventoryList from '../components/InventoryList';
import EmployeeForm from '../components/EmployeeForm';
import ItemForm from '../components/ItemForm';
import '../styles/dashboard.css';

export default function AdminDashboard({ activeTab: initialTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get active tab from URL or prop, default to 'employees'
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(initialTab || tabFromUrl || 'employees');
  
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployees();
    } else if (activeTab === 'inventory') {
      loadItems();
    }
  }, [activeTab]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemService.getItems();
      setItems(response.data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (formData) => {
    try {
      setLoading(true);
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee._id, formData);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.createEmployee(formData);
        toast.success('Employee added successfully');
      }
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error.response?.data?.message || 'Error saving employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
    try {
      await employeeService.deleteEmployee(id);
      toast.success('Employee deactivated successfully');
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Error deactivating employee');
    }
  };

  const handleAddItem = async (formData) => {
    try {
      setLoading(true);
      if (editingItem) {
        await itemService.updateItem(editingItem._id, formData);
        toast.success('Item updated successfully');
      } else {
        await itemService.createItem(formData);
        toast.success('Item added successfully');
      }
      setShowItemForm(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Error saving item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemService.deleteItem(id);
      toast.success('Item deleted successfully');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Error deleting item');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab === 'employees' ? 'employees' : 'inventory'}`);
  };

  return (
    <div className="dashboard">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => handleTabChange('employees')}
        >
          Employee Management
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          Inventory Management
        </button>
      </div>

      {activeTab === 'employees' && (
        <div className="tab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Employee Management</h2>
            <button 
              className="btn-primary"
              onClick={() => {
                setEditingEmployee(null);
                setShowEmployeeForm(!showEmployeeForm);
              }}
            >
              {showEmployeeForm ? 'Cancel' : '+ Add Employee'}
            </button>
          </div>

          {showEmployeeForm && (
            <div className="form-wrapper">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <EmployeeForm 
                onSubmit={handleAddEmployee}
                initialData={editingEmployee}
                loading={loading}
              />
            </div>
          )}

          <EmployeeList 
            employees={employees}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="tab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Inventory Management</h2>
            <button 
              className="btn-primary"
              onClick={() => {
                setEditingItem(null);
                setShowItemForm(!showItemForm);
              }}
            >
              {showItemForm ? 'Cancel' : '+ Add Item'}
            </button>
          </div>

          {showItemForm && (
            <div className="form-wrapper">
              <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <ItemForm 
                onSubmit={handleAddItem}
                initialData={editingItem}
                loading={loading}
              />
            </div>
          )}

          <InventoryList 
            items={items}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
