import { useState } from 'react';
import PropTypes from 'prop-types';

export default function ItemForm({ onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState(initialData || {
    itemID: '',
    itemName: '',
    price: '',
    stockQuantity: '',
    category: 'General',
    dailyRate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemID || !formData.itemName || !formData.price || !formData.stockQuantity) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Item ID:</label>
        <input
          type="text"
          name="itemID"
          value={formData.itemID}
          onChange={handleChange}
          placeholder="e.g., 001"
          disabled={initialData}
          required
        />
      </div>

      <div className="form-group">
        <label>Item Name:</label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="Item Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Price ($):</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label>Stock Quantity:</label>
        <input
          type="number"
          name="stockQuantity"
          value={formData.stockQuantity}
          onChange={handleChange}
          placeholder="0"
          required
        />
      </div>

      <div className="form-group">
        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Electronics"
        />
      </div>

      <div className="form-group">
        <label>Daily Rental Rate ($) - Optional:</label>
        <input
          type="number"
          name="dailyRate"
          value={formData.dailyRate}
          onChange={handleChange}
          placeholder="For rental items"
          step="0.01"
        />
      </div>

      <button type="submit" className="btn-success" disabled={loading}>
        {loading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
      </button>
    </form>
  );
}

ItemForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
};
