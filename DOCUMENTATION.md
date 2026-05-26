# Zanny Collection - Comprehensive System Documentation

This document serves as the master reference for the Zanny Collection e-commerce platform. It details the complete architecture, database schemas, feature flows, and all integrated security measures. It is designed to act as a definitive guide for future developers extending the platform.

---

## 1. System Architecture & Tech Stack

The application uses a serverless, decoupled architecture designed for high performance and low maintenance.

### Frontend
- **Framework:** React 18 with Vite.
- **Routing:** `react-router-dom` for client-side navigation.
- **Styling:** Custom CSS with monochrome/luxury design aesthetics. Micro-animations powered by `framer-motion`.
- **Icons:** `lucide-react`.

### Backend (Serverless API)
- **Host:** Cloudflare Pages Functions (`/functions/api/`).
- **Language:** JavaScript (running on Cloudflare Workers V8 engine).
- **Routing:** File-based routing (e.g., `functions/api/orders.js` handles `/api/orders` endpoints).

### Database (Storage)
- **Engine:** Cloudflare D1 (Serverless SQLite).
- **Access:** Accessed via `context.env.DB` bindings in the API functions.

---

## 2. Storage Mechanisms

### A. Client-Side Storage
The browser manages several states to ensure a smooth user experience without overloading the database:
1. **Cookies (`zanny_session`):** 
   - Stores the active session ID.
   - Flagged with `HttpOnly` and `Secure` (in production) to prevent JavaScript access and ensure transmission only over HTTPS.
2. **Local Storage (`window.localStorage`):**
   - `cart`: An array of product objects the user intends to purchase. This persists even if the user closes the browser.
   - `theme`: Stores the user's preference for 'light' or 'dark' mode.
3. **Session Storage (`window.sessionStorage`):**
   - `zanny_admin` (boolean) & `zanny_admin_token` (hashed string): Used strictly by the frontend Admin Dashboard to maintain the admin login state. This memory is completely wiped when the browser tab is closed.

### B. Database Schema (Cloudflare D1)
The core tables powering the platform:
- **`users`**: Stores `id`, `email`, `password_hash`, `salt`, `role` (customer/admin), and behavioral metrics (like consecutive cancellations).
- **`sessions`**: Maps a secure `id` (the cookie value) to a `user_id` with an `expires_at` timestamp.
- **`products`**: The catalog containing `price`, `stock`, `image_url`, and `variations`.
- **`orders`**: Tracks purchases, containing `total_amount`, `status`, and tracking timestamps (`created_at`, `confirmed_at`, `shipped_at`, `delivered_at`).
- **`order_items`**: A join table linking an `order_id` to multiple `product_id`s, locking in the `price_at_purchase`.
- **`feedback`**: Stores post-delivery customer reviews (`rating`, `comment`).

---

## 3. Core Feature Flows

### Customer Journey
1. **Catalog & Cart:** Users browse the `products` table via the frontend. Clicking "Add to Cart" updates the Local Storage.
2. **Checkout:** 
   - Users submit their cart to `/api/checkout`.
   - The backend **ignores** the prices sent by the client. It recalculates the total by fetching live prices from the `products` table (preventing price tampering).
   - An order is generated with the status `pending`.
3. **Order Tracking:** 
   - Users view the `OrderDetailPage` which displays a visual "Package History" timeline.
   - The timeline dynamically highlights steps (Placed -> Confirmed -> Shipped -> Delivered) based on timestamps saved in the `orders` table.
4. **Feedback:** Once marked `delivered`, the UI prompts for a star rating. This is a one-time prompt; once submitted, the API records the review and blocks future submissions for that specific order ID.

### Admin Capabilities
1. **Login:** Admins log in via `/admin/login` using a predefined secure password (`zanny2026`). 
2. **Dashboard Management:** Admins can view analytics, manage product inventory (CRUD operations), and process orders.
3. **Logistics & Status Updates:** Updating an order to `shipped` prompts the Admin for a Tracking Code, which is saved to the DB and instantly reflected on the customer's tracking timeline.

---

## 4. Security Measures & Vulnerability Protections

The system incorporates robust defenses against common OWASP vulnerabilities:

### 1. Authentication & Authorization (Broken Access Control)
- **Role-Based API Limits:** Endpoints actively verify roles using `user.role === 'admin'`. If a normal customer attempts to send an HTTP PATCH request to update an order to 'shipped', the API rejects it with a `403 Forbidden`.
- **Admin Token Header:** The Admin UI passes the `X-Admin-Token` in the headers of sensitive requests to explicitly prove authorization, preventing session confusion.
- **Data Ownership Checks:** Customers can only fetch and view orders where `order.user_id` matches their own session ID.

### 2. Injection Prevention (SQLi & XSS)
- **SQL Injection (SQLi):** Zero string concatenation is used in SQL queries. All inputs are passed through the Cloudflare D1 `.bind(var)` method, forcing the database engine to treat inputs strictly as un-executable data.
- **Cross-Site Scripting (XSS):** 
  - React naturally sanitizes data rendered in the DOM.
  - The `feedback` API specifically runs a Regex sanitizer (`.replace(/<[^>]*>?/gm, '')`) on user comments to permanently strip HTML/Script tags before they ever reach the database (preventing Stored XSS).

### 3. Business Logic & Tampering Prevention
- **Price Integrity:** As mentioned in Checkout, the backend never trusts client-side pricing data.
- **Feedback Spam:** The `/api/feedback` endpoint executes a `SELECT` check to ensure `order_id` doesn't already exist in the feedback table. If it does, it returns a `400 Bad Request`, preventing rating manipulation.
- **Session Expiration:** Sessions are not infinite. The database strictly enforces `expires_at` logic on all session queries.

### 4. Password Security
- Passwords are never stored in plain text.
- During registration, a unique random `salt` is generated. The password and salt are combined and hashed using the Web Crypto API's **SHA-256** algorithm before storage.

---
*End of Documentation.*
