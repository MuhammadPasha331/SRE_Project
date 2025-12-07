#!/usr/bin/env node

/**
 * Quick Start Migration Script
 * Run: npm run migrate
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════╗
║     🚀 POS System Data Migration                       ║
║     Java System → MongoDB                              ║
╚════════════════════════════════════════════════════════╝
`);

// Check if .env exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.log('   Create .env file with:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/pos-system');
  process.exit(1);
}

// Check if Database folder exists
const dbPath = path.join(__dirname, '../../Database');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Error: Database folder not found!');
  console.log('   Expected location: ' + dbPath);
  process.exit(1);
}

console.log('✓ Checking prerequisites...\n');

// Run migration
const child = spawn('node', [path.join(__dirname, 'migrateData.js')], {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (error) => {
  console.error('❌ Migration error:', error);
  process.exit(1);
});

child.on('close', (code) => {
  if (code === 0) {
    console.log(`
╔════════════════════════════════════════════════════════╗
║     ✅ Migration Complete!                             ║
╚════════════════════════════════════════════════════════╝

Next steps:
1. Start MongoDB (if not running):
   mongod

2. Start backend server:
   npm start

3. Start frontend:
   cd ../frontend && npm run dev

4. Login with migrated credentials:
   Username: Any from employeeDatabase.txt
   Example: admin / 1
   
5. Check MongoDB:
   mongosh > use pos-system > db.employees.count()
    `);
  } else {
    console.error(`❌ Migration failed with code ${code}`);
    process.exit(code);
  }
});
