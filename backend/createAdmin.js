/**
 * Script to create initial admin user
 * Run: node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pos-system';
    
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Username: admin');
      console.log('Password: admin123');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = new Employee({
      username: 'admin',
      name: 'Administrator',
      password: 'admin123', // Will be hashed automatically
      position: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✓ Admin user created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🔐 Change the password after first login!');

    await mongoose.disconnect();
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
