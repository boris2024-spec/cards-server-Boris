# User Blocking System After Failed Login Attempts

## Description

The system automatically blocks users for 24 hours after 3 failed login attempts with the same email address, even if the password is incorrect.

## Functionality

### Main Features:
* **Attempt tracking**: Each failed login attempt is saved in the database
* **Automatic blocking**: After 3 failed attempts, the user is blocked for 24 hours
* **Informative messages**: The user receives information about the number of remaining attempts
* **Automatic unblocking**: The block is lifted after 24 hours
* **Reset on successful login**: The attempt counter resets on correct password
* **Administrative reset**: Admin can forcibly reset the block

## Database Structure

### LoginAttempt Model
```javascript
{
  email: String,           // User email
  attempts: Number,        // Number of failed attempts
  blockedUntil: Date,      // Block expiration date
  lastAttempt: Date        // Last attempt date
}
```

## API Endpoints

### POST /api/users/login
Login with block check

**Block responses:**
- `423 Locked` - Account is blocked
- `401 Unauthorized` - Invalid credentials with remaining attempts info

### PATCH /api/users/reset-login-attempts
Reset login attempts (admin only)

**Request body:**
```json
{
  "email": "user@example.com"
}
```

## Logic

### Blocking Algorithm:
1. On failed login, the system checks existing records
2. Increments attempt counter or creates a new record
3. After 3 attempts, sets `blockedUntil` to 24 hours ahead
4. On each login, checks block status

### Unblocking:
- **Automatic**: After 24 hours (TTL index in MongoDB)
- **On successful login**: Record is deleted
- **Administrative**: Via API endpoint

## Security

### Attack Protection:
- **Brute Force**: Block after 3 attempts
- **Rate Limiting**: By email address
- **Temporary block**: 24 hours
- **Logging**: All attempts are saved

### Limitations:
- Block applies only by email
- Does not protect against attacks from different emails
- Requires active monitoring

## Testing

### Automated tests:
```bash
npm test -- user.blocking.test.js
```

### Manual testing:
```powershell
.\demo_user_blocking.ps1
```

## Configuration

### Constants (in loginAttemptService.js):
```javascript
const MAX_ATTEMPTS = 3;                    // Maximum attempts
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
```

### Environment variables:
- `ADMIN_REG_CODE` - Code for creating admin

## Monitoring

### Recommended metrics:
- Number of blocked accounts
- Frequency of failed login attempts
- Time to restore access
- Use of administrative reset

### Logs:
All blocking events are logged to the console for monitoring.

## Further Development

### Possible improvements:
- **IP-based blocking**: Block by IP address
- **Progressive delays**: Increasing delays
- **CAPTCHA integration**: Bot check
- **Email notifications**: Block notifications
- **Audit trail**: Detailed event log

### Integration with external systems:
- **Redis**: For fast caching
- **Monitoring tools**: Prometheus, Grafana
- **Alert systems**: Admin notifications
