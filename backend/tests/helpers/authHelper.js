const request = require('supertest');
const Employee = require('../../models/Employee');

// Lazy load app to avoid connection issues
function getApp() {
  return require('../../server');
}

/**
 * Creates a test employee and returns auth token
 * @param {Object} employeeData - Employee data (username, name, password, position)
 * @returns {Promise<{token: string, employee: Object}>}
 */
async function createAuthenticatedUser(employeeData = {}) {
  const defaultData = {
    username: `testuser_${Date.now()}`,
    name: 'Test User',
    password: 'Test123!@#',
    position: 'cashier',
    ...employeeData,
  };

  // Create employee
  const employee = new Employee(defaultData);
  await employee.save();

  // Login to get token
  const loginResponse = await request(getApp())
    .post('/api/auth/login')
    .send({
      username: defaultData.username,
      password: defaultData.password,
    });

  return {
    token: loginResponse.body.token,
    employee: loginResponse.body.user,
  };
}

/**
 * Creates an admin user and returns auth token
 * @returns {Promise<{token: string, employee: Object}>}
 */
async function createAdminUser() {
  return createAuthenticatedUser({
    username: `admin_${Date.now()}`,
    name: 'Admin User',
    position: 'admin',
  });
}

/**
 * Creates a cashier user and returns auth token
 * @returns {Promise<{token: string, employee: Object}>}
 */
async function createCashierUser() {
  return createAuthenticatedUser({
    username: `cashier_${Date.now()}`,
    name: 'Cashier User',
    position: 'cashier',
  });
}

module.exports = {
  createAuthenticatedUser,
  createAdminUser,
  createCashierUser,
};

