# Демонстрация блокировки пользователя после 3 неудачных попыток входа

Write-Host "=== Демонстрация системы блокировки пользователей ===" -ForegroundColor Green

# Убедимся, что сервер запущен
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8181/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "✓ Сервер запущен" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Сервер не запущен. Запустите сервер командой: npm start" -ForegroundColor Red
    exit 1
}

if (-not $serverRunning) {
    Write-Host "✗ Сервер недоступен" -ForegroundColor Red
    exit 1
}

$testEmail = "demo@blocking.test"
$correctPassword = "Demo123!"
$wrongPassword = "WrongPassword"

# Функция для создания тестового пользователя
function Create-TestUser {
    $userData = @{
        name = @{
            first = "Demo"
            middle = ""
            last = "User"
        }
        email = $testEmail
        password = $correctPassword
        phone = "050-1234567"
        image = @{
            url = "https://example.com/demo.jpg"
            alt = "Demo user"
        }
        address = @{
            state = "Demo State"
            country = "Demo Country"
            city = "Demo City"
            street = "Demo Street"
            houseNumber = 123
            zip = 12345
        }
    } | ConvertTo-Json -Depth 3

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8181/api/users" -Method POST -Body $userData -ContentType "application/json"
        Write-Host "✓ Тестовый пользователь создан" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "! Пользователь уже существует" -ForegroundColor Yellow
            return $true
        }
        Write-Host "✗ Ошибка создания пользователя: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Функция для попытки входа
function Try-Login {
    param($email, $password, $attemptNumber)
    
    $loginData = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8181/api/users/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✓ Попытка $attemptNumber`: Успешный вход" -ForegroundColor Green
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = ""
        
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            $errorMessage = $errorBody.message
        } catch {
            $errorMessage = $_.Exception.Message
        }

        Write-Host "✗ Попытка $attemptNumber`: $errorMessage (Код: $statusCode)" -ForegroundColor Red
        return $null
    }
}

# Функция для сброса попыток (требует админ токен)
function Reset-LoginAttempts {
    param($adminToken, $email)
    
    $resetData = @{
        email = $email
    } | ConvertTo-Json

    try {
        $headers = @{ 'x-auth-token' = $adminToken }
        $response = Invoke-WebRequest -Uri "http://localhost:8181/api/users/reset-login-attempts" -Method PATCH -Body $resetData -ContentType "application/json" -Headers $headers
        Write-Host "✓ Попытки входа сброшены администратором" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Ошибка сброса попыток: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Основная демонстрация
Write-Host "`n--- Шаг 1: Создание тестового пользователя ---" -ForegroundColor Cyan
if (-not (Create-TestUser)) {
    exit 1
}

Write-Host "`n--- Шаг 2: Демонстрация неудачных попыток входа ---" -ForegroundColor Cyan
Write-Host "Пробуем войти с неправильным паролем 3 раза..."

for ($i = 1; $i -le 3; $i++) {
    Start-Sleep -Seconds 1
    Try-Login -email $testEmail -password $wrongPassword -attemptNumber $i
}

Write-Host "`n--- Шаг 3: Попытка входа после блокировки ---" -ForegroundColor Cyan
Write-Host "Пробуем войти с правильным паролем (должно быть заблокировано)..."
Try-Login -email $testEmail -password $correctPassword -attemptNumber 4

Write-Host "`n--- Шаг 4: Демонстрация автоматического сброса через 24 часа ---" -ForegroundColor Cyan
Write-Host "В реальной системе блокировка снимется автоматически через 24 часа." -ForegroundColor Yellow
Write-Host "Для демонстрации покажем, как администратор может сбросить блокировку." -ForegroundColor Yellow

# Создаем администратора для демонстрации сброса
Write-Host "`n--- Создание администратора для сброса блокировки ---" -ForegroundColor Cyan

$adminData = @{
    name = @{
        first = "Admin"
        middle = ""
        last = "Demo"
    }
    email = "admin@demo.test"
    password = "Admin123!"
    phone = "050-7654321"
    adminCode = $env:ADMIN_REG_CODE
    image = @{
        url = "https://example.com/admin.jpg"
        alt = "Admin demo"
    }
    address = @{
        state = "Admin State"
        country = "Admin Country"
        city = "Admin City"
        street = "Admin Street"
        houseNumber = 456
        zip = 54321
    }
} | ConvertTo-Json -Depth 3

try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:8181/api/users" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "✓ Администратор создан" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "! Администратор уже существует" -ForegroundColor Yellow
    }
}

# Вход администратора
$adminLoginData = @{
    email = "admin@demo.test"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:8181/api/users/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    $adminToken = ($adminLoginResponse.Content | ConvertFrom-Json).token
    Write-Host "✓ Администратор вошел в систему" -ForegroundColor Green

    # Сброс попыток входа
    Write-Host "`n--- Сброс попыток входа администратором ---" -ForegroundColor Cyan
    Reset-LoginAttempts -adminToken $adminToken -email $testEmail

    # Проверка, что пользователь может войти
    Write-Host "`n--- Проверка входа после сброса ---" -ForegroundColor Cyan
    Try-Login -email $testEmail -password $correctPassword -attemptNumber "После сброса"

} catch {
    Write-Host "✗ Ошибка входа администратора: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Демонстрация завершена ===" -ForegroundColor Green
Write-Host "Система блокировки работает следующим образом:" -ForegroundColor White
Write-Host "• После 3 неудачных попыток входа пользователь блокируется на 24 часа" -ForegroundColor White
Write-Host "• Блокировка применяется по email адресу" -ForegroundColor White
Write-Host "• При успешном входе счетчик попыток сбрасывается" -ForegroundColor White
Write-Host "• Администратор может сбросить блокировку принудительно" -ForegroundColor White
Write-Host "• Блокировка автоматически снимается через 24 часа" -ForegroundColor White
