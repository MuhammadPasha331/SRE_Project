const request = require('supertest');
const app = require('../../server');
const Rental = require('../../models/Rental');
const Item = require('../../models/Item');
const Customer = require('../../models/Customer');
const { createCashierUser, createAdminUser } = require('../helpers/authHelper');
const { createTestItem, createTestCustomer, createTestRental } = require('../helpers/testData');

describe('Rentals API Integration Tests', () => {
  let cashierToken;
  let adminToken;
  let cashierId;
  let testItem;
  let testCustomer;

  beforeAll(async () => {
    // Create authenticated users
    const cashier = await createCashierUser();
    cashierToken = cashier.token;
    cashierId = cashier.employee.id;

    const admin = await createAdminUser();
    adminToken = admin.token;

    // Create test item
    testItem = new Item(createTestItem({ itemID: 2001, stockQuantity: 30 }));
    await testItem.save();

    // Create test customer
    testCustomer = new Customer(createTestCustomer());
    await testCustomer.save();
  });

  describe('POST /api/rentals', () => {
    it('should create a rental with valid data (201)', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const rentalData = {
        items: [
          {
            itemID: testItem.itemID,
            itemName: testItem.itemName,
            quantity: 1,
          },
        ],
        customerId: testCustomer._id.toString(),
        cashierId: cashierId,
        dueDate: dueDate.toISOString(),
        totalCost: 50.00,
        notes: 'Test rental',
      };

      const response = await request(app)
        .post('/api/rentals')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(rentalData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.totalCost).toBe(50.00);
      expect(response.body.status).toBe('active');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/rentals')
        .send(createTestRental())
        .expect(401);
    });

    it('should return 400 with invalid rental data', async () => {
      const invalidRentalData = {
        items: [],
        customerId: testCustomer._id.toString(),
      };

      const response = await request(app)
        .post('/api/rentals')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(invalidRentalData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should update inventory when creating rental', async () => {
      const initialStock = testItem.stockQuantity;
      const rentalQuantity = 2;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const rentalData = {
        items: [
          {
            itemID: testItem.itemID,
            itemName: testItem.itemName,
            quantity: rentalQuantity,
          },
        ],
        customerId: testCustomer._id.toString(),
        cashierId: cashierId,
        dueDate: dueDate.toISOString(),
        totalCost: 100.00,
      };

      await request(app)
        .post('/api/rentals')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(rentalData)
        .expect(201);

      // Verify inventory was updated
      const updatedItem = await Item.findOne({ itemID: testItem.itemID });
      expect(updatedItem.stockQuantity).toBe(initialStock - rentalQuantity);
    });
  });

  describe('POST /api/rentals/:rentalId/return', () => {
    let testRental;

    beforeEach(async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      testRental = new Rental({
        items: [
          {
            itemID: testItem.itemID,
            itemName: testItem.itemName,
            quantity: 1,
          },
        ],
        customer: testCustomer._id,
        cashier: cashierId,
        dueDate: dueDate,
        totalCost: 50.00,
        rentalID: `RENTAL-${Date.now()}`,
        status: 'active',
      });
      await testRental.save();
    });

    it('should return a rental successfully (200)', async () => {
      const response = await request(app)
        .post(`/api/rentals/${testRental._id}/return`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ returnItems: null })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'returned');
      expect(response.body).toHaveProperty('returnedDate');
      expect(response.body).toHaveProperty('lateFee');
    });

    it('should calculate late fee for overdue rental', async () => {
      // Create an overdue rental
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - 3); // 3 days ago

      const overdueRental = new Rental({
        items: [
          {
            itemID: testItem.itemID,
            itemName: testItem.itemName,
            quantity: 1,
          },
        ],
        customer: testCustomer._id,
        cashier: cashierId,
        dueDate: overdueDate,
        totalCost: 50.00,
        rentalID: `RENTAL-${Date.now()}`,
        status: 'overdue',
      });
      await overdueRental.save();

      const response = await request(app)
        .post(`/api/rentals/${overdueRental._id}/return`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ returnItems: null })
        .expect(200);

      expect(response.body.lateFee).toBeGreaterThan(0);
      expect(response.body.status).toBe('returned');
    });

    it('should return 404 for non-existent rental', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .post(`/api/rentals/${fakeId}/return`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ returnItems: null })
        .expect(500);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post(`/api/rentals/${testRental._id}/return`)
        .send({ returnItems: null })
        .expect(401);
    });
  });

  describe('GET /api/rentals', () => {
    it('should get all rentals (200)', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const rental = new Rental({
        ...createTestRental(),
        customer: testCustomer._id,
        cashier: cashierId,
        rentalID: `RENTAL-${Date.now()}`,
      });
      await rental.save();

      const response = await request(app)
        .get('/api/rentals')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter rentals by status', async () => {
      const response = await request(app)
        .get('/api/rentals')
        .query({ status: 'active' })
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/rentals')
        .expect(401);
    });
  });

  describe('GET /api/rentals/:id', () => {
    it('should get a rental by ID (200)', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const rental = new Rental({
        ...createTestRental(),
        customer: testCustomer._id,
        cashier: cashierId,
        rentalID: `RENTAL-${Date.now()}`,
      });
      await rental.save();

      const response = await request(app)
        .get(`/api/rentals/${rental._id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', rental._id.toString());
      expect(response.body).toHaveProperty('items');
    });

    it('should return 404 for non-existent rental', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/rentals/${fakeId}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/rentals/customer/:customerId', () => {
    it('should get outstanding rentals for a customer (200)', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const rental = new Rental({
        ...createTestRental(),
        customer: testCustomer._id,
        cashier: cashierId,
        rentalID: `RENTAL-${Date.now()}`,
        status: 'active',
      });
      await rental.save();

      const response = await request(app)
        .get(`/api/rentals/customer/${testCustomer._id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/rentals/customer/${testCustomer._id}`)
        .expect(401);
    });
  });

  describe('GET /api/rentals/check-overdue', () => {
    it('should check and update overdue rentals (200)', async () => {
      const response = await request(app)
        .get('/api/rentals/check-overdue')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('matchedCount');
      expect(response.body).toHaveProperty('modifiedCount');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/rentals/check-overdue')
        .expect(401);
    });
  });
});

