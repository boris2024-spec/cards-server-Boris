# What to Add to the Frontend to Support User Blocking

## Brief Overview of Changes

Backend now blocks users for 24 hours after 3 failed login attempts. The frontend needs to be updated to handle new API responses.

## 🔴 CRITICAL Changes

### 1. Handling New 423 (Locked) Response Code

```javascript
// Add handling in your login function:
if (response.status === 423) {
  // Account is blocked
  setError(data.message);
  setIsBlocked(true);
  // Show unblock time if available
  if (data.blockedUntil) {
    const blockedUntil = new Date(data.blockedUntil);
    startCountdown(blockedUntil);
  }
}
```

### 2. Improved 401 Handling (show remaining attempts)

```javascript
if (response.status === 401) {
  setError(data.message); // "Invalid email or password. 2 attempts remaining"
  // Extract remaining attempts
  const remainingMatch = data.message.match(/(\d+) attempts remaining/);
  if (remainingMatch) {
    const remaining = parseInt(remainingMatch[1]);
    setRemainingAttempts(remaining);
    if (remaining <= 1) {
      setWarning('⚠️ One more failed attempt will block your account for 24 hours!');
    }
  }
}
```

## 🟡 RECOMMENDED UI Improvements

### 1. Remaining Attempts Indicator

```jsx
// Add to login form
{!isBlocked && remainingAttempts < 3 && (
  <div className="attempts-indicator">
    Attempts left: {remainingAttempts}
    <div className="attempts-dots">
      {[1, 2, 3].map(i => (
        <span 
          key={i} 
          className={`dot ${i <= remainingAttempts ? 'active' : 'inactive'}`}
        />
      ))}
    </div>
  </div>
)}
```

### 2. Countdown Timer When Blocked

```javascript
const startCountdown = (blockedUntil) => {
  const updateCountdown = () => {
    const now = new Date();
    const timeLeft = blockedUntil - now;
    if (timeLeft <= 0) {
      setIsBlocked(false);
      setError('');
      return;
    }
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    setBlockCountdown(`🔒 Unblock in: ${hours}h ${minutes}m`);
  };
  updateCountdown();
  const interval = setInterval(updateCountdown, 60000);
  return () => clearInterval(interval);
};
```

### 3. Blocked Login Button

```jsx
<button 
  type="submit" 
  disabled={isBlocked}
  className={isBlocked ? 'button-disabled' : 'button-primary'}
>
  {isBlocked ? '🔒 Account is blocked' : 'Login'}
</button>
```

## 🟢 OPTIONAL Features for Admins

### Block Reset Form (admin only)

```jsx
const AdminResetForm = () => {
  const [email, setEmail] = useState('');
  const handleReset = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/users/reset-login-attempts', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ email })
    });
    if (response.ok) {
      alert('Login attempts reset');
    }
  };
  return (
    <div>
      <h3>Reset Block</h3>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="User email"
      />
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};
```

## 📱 Simple CSS Styles

```css
/* Attempts indicator */
.attempts-indicator {
  text-align: center;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.attempts-dots {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.active { background-color: #28a745; }
.dot.inactive { background-color: #dc3545; }

/* Blocked button */
.button-disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}

/* Warnings */
.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
```

## 🚀 Minimal Implementation (5 minutes)

If you have little time, just add handling for code 423:

```javascript
// Add to your existing login function:
if (response.status === 423) {
  alert('Account is blocked for 24 hours due to multiple failed login attempts');
  return;
}
```

## ✅ What Works Without Changes

- Successful login (code 200)
- Regular login errors (code 401)
- Admin blocking (code 403)
- All other API endpoints

## 📋 Test Scenarios

1. **3 failed attempts** → should show block
2. **Blocked user login attempt** → should show wait time
3. **Successful login after 2 failed** → should reset counter
4. **Admin resets block** → user can login

The system is fully implemented in the backend and ready to use! 🎉
