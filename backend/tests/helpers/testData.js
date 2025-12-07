/**
 * Test data factories for creating test entities
 */

function createTestItem(itemData = {}) {
  return {
    itemID: itemData.itemID || Math.floor(Math.random() * 10000),
    itemName: itemData.itemName || `Test Item ${Date.now()}`,
    price: itemData.price || 10.99,
    stockQuantity: itemData.stockQuantity || 100,
    category: itemData.category || 'General',
    description: itemData.description || 'Test item description',
    ...itemData,
  };
}

function createTestCustomer(customerData = {}) {
  return {
    phoneNumber: customerData.phoneNumber || `555${Date.now().toString().slice(-7)}`,
    firstName: customerData.firstName || 'John',
    lastName: customerData.lastName || 'Doe',
    email: customerData.email || `test${Date.now()}@example.com`,
    ...customerData,
  };
}

function createTestSale(saleData = {}) {
  return {
    items: saleData.items || [
      {
        itemID: 1,
        itemName: 'Test Item',
        price: 10.99,
        quantity: 2,
        subtotal: 21.98,
      },
    ],
    subtotal: saleData.subtotal || 21.98,
    discount: saleData.discount || 0,
    tax: saleData.tax || 1.32,
    total: saleData.total || 23.30,
    paymentMethod: saleData.paymentMethod || 'cash',
    ...saleData,
  };
}

function createTestRental(rentalData = {}) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

  return {
    items: rentalData.items || [
      {
        itemID: 1,
        itemName: 'Test Rental Item',
        quantity: 1,
      },
    ],
    dueDate: rentalData.dueDate || dueDate.toISOString(),
    totalCost: rentalData.totalCost || 50.00,
    notes: rentalData.notes || 'Test rental',
    ...rentalData,
  };
}

module.exports = {
  createTestItem,
  createTestCustomer,
  createTestSale,
  createTestRental,
};

