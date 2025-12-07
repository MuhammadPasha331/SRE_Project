import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function SaleForm({ onSubmit, items, loading }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 items per page (3x4 grid)

  const handleAddItem = (item, quantity) => {
    const existingItem = selectedItems.find(i => i._id === item._id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(i =>
        i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i._id !== itemId));
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setSelectedItems(selectedItems.map(i =>
        i._id === itemId ? { ...i, quantity: newQuantity } : i
      ));
    }
  };

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.itemName.toLowerCase().includes(term) ||
      item.itemID?.toString().includes(term)
    );
  }, [items, searchTerm]);

  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.06; // 6% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }
    onSubmit({
      items: selectedItems,
      discountCode,
      paymentMethod,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="sale-form">
      <div className="form-section">
        <div className="items-header">
          <h3>Available Items</h3>
          <div className="items-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="items-count">
              Showing {paginatedItems.length} of {filteredItems.length} items
            </span>
          </div>
        </div>
        
        <div className="items-grid">
          {paginatedItems.length === 0 ? (
            <div className="no-items">
              <p>No items found{searchTerm ? ` matching "${searchTerm}"` : ''}</p>
            </div>
          ) : (
            paginatedItems.map(item => {
              const selectedItem = selectedItems.find(i => i._id === item._id);
              const isSelected = !!selectedItem;
              
              return (
                <div key={item._id} className={`item-card ${isSelected ? 'selected' : ''} ${item.stockQuantity === 0 ? 'out-of-stock' : ''}`}>
                  <div className="item-info">
                    <h4>{item.itemName}</h4>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                    <p className="item-stock">
                      Stock: <span className={item.stockQuantity === 0 ? 'stock-zero' : ''}>{item.stockQuantity}</span>
                    </p>
                  </div>
                  <div className="item-actions">
                    {isSelected ? (
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item._id, selectedItem.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={item.stockQuantity}
                          value={selectedItem.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 0;
                            handleUpdateQuantity(item._id, qty);
                          }}
                          className="qty-input"
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => {
                            if (selectedItem.quantity < item.stockQuantity) {
                              handleUpdateQuantity(item._id, selectedItem.quantity + 1);
                            }
                          }}
                          disabled={selectedItem.quantity >= item.stockQuantity}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max={item.stockQuantity}
                        placeholder="Qty"
                        className="qty-input-add"
                        disabled={item.stockQuantity === 0}
                        onBlur={(e) => {
                          const qty = parseInt(e.target.value);
                          if (qty > 0 && qty <= item.stockQuantity) {
                            handleAddItem(item, qty);
                            e.target.value = '';
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const qty = parseInt(e.target.value);
                            if (qty > 0 && qty <= item.stockQuantity) {
                              handleAddItem(item, qty);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="form-section">
          <h3>Selected Items</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(item => (
                <tr key={item._id}>
                  <td><strong>{item.itemName}</strong></td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.stockQuantity || 999}
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1;
                        handleUpdateQuantity(item._id, qty);
                      }}
                      className="table-qty-input"
                    />
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-danger btn-small"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="form-section">
        <label>Discount Code:</label>
        <input
          type="text"
          placeholder="Enter coupon code (optional)"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="card">Credit Card</option>
          <option value="check">Check</option>
        </select>
      </div>

      <div className="totals-section">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Tax (6%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="total-row total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn-success btn-full"
        disabled={loading || selectedItems.length === 0}
      >
        {loading ? 'Processing...' : 'Complete Sale'}
      </button>
    </form>
  );
}

SaleForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};
