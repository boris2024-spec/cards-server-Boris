# Что нужно добавить во фронтенд для поддержки блокировки пользователей

## Краткий обзор изменений

Бэкенд теперь блокирует пользователей на 24 часа после 3 неудачных попыток входа. Фронтенд нужно обновить для обработки новых ответов API.

## 🔴 КРИТИЧНЫЕ изменения

### 1. Обработка нового кода ответа 423 (Locked)

```javascript
// В функции входа добавить обработку:
if (response.status === 423) {
  // Аккаунт заблокирован
  setError(data.message);
  setIsBlocked(true);
  
  // Показать время разблокировки если есть
  if (data.blockedUntil) {
    const blockedUntil = new Date(data.blockedUntil);
    startCountdown(blockedUntil);
  }
}
```

### 2. Улучшенная обработка 401 (показ оставшихся попыток)

```javascript
if (response.status === 401) {
  setError(data.message); // "Invalid email or password. 2 attempts remaining"
  
  // Извлечь количество попыток
  const remainingMatch = data.message.match(/(\d+) attempts remaining/);
  if (remainingMatch) {
    const remaining = parseInt(remainingMatch[1]);
    setRemainingAttempts(remaining);
    
    if (remaining <= 1) {
      setWarning('⚠️ Еще одна неудачная попытка заблокирует аккаунт на 24 часа!');
    }
  }
}
```

## 🟡 РЕКОМЕНДУЕМЫЕ улучшения UI

### 1. Индикатор оставшихся попыток

```jsx
// Добавить в форму входа
{!isBlocked && remainingAttempts < 3 && (
  <div className="attempts-indicator">
    Осталось попыток: {remainingAttempts}
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

### 2. Таймер обратного отсчета при блокировке

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
    
    setBlockCountdown(`🔒 Разблокировка через: ${hours}ч ${minutes}м`);
  };
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 60000);
  return () => clearInterval(interval);
};
```

### 3. Заблокированная кнопка входа

```jsx
<button 
  type="submit" 
  disabled={isBlocked}
  className={isBlocked ? 'button-disabled' : 'button-primary'}
>
  {isBlocked ? '🔒 Аккаунт заблокирован' : 'Войти'}
</button>
```

## 🟢 ОПЦИОНАЛЬНЫЕ возможности для админов

### Форма сброса блокировок (только для админов)

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
      alert('Попытки входа сброшены');
    }
  };
  
  return (
    <div>
      <h3>Сброс блокировки</h3>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email пользователя"
      />
      <button onClick={handleReset}>Сбросить</button>
    </div>
  );
};
```

## 📱 Простые CSS стили

```css
/* Индикатор попыток */
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

/* Заблокированная кнопка */
.button-disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}

/* Предупреждения */
.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
```

## 🚀 Минимальная реализация (5 минут)

Если времени мало, достаточно добавить только обработку кода 423:

```javascript
// В существующую функцию входа добавить:
if (response.status === 423) {
  alert('Аккаунт заблокирован на 24 часа из-за множественных неудачных попыток входа');
  return;
}
```

## ✅ Что работает без изменений

- Успешный вход (код 200)
- Обычные ошибки входа (код 401) 
- Блокировка администратором (код 403)
- Все остальные API endpoints

## 📋 Тестовые сценарии

1. **3 неудачных попытки** → должен показать блокировку
2. **Попытка входа заблокированного** → должен показать время ожидания  
3. **Успешный вход после 2 неудачных** → должен сбросить счетчик
4. **Админ сбрасывает блокировку** → пользователь может войти

Система полностью реализована в бэкенде и готова к использованию! 🎉
