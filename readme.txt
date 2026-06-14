SUQ Marketplace - A Node.js E-commerce Platform with PostgreSQL

================================================================================

SUQ Marketplace is a full-featured e-commerce web application built with Node.js, Express, EJS, and PostgreSQL. It allows users to buy and sell products, manage inventory, track sales, and handle user authentication.

================================================================================

GROUP MEMBERS

Abel Berhanu 
Ermiyas Ketema
Beidemariyam Tamirat
Kaleb Meteku
Fenet Asrat

================================================================================

FEATURES

- User Authentication (Register, Login, Logout with confirmation modal)
- Product Management (Create, Read, Update, Delete)
- Inventory Tracking with Stock Management
- Purchase System with Order History
- Sales Dashboard with Earnings Tracking
- User Dashboard with Statistics
- Responsive Tea Leaves inspired design
- Secure Session Management

================================================================================

TECHNOLOGIES USED

Node.js, Express.js, PostgreSQL, EJS, bcryptjs, express-session, dotenv, nodemon

================================================================================

PREREQUISITES

Node.js (v18 or higher) and PostgreSQL (v14 or higher) must be installed on your system.

================================================================================

COMPLETE INSTALLATION GUIDE

1. Clone the repository:
   git clone https://github.com/Suq-Marketplace/Suq-Market.git
   cd suq-marketplace

2. Install dependencies:
   npm install

3. Create PostgreSQL database:
   Open psql or DBeaver and run: CREATE DATABASE suq_marketplace;

4. Run the database schema:
   psql -U postgres -d suq_marketplace -f database/schema.sql

5. Seed the database with sample data:
   node database/seed.js

6. Create .env file in the root directory with these variables:
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=suq_marketplace
   SESSION_SECRET=suq_marketplace_secret_key_2026

7. Start the application:
   npm run dev

8. Open your browser to http://localhost:3000

================================================================================

LOGIN CREDENTIALS

Username: john_doe | Password: password123 | Role: Seller
Username: jane_smith | Password: password123 | Role: Seller
Username: bob_wilson | Password: password123 | Role: User
Username: alice_brown | Password: password123 | Role: User

================================================================================

PROJECT STRUCTURE

suq-marketplace/
├── config/
│   └── db.js
├── controllers/
│   ├── userController.js
│   ├── productController.js
│   ├── saleController.js
│   └── pageController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── UserModel.js
│   ├── ProductModel.js
│   └── SaleModel.js
├── routes/
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── saleRoutes.js
│   └── pageRoutes.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── products.ejs
│   ├── product-detail.ejs
│   ├── add-product.ejs
│   ├── edit-product.ejs
│   ├── sales.ejs
│   ├── inventory.ejs
│   └── error.ejs
├── public/
│   └── css/
│       └── style.css
├── database/
│   ├── schema.sql
│   └── seed.js
├── .env
├── app.js
├── package.json
└── README.md

================================================================================

API ENDPOINTS FOR POSTMAN TESTING

GET    /api/products              - Get all products
GET    /api/products/:id          - Get single product
POST   /api/users/register        - Register new user
POST   /api/users/login           - Login user
GET    /api/users/logout          - Logout user
POST   /api/sales/purchase        - Purchase a product
GET    /api/sales/my-sales        - Get seller's sales
GET    /api/sales/my-purchases    - Get buyer's purchases

================================================================================

TROUBLESHOOTING

Problem: Database connection failed
Solution: Run "net start postgresql-x64-18" to start PostgreSQL

Problem: Product not found when adding product
Solution: Make sure you're logged in first

Problem: Port already in use
Solution: Change PORT in .env file

Problem: Module not found
Solution: Run "npm install" again

================================================================================

LICENSE

NONE

================================================================================

🎉 Happy Selling on SUQ Marketplace! 🎉