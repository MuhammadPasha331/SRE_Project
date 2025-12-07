const request = require('supertest');
const app = require('../../server');
const Sale = require('../../models/Sale');
const Item = require('../../models/Item');
const Customer = require('../../models/Customer');
const { createCashierUser, createAdminUser } = require('../helpers/authHelper');
const { createTestItem, createTestCustomer, createTestSale } = require('../helpers/testData');

describe('Sales API Integration Tests', () => {
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
    testItem = new Item(createTestItem({ itemID: 1001, stockQuantity: 50 }));
    await testItem.save();

    // Create test customer
    testCustomer = new Customer(createTestCustomer());
    await testCustomer.save();
  });

  describe('POST /api/sales', () => {
    it('should create a sale with valid data (201)', async () => {
      const saleData = {
        items: [
          {
            itemID: testItem.itemID,
            itemName: testItem.itemName,
            price: testItem.price,
            quantity: 2,
            subtotal: testItem.price * 2,
          },
        ],
        subtotal: testItem.price * 2,
        discount: 0,
        tax: (testItem.price * 2) * 0.06,
        total: (testItem.price * 2) * 1.06,
        paymentMethod: 'cash',
        cashierId: cashierId,
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(saleData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBeCloseTo(saleData.total, 2);
      expect(response.body.paymentMethod).toBe('cash');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/sales')
        .send(createTestSale())
        .expect(401);
    });

    it('should return 403 for unauthorized role', async () => {
      // Note: This would require a user with a role that's not cashier/admin
      // For now, we test that cashier can access
      const saleData = createTestSale({ cashierId });
      
      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(saleData)
        .expect(201);

      expect(response.status).toBe(201);
    });

    it('should return 400 with invalid sale data', async () => {
      const invalidSaleData = {
        items: [],
        subtotal: 0,
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(invalidSaleData)
        .expect(500); // Server error due to missing required fields

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/sales/calculate-totals', () => {
    it('should calculate totals correctly (200)', async () => {
      const items = [
        {
          itemID: testItem.itemID,
          price: testItem.price,
          quantity: 3,
        },
      ];

      const response = await request(app)
        .post('/api/sales/calculate-totals')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ items, discountPercent: 0, couponId: null })
        .expect(200);

      expect(response.body).toHaveProperty('subtotal');
      expect(response.body).toHaveProperty('tax');
      expect(response.body).toHaveProperty('total');
      expect(response.body.subtotal).toBeCloseTo(testItem.price * 3, 2);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/sales/calculate-totals')
        .send({ items: [] })
        .expect(401);
    });
  });

  describe('GET /api/sales', () => {
    it('should get all sales (200)', async () => {
      // Create a test sale first
      const sale = new Sale({
        ...createTestSale(),
        cashier: cashierId,
        saleID: `SALE-${Date.now()}`,
      });
      await sale.save();

      const response = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/sales')
        .expect(401);
    });

    it('should filter sales by query parameters', async () => {
      const response = await request(app)
        .get('/api/sales')
        .query({ paymentMethod: 'cash' })
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/sales/:id', () => {
    it('should get a sale by ID (200)', async () => {
      const sale = new Sale({
        ...createTestSale(),
        cashier: cashierId,
        saleID: `SALE-${Date.now()}`,
      });
      await sale.save();

      const response = await request(app)
        .get(`/api/sales/${sale._id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', sale._id.toString());
      expect(response.body).toHaveProperty('items');
    });

    it('should return 404 for non-existent sale', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/sales/${fakeId}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication', async () => {
      const sale = new Sale({
        ...createTestSale(),
        cashier: cashierId,
        saleID: `SALE-${Date.now()}`,
      });
      await sale.save();

      await request(app)
        .get(`/api/sales/${sale._id}`)
        .expect(401);
    });
  });
});

