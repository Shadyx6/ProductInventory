# Product Inventory Management System

A full-stack web application designed for real-time inventory tracking, product management, and audit-logged stock movement history. Built with Node.js, Express, PostgreSQL, and React.

---

## Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM (`/` and `/products/:id`)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Custom Vanilla CSS with a dark theme

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: PostgreSQL
- **Database Driver**: `pg` (Node-Postgres) with connection pooling
- **Environment & CORS**: `dotenv`, `cors`

---

## Prerequisites

Before running the application, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12.0 or higher)

---

## Database Setup

1. Start your PostgreSQL service.
2. Create a new database named `product_inventory`:
   ```bash
   createdb -U postgres product_inventory
   ```
3. Run the schema script to create the required tables and constraints:
   ```bash
   psql -U postgres -d product_inventory -f database/schema.sql
   ```
4. Seed the database with sample products and stock transactions:
   ```bash
   psql -U postgres -d product_inventory -f database/seed.sql
   ```

---

## Environment Configuration

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=product_inventory
```

---

## Backend Setup & Running

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend in development mode (with hot reloading via `nodemon`):
   ```bash
   npm run dev
   ```
   Or start in standard production mode:
   ```bash
   npm start
   ```
The backend server will run at `http://localhost:5000`.

---

## Frontend Setup & Running

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
The application will open automatically at `http://localhost:3000`.

---

## Database Schema Overview

### `products` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique product identifier |
| `name` | `VARCHAR(255)` | `NOT NULL` | Product title |
| `sku` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Unique SKU code |
| `category` | `VARCHAR(100)` | `NOT NULL` | Product category grouping |
| `price` | `NUMERIC(10,2)` | `CHECK (price > 0)` | Product unit price |
| `quantity` | `INTEGER` | `CHECK (quantity >= 0)` | Current available stock level |
| `low_stock_threshold` | `INTEGER` | `CHECK (low_stock_threshold >= 0)` | Stock warning threshold |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record last update timestamp |

### `stock_transactions` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique transaction ID |
| `product_id` | `INTEGER` | `REFERENCES products(id) ON DELETE CASCADE` | Foreign key to `products` |
| `type` | `VARCHAR(10)` | `CHECK (type IN ('IN', 'OUT'))` | Movement direction |
| `quantity` | `INTEGER` | `CHECK (quantity > 0)` | Quantity added or removed |
| `note` | `TEXT` | Optional | Transaction description / reference |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of movement |

---

## API Endpoints Reference

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Fetch all products | Query: `search`, `category` |
| `POST` | `/api/products` | Create a new product | JSON body with product fields |
| `GET` | `/api/products/:id` | Fetch single product by ID | - |
| `PUT` | `/api/products/:id` | Update product details | JSON body (`name`, `category`, `price`, `low_stock_threshold`) |
| `DELETE` | `/api/products/:id` | Delete product and its history | - |
| `POST` | `/api/products/:id/stock-in` | Record stock arrival | JSON body (`quantity`, optional `note`) |
| `POST` | `/api/products/:id/stock-out` | Record stock dispatch | JSON body (`quantity`, optional `note`) |
| `GET` | `/api/products/:id/transactions` | Fetch stock history for product | - |

---

## Key Business Logic & Validation Rules

- **Low Stock Logic**: A product is marked as **Low Stock** when `quantity < low_stock_threshold`.
- **Immutable SKU**: SKU is set upon product creation and disabled/read-only during edits.
- **Stock Movement Integrity**: Stock quantity adjustments are managed exclusively through Stock In and Stock Out APIs using PostgreSQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to guarantee that the `products.quantity` update and the `stock_transactions` record insertion succeed atomically.
- **Overdraft Protection**: Stock-out transactions are rejected with HTTP 400 if requested quantity exceeds current available stock.
- **Duplicate SKU Prevention**: Duplicate SKU submissions return HTTP 409 Conflict.

---

## Postman Collection

A ready-to-import Postman collection with example request payloads is included at `postman_collection.json` in the root folder.
