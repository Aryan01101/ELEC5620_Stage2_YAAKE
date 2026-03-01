# CSRF Protection - YAAKE

## Overview

YAAKE implements modern CSRF (Cross-Site Request Forgery) protection using:
- **Double Submit Cookie** pattern
- **Custom header validation**
- **SameSite cookies**

This approach is recommended for Single Page Applications (SPAs) with JWT authentication.

---

## How It Works

### 1. Token Generation

When a user makes their first request to the API:
1. Server generates a random 32-byte CSRF token
2. Token is set as a cookie: `XSRF-TOKEN`
3. Cookie is:
   - **HttpOnly: false** (so JavaScript can read it)
   - **SameSite: strict** (prevents cross-site requests)
   - **Secure: true** (in production, HTTPS only)
   - **MaxAge: 24 hours**

### 2. Token Validation

For state-changing requests (POST, PUT, PATCH, DELETE):
1. Frontend reads token from cookie
2. Frontend sends token in `X-XSRF-TOKEN` header
3. Server compares cookie token with header token
4. Request proceeds only if tokens match

### 3. Safe Methods

GET, HEAD, and OPTIONS requests skip CSRF validation since they should not modify state.

---

## Frontend Integration

The frontend automatically includes CSRF tokens in requests:

```javascript
// api.js automatically handles this
POST /api/auth/login
Headers:
  Authorization: Bearer <jwt-token>
  X-XSRF-TOKEN: <csrf-token-from-cookie>
```

No manual intervention required - the `api.js` interceptor handles everything.

---

## Configuration

### Disable CSRF Protection (Development Only)

Add to `.env`:
```env
DISABLE_CSRF=true
```

**⚠️ WARNING:** Never disable CSRF in production!

### Check CSRF Status

CSRF protection is automatically enabled in all environments unless explicitly disabled.

---

## Security Benefits

### Prevents CSRF Attacks

**Without CSRF Protection:**
```html
<!-- Attacker's website -->
<form action="https://yaake.com/api/jobposts" method="POST">
  <input name="title" value="Malicious Job" />
</form>
<script>document.forms[0].submit();</script>
```

If a logged-in user visits this malicious site, the request succeeds because their cookies are sent automatically.

**With CSRF Protection:**
```
Request to: POST https://yaake.com/api/jobposts
Cookie: yaake_token=abc123; XSRF-TOKEN=xyz789
Headers: (missing X-XSRF-TOKEN header)

Response: 403 Forbidden
{
  "success": false,
  "message": "CSRF token missing",
  "code": "CSRF_TOKEN_MISSING"
}
```

The malicious site can't read the CSRF token from the cookie (cross-origin restriction), so it can't include it in the header. Request is blocked.

---

## Error Responses

### Missing CSRF Token

```json
{
  "success": false,
  "message": "CSRF token missing",
  "code": "CSRF_TOKEN_MISSING"
}
```

**Cause:** Frontend didn't send CSRF token in header
**Fix:** Ensure XSRF-TOKEN cookie exists and is being sent in X-XSRF-TOKEN header

### Invalid CSRF Token

```json
{
  "success": false,
  "message": "Invalid CSRF token",
  "code": "CSRF_TOKEN_INVALID"
}
```

**Cause:** Token in header doesn't match token in cookie
**Fix:** Check that tokens aren't being modified. Clear cookies and retry.

---

## Testing CSRF Protection

### Test with cURL

```bash
# 1. Get CSRF token
curl -c cookies.txt http://localhost:5001/api/health

# 2. Extract token from cookies
TOKEN=$(grep XSRF-TOKEN cookies.txt | awk '{print $7}')

# 3. Make authenticated request with CSRF token
curl -b cookies.txt \
  -H "X-XSRF-TOKEN: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' \
  http://localhost:5001/api/auth/login

# 4. Try without CSRF token (should fail)
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' \
  http://localhost:5001/api/auth/login
# Expected: 403 Forbidden - CSRF token missing
```

### Test in Browser DevTools

```javascript
// In browser console (on your frontend)

// Check if CSRF token cookie exists
document.cookie.split(';').find(c => c.includes('XSRF-TOKEN'));

// Make a request without CSRF token (should fail)
fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'Test@123' })
})
.then(r => r.json())
.then(console.log);
// Expected: { success: false, message: "CSRF token missing" }
```

---

## Best Practices

### 1. Always Use HTTPS in Production

CSRF tokens are more secure over HTTPS:
```env
NODE_ENV=production
HTTPS_ENABLED=true
```

### 2. Set Short Token Lifetimes

Tokens expire after 24 hours by default. For higher security, reduce in `csrfMiddleware.js`:

```javascript
maxAge: 2 * 60 * 60 * 1000, // 2 hours instead of 24
```

### 3. Log CSRF Failures

Failed CSRF validation attempts are logged with:
```javascript
logger.warn('CSRF validation failed', {
  method: req.method,
  url: req.originalUrl,
  ip: req.ip
});
```

Monitor these logs for potential attacks.

### 4. Use SameSite Cookies

Cookies are set with `SameSite: strict`:
- **Strict:** Cookies not sent on any cross-site request
- **Lax:** Cookies sent on top-level navigation (GET only)
- **None:** Cookies sent on all requests (requires Secure flag)

Our implementation uses **strict** for maximum security.

---

## Troubleshooting

### CSRF Tokens Not Set

**Symptom:** `XSRF-TOKEN` cookie not appearing

**Causes:**
1. CSRF disabled: Check `DISABLE_CSRF` not set to `true`
2. Cookie-parser not installed: `npm install cookie-parser`
3. Middleware order wrong: Cookie-parser must come before CSRF middleware

**Fix:**
```javascript
// Correct order in server.js
app.use(cookieParser());      // First
app.use(setCsrfToken);         // Then CSRF
```

### Frontend Not Sending Token

**Symptom:** 403 errors on POST requests

**Causes:**
1. Cookie not being sent: Check `credentials: 'include'` in fetch/axios
2. Cross-origin issue: Frontend and backend must be on same domain or CORS properly configured

**Fix:**
```javascript
// In api.js
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies
});
```

### Tokens Don't Match

**Symptom:** "Invalid CSRF token" errors

**Causes:**
1. Multiple backend instances with different secrets
2. Cookie being modified
3. Token expired

**Fix:**
- Use single backend instance or shared session store
- Check cookie integrity
- Refresh page to get new token

---

## Migration Guide

### Existing Applications

If adding CSRF to an existing application:

1. **Install dependencies**
   ```bash
   npm install cookie-parser
   ```

2. **Add middleware** (in order)
   ```javascript
   app.use(cookieParser());
   app.use(setCsrfToken);
   app.use(validateCsrfToken);
   ```

3. **Update frontend** to include CSRF token in headers
   ```javascript
   config.headers['X-XSRF-TOKEN'] = getCookie('XSRF-TOKEN');
   ```

4. **Test thoroughly** before deploying to production

5. **Monitor logs** for CSRF failures after deployment

---

## Alternative: Custom Header Approach

For API-only applications (no browser cookies), use custom header validation:

```javascript
// Validate custom header exists
if (!req.headers['x-requested-with'] === 'XMLHttpRequest') {
  return res.status(403).json({ message: 'Invalid request' });
}
```

However, double-submit cookie is more secure for browser-based SPAs.

---

## Security Audit Checklist

- [ ] CSRF protection enabled (`DISABLE_CSRF` not set)
- [ ] Cookies set with `SameSite: strict`
- [ ] HTTPS enabled in production (`Secure` flag on cookies)
- [ ] Frontend sends CSRF token in X-XSRF-TOKEN header
- [ ] CSRF failures logged and monitored
- [ ] Token lifetime appropriate for use case
- [ ] No CSRF token in URL parameters (only cookies/headers)

---

## Further Reading

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

---

**Last Updated:** 2024-03-02
**Version:** 1.0.0
