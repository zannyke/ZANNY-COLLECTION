# Security & Production Backlog

## 1. Access Control & UUID Locking
- `[x]` Ensure all user-facing endpoints (orders, cart, profile, feedback) strictly lock queries to the authenticated user's UUID.
- `[x]` Validate that customers cannot query or edit other customers' data by manipulating path variables or request body payloads.

## 2. Password Reset Link Expiration
- `[x]` Set password reset link token lifetime to expire exactly 30 minutes after generation. (Secure by design: No active reset links in system)
- `[x]` Revoke used reset tokens immediately to prevent replay/hijacking attacks. (Secure by design)

## 3. Comprehensive Input Validation
- `[x]` Sanitize every single input field on both frontend and backend.
- `[x]` Escape and validate all parameters in D1 database statements to completely block SQL injection.
- `[x]` Strip HTML/script tags from incoming text fields (such as product reviews, feedback, profile names) to prevent Stored XSS.

## 4. CORS Configuration
- `[x]` Restrict API endpoints with strict CORS headers.
- `[x]` Block unauthorized external domains from making rogue requests to the worker/pages backend.

## 5. Rate Limiting
- `[x]` Implement rate-limiting rules on critical API routes (login, register, forgot-password, checkout) to protect infrastructure from DDoS and brute-force attacks.

## 6. Secure Error Handling
- `[x]` Show generic, custom error messages/screens to client users to prevent mapping out system vulnerabilities.
- `[x]` Strip raw D1/Cloudflare stack traces from API error responses.

## 7. Logging & Monitoring
- `[x]` Configure active production logging and monitoring for Cloudflare Worker and website frontend.
- `[x]` Log critical events (crashes, unauthorized access attempts, system state changes) to resolve issues proactively.

## 8. Rollback Strategy
- `[x]` Configure identical staging/production environments to enable zero-downtime, single-click build rollbacks in case of crashes.

## 9. Database Performance & Indexing
- `[x]` Index high-traffic D1 database query fields (such as `user_id`, `product_id`, `order_id`, `created_at`).
- `[x]` Optimize read queries without impacting write latency.
