import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function RentalForm({ onSubmit, items, loading }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [daysToRent, setDaysToRent] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Calculate daily rate
  const dailyRate = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.dailyRate || selectedItem.price * 0.1; // 10% of price as default daily rate
  }, [selectedItem]);

  // Calculate total reactively
  const total = useMemo(() => {
    if (!selectedItem || quantity <= 0 || daysToRent <= 0) return 0;
    return dailyRate * daysToRent * quantity;
  }, [dailyRate, daysToRent, quantity, selectedItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select an item');
      return;
    }
    if (!customerPhone) {
      alert('Please enter customer phone number');
      return;
    }
    onSubmit({
      item: selectedItem,
      quantity,
      daysToRent,
      paymentMethod,
      customerPhone,
      customerName,
      dailyRate,
      totalCost: total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rental-form">
      <div className="form-section">
        <h3>Select Item to Rent</h3>
        <div className="items-grid">
          {items.map(item => (
            <div
              key={item._id}
              className={`item-card ${selectedItem?._id === item._id ? 'selected' : ''} ${item.stockQuantity === 0 ? 'out-of-stock' : ''}`}
              onClick={() => {
                if (item.stockQuantity > 0) {
                  setSelectedItem(item);
                  setQuantity(1); // Reset quantity when selecting new item
                }
              }}
            >
              <div className="item-info">
                <h4>{item.itemName}</h4>
                <p className="item-price">${(item.dailyRate || item.price * 0.1).toFixed(2)}/day</p>
                <p className="item-stock">
                  Available: <span className={item.stockQuantity === 0 ? 'stock-zero' : ''}>{item.stockQuantity}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <>
          <div className="form-section">
            <label>Customer Phone Number: <span className="required">*</span></label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter customer phone number"
              required
            />
          </div>

          <div className="form-section">
            <label>Customer Name:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name (optional)"
            />
          </div>

          <div className="form-section">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={selectedItem.stockQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), selectedItem.stockQuantity));
                }}
                className="qty-input"
                required
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity(prev => Math.min(selectedItem.stockQuantity, prev + 1))}
                disabled={quantity >= selectedItem.stockQuantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-section">
            <label>Number of Days:</label>
            <div className="quantity-controls">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setDaysToRent(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={daysToRent}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setDaysToRent(Math.max(1, val));
                }}
                className="qty-input"
                required
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => setDaysToRent(prev => prev + 1)}
              >
                +
              </button>
            </div>
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
              <span>Daily Rate:</span>
              <span>${dailyRate.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Days:</span>
              <span>{daysToRent}</span>
            </div>
            <div className="total-row">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="total-row">
              <span>Subtotal (Rate × Days × Qty):</span>
              <span>${(dailyRate * daysToRent * quantity).toFixed(2)}</span>
            </div>
            <div className="total-row total">
              <span>Total Cost:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-success btn-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Rental'}
          </button>
        </>
      )}
    </form>
  );
}

RentalForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};
