# Point of Sale (POS) System - MERN Conversion

A complete modernization of a legacy Java desktop POS system into a full-stack MERN (MongoDB, Express, React, Node.js) web application.

## Overview

This project converts a file-based Java POS system into a scalable, cloud-ready web application with a professional REST API backend and interactive React frontend.

### What Was Converted

**From Java Legacy System:**
- Employee management and authentication
- Inventory management with stock tracking
- Customer lookup and rental tracking
- Sales processing with tax and discount calculations
- Rental management with due dates and late fees
- Coupon/discount code management
- File-based text databases → MongoDB collections

**To Modern Stack:**
- Node.js/Express REST API
- MongoDB with Mongoose schemas
- React with context API
- JWT-based authentication
- Role-based access control (Admin/Cashier)

## Folder Structure

```
pos-mern-conversion/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Item.js
│   │   ├── Customer.js
│   │   ├── Sale.js
│   │   ├── Rental.js
│   │   └── Coupon.js
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── SETUP.md
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:3000

## Key Features

### Completed
- JWT Authentication with role-based access
- Employee CRUD with secure password hashing
- Inventory management with low-stock alerts
- Customer lookup by phone number
- Sales processing with automatic tax/discount calculation
- Rental management with due date tracking
- Coupon management with expiry validation
- Admin and Cashier dashboard interfaces
- Service layer for business logic separation




## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Dev Tools:** Nodemon

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** CSS3 with CSS Modules ready

## Data Models

### Employee
- Username, name, password (hashed), position (admin/cashier/manager)
- isActive flag for soft deletion
- Timestamps for audit trail

### Item
- Unique itemID, name, price, stockQuantity
- Category and description
- Tracks inventory value

### Customer
- Phone number (unique identifier)
- First/last name, email
- Outstanding rentals list
- Total spent tracking

### Sale
- Items list with quantities and prices
- Automatic subtotal, discount, tax (6%), total calculation
- Payment method and cashier reference
- Coupon application support

### Rental
- Items list with rental quantities
- Due date and return date tracking
- Status: active/returned/overdue
- Late fee calculation ($5/day)

### Coupon
- Code-based discount system
- Percentage or fixed amount discounts
- Expiry dates and max usage limits
- Usage tracking

## API Response Format

All endpoints return JSON with consistent structure:

**Success (200-201):**
```json
{
  "id": "...",
  "field": "value",
  ...
}
```

**Error (4xx-5xx):**
```json
{
  "message": "Error description"
}
```

## Authentication

1. **Login** → Get JWT token
2. **Store token** in localStorage
3. **Include token** in Authorization header: `Bearer <token>`
4. **Token expires** after 24 hours

## Role-Based Access Control

- **Admin:** Create/manage employees, manage inventory, create coupons
- **Manager:** Manage inventory, create coupons, view reports
- **Cashier:** Process sales, create rentals, return items, lookup customers

## Migration Notes

### From Java to Node.js

| Java | Node.js |
|------|---------|
| File-based storage | MongoDB |
| Text file parsing | Mongoose schemas |
| GUI interfaces | REST API endpoints |
| Singleton patterns | Service classes |
| Static methods | Module exports |
| BufferedReader | Mongoose queries |
| Password in plain text | bcryptjs hashing |

### Database Naming Convention

Java Model → MongoDB Collection (Lowercase, plural):
- `Employee` → `employees`
- `Item` → `items`
- `Customer` → `customers`
- `Sale` → `sales`
- `Rental` → `rentals`
- `Coupon` → `coupons`

## Running Tests (Future)

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```



## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/pos-system
JWT_SECRET=your_secret_key_change_in_production
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### MongoDB Connection Refused
- Start MongoDB: `net start MongoDB` (Windows)
- Or use MongoDB Atlas cloud: Update MONGO_URI to cloud instance

### CORS Errors
- Backend CORS is enabled globally
- Frontend proxy configured in vite.config.js

### Port Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Token Expired
- User must login again
- Frontend clears token and redirects to login

## Project Statistics

- **Backend Files:** 27
- **Frontend Files:** 25
- **API Endpoints:** 38+
- **Mongoose Schemas:** 6
- **React Components:** 7+ pages
- **Lines of Code:** ~3000+



## Contributing

This is a conversion project. For improvements:
1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests with clear descriptions

## License

MIT License

## Support

For issues or questions:
- Check SETUP.md for detailed setup instructions
- Review API documentation in comments
- Check browser console for frontend errors
- Check server logs for backend errors

---

**Converted from:** Legacy Java Desktop POS System
**Conversion Date:** 2025
**Status:** Production Ready (Functional Core)
