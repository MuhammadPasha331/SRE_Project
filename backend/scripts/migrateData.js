/**
 * Data Migration Script: Java POS System → MongoDB
 * 
 * This script reads data from the original Java POS text files
 * and imports them into MongoDB collections.
 * 
 * Usage: node scripts/migrateData.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Item = require('../models/Item');
const Sale = require('../models/Sale');
const Rental = require('../models/Rental');
const Customer = require('../models/Customer');

// Database path (legacy data stored at project root ../../Database)
// Database path (legacy data stored at repository root: Point-of-Sale-System-master/Database)
// From this file (backend/scripts) we need to go up three levels to reach project root
const DATABASE_PATH = path.resolve(__dirname, '../../../Database');

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://i222635_db_user:fast2022@cluster0.oor2rwf.mongodb.net/');
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

/**
 * Parse employee data from employeeDatabase.txt
 * Format: ID Role FirstName LastName Password
 */
async function migrateEmployees() {
  try {
    console.log('\n📦 Migrating Employees...');
    const filepath = path.join(DATABASE_PATH, 'employeeDatabase.txt');
    const data = fs.readFileSync(filepath, 'utf-8');
    
    const employees = [];
    const lines = data.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const [id, role, firstName, lastName, password = 'password123'] = parts;

        const employee = {
          username: id.toLowerCase(),
          name: `${firstName} ${lastName}`,
          password: password.length < 6 ? 'password123' : password, // Ensure min 6 chars
          position: role.toLowerCase() === 'admin' ? 'admin' : 'cashier',
          isActive: true,
        };

        employees.push(employee);
      }
    }

    // Insert employees
    await Employee.deleteMany({}); // Clear existing
    const result = await Employee.insertMany(employees);
    console.log(`✓ Migrated ${result.length} employees`);
    return result;
  } catch (error) {
    console.error('✗ Employee migration error:', error.message);
    return [];
  }
}

/**
 * Parse item data from itemDatabase.txt
 * Format: ID Name Price Stock
 */
async function migrateItems() {
  try {
    console.log('\n📦 Migrating Items...');
    const filepath = path.join(DATABASE_PATH, 'itemDatabase.txt');
    const data = fs.readFileSync(filepath, 'utf-8');

    const items = [];
    const lines = data.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const [id, name, price, quantity] = parts;

        const item = {
          itemID: parseInt(id),
          itemName: name,
          description: `${name} - Migrated from legacy system`,
          price: parseFloat(price),
          stockQuantity: parseInt(quantity),
          category: 'General',
          isActive: true,
        };

        items.push(item);
      }
    }

    // Insert items
    await Item.deleteMany({}); // Clear existing
    const result = await Item.insertMany(items);
    console.log(`✓ Migrated ${result.length} items`);
    return result;
  } catch (error) {
    console.error('✗ Item migration error:', error.message);
    return [];
  }
}

/**
 * Parse sales data from saleInvoiceRecord.txt
 * Format: DateTime, ItemID ItemName Quantity Price, Total with tax
 */
async function migrateSales(employees, items) {
  try {
    console.log('\n📦 Migrating Sales...');
    const filepath = path.join(DATABASE_PATH, 'saleInvoiceRecord.txt');
    const data = fs.readFileSync(filepath, 'utf-8');

    const sales = [];
    const lines = data.split('\n').filter(line => line.trim());

    let currentSale = null;
    let saleItems = [];
    let totalWithTax = 0;

    for (const line of lines) {
      // Check if it's a timestamp (datetime format)
      if (/^\d{4}-\d{2}-\d{2}/.test(line)) {
        // Save previous sale
        if (currentSale && saleItems.length > 0) {
          currentSale.items = saleItems;
          sales.push(currentSale);
          saleItems = [];
        }

        // Start new sale
        currentSale = {
          saleID: `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          items: [],
          subtotal: 0,
          tax: 0,
          total: totalWithTax || 0,
          paymentMethod: 'cash',
          cashier: employees[0]?._id || null,
          customer: null,
          couponUsed: null,
          saleDate: new Date(line),
          notes: 'Migrated from legacy system',
        };
      } else if (/^Total with tax:/.test(line)) {
        const total = parseFloat(line.split(':')[1].trim());
        totalWithTax = total;
      } else if (currentSale && /^\d+\s+/.test(line)) {
        // Item line format: ItemID ItemName Quantity Price
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const itemID = parseInt(parts[0]);
          const itemName = parts[1];
          const quantity = parseInt(parts[2]);
          const price = parseFloat(parts[3]);

          saleItems.push({
            itemID,
            itemName,
            price,
            quantity,
            subtotal: quantity * price,
          });
        }
      }
    }

    // Add last sale
    if (currentSale && saleItems.length > 0) {
      currentSale.items = saleItems;
      sales.push(currentSale);
    }

    // Insert sales
    await Sale.deleteMany({}); // Clear existing
    const result = await Sale.insertMany(sales);
    console.log(`✓ Migrated ${result.length} sales`);
    return result;
  } catch (error) {
    console.error('✗ Sales migration error:', error.message);
    return [];
  }
}

/**
 * Parse customer and rental data from userDatabase.txt
 * Format: PhoneNumber ItemID,ItemDate,ReturnedBool ...
 */
async function migrateCustomersAndRentals(items) {
  try {
    console.log('\n📦 Migrating Customers & Rentals...');
    const filepath = path.join(DATABASE_PATH, 'userDatabase.txt');
    const data = fs.readFileSync(filepath, 'utf-8');

    const customers = [];
    const rentals = [];
    const lines = data.split('\n').filter(line => line.trim());

    // Clear existing customers and rentals first to avoid duplicates
    await Customer.deleteMany({});
    await Rental.deleteMany({});

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 1) continue;

      const phoneNumber = parts[0];

      // Skip if phone number looks invalid
      if (!/^\d+$/.test(phoneNumber) || phoneNumber.length < 7) continue;

      // Create customer
      const customer = {
        phoneNumber,
        firstName: `Customer`,
        lastName: phoneNumber,
        email: `customer.${phoneNumber}@pos.com`,
        isActive: true,
      };

      const savedCustomer = await Customer.create(customer);
      customers.push(savedCustomer);

      // Parse rentals - format: ItemID,ItemDate,ReturnedBool
      for (let i = 1; i < parts.length; i += 3) {
        if (i + 2 < parts.length) {
          const itemID = parseInt(parts[i]);
          const itemDate = parts[i + 1];
          const returned = parts[i + 2].toLowerCase() === 'true';

          const item = items.find(it => it.itemID === itemID);

          if (item) {
            const rentalDate = parseDate(itemDate);
            const rental = {
              rentalID: `RENTAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              items: [
                {
                  itemID: item.itemID,
                  itemName: item.itemName,
                  quantity: 1,
                },
              ],
              customer: savedCustomer._id,
              rentalDate,
              dueDate: new Date(rentalDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
              returnedDate: returned ? rentalDate : null,
              status: returned ? 'returned' : 'active',
              totalCost: item.price,
            };

            rentals.push(rental);
          }
        }
      }
    }

    // Insert rentals
    const rentalResult = await Rental.insertMany(rentals);
    console.log(`✓ Migrated ${customers.length} customers`);
    console.log(`✓ Migrated ${rentalResult.length} rentals`);

    return { customers, rentals };
  } catch (error) {
    console.error('✗ Customer/Rental migration error:', error.message);
    return { customers: [], rentals: [] };
  }
}

/**
 * Parse date from format MM/DD/YY
 */
function parseDate(dateStr) {
  try {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);

      // Handle 2-digit years (00-99 → 2000-2099)
      const fullYear = year < 100 ? 2000 + year : year;

      return new Date(fullYear, month - 1, day);
    }
    return new Date();
  } catch (error) {
    return new Date();
  }
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('🚀 Starting Data Migration...\n');

    await connectDB();

    // Run migrations in order
    const employees = await migrateEmployees();
    const items = await migrateItems();
    await migrateSales(employees, items);
    const { customers, rentals } = await migrateCustomersAndRentals(items);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✓ MIGRATION COMPLETE!');
    console.log('='.repeat(50));
    console.log(`
Summary:
  ✓ Employees: ${employees.length}
  ✓ Items: ${items.length}
  ✓ Customers: ${customers.length}
  ✓ Rentals: ${rentals.length}
  
Your data has been successfully migrated to MongoDB!
    `);

    await mongoose.connection.close();
    console.log('Database connection closed.\n');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
