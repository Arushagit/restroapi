# RESTROFLOW – Restaurant Operating System & Management Platform

RESTROFLOW is a demonstrable, full-stack restaurant management platform built with **React 18 + Vite + Tailwind CSS** on the frontend, **Python + Django 4.2 + Django REST Framework + SimpleJWT** on the backend, and **PostgreSQL 18** as the relational database.

---

## 🌟 Demo Credentials (Pre-seeded)

| Role | Username | Password | Dedicated Access Area | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | `/admin` | Executive Analytics, Revenue velocity, Food menu CRUD, Table config |
| **Floor Staff** | `staff` | `staff123` | `/staff` | Floor Seating Map, Table POS order taking, Table service tracking |
| **Kitchen Staff** | `kitchen` | `kitchen123` | `/kitchen` | Live Kitchen Display System (KDS ticket progression) |
| **Customer** | `customer` | `customer123` | `/` | Web Storefront: Browse menu, Cart, Multi-mode checkout, Order tracking |
| **Customer 2** | `rahul` | `rahul123` | `/` | Second customer profile |

> 💡 *On the login screen (`/login`), you can also click the quick one-click demo credential buttons to log in instantly as any role.*

---

## 🚀 Quick Start (Running Frontend & Backend)

### 1. Backend (Django + PostgreSQL)
```bash
cd d:\restro\backend
python manage.py runserver 0.0.0.0:8000
```
- API Base URL: `https://restroapi-vvei.onrender.com/api/`
- Admin Panel: `https://restroapi-vvei.onrender.com/admin/`

### 2. Frontend (React + Vite)
```bash
cd d:\restro\frontend
npm run dev
```
- Web Application: `http://localhost:5173/`

### 3. Automated End-to-End Test Suite
To run the automated 10-step interview verification script:
```bash
python d:\restro\test_workflow.py
```

---

## 🎯 10-Step Interview Demonstration Workflow

1. **Admin Login**: Log in at `/login` using `admin` / `admin123` or click the **👔 Admin** quick-fill button.
2. **Food Management**:
   - Go to `/admin/categories` and view/create categories.
   - Go to `/admin/food` and view/add dishes, set prices, mark Veg/Non-Veg, or toggle availability.
3. **Customer Browsing**:
   - Open `/menu` to view the menu, search dishes, and filter by Veg/Non-Veg or category.
4. **Add to Cart**:
   - Click "Add to Cart" on any dish (e.g. *Grand Butter Chicken*, *Awadhi Dum Biryani*).
   - View `/cart`, adjust quantities, or add custom kitchen notes.
5. **Checkout & Place Order**:
   - Proceed to `/checkout`.
   - Select dining mode: **Dine-in** (select table number), **Takeaway**, or **Delivery**.
   - Click **Place Order**. Note the generated Order ID.
6. **Incoming Order on Admin**:
   - Switch to `/admin/orders` or `/admin` dashboard.
   - View the new order immediately appear in the database stream.
7. **Kitchen Display System (KDS)**:
   - Go to `/kitchen` (or log in as `kitchen` / `kitchen123`).
   - The order appears in the **Incoming Orders** column.
   - Click **Start Preparing** (advances status to *Preparing*).
   - Click **Mark Plated & Ready** (advances status to *Ready*).
8. **Live Customer Tracking**:
   - Check `/orders` as the customer. See real-time status change to **READY**.
9. **Cashier Billing & GST Invoicing**:
   - Navigate to `/admin/billing`.
   - The ready order is waiting under **Pending Checkout Orders**.
   - Click **Settle & Bill**, select payment method (**UPI QR**, **Cash**, or **Card**), enter discount/amount tendered.
   - Click **Record Payment & Invoice** to generate an official printable invoice (`RF-YYYYMM-XXXX`).
   - Click **Print Receipt** to see the GST-compliant itemized receipt.
10. **Analytics Reflection**:
   - Return to `/admin` dashboard.
   - Observe **Today's Revenue**, **Total Orders**, **Popular Dishes**, and the **7-Day Revenue Velocity Chart** automatically update with the new transaction.

---

## 🏗️ Architecture & Technical Highlights

- **Backend Calculations**: Order subtotals, GST (5%), discounts, and totals are computed strictly on the backend using database prices snapshotting to `OrderItem.unit_price`.
- **Relational Integrity**: Foreign keys with `PROTECT` on food items, atomic transactions during checkout and billing settlement.
- **Table State Automation**: Tables transition from `available` to `occupied` on dine-in order placement, and return to `available` upon completion/payment.
- **RESTful API**: Standardized JSON responses, JWT Bearer tokens with role claims, DjangoFilterBackend, and custom permission classes.

