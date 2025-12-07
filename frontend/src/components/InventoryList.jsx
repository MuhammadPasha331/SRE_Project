import PropTypes from 'prop-types';

export default function InventoryList({ items, onEdit, onDelete, loading }) {
  const getLowStockClass = (quantity) => quantity < 5 ? 'low-stock' : '';

  return (
    <div className="inventory-list">
      <h3>Inventory Items</h3>
      {loading ? (
        <p>Loading inventory...</p>
      ) : items.length === 0 ? (
        <p>No items in inventory</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className={getLowStockClass(item.stockQuantity)}>
                <td>{item.itemID}</td>
                <td>{item.itemName}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.stockQuantity}</td>
                <td>{item.category}</td>
                <td>${(item.price * item.stockQuantity).toFixed(2)}</td>
                <td>
                  <button
                    className="btn-primary btn-small"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger btn-small"
                    onClick={() => onDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

InventoryList.propTypes = {
  items: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
