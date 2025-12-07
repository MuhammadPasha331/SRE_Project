import PropTypes from 'prop-types';

export default function EmployeeList({ employees, onEdit, onDelete, loading }) {
  const getRoleColor = (position) => {
    switch(position) {
      case 'admin': return 'badge-admin';
      case 'manager': return 'badge-manager';
      case 'cashier': return 'badge-cashier';
      default: return '';
    }
  };

  return (
    <div className="employee-list">
      <h3>Employees</h3>
      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp._id}>
                <td>{emp.username}</td>
                <td>{emp.name}</td>
                <td>
                  <span className={`badge ${getRoleColor(emp.position)}`}>
                    {emp.position}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-primary btn-small"
                    onClick={() => onEdit(emp)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger btn-small"
                    onClick={() => onDelete(emp._id)}
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

EmployeeList.propTypes = {
  employees: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
