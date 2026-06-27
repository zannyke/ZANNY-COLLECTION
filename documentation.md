# Zanny Collection Security Architecture Documentation (Updated Post-Audit)

This document outlines the security controls, authentication mechanisms, route protection, and recent fixes implemented for the Zanny Collection platform.

---

## 1. Security Check Results & Recent Fixes (May 2026 Audit)

During our comprehensive security check, we identified and successfully patched a critical authorization vulnerability:

### ⚠️ Fixed: Admin Endpoint Authorization Bypass
- **The Issue:** Endpoints under `functions/api/products.js`, `functions/api/products/[id].js`, `functions/api/auth/delete.js`, and `functions/api/upload.js` were verifying admin sessions by calling `requireAdmin(context)` and evaluating `if (auth.error)`. However, the helper returns a standard `Response` object on error, which does not contain an `.error` property. This caused the condition to evaluate to `undefined` (falsy), completely bypassing the security guard and allowing unauthorized users to perform admin tasks.
- **The Fix:** Updated the checks in all 4 affected files to use `if (auth instanceof Response) return auth;` which correctly intercepts unauthorized requests and returns the 403 Forbidden Response stream immediately.

---

## 2. Authentication & Session Management

- **Session Tokens:** Sessions are managed using HttpOnly, Secure, and SameSite=Strict cookies (`zanny_session`). This prevents client-side Javascript (XSS attacks) from reading session tokens.
- **Provider Isolation:** Local and Google OAuth providers are fully integrated. Google OAuth callback correctly checks for pre-existing local accounts under the same email to link them, preventing account duplication and privilege escalation.
- **Step-Up Authentication:** Unlocking the `/admin` workspace requires a second password verification layer. If an admin tries to enter the admin dashboard, they must provide their master password.

---

## 3. Front-End Route Protection & Obfuscation

- **Admin Obfuscation:** The `/admin` path is hidden from the public. Any user without the `admin` role who navigates directly to `/admin` will receive a standard **404 Page Not Found** rather than a "403 Forbidden" or a login prompt. This obfuscates the admin panel's existence.
- **Dynamic Controls:** The "Admin Dashboard" navigation button in the **Account Settings** page is conditionally rendered and only visible if `user.role === 'admin'`.
- **Session-level Unlock:** The admin interface requires `zanny_admin_unlocked` in `sessionStorage` to load. This session flag is set only after successful verification of the master password.
- **Checkout Guard:** If a guest or unauthenticated user attempts to access `/checkout` or place an order, they are presented with an elegant notice prompting them to log in or create an account to secure their checkout process.

---

## 4. Back-End Security & API Protection

- **Role-Based Access Control (RBAC):** Backend route handlers (endpoints under `/api/admin/*`) verify the caller's session using `requireAdmin(context)`. If the session is invalid or the caller's role is not `'admin'`, a `403 Forbidden` response is returned immediately.
- **Input Sanitization:** User inputs (such as product feedback comments) are sanitized to strip out HTML tags and scripts, protecting the platform from Stored Cross-Site Scripting (XSS).
- **Rate-Limiting & Protection:** The verify-password API has built-in timing-attack protection (introducing uniform delays on mismatch verification requests).
- **Secure Order Creation:** The order creation endpoint (`functions/api/orders.js`) strictly verifies the active session user and binds their database ID (`user.id`) rather than accepting client-submitted payloads. This prevents any parameter tampering or unauthorized orders.

---

## 5. Key Safeguards & Git Hygiene

- **Sensitive Configurations:** All sensitive credentials, including Google Client Secrets, Resend API Keys, and Mpesa Passkeys, are managed via **Cloudflare Environment Variables (Secret Bindings)**. They are never hardcoded in the codebase or pushed to Git.
- **Gitignore Rules:** Development logs, `.env` files, and local caches are ignored by Git to avoid accidental leakage.

---

## 6. Website & Mobile App Integration (June 2026 Updates)

To support unified operation between the Flutter mobile application and the Cloudflare Pages website, we implemented a series of shared data resolution and integration features:

### A. R2 CDN Image Resolution
- SQLite D1 stores product and gallery images as relative filenames (e.g. `product_1719472343.jpg`) to save space.
- The website resolved these filenames dynamically through the `resolveImageUrl` helper inside `ProductContext.jsx`.
- Clean relative URLs are resolved using the Cloudflare R2 Public CDN base URL: `https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/`. URLs starting with `http`, `https`, `data:`, or `/api/` are kept as-is.

### B. Live Cart Synchronization Normalization
- To synchronize the guest cart (`localStorage`) and logged-in user cart (D1 database) across devices, the keys were normalized.
- Fetched cart entries are normalized on load to construct a unique variation key: `${id}-${color}-${size}`.
- Relative cart images are dynamically prefixed with the CDN URL, ensuring that checkout/cart drawer thumbnails load correctly.

### C. Fallback Color & Size Resolution for Legacy Products
- **Vulnerability**: Products in the D1 database without the `variations` column populated would display no colors and show all sizes as out-of-stock, blocking users from adding items to their cart.
- **Resolution**:
  - The website now parses the D1 `colors` and `sizes` JSON arrays on fetch and stores them in `p.parsedColors` and `p.parsedSizes`.
  - Both [ProductDetailPage.jsx](file:///c:/Users/Administrator/Desktop/website/src/pages/ProductDetailPage.jsx) and [CategoryPage.jsx](file:///c:/Users/Administrator/Desktop/website/src/pages/CategoryPage.jsx) (`ProductCard` component) implement fallback checks: if `variations` is empty, they fall back to rendering colors/sizes from `parsedColors` and `parsedSizes`, using `product.stock` as the global quantity limit.

---

## 7. APK Uploads & Version Release Management

We built a secure, public-facing distribution and admin release console for the Zanny Collection Android app:

### A. Public Mobile App Download Section
- Integrated a highly aesthetic CTA download section (`AppDownloadSection.jsx`) on the home page.
- Fetches the active version configuration dynamically from `/api/version`.
- Renders the release details (version, build, published date, and custom changelog) along with a direct, secure download link to the APK file in R2.

### B. Cloudflare Pages Proxy Functions
- **`/api/version` (functions/api/version.js)**: Proxies requests to the Cloudflare Worker API at `https://zanny-collection-api.zannykenya254.workers.dev/api/version`.
  - `GET`: Public read access to active configuration.
  - `PUT`: Requires authenticated administrator (`requireAdmin`) to publish new release updates.
- **`/api/upload-apk` (functions/api/upload-apk.js)**: Proxies APK file uploads securely to the Worker's `POST /api/upload` endpoint, restricted to administrators.

### C. Admin Console APK Releases
- Added the **App Updates** tab (`version` tab) inside the `AdminDashboard.jsx` console.
- Admins can upload new `.apk` files directly to R2 and automatically auto-fill the release URL in the publish form.
- The publish form sends the new configuration (version string, incremented build number, APK URL, changelog, and `admin_secret` key) to D1 to authorize the updates.

