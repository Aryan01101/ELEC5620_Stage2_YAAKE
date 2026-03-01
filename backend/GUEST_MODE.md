# Guest Mode - YAAKE

## Overview

YAAKE's Guest Mode allows users to quickly explore the platform during networking events, demos, and product showcases without requiring email verification or complex registration. This feature is designed to reduce friction and enable immediate platform access while providing a path to upgrade to a full account.

---

## Key Features

### 1. **Quick Guest Registration**
- No email verification required
- Simple 2-field form (name optional, role selection)
- Auto-generated credentials
- Instant access to platform
- Rate-limited to prevent abuse (10 registrations per 15 minutes per IP)

### 2. **Role Switching**
- Guest users can switch between three roles:
  - **Applicant** (Job Seeker)
  - **Recruiter**
  - **Career Trainer**
- Instant role change without re-registration
- All data preserved across role changes
- Analytics tracking for role switches

### 3. **Account Upgrade Path**
- Convert guest account to permanent account
- Requires email and secure password
- Email verification sent upon upgrade
- All guest data preserved after upgrade
- Seamless transition

### 4. **Visual Indicators**
- Prominent banner at top of dashboard
- Guest badge in account information
- Minimizable banner for better UX
- Clear upgrade and role-switch CTAs

---

## Architecture

### Backend Components

#### **1. Database Schema** (`/backend/models/userModel.js`)

```javascript
{
  isGuest: { type: Boolean, default: false, index: true },
  guestMetadata: {
    createdAt: { type: Date, default: null },
    originalRole: { type: String, default: null },
    roleSwitchCount: { type: Number, default: 0 },
    upgradedAt: { type: Date, default: null }
  }
}
```

**Purpose**: Track guest status, metadata, and analytics.

#### **2. Controllers** (`/backend/controllers/authController.js`)

##### **guestRegister**
- **Route**: `POST /api/auth/guest-register`
- **Access**: Public (rate-limited)
- **Input**: `{ name?: string, role?: string }`
- **Output**: `{ user, token, credentials: { email, password }, isGuest: true }`
- **Logic**:
  1. Validates role (defaults to 'applicant')
  2. Generates unique email: `guest-{timestamp}-{random}@demo.yaake.com`
  3. Uses standard password: `Guest2024!`
  4. Creates user with `isVerified: true`, `isGuest: true`
  5. Returns credentials for user to save
  6. Logs creation event for analytics

##### **switchRole**
- **Route**: `POST /api/auth/switch-role`
- **Access**: Private (authenticated guests only)
- **Input**: `{ newRole: string }`
- **Output**: `{ user, token }`
- **Logic**:
  1. Validates user is a guest
  2. Validates new role is different from current
  3. Updates user role and increments switch count
  4. Generates new JWT with updated role
  5. Logs role switch for analytics

##### **upgradeGuest**
- **Route**: `POST /api/auth/upgrade-guest`
- **Access**: Private (authenticated guests only)
- **Input**: `{ email: string, password: string, confirmPassword: string }`
- **Output**: `{ user, token, emailSent: boolean }`
- **Logic**:
  1. Validates user is a guest
  2. Validates email format and uniqueness
  3. Validates password strength
  4. Hashes password with bcrypt
  5. Updates user to non-guest status
  6. Sends verification email
  7. Marks upgrade timestamp
  8. Logs upgrade event for analytics

#### **3. Middleware** (`/backend/middleware/guestMiddleware.js`)

##### **guestRegisterLimiter**
- **Type**: Rate limiter
- **Limit**: 10 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests
- **Logging**: Warns on rate limit exceeded

##### **requireGuest**
- **Type**: Authorization middleware
- **Purpose**: Ensures only guest users access certain routes
- **Response**: 403 Forbidden for non-guests

##### **logGuestActivity**
- **Type**: Analytics middleware
- **Purpose**: Logs guest actions asynchronously
- **Non-blocking**: Uses `setImmediate()`

##### **addGuestIndicator**
- **Type**: Response modifier
- **Purpose**: Adds `isGuestMode: true` to responses for guest users

#### **4. Routes** (`/backend/routes/authRoutes.js`)

```javascript
// Guest registration - Public, rate-limited
router.post('/guest-register', guestRegisterLimiter, guestRegisterValidation, guestRegister);

// Role switching - Private, guests only
router.post('/switch-role', protect, requireGuest, switchRoleValidation, switchRole);

// Account upgrade - Private, guests only
router.post('/upgrade-guest', protect, requireGuest, upgradeGuestValidation, upgradeGuest);
```

---

### Frontend Components

#### **1. GuestSignupForm** (`/frontend/src/components/Auth/GuestSignupForm.js`)
- Simple 2-field form (name optional, role required)
- Auto-displays credentials after registration
- Auto-redirects to dashboard after 5 seconds
- Manual "Continue" button available
- Copy-to-clipboard functionality for credentials

#### **2. GuestModeBanner** (`/frontend/src/components/GuestModeBanner.js`)
- Sticky banner at top of dashboard
- Shows current role and guest status
- Provides "Switch Role" and "Upgrade Account" buttons
- Minimizable to small badge in corner
- Responsive design for mobile

#### **3. RoleSwitcher** (`/frontend/src/components/RoleSwitcher.js`)
- Modal dialog with role selection
- Radio button interface
- Shows current role with badge
- Prevents switching to same role
- Updates UI immediately after switch

#### **4. UpgradeModal** (`/frontend/src/components/UpgradeModal.js`)
- Full registration form with validation
- Password strength requirements displayed
- Success animation after upgrade
- Auto-refreshes page after 3 seconds
- Email verification notice

#### **5. Updated LoginForm** (`/frontend/src/components/Auth/LoginForm.js`)
- Added "Try as Guest" button
- Styled with distinct color (purple/indigo)
- Divider between login and guest access
- Direct link to guest signup page

---

## User Flows

### Flow 1: Guest Registration

```
1. User visits /login or /guest-signup
2. Clicks "Try as Guest" button
3. (Optional) Enters display name
4. Selects role (Applicant, Recruiter, Career Trainer)
5. Clicks "Create Guest Account"
6. Credentials displayed (email + password)
7. User can copy credentials
8. Auto-redirected to dashboard after 5 seconds
9. Guest banner appears at top
```

### Flow 2: Role Switching

```
1. Guest user logged in
2. Sees guest banner with "Switch Role" button
3. Clicks "Switch Role"
4. Modal appears with 3 role options
5. Selects desired role
6. Clicks "Switch Role"
7. Page refreshes with new role
8. Menu items update based on new role
9. Analytics logged
```

### Flow 3: Account Upgrade

```
1. Guest user logged in
2. Sees guest banner with "Upgrade Account" button
3. Clicks "Upgrade Account"
4. Modal appears with registration form
5. Enters email and secure password
6. Clicks "Upgrade Account"
7. Success animation shown
8. Verification email sent
9. Page refreshes with updated status
10. User is no longer a guest
11. Email verification required for full access
```

---

## Security Considerations

### 1. **Rate Limiting**
- Guest registration: 10 per 15 minutes per IP
- Prevents automated abuse
- Returns clear error message when exceeded
- Logged for monitoring

### 2. **Auto-Generated Credentials**
- Email: `guest-{timestamp}-{random}@demo.yaake.com`
  - Timestamp ensures uniqueness
  - 4-byte random hex adds entropy
  - Total uniqueness: ~4.3 billion combinations per millisecond
- Password: `Guest2024!`
  - Meets complexity requirements
  - Publicly known (by design for demo accounts)
  - Changed upon upgrade

### 3. **Middleware Protection**
- `requireGuest` ensures only guests can switch roles or upgrade
- `protect` ensures authentication before guest operations
- CSRF protection applies to all state-changing requests

### 4. **Data Privacy**
- Guest data treated same as regular users in database
- No special retention policy (yet)
- Analytics logging excludes sensitive data
- Winston logger configured for privacy

### 5. **Upgrade Validation**
- Email uniqueness checked before upgrade
- Password strength enforced (8+ chars, uppercase, lowercase, number, special char)
- Passwords hashed with bcrypt (10 salt rounds)
- Email verification sent for security

---

## Analytics & Logging

### Events Logged

All guest events are logged with Winston for analytics:

```javascript
// Guest account creation
logger.info('Guest account created', {
  guestId: user._id,
  role: guestRole,
  name: guestName
});

// Role switch
logger.info('Guest role switched', {
  guestId: req.user.id,
  oldRole: req.user.role,
  newRole: newRole,
  switchCount: currentSwitchCount + 1
});

// Account upgrade
logger.info('Guest account upgraded', {
  userId: req.user.id,
  newEmail: email,
  originalRole: req.user.guestMetadata?.originalRole
});

// Rate limit exceeded
logger.warn('Guest registration rate limit exceeded', {
  ip: req.ip,
  userAgent: req.get('user-agent')
});
```

### Metrics to Track

- **Guest Registration Volume**
  - Registrations per day/week/month
  - Peak registration times
  - Geographic distribution (by IP)

- **Role Distribution**
  - Most popular initial role
  - Role switch patterns
  - Average role switches per guest

- **Upgrade Rate**
  - Percentage of guests who upgrade
  - Time to upgrade (creation → upgrade)
  - Most upgraded role

- **Session Duration**
  - Average session length for guests
  - Engagement by role
  - Feature usage by guests

---

## Configuration

### Environment Variables

No special environment variables required. Guest mode is always enabled unless disabled via feature flag (not implemented yet).

**Optional future additions**:
```env
# Feature flag to disable guest mode
GUEST_MODE_ENABLED=true

# Custom guest email domain
GUEST_EMAIL_DOMAIN=demo.yaake.com

# Guest account expiration (days)
GUEST_ACCOUNT_EXPIRY_DAYS=30

# Rate limit window (milliseconds)
GUEST_RATE_LIMIT_WINDOW=900000

# Rate limit max requests
GUEST_RATE_LIMIT_MAX=10
```

---

## Testing

### Manual Testing Checklist

**Guest Registration**:
- [ ] Can create guest account with name
- [ ] Can create guest account without name
- [ ] Can select each role (applicant, recruiter, career_trainer)
- [ ] Credentials displayed correctly
- [ ] Can copy credentials to clipboard
- [ ] Auto-redirects to dashboard
- [ ] Manual "Continue" button works
- [ ] Rate limiting triggers after 10 registrations

**Role Switching**:
- [ ] Guest banner appears for guest users
- [ ] "Switch Role" button opens modal
- [ ] Current role is marked
- [ ] Can select different role
- [ ] Cannot switch to same role
- [ ] Page refreshes after switch
- [ ] Menu items update for new role
- [ ] Role switch count increments

**Account Upgrade**:
- [ ] "Upgrade Account" button opens modal
- [ ] Email validation works
- [ ] Password validation works (8+ chars, complexity)
- [ ] Confirm password validation works
- [ ] Duplicate email rejected
- [ ] Success animation shows
- [ ] Verification email sent
- [ ] User no longer shows as guest
- [ ] Guest banner disappears after upgrade

**UI/UX**:
- [ ] Guest banner is sticky at top
- [ ] Banner can be minimized
- [ ] Minimized banner can be expanded
- [ ] Modals close on overlay click
- [ ] Modals close on X button
- [ ] Mobile responsive

### Automated Testing (TODO)

See todo list for automated testing tasks.

---

## Troubleshooting

### Issue: Guest registration returns 429

**Cause**: Rate limit exceeded (more than 10 registrations in 15 minutes from same IP)

**Solution**:
- Wait 15 minutes
- Use different IP/network
- Check logs for abuse patterns: `grep "Guest registration rate limit" logs/combined.log`

### Issue: Role switch returns 403

**Cause**: User is not a guest account

**Solution**:
- Verify user has `isGuest: true` in database
- Check that `requireGuest` middleware is applied to route
- Verify JWT token is valid and contains guest user

### Issue: Upgrade fails with "Email already registered"

**Cause**: Email is already in use by another account

**Solution**:
- User must choose different email
- Check database for conflicting email: `db.users.findOne({ email: "..." })`
- Verify email is not just uppercase/lowercase variation

### Issue: Guest banner not appearing

**Cause**: User object doesn't have `isGuest` field or it's false

**Solution**:
- Check user object in localStorage: `localStorage.getItem('yaake_user')`
- Verify API response includes `isGuest: true`
- Check Dashboard component receives user prop
- Verify GuestModeBanner component is imported

---

## Best Practices

### For Networking Events

1. **Pre-event Setup**
   - Test guest registration flow
   - Verify sample data is populated
   - Check rate limits are appropriate
   - Prepare demo accounts if needed

2. **During Event**
   - Monitor guest registration volume
   - Watch for rate limit issues
   - Track role distribution
   - Collect feedback

3. **Post-event**
   - Analyze guest analytics
   - Check upgrade rate
   - Review session duration
   - Identify popular features

### For Development

1. **Local Testing**
   - Use guest accounts for quick testing
   - Test with different roles
   - Verify role switching works
   - Test upgrade path

2. **Code Maintenance**
   - Keep guest logic separate from regular auth
   - Use `requireGuest` middleware consistently
   - Log important events
   - Document any changes

3. **Database**
   - Index `isGuest` field for performance
   - Monitor guest account growth
   - Consider cleanup policy for abandoned guests
   - Track metadata for analytics

---

## Future Enhancements

### Short Term (Next Sprint)
- [ ] Auto-populate sample data on guest creation
- [ ] Guest data seeder script for testing
- [ ] Automated tests for guest features
- [ ] Guest account expiration (30 days inactive)

### Medium Term (Next Quarter)
- [ ] Guest session analytics dashboard
- [ ] A/B testing for guest onboarding
- [ ] Custom guest welcome tour
- [ ] Guest feedback collection

### Long Term (6+ Months)
- [ ] Guest account cleanup job
- [ ] Advanced analytics (cohort analysis)
- [ ] Guest referral tracking
- [ ] Integration with marketing automation

---

## FAQ

**Q: Can guest accounts access all features?**
A: Yes, guest accounts have full access to all features based on their selected role. They are functionally identical to regular accounts except for the temporary nature.

**Q: How long do guest accounts last?**
A: Currently, guest accounts persist indefinitely. Future enhancement will add auto-expiration after 30 days of inactivity.

**Q: Can I convert a guest account to a regular account?**
A: Yes, use the "Upgrade Account" button in the guest banner. You'll need to provide an email and password.

**Q: What happens to my data when I upgrade?**
A: All your data is preserved. You simply add email/password authentication to your existing account.

**Q: Can I switch roles multiple times?**
A: Yes, guest users can switch roles as many times as needed to explore different perspectives.

**Q: Is guest data secure?**
A: Yes, guest data is stored with the same security measures as regular accounts. However, since credentials are simple and publicly known, don't use guest accounts for sensitive data.

**Q: Can I delete a guest account?**
A: Currently, accounts must be deleted manually from the database. Future enhancement will add self-service account deletion.

---

## Related Documentation

- [Authentication Documentation](./README.md)
- [CSRF Protection](./CSRF_PROTECTION.md)
- [Logging Guide](./LOGGING.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated**: 2026-03-02
**Version**: 1.0.0
**Author**: YAAKE Team
