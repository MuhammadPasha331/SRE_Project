import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as rentalService from '../services/rentalService';

export default function ReturnForm({ onSubmit, loading }) {
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadActiveRentals();
  }, []);

  const loadActiveRentals = async () => {
    try {
      const response = await rentalService.getRentals({ status: 'active' });
      // Also get overdue rentals
      const overdueResponse = await rentalService.getRentals({ status: 'overdue' });
      const allActive = [...(response.data || []), ...(overdueResponse.data || [])];
      setRentals(allActive);
    } catch (error) {
      console.error('Error loading rentals:', error);
      // Set empty array on error to prevent crashes
      setRentals([]);
    }
  };

  const calculateLateFee = () => {
    if (!selectedRental) return 0;
    const today = new Date();
    const dueDate = new Date(selectedRental.dueDate);
    const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
    // Late fee is $5 per day overdue (as per backend service)
    return daysOverdue * 5;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRental) {
      alert('Please select a rental to return');
      return;
    }
    onSubmit({
      rentalId: selectedRental._id,
      condition,
      notes,
      lateFee: calculateLateFee(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="return-form">
      <div className="form-section">
        <h3>Select Rental to Return</h3>
        {rentals.length === 0 ? (
          <p>No active rentals to return</p>
        ) : (
          <div className="rentals-list">
            {rentals.map(rental => {
              // Handle rental data structure - items is an array
              const firstItem = rental.items && rental.items.length > 0 ? rental.items[0] : null;
              const customerName = rental.customer 
                ? (typeof rental.customer === 'object' 
                    ? `${rental.customer.firstName || ''} ${rental.customer.lastName || ''}`.trim()
                    : rental.customer)
                : 'Unknown Customer';
              
              return (
                <div
                  key={rental._id}
                  className={`rental-card ${selectedRental?._id === rental._id ? 'selected' : ''}`}
                  onClick={() => setSelectedRental(rental)}
                >
                  <h4>{firstItem ? firstItem.itemName || `Item #${firstItem.itemID}` : 'Unknown Item'}</h4>
                  <p><strong>Rental ID:</strong> {rental.rentalID || rental._id?.substring(0, 8)}</p>
                  <p><strong>Customer:</strong> {customerName}</p>
                  <p><strong>Due Date:</strong> {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Total Cost:</strong> ${rental.totalCost ? rental.totalCost.toFixed(2) : '0.00'}</p>
                  <p><strong>Status:</strong> <span className={`badge badge-${rental.status || 'active'}`}>{rental.status || 'active'}</span></p>
                  {rental.items && rental.items.length > 0 && (
                    <p><strong>Quantity:</strong> {rental.items[0].quantity || 1}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedRental && (
        <>
          <div className="form-section">
            <label>Item Condition:</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <div className="form-section">
            <label>Return Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the rental return..."
              rows="4"
            />
          </div>

          {calculateLateFee() > 0 && (
            <div className="alert-box">
              ⚠️ Late Fee: ${calculateLateFee().toFixed(2)}
            </div>
          )}

          <div className="totals-section">
            {selectedRental.items && selectedRental.items.length > 0 && (
              <>
                <div className="total-row">
                  <span>Item:</span>
                  <span>{selectedRental.items[0].itemName || `Item #${selectedRental.items[0].itemID}`}</span>
                </div>
                <div className="total-row">
                  <span>Quantity:</span>
                  <span>{selectedRental.items[0].quantity || 1}</span>
                </div>
              </>
            )}
            <div className="total-row">
              <span>Rental Cost:</span>
              <span>${selectedRental.totalCost ? selectedRental.totalCost.toFixed(2) : '0.00'}</span>
            </div>
            <div className="total-row">
              <span>Due Date:</span>
              <span>{selectedRental.dueDate ? new Date(selectedRental.dueDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            {calculateLateFee() > 0 && (
              <div className="total-row warning">
                <span>Late Fee ($5/day):</span>
                <span>${calculateLateFee().toFixed(2)}</span>
              </div>
            )}
            {calculateLateFee() > 0 && (
              <div className="total-row total">
                <span>Total Due:</span>
                <span>${((selectedRental.totalCost || 0) + calculateLateFee()).toFixed(2)}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-success btn-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Return'}
          </button>
        </>
      )}
    </form>
  );
}

ReturnForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
