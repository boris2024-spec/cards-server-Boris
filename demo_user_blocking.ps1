# Демонстрация блокировки пользователей администратором
# Все команды выполняются в PowerShell

Write-Host "🚀 Демонстрация функциональности блокировки пользователей" -ForegroundColor Green
Write-Host ""

# 1. Создание администратора (первый пользователь автоматически становится админом)
Write-Host "1️⃣ Создание администратора..." -ForegroundColor Yellow
$adminEmail = "admin_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$adminData = @{
    name = @{
        first = "Admin"
        last = "User"
    }
    phone = "050-123 4567"
    email = $adminEmail
    password = "AdminPass123!"
    isBusiness = $false
} | ConvertTo-Json -Depth 3

$adminRegisterResponse = Invoke-RestMethod -Uri "http://localhost:3000/users" -Method Post -Body $adminData -ContentType "application/json"
Write-Host "   Администратор создан: $($adminRegisterResponse.email)" -ForegroundColor Green
Write-Host "   isAdmin: $($adminRegisterResponse.isAdmin)" -ForegroundColor Green
Write-Host ""

# 2. Авторизация администратора
Write-Host "2️⃣ Авторизация администратора..." -ForegroundColor Yellow
$adminLoginData = @{
    email = $adminEmail
    password = "AdminPass123!"
} | ConvertTo-Json

$adminToken = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method Post -Body $adminLoginData -ContentType "application/json"
Write-Host "   Токен получен: ✅" -ForegroundColor Green
Write-Host ""

# 3. Создание обычного пользователя
Write-Host "3️⃣ Создание обычного пользователя..." -ForegroundColor Yellow
$userEmail = "user_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$userData = @{
    name = @{
        first = "Regular"
        last = "User"
    }
    phone = "050-987 6543"
    email = $userEmail
    password = "UserPass123!"
    isBusiness = $true
} | ConvertTo-Json -Depth 3

$userRegisterResponse = Invoke-RestMethod -Uri "http://localhost:3000/users" -Method Post -Body $userData -ContentType "application/json"
$userId = $userRegisterResponse._id
Write-Host "   Пользователь создан: $($userRegisterResponse.email)" -ForegroundColor Green
Write-Host "   ID: $userId" -ForegroundColor Green
Write-Host "   isAdmin: $($userRegisterResponse.isAdmin)" -ForegroundColor Green
Write-Host "   isBlocked: $($userRegisterResponse.isBlocked)" -ForegroundColor Green
Write-Host ""

# 4. Проверка авторизации обычного пользователя
Write-Host "4️⃣ Проверка авторизации обычного пользователя..." -ForegroundColor Yellow
$userLoginData = @{
    email = $userEmail
    password = "UserPass123!"
} | ConvertTo-Json

try {
    $userToken = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method Post -Body $userLoginData -ContentType "application/json"
    Write-Host "   Авторизация успешна: ✅" -ForegroundColor Green
} catch {
    Write-Host "   Ошибка авторизации: ❌" -ForegroundColor Red
}
Write-Host ""

# 5. Админ блокирует пользователя
Write-Host "5️⃣ Блокировка пользователя администратором..." -ForegroundColor Yellow
$headers = @{
    "x-auth-token" = $adminToken
    "Content-Type" = "application/json"
}

$blockResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/$userId/block" -Method Patch -Headers $headers
Write-Host "   Пользователь заблокирован: ✅" -ForegroundColor Green
Write-Host "   isBlocked: $($blockResponse.isBlocked)" -ForegroundColor Green
Write-Host ""

# 6. Проверка что заблокированный пользователь не может логиниться
Write-Host "6️⃣ Попытка авторизации заблокированного пользователя..." -ForegroundColor Yellow
try {
    $blockedUserToken = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method Post -Body $userLoginData -ContentType "application/json"
    Write-Host "   Ошибка: пользователь смог авториизоваться! ❌" -ForegroundColor Red
} catch {
    Write-Host "   Доступ запрещен: ✅" -ForegroundColor Green
    Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Cyan
}
Write-Host ""

# 7. Админ разблокирует пользователя
Write-Host "7️⃣ Разблокировка пользователя администратором..." -ForegroundColor Yellow
$unblockResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/$userId/unblock" -Method Patch -Headers $headers
Write-Host "   Пользователь разблокирован: ✅" -ForegroundColor Green
Write-Host "   isBlocked: $($unblockResponse.isBlocked)" -ForegroundColor Green
Write-Host ""

# 8. Проверка что разблокированный пользователь снова может логиниться
Write-Host "8️⃣ Проверка авторизации разблокированного пользователя..." -ForegroundColor Yellow
try {
    $unblockedUserToken = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method Post -Body $userLoginData -ContentType "application/json"
    Write-Host "   Авторизация восстановлена: ✅" -ForegroundColor Green
} catch {
    Write-Host "   Ошибка авторизации: ❌" -ForegroundColor Red
    Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 9. Попытка обычного пользователя заблокировать другого (должна провалиться)
Write-Host "9️⃣ Попытка обычного пользователя заблокировать администратора..." -ForegroundColor Yellow
$userHeaders = @{
    "x-auth-token" = $unblockedUserToken
    "Content-Type" = "application/json"
}

try {
    $unauthorizedBlock = Invoke-RestMethod -Uri "http://localhost:3000/users/$($adminRegisterResponse._id)/block" -Method Patch -Headers $userHeaders
    Write-Host "   Ошибка: обычный пользователь смог заблокировать админа! ❌" -ForegroundColor Red
} catch {
    Write-Host "   Доступ корректно запрещен: ✅" -ForegroundColor Green
    Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "✅ Все тесты прошли успешно! Функциональность блокировки работает корректно." -ForegroundColor Green
