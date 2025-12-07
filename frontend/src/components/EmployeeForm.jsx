import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { validatePassword, validateUsername, validateRequired } from '../utils/validation';
import toast from '../services/toastService';

export default function EmployeeForm({ onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    position: 'cashier',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        name: initialData.name || '',
        password: '',
        position: initialData.position || 'cashier',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Validate password in real-time
    if (name === 'password' && value) {
      const validation = validatePassword(value);
      setPasswordStrength(validation);
    } else if (name === 'password' && !value) {
      setPasswordStrength(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username (only for new employees)
    if (!initialData) {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.error;
      }
    }

    // Validate name
    const nameValidation = validateRequired(formData.name, 'Full Name');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    // Validate password
    if (!initialData || formData.password) {
      if (!formData.password) {
        newErrors.password = initialData 
          ? 'Password is required if you want to change it' 
          : 'Password is required';
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0];
        }
      }
    }

    // Validate position
    if (!['cashier', 'admin'].includes(formData.position)) {
      newErrors.position = 'Position must be either cashier or admin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Prepare data for submission
    const submitData = {
      username: formData.username.trim().toLowerCase(),
      name: formData.name.trim(),
      position: formData.position,
      isActive: formData.isActive,
    };

    // Only include password if it's provided
    if (formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Username: <span className="required">*</span></label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username (lowercase, no spaces)"
          disabled={!!initialData}
          required
          className={errors.username ? 'error' : ''}
        />
        {errors.username && <span className="field-error">{errors.username}</span>}
        {!initialData && (
          <small className="form-hint">3+ characters, lowercase letters, numbers, and underscores only</small>
        )}
      </div>

      <div className="form-group">
        <label>Full Name: <span className="required">*</span></label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>
          {initialData ? 'New Password (leave blank to keep current):' : 'Password: '}
          {!initialData && <span className="required">*</span>}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={initialData ? 'Enter new password' : 'Enter password'}
          required={!initialData}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}
        {passwordStrength && (
          <div className="password-strength">
            {passwordStrength.isValid ? (
              <span className="strength-valid">✓ Password meets requirements</span>
            ) : (
              <div className="strength-invalid">
                <strong>Password must have:</strong>
                <ul>
                  {passwordStrength.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {!initialData && (
          <small className="form-hint">
            At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Position: <span className="required">*</span></label>
        <select 
          name="position" 
          value={formData.position} 
          onChange={handleChange}
          className={errors.position ? 'error' : ''}
        >
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>
        {errors.position && <span className="field-error">{errors.position}</span>}
      </div>

      {initialData && (
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            {' '}Active Account
          </label>
        </div>
      )}

      <button type="submit" className="btn-success" disabled={loading}>
        {loading ? 'Saving...' : initialData ? 'Update Employee' : 'Add Employee'}
      </button>
    </form>
  );
}

EmployeeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
};
