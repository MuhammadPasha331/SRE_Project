# Integration Tests

This directory contains Supertest-based integration tests for the POS system API endpoints.

## Test Structure

```
tests/
├── setup.js                    # Test environment setup
├── helpers/
│   ├── authHelper.js          # Authentication helper functions
│   └── testData.js            # Test data factories
└── integration/
    ├── sales.test.js          # Sales endpoint tests
    ├── rentals.test.js        # Rentals endpoint tests
    └── inventory.test.js      # Inventory endpoint tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Test Coverage

The tests cover:

### Sales Endpoints (`/api/sales`)
- ✅ POST `/api/sales` - Create sale
- ✅ POST `/api/sales/calculate-totals` - Calculate totals
- ✅ GET `/api/sales` - Get all sales
- ✅ GET `/api/sales/:id` - Get sale by ID

### Rentals Endpoints (`/api/rentals`)
- ✅ POST `/api/rentals` - Create rental
- ✅ POST `/api/rentals/:rentalId/return` - Return rental
- ✅ GET `/api/rentals` - Get all rentals
- ✅ GET `/api/rentals/:id` - Get rental by ID
- ✅ GET `/api/rentals/customer/:customerId` - Get customer rentals
- ✅ GET `/api/rentals/check-overdue` - Check overdue rentals

### Inventory Endpoints (`/api/items`)
- ✅ POST `/api/items` - Create item
- ✅ GET `/api/items` - Get all items
- ✅ GET `/api/items/:id` - Get item by ID
- ✅ PUT `/api/items/:id` - Update item
- ✅ DELETE `/api/items/:id` - Delete item
- ✅ GET `/api/items/low-stock` - Get low stock items
- ✅ GET `/api/items/inventory-value` - Get inventory value

## Test Features

- **Authentication**: All tests use proper JWT authentication
- **Role-based Authorization**: Tests verify role-based access control
- **HTTP Status Codes**: Tests verify correct HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **Data Validation**: Tests verify request/response data structure
- **Error Handling**: Tests verify proper error responses
- **Isolated Database**: Uses MongoDB Memory Server for isolated test database

## Test Helpers

### `authHelper.js`
- `createAuthenticatedUser()` - Create user and get auth token
- `createAdminUser()` - Create admin user
- `createCashierUser()` - Create cashier user

### `testData.js`
- `createTestItem()` - Generate test item data
- `createTestCustomer()` - Generate test customer data
- `createTestSale()` - Generate test sale data
- `createTestRental()` - Generate test rental data

## Notes

- Tests use MongoDB Memory Server for isolated testing
- Database is cleaned after each test
- All tests require authentication tokens
- Tests verify both success and error scenarios

