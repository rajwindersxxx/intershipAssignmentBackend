---
# 🛒 E-Commerce Backend API

A **production-ready REST API** for an e-commerce web application built with **Node.js**, **Express**, **TypeScript**, **Zod**, and **PostgreSQL** (via Prisma).

This API supports **user authentication**, **product management**, **order processing**, and **admin features**, designed for **scalability**, **security**, and **clean architecture**.
---

## 🛠 Tech Stack

### **Backend**

- **Node.js** & **Express.js** – Server & routing
- **TypeScript** – Type-safe development
- **Prisma ORM** – Type-safe database access
- **PostgreSQL** – Relational database
- **Zod** – Runtime schema validation
- **JWT** – Authentication via cookies

### **Dev Tools**

- **Nodemon** – Development server auto-restart
- **ESLint + Prettier** – Code linting & formatting
- **Postman** – API testing & documentation

---

## 📂 Project Structure

```bash
.
├── src/
│   ├── config/          # App & database configuration
│   ├── controller/      # Route controllers
│   ├── middleware/      # Auth, error handling, validation
│   ├── routes/          # API routes
│   ├── supabase/        # For strong images in bucket
│   ├── utils/           # Helper functions
│   ├── zod/             # Zod validation schemas
│   ├── types/           # Type definitions
│   ├── tests/           # integration and uni testing
│   ├── app.ts           # Express app initialization
│   └── server.ts        # Server entry point
├── prisma/              # Prisma schema & migrations
├── uploads/             # Uploaded files (images) localTesting
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### **System Requirements**

- Node.js v22+
- PostgreSQL v16+

---

### **Manual Setup**

1. Clone the repository:

```bash
git clone https://github.com/rajwindersxxx/shopping-e-commerce-api.git
cd shopping-e-commerce-api.git
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
DATABASE_URL=<postgres-url>
SUPABASE_URL=<supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<supabase-server-key>
ACCESS_SECRET=<secret-for-jwt>
CORE_URL=<frontend-domain>   #only for production
```

4. Initialize Prisma:

```bash
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to DB
npx prisma db seed       # Seed sample data

npx prisma migrate       # generate after making changes in db
npx prisma migrate deploy  #push schema in production safely

```

Note: seed Data totalAmount and items price not accurate !

5. Start development server:

```bash
npm run dev
```

You should see:

> `Server is running on http://localhost:4000` > `✅ Database connection successful`

---

- API → [http://localhost:4000](http://localhost:4000)

---

## 📜 API Documentation

All API endpoints are documented with **Postman**:
[**View API Docs in Postman**](https://documenter.getpostman.com/view/36192494/2sB3BHkonF)

**Key endpoints include:**

| Feature                | Endpoint                             | Method |
| ---------------------- | ------------------------------------ | ------ |
| User SigUp             | `/api/v1/auth/signUp`                | POST   |
| User Login             | `/api/v1/auth/login`                 | POST   |
| Get Products           | `/api/v1/products`                   | GET    |
| Get Product by ID      | `/api/v1/products/:id`               | GET    |
| Create Product (Admin) | `/api/v1/products`                   | POST   |
| Update Product (Admin) | `/api/v1/products/:id`               | PUT    |
| Delete Product (Admin) | `/api/v1/products/:id`               | DELETE |
| Create Order           | `/api/v1/orders`                     | POST   |
| Get User Orders        | `/api/v1/orders`                     | GET    |
| checkout Order         | `/api/v1/orders/checkout/:id/status` | PATCH  |

---

## ✅ Features

- **Type-safe backend & database** using Prisma + TypeScript
- **Runtime validation** with Zod
- **JWT authentication** via cookies
- **Role-based access** (User & Admin)
- **CRUD operations** for Products & Orders
- **Postman documentation** for all endpoints

## Challenges

- my app not crash on production due to invalid cookies config.
- during testing sometime token expire which is bit challenging to fix.
- It feel bit challenging to config core and understand it working
- making github ci/cd pipline
- first time railway hosting is
