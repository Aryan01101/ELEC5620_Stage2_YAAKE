# YAAKE Security Architecture

## Authentication & Authorization

### Authentication Method
- **JWT (JSON Web Tokens)** stored in localStorage
- Tokens sent via `Authorization: Bearer {token}` header
- Token expiration: 24 hours
- Refresh tokens: Not currently implemented (recommended for production)

### Why No CSRF Protection?

**Decision**: CSRF protection has been intentionally **disabled** for YAAKE.

**Rationale**:
- YAAKE uses JWT tokens stored in localStorage, NOT cookies
- CSRF attacks exploit browsers automatically sending cookies with requests
- Since we use `Authorization` headers (not cookies), browsers don't auto-send authentication
- **Attackers cannot force browsers to send localStorage data cross-origin**

**Industry Standard**:
This approach follows industry best practices used by:
- Auth0 (JWT in localStorage)
- Firebase Authentication (client SDK)
- Supabase (JWT in localStorage)
- AWS Amplify (JWT in memory/localStorage)

**References**:
- OWASP CSRF Prevention Cheat Sheet: "Stateless (token-based) authentication does not require CSRF protection"
- Auth0 Documentation: "JWTs sent as Authorization headers are not vulnerable to CSRF"

### Security Trade-offs

| Attack Vector | Protection | Notes |
|---------------|------------|-------|
| **CSRF** | Not applicable | Tokens in localStorage, not cookies |
| **XSS** | CSP + Input Sanitization | PRIMARY CONCERN - see XSS Prevention below |
| **Token Theft** | HTTPS + Secure Storage | Tokens transmitted over HTTPS only |
| **Brute Force** | Rate Limiting | 100 requests per 15 min per IP |
| **SQL/NoSQL Injection** | Parameterized Queries + Sanitization | Mongoose prevents injection |

---

## XSS (Cross-Site Scripting) Prevention

Since localStorage is vulnerable to XSS attacks, we implement multiple layers of XSS protection:

### 1. Content Security Policy (CSP)
```javascript
// server.js - helmet configuration
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],           // Only allow scripts from our domain
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", FRONTEND_URL],
    objectSrc: ["'none'"],           // Block plugins
    frameSrc: ["'none'"],            // Prevent clickjacking
  }
}
```

**What CSP Prevents**:
- Inline script execution from injected code
- Loading scripts from untrusted domains
- Eval() and similar dangerous functions

### 2. Input Sanitization
- All user inputs are sanitized before processing
- Express-mongo-sanitize prevents NoSQL injection
- Mongoose schema validation enforces data types

### 3. Output Encoding
- React automatically escapes JSX content
- Dangerous HTML rendering avoided (no dangerouslySetInnerHTML without sanitization)

### 4. HTTP Security Headers
Helmet provides:
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-XSS-Protection: 0` - Disabled (CSP is better)
- `Strict-Transport-Security` - Forces HTTPS

---

## Guest Account Security

### Guest Account Model
- Temporary accounts for demos and networking events
- Auto-generated credentials (email + password)
- Can switch between roles (applicant/recruiter/trainer)
- Can upgrade to full account

### Security Measures for Guests
1. **Same authentication as regular users** - JWT with same security
2. **Rate limiting** - 100 guest registrations per 15 min per IP
3. **Password requirements** - Same strength requirements as regular accounts
4. **Role restrictions** - Enforced by `requireGuest` middleware
5. **Data isolation** - Guest data clearly marked in database

### Guest-Specific Endpoints
These endpoints are protected by **JWT + requireGuest middleware**:
- `POST /api/auth/guest-register` - Create guest account
- `POST /api/auth/switch-role` - Switch between demo roles
- `POST /api/auth/upgrade-guest` - Convert to full account

**Note**: These endpoints were previously exempt from CSRF, but now CSRF is globally disabled.

---

## Rate Limiting

### Global Rate Limit
- **100 requests per 15 minutes** per IP address
- Applied to all `/api/*` endpoints
- Prevents brute force and DoS attacks

### Specific Limits
- Guest registration: Additional rate limiter (guestRegisterLimiter)
- Login attempts: Monitored via rate limiter
- AI features (cover letter, questions): 60-second timeout protection

---

## Data Protection

### Sensitive Data Handling
1. **Passwords**: Hashed with bcrypt (salt rounds: 10)
2. **JWT Secrets**: Stored in environment variables
3. **API Keys**: Never logged or exposed in responses
4. **User PII**: Redacted from logs

### Sentry Error Tracking
Before sending errors to Sentry:
- Authorization headers removed
- Cookie headers removed
- Password fields redacted to `[REDACTED]`
- 404 errors filtered out (not actionable)

---

## CORS (Cross-Origin Resource Sharing)

### Configuration
```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true  // Allow credentials (cookies, authorization headers)
})
```

### Security Notes
- Origin restricted to specific frontend URL
- Wildcard (`*`) origins NOT allowed
- Credentials explicitly enabled for authenticated requests

---

## Environment Variables

### Required
- `MONGO_URI` - Database connection string
- `JWT_SECRET` - Token signing secret (min 32 chars)
- `SENTRY_DSN` - Error tracking (production)
- `FRONTEND_URL` - CORS origin (production)

### Recommended
- `GEMINI_API_KEY` - AI features
- `RESEND_API_KEY` - Email functionality
- `OUTREACH_FROM_EMAIL` - Email sender address

### Security
- `HTTPS_ENABLED` - Force HTTPS (production)
- `NODE_ENV` - Environment mode

**Validation**: All required variables validated on startup (env.validation.js)

---

## Deployment Security Checklist

### Before Production
- [ ] Set strong `JWT_SECRET` (64+ random characters)
- [ ] Configure `SENTRY_DSN` for error tracking
- [ ] Set correct `FRONTEND_URL` for CORS
- [ ] Enable HTTPS (`HTTPS_ENABLED=true`)
- [ ] Review and test CSP directives
- [ ] Audit npm dependencies for vulnerabilities
- [ ] Enable rate limiting in production
- [ ] Configure proper logging (no sensitive data)
- [ ] Set up database backups
- [ ] Review and restrict API permissions

### Continuous Security
- [ ] Regular dependency updates (`npm audit`)
- [ ] Monitor Sentry for unusual errors
- [ ] Review rate limit logs for abuse
- [ ] Audit user permissions periodically
- [ ] Test XSS protection with security tools
- [ ] Keep security documentation updated

---

## Security Incident Response

### If JWT Secret is Compromised
1. Generate new `JWT_SECRET` immediately
2. Update environment variables
3. Deploy new secret
4. All users must re-login (tokens invalidated)
5. Investigate how compromise occurred

### If XSS Vulnerability Discovered
1. Patch vulnerability immediately
2. Review CSP effectiveness
3. Audit all user-generated content
4. Deploy fix
5. Notify affected users if data exposed

### If Database Access Compromised
1. Rotate database credentials
2. Audit access logs
3. Check for unauthorized data access
4. Notify affected users
5. Implement additional access controls

---

## Future Security Enhancements

### Recommended Improvements
1. **Refresh Tokens**: Implement JWT refresh token flow
2. **MFA (Multi-Factor Auth)**: Add 2FA for sensitive accounts
3. **Session Management**: Track active sessions
4. **Input Validation Library**: Use Joi or Yup for schema validation
5. **API Request Signing**: Add request signature verification
6. **DDoS Protection**: Use Cloudflare or similar CDN
7. **Database Encryption**: Encrypt sensitive fields at rest
8. **Security Headers**: Add additional headers (Permissions-Policy, etc.)

### Security Audits
- Conduct penetration testing before major releases
- Use automated security scanners (Snyk, OWASP ZAP)
- Review third-party dependencies quarterly
- Perform code security reviews for auth changes

---

## Contact

For security vulnerabilities, please report to: [security contact email]

**Do NOT** report security issues via public GitHub issues.

---

**Last Updated**: March 3, 2026
**Security Review Date**: March 3, 2026
**Next Review**: June 3, 2026 (quarterly)
