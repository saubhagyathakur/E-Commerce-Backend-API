# E-Commerce Full-Stack Platform & API

Production-grade E-Commerce Web Application and Backend API built with **React**, **Express.js**, **Node.js**, and **MongoDB**. Designed and engineered with high resilience, clean layered architecture, atomic stock transactions, server-side cart calculations, role-based access control, interactive Swagger UI documentation, and a complete automated test suite (24/24 passing).

---

## 🚀 Key Features & Functional Requirements Checklist

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **1. Authentication & Users** | Secure registration, login, JWT token issuance & Bearer header auth | ✅ Complete |
| **2. Secure Register & Login** | Email validation, duplicate email prevention (HTTP 409), login validation | ✅ Complete |
| **3. Bcrypt & JWT** | Bcrypt salted hashing (10 rounds) and JWT signature verification | ✅ Complete |
| **4. Customer & Admin Roles** | Strict RBAC (`authorize('admin')`), gating administrative operations | ✅ Complete |
| **5. Product Management** | CRUD operations with full data persistence in MongoDB | ✅ Complete |
| **6. Product Data Fields** | `name`, `description`, `price`, `category`, `stock`, `imageUrl` | ✅ Complete |
| **7. Admin Product Actions** | Admins can add (`POST`), edit (`PUT`/`PATCH`), and delete (`DELETE`) products | ✅ Complete |
| **8. Customer Product Browsing** | Search products by name, description, category; view single product | ✅ Complete |
| **9. Filter Products** | Filter by category and price range (`minPrice` & `maxPrice`), sorting | ✅ Complete |
| **10. Shopping Cart** | Dedicated cart storage per customer with live product references | ✅ Complete |
| **11. Add to Cart** | Add products, increment quantity if already existing, validate stock limit | ✅ Complete |
| **12. Change Quantities** | Increase or decrease quantities, check against available inventory | ✅ Complete |
| **13. Remove Cart Items** | Remove specific item or clear entire shopping cart | ✅ Complete |
| **14. Server-Side Cart Calculation** | Live unit price lookup, subtotal calculation, and server-side total amount | ✅ Complete |
| **15. Order Management** | Atomic order checkout workflow, snapshots, and customer isolation | ✅ Complete |
| **16. Place Order from Cart** | Converts active shopping cart into confirmed order | ✅ Complete |
| **17. Stock Verification** | Validates item stock before confirming order; prevents over-ordering | ✅ Complete |
| **18. Save Order Details** | Items snapshot, quantities, total amount, customer ID, order status | ✅ Complete |
| **19. Reduce Inventory** | Atomic inventory deduction (`$inc: { stock: -qty }`) with race condition rollback | ✅ Complete |
| **20. Customer Order History** | Customers can view their own orders (`/api/orders/my-orders`) | ✅ Complete |
| **21. Admin Order Status Update** | Admins can update status: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled` | ✅ Complete |

---

## 🛠 Tech Stack

- **Frontend**: React 18 / 19, Vite, Lucide Icons, Modern Responsive CSS
- **Backend**: Node.js (v24), Express 5, Mongoose 9
- **Database**: MongoDB
- **Security & Utilities**: `bcryptjs`, `jsonwebtoken`, `helmet`, `cors`, `morgan`, `express-validator`
- **Documentation**: Swagger UI (`swagger-ui-express`) & OpenAPI 3.0
- **Testing**: `vitest`, `supertest` (24 integration test cases)

---

## 📦 Project Structure

```
d:/e-com/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx    # Copper Dashboard matching assignment UI
│   │   │   ├── CustomerStore.jsx     # Product Catalog with Search & Filter
│   │   │   ├── CartDrawer.jsx        # Shopping Cart with Server Calculation
│   │   │   ├── OrdersView.jsx        # Customer & Admin Orders View
│   │   │   ├── InventoryView.jsx     # Admin Product Management
│   │   │   ├── ProductModal.jsx      # Add / Edit Product Modal
│   │   │   ├── AuthModal.jsx         # Sign In / Register Modal
│   │   │   ├── Sidebar.jsx           # Side Navigation
│   │   │   └── Topbar.jsx            # Top Navigation, Search & Role Switcher
│   │   ├── services/
│   │   │   └── api.js                # API Client & Token Management
│   │   ├── App.jsx                   # Main React Application
│   │   └── index.css                 # Clean Modern Styling
│   └── dist/                         # Production Build (served by Express)
├── src/                        # Express Backend API
│   ├── config/
│   │   ├── db.js                     # MongoDB Connection & Lifecycle
│   │   └── env.js                    # Centralized Environment Config
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Profile & Dashboard Metrics
│   │   ├── productController.js      # Products CRUD, Search & Category/Price Filters
│   │   ├── cartController.js         # Cart Operations & Server Calculations
│   │   └── orderController.js        # Orders, Stock Deductions & Status Updates
│   ├── middlewares/
│   │   ├── auth.js                   # JWT Authentication & Role Authorization
│   │   ├── validate.js               # Express-Validator Handler
│   │   └── errorHandler.js           # Centralized Error Middleware
│   ├── models/
│   │   ├── User.js                   # User Schema with Bcrypt Hooks
│   │   ├── Product.js                # Product Schema with Indexes
│   │   ├── Cart.js                   # Cart Schema
│   │   └── Order.js                  # Order Schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── index.js
│   ├── docs/
│   │   └── swagger.js                # OpenAPI 3.0 Documentation
│   ├── scripts/
│   │   └── seed.js                   # Database Seeder Script
│   ├── app.js                        # Express App & Static Middleware
│   └── server.js                     # Server Entry Point
├── tests/
│   ├── setup.js                      # Test Environment Lifecycle
│   ├── auth.test.js                  # Authentication & Profile Tests (7 tests)
│   ├── products.test.js              # Product CRUD, Search & Filter Tests (7 tests)
│   ├── cart.test.js                  # Cart & Server-Side Calculation Tests (6 tests)
│   └── orders.test.js                # Order Placement & Stock Reduction Tests (4 tests)
├── .env                              # Environment Variables
├── .env.example
├── vitest.config.js
└── package.json
```

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- **Node.js** (v18+ or v24+)
- **MongoDB** running on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies & Build Frontend
```bash
# Install root dependencies
npm install

# Build client React application
npm run build
```

### 3. Seed Database with Realistic Data
Populates the database with admin and customer accounts, products, cart items, and sample orders:
```bash
npm run seed
```

### 4. Start the Full-Stack Application
```bash
npm start
```
- **Web Application & Dashboard**: [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger UI Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123` | Full Access: Dashboard Metrics, Product CRUD, Order Status Updates |
| **Customer** | `customer@example.com` | `Customer@123` | Store Catalog, Cart Management, Order Checkout, Order History |

> **Tip**: The top navigation bar in the web app contains a **Role Switcher** ("Admin View" / "Customer View") for instant one-click switching during testing!

---

## 🧪 Automated Test Suite (24/24 Passing)

Run the comprehensive integration test suite:
```bash
npm test
```

### Test Coverage Highlights:
- **`tests/auth.test.js`**: Registration, bcrypt password hashing, duplicate email rejection, invalid inputs, JWT token login, Bearer token verification, profile retrieval.
- **`tests/products.test.js`**: Admin product creation, RBAC customer restriction (403), public listing, keyword search, category filtering, price range (`minPrice` / `maxPrice`), admin update and deletion.
- **`tests/cart.test.js`**: Adding products, incremental quantity, stock limitation guard (400), server-side total amount calculation, updating quantity, item removal.
- **`tests/orders.test.js`**: Empty cart rejection, checkout stock verification, atomic inventory reduction (`$inc: { stock: -qty }`), cart clearing upon checkout, customer viewing own orders, admin viewing all orders and updating status.

---

## 📡 API Reference Summary

### Authentication
- `POST /api/auth/register` - Register a new customer or admin
- `POST /api/auth/login` - Authenticate and obtain JWT
- `GET /api/auth/me` - Get profile of authenticated user
- `GET /api/auth/stats` - Admin metrics & inventory alerts

### Products
- `GET /api/products` - Browse catalog (with `?search=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?sort=`, `?page=`)
- `GET /api/products/categories` - Distinct categories
- `GET /api/products/:id` - Product details
- `POST /api/products` - Create product *(Admin)*
- `PUT /api/products/:id` - Update product *(Admin)*
- `DELETE /api/products/:id` - Delete product *(Admin)*

### Shopping Cart
- `GET /api/cart` - View cart with server-side calculated totals
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Order Management
- `POST /api/orders` - Place order from cart (verifies stock & deducts inventory)
- `GET /api/orders/my-orders` - Customer's order history
- `GET /api/orders` - View all customer orders *(Admin)*
- `GET /api/orders/:id` - Order details
- `PATCH /api/orders/:id/status` - Update order status: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled` *(Admin)*
