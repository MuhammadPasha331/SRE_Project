const request = require('supertest');
const app = require('../../server');
const Item = require('../../models/Item');
const { createAdminUser, createCashierUser } = require('../helpers/authHelper');
const { createTestItem } = require('../helpers/testData');

describe('Inventory API Integration Tests', () => {
  let adminToken;
  let cashierToken;
  let adminId;
  let testItem;

  beforeAll(async () => {
    // Create authenticated users
    const admin = await createAdminUser();
    adminToken = admin.token;
    adminId = admin.employee.id;

    const cashier = await createCashierUser();
    cashierToken = cashier.token;
  });

  describe('POST /api/items', () => {
    it('should create an item with valid data (201) - Admin', async () => {
      const itemData = createTestItem({ itemID: 3001 });

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.itemID).toBe(itemData.itemID);
      expect(response.body.itemName).toBe(itemData.itemName);
      expect(response.body.price).toBe(itemData.price);
      expect(response.body.stockQuantity).toBe(itemData.stockQuantity);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/items')
        .send(createTestItem())
        .expect(401);
    });

    it('should return 403 for unauthorized role (cashier)', async () => {
      const itemData = createTestItem({ itemID: 3002 });

      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(itemData)
        .expect(403);
    });

    it('should return 400 with invalid item data', async () => {
      const invalidItemData = {
        itemName: 'Test Item',
        // Missing required fields: itemID, price, stockQuantity
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidItemData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for duplicate itemID', async () => {
      const itemData = createTestItem({ itemID: 3003 });
      
      // Create first item
      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/items', () => {
    beforeEach(async () => {
      // Create test items
      testItem = new Item(createTestItem({ itemID: 4001 }));
      await testItem.save();

      const item2 = new Item(createTestItem({ itemID: 4002, category: 'Electronics' }));
      await item2.save();
    });

    it('should get all items (200)', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/items')
        .expect(401);
    });

    it('should filter items by category', async () => {
      const response = await request(app)
        .get('/api/items')
        .query({ category: 'Electronics' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/items/:id', () => {
    beforeEach(async () => {
      testItem = new Item(createTestItem({ itemID: 5001 }));
      await testItem.save();
    });

    it('should get an item by ID (200)', async () => {
      const response = await request(app)
        .get(`/api/items/${testItem._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', testItem._id.toString());
      expect(response.body.itemID).toBe(testItem.itemID);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/items/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Item not found');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/items/${testItem._id}`)
        .expect(401);
    });
  });

  describe('PUT /api/items/:id', () => {
    beforeEach(async () => {
      testItem = new Item(createTestItem({ itemID: 6001, stockQuantity: 50 }));
      await testItem.save();
    });

    it('should update an item (200) - Admin', async () => {
      const updateData = {
        itemName: 'Updated Item Name',
        price: 15.99,
        stockQuantity: 75,
      };

      const response = await request(app)
        .put(`/api/items/${testItem._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.itemName).toBe(updateData.itemName);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.stockQuantity).toBe(updateData.stockQuantity);
    });

    it('should return 403 for unauthorized role (cashier)', async () => {
      const updateData = {
        itemName: 'Updated Item Name',
      };

      await request(app)
        .put(`/api/items/${testItem._id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/items/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ itemName: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Item not found');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .put(`/api/items/${testItem._id}`)
        .send({ itemName: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /api/items/:id', () => {
    let itemToDelete;

    beforeEach(async () => {
      itemToDelete = new Item(createTestItem({ itemID: 7001 }));
      await itemToDelete.save();
    });

    it('should delete an item (200) - Admin only', async () => {
      const response = await request(app)
        .delete(`/api/items/${itemToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Item deleted successfully');

      // Verify item is deleted
      const deletedItem = await Item.findById(itemToDelete._id);
      expect(deletedItem).toBeNull();
    });

    it('should return 403 for unauthorized role (cashier)', async () => {
      await request(app)
        .delete(`/api/items/${itemToDelete._id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/items/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Item not found');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/items/${itemToDelete._id}`)
        .expect(401);
    });
  });

  describe('GET /api/items/low-stock', () => {
    beforeEach(async () => {
      // Create items with different stock levels
      await Item.create(createTestItem({ itemID: 8001, stockQuantity: 5 })); // Low stock
      await Item.create(createTestItem({ itemID: 8002, stockQuantity: 15 })); // Above threshold
      await Item.create(createTestItem({ itemID: 8003, stockQuantity: 3 })); // Low stock
    });

    it('should get low stock items (200)', async () => {
      const response = await request(app)
        .get('/api/items/low-stock')
        .query({ threshold: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(item => {
        expect(item.stockQuantity).toBeLessThanOrEqual(10);
      });
    });

    it('should use default threshold of 10 if not provided', async () => {
      const response = await request(app)
        .get('/api/items/low-stock')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/items/low-stock')
        .expect(401);
    });
  });

  describe('GET /api/items/inventory-value', () => {
    beforeEach(async () => {
      // Create items with known values
      await Item.create(createTestItem({ itemID: 9001, price: 10, stockQuantity: 5 })); // 50
      await Item.create(createTestItem({ itemID: 9002, price: 20, stockQuantity: 3 })); // 60
      // Total: 110
    });

    it('should calculate total inventory value (200) - Admin/Manager', async () => {
      const response = await request(app)
        .get('/api/items/inventory-value')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalInventoryValue');
      expect(typeof response.body.totalInventoryValue).toBe('number');
      expect(response.body.totalInventoryValue).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for unauthorized role (cashier)', async () => {
      await request(app)
        .get('/api/items/inventory-value')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/items/inventory-value')
        .expect(401);
    });
  });
});

