# Zanny Collection — Website Integration & Database Guide

This guide is for the website developer to successfully integrate with the shared SQLite D1 database and display products, sizes, colors, and images correctly.

---

## 💾 1. Understanding the `products` Table Schema

SQLite D1 does not have native list or array datatypes. Therefore, multi-value fields (like sizes, colors, and gallery images) are stored inline inside the `products` table as **JSON-serialized strings**.

### Key Columns in the `products` Table

* `sizes`: Stored as a JSON string array, e.g. `'["XS", "S", "M", "L"]'`
* `colors`: Stored as a JSON string array, e.g. `'["Black", "Navy Blue"]'`
* `image_url`: Stored as a relative filename, e.g. `'product_1719472343.jpg'` (Needs CDN prefix to resolve).
* `gallery_urls`: Stored as a JSON string array of relative filenames, e.g. `'["gallery_1719472343_0.jpg", "gallery_1719472343_1.jpg"]'`.
* `is_deleted`: Soft-delete flag. `1` means the product has been deleted; `0` means it is active. **Always query where `is_deleted = 0`**.
* `is_new`: `1` for new arrivals, `0` otherwise.
* `is_sale`: `1` for discount items, `0` otherwise.

---

## 🛠️ 2. How to Parse Sizes & Colors in Code

Since sizes and colors are stored as JSON strings, the website backend or frontend **must parse the JSON** before attempting to render them as HTML lists or selector buttons.

### JavaScript / Node.js / Next.js Example

```javascript
// Fetch the product from D1
const product = dbRow; 

// Parse the JSON strings safely
const sizesArray = JSON.parse(product.sizes || '[]');
const colorsArray = JSON.parse(product.colors || '[]');

// Rendering in HTML/JSX:
return (
  <div>
    <h3>Available Sizes:</h3>
    {sizesArray.map(size => (
      <button key={size}>{size}</button>
    ))}
  </div>
);
```

### PHP Example

```php
// Fetch row from D1
$product = $dbRow;

// Decode JSON strings into PHP arrays
$sizesArray = json_decode($product['sizes'] ?? '[]');
$colorsArray = json_decode($product['colors'] ?? '[]');

// Rendering in PHP:
echo "<h3>Available Sizes:</h3>";
foreach ($sizesArray as $size) {
    echo "<button>" . htmlspecialchars($size) . "</button>";
}
```

---

## 🖼️ 3. How to Resolve Product Images

To keep the database clean, only relative image filenames are stored in the database. To display them on the website, prefix the filenames with the **Cloudflare R2 Public CDN URL**:

* **R2 Public CDN Base URL**: `https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/`

### Example Image Resolution Code

```javascript
const cdnBase = "https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/";

// Resolve main image
const mainImageUrl = product.image_url 
  ? `${cdnBase}${product.image_url}`
  : "placeholder_image.png";

// Resolve gallery images
const galleryUrlsArray = JSON.parse(product.gallery_urls || '[]');
const fullGalleryUrls = galleryUrlsArray.map(img => `${cdnBase}${img}`);
```

---

## 🔍 4. Recommended SQL Query for Fetching Active Products

Always filter out deleted items and parse/aggregate ratings (calculated from the `feedback` review table):

```sql
SELECT 
  p.id,
  p.name,
  p.subtitle,
  p.description,
  p.price,
  p.original_price,
  p.image_url,
  p.gallery_urls,
  p.colors,
  p.sizes,
  p.stock,
  p.is_new,
  p.is_sale,
  -- Calculate average rating and review counts on-the-fly
  ROUND(COALESCE((SELECT AVG(f.rating) FROM feedback f WHERE f.product_id = p.id), 0), 1) as avg_rating,
  COALESCE((SELECT COUNT(f.id) FROM feedback f WHERE f.product_id = p.id), 0) as review_count
FROM products p
WHERE p.is_deleted = 0
ORDER BY p.created_at DESC;
```

---

## 📱 5. Mobile App Download & Live Updates Section

To distribute the Zanny Collection Android App directly from the website, the website landing page or settings should feature a download button linked directly to the latest verified APK version.

### A. Fetching the Latest APK Info (Website Frontend)

Make a `GET` request from the frontend to fetch the current version configuration:

* **Endpoint**: `GET https://zanny-collection-api.zannykenya254.workers.dev/api/version`
* **Response Format**:

  ```json
  {
    "version": "1.0.23",
    "build": 42,
    "url": "https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/zanny_collection_v1.0.23_20260627_1139.apk",
    "changelog": "Database performance patches and review screen fixes.",
    "publishedAt": "2026-06-27T08:50:44Z"
  }
  ```

### B. Displaying the Download Button

Use the returned `url` property as the `href` attribute for the **"Download Zanny App (Android)"** button.

```html
<a href="${versionResponse.url}" class="download-btn">
  Download Zanny App v${versionResponse.version} (APK)
</a>
```

---

## ⚙️ 6. Admin APK Upload & Version Management

The website Admin Panel should provide a simple interface for the administrator to release new APK versions to users.

### A. Uploading the APK File

When the admin uploads a new `.apk` file:

1. **Endpoint**: `POST https://zanny-collection-api.zannykenya254.workers.dev/api/upload`
2. **Payload**: `multipart/form-data` containing the file under key `file`.
3. **Response**: Returns the direct R2 URL of the uploaded APK file, e.g.:
   `"https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/zanny_collection_v1.0.24.apk"`

### B. Publishing the New Version

After receiving the uploaded URL, update the active version by sending a `PUT` request:

1. **Endpoint**: `PUT https://zanny-collection-api.zannykenya254.workers.dev/api/version`
2. **Headers**: `'Content-Type': 'application/json'`
3. **Payload**:

   ```json
   {
     "version": "1.0.24",
     "build": 43,
     "url": "https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/zanny_collection_v1.0.24.apk",
     "changelog": "Added new collection items and features.",
     "admin_secret": "ZannyAdmin2024Secret"
   }
   ```

   *(Note: `admin_secret` must match the secret configured in the Cloudflare Worker to authorize the version update).*

---

## ✉️ 7. Email Notifications & Resend Configuration

To ensure customers receive transactional confirmation emails (for orders placed, shipped, delivered, and cancelled), the **Resend API Key** must be bound to the Cloudflare Worker.

### Enabling Email Notifications

If emails are not being sent, run the following Wrangler command to set the Resend API Key secret:

```bash
wrangler secret put RESEND_API_KEY
```

When prompted, paste your active Resend API Key (`re_...`). The Edge Worker will automatically start delivering rich-HTML receipts and shipping updates!

---

## 🛒 8. Live Cart Synchronization (Real-Time App & Website Sync)

To ensure the user has a unified shopping experience, the **shopping cart must be synchronized in real-time** between the mobile application and the website.

When a user logs in, the website **must not** rely on client-side `localStorage` for their cart. Instead, the website must synchronize cart items with the server backend using the `/api/cart` endpoints.

### A. Fetching the Active Cart (On Website Load / Login)

Fetch the current logged-in user's cart from the server:

* **Endpoint**: `GET https://zanny-collection-api.zannykenya254.workers.dev/api/cart`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response Format**:

  ```json
  {
    "items": [
      {
        "product": {
          "id": "prod_123",
          "name": "Classic Essential Hoodie",
          "price": 850
          // ...other product details
        },
        "selectedSize": "L",
        "selectedColor": "Black",
        "quantity": 2
      }
    ]
  }
  ```

### B. Syncing Cart Updates (On Add/Update/Remove in Website)

Whenever a user adds an item to the cart, modifies a quantity, or removes an item on the website, send the updated cart list to the server:

* **Endpoint**: `POST https://zanny-collection-api.zannykenya254.workers.dev/api/cart`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Payload**:

  ```json
  {
    "items": [
      {
        "product_id": "prod_123",
        "selected_size": "L",
        "selected_color": "Black",
        "quantity": 2
      }
    ]
  }
  ```

  *(Note: Send the complete active cart array in the payload. The Pages Function will overwrite the old database state with this new snapshot, ensuring the mobile app and website stay perfectly in sync).*

---

## 🛍️ 9. Order Checkout & Payment Integration

The website must implement two different checkout tracks to handle prepaid and Cash on Delivery (COD) transactions securely.

> [!IMPORTANT]
> The website uses **cookie-based session authentication** via the `zanny_session` HttpOnly cookie set at login. All checkout API calls go to the **website's own Cloudflare Pages Functions** (`/api/...`). The cookie is sent automatically by the browser — **no `Authorization: Bearer` header is needed from the frontend**.

---

### 🔐 Authentication Model for Checkout

The `zanny_session` cookie is set by the Pages Function on successful login. The backend reads it server-side via `getCurrentUser(context)` in `functions/utils/auth.js`, which queries the `sessions` table in D1 to verify it is valid and unexpired.

The Cloudflare Worker at `zanny-collection-api.zannykenya254.workers.dev` uses **JWT Bearer tokens** — this is used by the **mobile app only**. The website never calls the Worker endpoints directly for authenticated operations.

Checkout protection is already in place via the `<UserRoute>` guard in `App.jsx`.

---

### Track A: Prepaid Online Checkout (Paystack)

To prevent unpaid "pending" orders from cluttering the database, **the website must NOT create the order in D1 before payment is confirmed**. The order is inserted by the Paystack webhook only after payment succeeds.

#### Step 1 — Initialize the Payment Session

From the `Checkout.jsx` component, send a `POST` request to the local Pages Function:

* **Endpoint**: `POST /api/payments/initialize-paystack`
* **Auth**: Automatic (cookie sent by browser — no header needed)
* **Content-Type**: `application/json`
* **Payload**:

  ```json
  {
    "items": [
      {
        "product_id": "oversized-zc-hoodie",
        "product_name": "Oversized ZC Hoodie",
        "product_price": 2500,
        "selected_size": "L",
        "selected_color": "Black",
        "quantity": 1
      }
    ],
    "total_amount": 2750,
    "delivery_address": "Nairobi, Kilimani Road, Apt 4B",
    "recipient_name": "John Doe",
    "recipient_phone": "0712345678"
  }
  ```

* **Success Response**:

  ```json
  {
    "url": "https://checkout.paystack.com/abc123xyz",
    "reference": "zanny_direct_ORD-871928_1720000000000",
    "tempOrderId": "ORD-871928"
  }
  ```

#### Step 2 — Redirect to Paystack

After receiving the response, redirect the browser to `response.url`:

```javascript
const res = await fetch('/api/payments/initialize-paystack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      selected_size: item.size,
      selected_color: item.color,
      quantity: item.qty
    })),
    total_amount: finalTotal,
    delivery_address: `${form.address}, ${selectedZone.label}`,
    recipient_name: form.fullName,
    recipient_phone: form.phone
  })
});

if (res.ok) {
  const data = await res.json();
  clearCart(); // Clear cart immediately before redirect
  window.location.href = data.url; // Redirect to Paystack hosted checkout page
} else {
  const err = await res.json();
  alert(err.error || 'Failed to initialize payment. Please try again.');
}
```

#### Step 3 — After Payment (Callback)

Paystack redirects the user back to:
`https://zannycollection.com/orders?id=<tempOrderId>&payment=success`

Show the order detail page using the `tempOrderId`. The order will already be in the database (inserted by the webhook — see Step 4).

#### Step 4 — Webhook-Driven Order Insertion

Paystack calls a webhook on the **Cloudflare Worker** once payment clears:

* **Webhook URL** *(register this in your Paystack Dashboard)*: `https://zanny-collection-api.zannykenya254.workers.dev/api/payments/paystack-webhook`
* **Event**: `charge.success`

The webhook handler performs:
1. **HMAC-SHA512 signature verification** of the raw request body using `PAYSTACK_SECRET_KEY`.
2. **Live stock check** for every item carried in the `metadata` payload.
3. **If in stock**: Inserts the confirmed order into D1 with `status = 'confirmed'`, decrements stock (`stock - qty`), increments `sold` counter, sends confirmation email via Resend, and sends push notification to the customer.
4. **If out of stock**: Triggers an **automatic full Paystack refund**, inserts the order as `status = 'cancelled'`, sends a refund notification email and push to the customer.

> [!IMPORTANT]
> You must register the webhook URL in your Paystack Dashboard under **Settings → Webhooks → Add Endpoint** and select the `charge.success` event. Without this, online payments will never confirm.

---

### Track B: Cash on Delivery (COD) Checkout

COD orders are placed immediately without a payment screen. The order is written directly to D1 by the local Pages Function.

* **Endpoint**: `POST /api/orders`
* **Auth**: Automatic (cookie sent by browser)
* **Payload**:

  ```json
  {
    "recipientName": "John Doe",
    "totalAmount": 2750,
    "shippingAddress": "Nairobi, Kilimani Road, Apt 4B",
    "phoneNumber": "0712345678",
    "status": "pending",
    "items": [
      {
        "id": "oversized-zc-hoodie",
        "qty": 1,
        "size": "L",
        "color": "Black",
        "price": 2500
      }
    ]
  }
  ```

The backend validates live stock, decrements inventory, generates the `ORD-XXXXXX` order ID, sends email & push notifications, and returns:

```json
{ "orderId": "ORD-871928" }
```

On success, clear the cart locally and navigate to `/order-success`.

#### COD Anti-Fraud Trust System

The backend enforces automatic COD restrictions:

- If a user accumulates **3 consecutive COD cancellations**, the server sets `restricted_from_cod = 1` on their account.
- When restricted, `/api/orders` rejects COD requests with HTTP `400`:
  ```json
  { "error": "Pay on Delivery is temporarily disabled for your account. Please pay upfront via M-Pesa." }
  ```
- The `Checkout.jsx` page already reads `user.restricted_from_cod` from the session context and hides/disables the COD option automatically. No extra frontend logic is needed.
- The user regains COD access after **3 consecutive successful prepaid orders**.

---

### Input Validation Rules (Server-Enforced)

The backend validates all checkout payloads. The frontend should mirror these rules to avoid unnecessary failed requests:

| Field | Rule |
|---|---|
| `recipient_name` | 2–50 characters |
| `delivery_address` | 5–250 characters |
| `recipient_phone` | 9–15 numeric digits (`0712345678` or `+254712345678`) |
| `total_amount` | Positive number greater than 0 |
| `items` | Non-empty array |

---

### Required Pages Function: `functions/api/payments/initialize-paystack.js`

Create this new file to handle Paystack session initialization. It uses the session cookie for auth and calls Paystack's API server-side, keeping the secret key hidden from the browser:

```javascript
// functions/api/payments/initialize-paystack.js
import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!context.env.PAYSTACK_SECRET_KEY) {
      return Response.json({ error: 'Payment gateway not configured.' }, { status: 500 });
    }

    const data = await context.request.json();
    const { items, total_amount, delivery_address, recipient_name, recipient_phone } = data;

    // Server-side validation
    if (!Array.isArray(items) || items.length === 0)
      return Response.json({ error: 'Order items are required.' }, { status: 400 });
    if (typeof total_amount !== 'number' || total_amount <= 0)
      return Response.json({ error: 'Total amount must be a positive number.' }, { status: 400 });
    if (!delivery_address || delivery_address.length < 5 || delivery_address.length > 250)
      return Response.json({ error: 'Please enter a valid delivery address (5-250 characters).' }, { status: 400 });
    if (!recipient_name || recipient_name.length < 2 || recipient_name.length > 50)
      return Response.json({ error: 'Please enter a valid name (2-50 characters).' }, { status: 400 });
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test((recipient_phone || '').replace(/\s+/g, '')))
      return Response.json({ error: 'Please enter a valid phone number (9-15 digits).' }, { status: 400 });

    // Fetch user email for Paystack
    const dbUser = await context.env.DB.prepare(
      'SELECT email FROM users WHERE id = ?'
    ).bind(user.id).first();
    const customerEmail = dbUser?.email || 'customer@zannycollection.com';

    const tempOrderId = 'ORD-' + String(Date.now()).slice(-6);
    const reference = `zanny_direct_${tempOrderId}_${Date.now()}`;
    const origin = new URL(context.request.url).origin;

    const paystackPayload = {
      email: customerEmail,
      amount: Math.round(total_amount * 100), // Paystack requires kobo (1 KES = 100)
      currency: 'KES',
      reference: reference,
      callback_url: `${origin}/orders?id=${tempOrderId}&payment=success`,
      metadata: {
        temp_order_id: tempOrderId,
        user_id: user.id,
        items: JSON.stringify(items),
        total_amount: total_amount,
        delivery_address: delivery_address,
        recipient_name: recipient_name,
        recipient_phone: recipient_phone,
        is_direct: true  // Tells the webhook this is a direct (pre-order-insertion) flow
      }
    };

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paystackPayload)
    });

    const respData = await res.json();
    if (!res.ok || !respData.status) {
      return Response.json({ error: respData.message || 'Failed to initialize payment.' }, { status: 400 });
    }

    return Response.json({
      url: respData.data.authorization_url,
      reference: reference,
      tempOrderId: tempOrderId
    });

  } catch (err) {
    console.error('Paystack init error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

> [!IMPORTANT]
> You must bind `PAYSTACK_SECRET_KEY` as a **Cloudflare Pages secret** (not a plain variable) in your Pages project settings: **Settings → Environment variables → Add variable → mark as Secret**. This key is never sent to the browser.

---

### Required Database Migration

The website's `schema.sql` `orders` table is missing columns that the Paystack webhook writes. Run this migration against the live D1 database before enabling Paystack:

```sql
-- Paystack payment reference written by webhook on confirmation
ALTER TABLE orders ADD COLUMN paystack_reference TEXT DEFAULT '';

-- Soft-delete flags for admin and user order history management
ALTER TABLE orders ADD COLUMN is_deleted_by_user INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN is_deleted_by_admin INTEGER DEFAULT 0;

-- Pre-order support column on products (if not yet added)
ALTER TABLE products ADD COLUMN is_preorder INTEGER DEFAULT 0;
```

Run via Wrangler CLI:

```bash
npx wrangler d1 execute zanny-db --remote --command "ALTER TABLE orders ADD COLUMN paystack_reference TEXT DEFAULT ''"
npx wrangler d1 execute zanny-db --remote --command "ALTER TABLE orders ADD COLUMN is_deleted_by_user INTEGER DEFAULT 0"
npx wrangler d1 execute zanny-db --remote --command "ALTER TABLE orders ADD COLUMN is_deleted_by_admin INTEGER DEFAULT 0"
npx wrangler d1 execute zanny-db --remote --command "ALTER TABLE products ADD COLUMN is_preorder INTEGER DEFAULT 0"
```

---

## 🔄 10. Customer Returns Request Policy

* **The 2-Day Limit**: Customers are allowed to request a product return only within **2 days (48 hours) of delivery**.
* **Making a Request**: Send a `POST` to the local Pages Function:
  * **Endpoint**: `POST /api/orders/cancel` *(handles both cancellations and return requests)*
  * **Auth**: Automatic (session cookie)
  * **Payload**:

    ```json
    {
      "orderId": "ORD-XXXXXX"
    }
    ```

  * **Processing**: For delivered orders within 48 hours, the server sets `status = 'return_pending'`, sends a push notification to the admin, and emails the customer that returns take up to 5 days to verify.

> [!NOTE]
> For Paystack-paid orders, the admin approves the return from the admin dashboard. Approved returns trigger an automatic refund via the Paystack refund API (`https://api.paystack.co/refund`) using the stored `paystack_reference`. This is handled on the Cloudflare Worker side.

---

## 🖨️ 11. PDF Invoice & Receipt Generation

Instead of writing custom PDF rendering logic on the website, link directly to the official HTML printer template served by the Cloudflare Worker:

* **URL Format**: `https://zanny-collection-api.zannykenya254.workers.dev/orders?id=<ORDER_ID>`
* **Document Logic**:
  * `pending` status → renders an **INVOICE** with **"Total to be Paid"**
  * `confirmed` / `shipped` / `delivered` → renders a **RECEIPT** with **"Total Paid"** and Paystack reference
  * `cancelled` → bold diagonal **`ORDER CANCELLED`** stamp
  * `return_pending` / `return_approved` → orange **`RETURN REQUESTED — PROCESSING (UP TO 5 DAYS)`** watermark
* **Printing**: Clicking the **Download PDF / Print** button calls `window.print()` to generate the PDF locally.

---

## ⚙️ 12. Paystack Setup Checklist

### A. Cloudflare Pages Secrets (Website)

Add these in the Cloudflare Dashboard → **Pages** → `zanny-collection` → **Settings** → **Environment variables**:

| Variable Name | Value | Type |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | **Secret** (encrypted) |

Redeploy after adding. Secrets are available to Pages Functions via `context.env.PAYSTACK_SECRET_KEY`.

> [!CAUTION]
> **Never** commit `PAYSTACK_SECRET_KEY` to the repository. It must only live as a Cloudflare Pages Secret — never as a plain environment variable or in any `.env` file in version control.

### B. Paystack Dashboard Configuration

| Step | What to Do |
|---|---|
| ✅ **Webhook URL** | Add `https://zanny-collection-api.zannykenya254.workers.dev/api/payments/paystack-webhook` |
| ✅ **Webhook Event** | Enable `charge.success` |
| ✅ **Live Secret Key** | Copy `sk_live_...` → bind as `PAYSTACK_SECRET_KEY` Pages Secret (above) |
| ✅ **Worker Secret** | Run `wrangler secret put PAYSTACK_SECRET_KEY` in the `cloudflare-worker` project to enable refund logic |
| ✅ **Callback URL** | Confirm Paystack redirects back to `https://zannycollection.com/orders` after payment |

---

## 🔑 13. Password Verification Code System (Forgot & Confirm)

To recover lost accounts, the website implements a secure 6-digit numeric verification code system delivered directly via email.

### Workflow & APIs

#### 1. Request a Reset Code
* **Endpoint**: `POST /api/auth/forgot-password`
* **Payload**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "message": "If the email matches an active account, a 6-digit code has been sent."
  }
  ```
* **Behavior**:
  - Generates a random 6-digit verification code.
  - Inserts or replaces a record in the `password_resets` D1 table with a **15-minute expiry**.
  - Sends a premium dark-themed HTML verification email containing the code using the Resend service.
  - Returns a generic success message (preventing email harvesting).

#### 2. Confirm the Reset
* **Endpoint**: `POST /api/auth/reset-password`
* **Payload**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "password": "new_secure_password"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successful. You can now log in with your new password."
  }
  ```
* **Behavior**:
  - Validates that the code matches the record in `password_resets` and is not expired.
  - Hashes the new password using the identical PBKDF2 scheme (`iterations: 100000`, `hash: "SHA-256"`).
  - Updates the user record in `users` with the new hash and salt.
  - Deletes the token from `password_resets` to prevent replay attacks.


