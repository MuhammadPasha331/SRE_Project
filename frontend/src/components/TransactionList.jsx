import PropTypes from 'prop-types';

export default function TransactionList({ transactions, loading }) {
  const calculateItemCount = (items) => items?.length || 0;

  return (
    <div className="transaction-list">
      <h3>Recent Transactions</h3>
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>ID</th>
              <th>Employee</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction._id}>
                <td>{new Date(transaction.date).toLocaleString()}</td>
                <td>{transaction._id.substring(0, 8)}</td>
                <td>{transaction.employeeID}</td>
                <td>{calculateItemCount(transaction.items)}</td>
                <td>${transaction.subtotal?.toFixed(2) || '0.00'}</td>
                <td>${transaction.tax?.toFixed(2) || '0.00'}</td>
                <td><strong>${transaction.total?.toFixed(2) || '0.00'}</strong></td>
                <td>{transaction.paymentMethod || 'Cash'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

TransactionList.propTypes = {
  transactions: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};
