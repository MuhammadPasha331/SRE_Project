import { useState } from 'react';
import PropTypes from 'prop-types';

export default function PaymentModal({ transaction, onConfirm, onCancel, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState(transaction?.total || 0);

  const calculateChange = () => {
    return Math.max(0, amountTendered - transaction.total);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amountTendered < transaction.total) {
      alert('Amount tendered is less than total');
      return;
    }
    onConfirm({
      method: paymentMethod,
      amountTendered,
      change: calculateChange(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Payment Processing</h2>

        <div className="payment-details">
          <div className="detail-row">
            <span>Subtotal:</span>
            <span>${transaction.subtotal.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Tax:</span>
            <span>${transaction.tax.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Discount:</span>
            <span>-${transaction.discount.toFixed(2)}</span>
          </div>
          <div className="detail-row total">
            <span>Total Due:</span>
            <span>${transaction.total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="check">Check</option>
              <option value="electronic">Electronic Transfer</option>
            </select>
          </div>

          {paymentMethod === 'cash' && (
            <div className="form-group">
              <label>Amount Tendered ($):</label>
              <input
                type="number"
                step="0.01"
                min={transaction.total}
                value={amountTendered}
                onChange={(e) => setAmountTendered(parseFloat(e.target.value))}
                required
              />
              <div className="change-display">
                Change: ${calculateChange().toFixed(2)}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-success"
              disabled={loading || amountTendered < transaction.total}
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PaymentModal.propTypes = {
  transaction: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
