# Demonstration of user blocking after 3 failed login attempts

Write-Host "=== User Blocking System Demonstration ===" -ForegroundColor Green

# Make sure the server is running
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8181/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "✓ Server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Server is not running. Start the server with command: npm start" -ForegroundColor Red
    exit 1
}

if (-not $serverRunning) {
    Write-Host "✗ Server is unavailable" -ForegroundColor Red
    exit 1
}

$testEmail = "demo@blocking.test"
$correctPassword = "Demo123!"
$wrongPassword = "WrongPassword"

# Function to create test user
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
        Write-Host "✓ Test user created" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "! User already exists" -ForegroundColor Yellow
            return $true
        }
        Write-Host "✗ Error creating user: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to attempt login
function Try-Login {
    param($email, $password, $attemptNumber)
    
    $loginData = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8181/api/users/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✓ Attempt $attemptNumber`: Successful login" -ForegroundColor Green
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

        Write-Host "✗ Attempt $attemptNumber`: $errorMessage (Code: $statusCode)" -ForegroundColor Red
        return $null
    }
}

# Function to reset login attempts (requires admin token)
function Reset-LoginAttempts {
    param($adminToken, $email)
    
    $resetData = @{
        email = $email
    } | ConvertTo-Json

    try {
        $headers = @{ 'x-auth-token' = $adminToken }
        $response = Invoke-WebRequest -Uri "http://localhost:8181/api/users/reset-login-attempts" -Method PATCH -Body $resetData -ContentType "application/json" -Headers $headers
        Write-Host "✓ Login attempts reset by administrator" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Error resetting attempts: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main demonstration
Write-Host "`n--- Step 1: Creating test user ---" -ForegroundColor Cyan
if (-not (Create-TestUser)) {
    exit 1
}

Write-Host "`n--- Step 2: Demonstrating failed login attempts ---" -ForegroundColor Cyan
Write-Host "Trying to login with wrong password 3 times..."

for ($i = 1; $i -le 3; $i++) {
    Start-Sleep -Seconds 1
    Try-Login -email $testEmail -password $wrongPassword -attemptNumber $i
}

Write-Host "`n--- Step 3: Login attempt after blocking ---" -ForegroundColor Cyan
Write-Host "Trying to login with correct password (should be blocked)..."
Try-Login -email $testEmail -password $correctPassword -attemptNumber 4

Write-Host "`n--- Step 4: Demonstrating automatic reset after 24 hours ---" -ForegroundColor Cyan
Write-Host "In real system, blocking is automatically removed after 24 hours." -ForegroundColor Yellow
Write-Host "For demonstration, we'll show how administrator can reset the block." -ForegroundColor Yellow

# Create administrator for demonstration of reset
Write-Host "`n--- Creating administrator to reset blocking ---" -ForegroundColor Cyan

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
    Write-Host "✓ Administrator created" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "! Administrator already exists" -ForegroundColor Yellow
    }
}

# Administrator login
$adminLoginData = @{
    email = "admin@demo.test"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:8181/api/users/login" -Method POST -Body $adminLoginData -ContentType "application/json"
    $adminToken = ($adminLoginResponse.Content | ConvertFrom-Json).token
    Write-Host "✓ Administrator logged in" -ForegroundColor Green

    # Reset login attempts
    Write-Host "`n--- Resetting login attempts by administrator ---" -ForegroundColor Cyan
    Reset-LoginAttempts -adminToken $adminToken -email $testEmail

    # Check that user can login
    Write-Host "`n--- Checking login after reset ---" -ForegroundColor Cyan
    Try-Login -email $testEmail -password $correctPassword -attemptNumber "After reset"

} catch {
    Write-Host "✗ Administrator login error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Demonstration completed ===" -ForegroundColor Green
Write-Host "The blocking system works as follows:" -ForegroundColor White
Write-Host "• After 3 failed login attempts, user is blocked for 24 hours" -ForegroundColor White
Write-Host "• Blocking is applied by email address" -ForegroundColor White
Write-Host "• On successful login, attempt counter is reset" -ForegroundColor White
Write-Host "• Administrator can forcibly reset the blocking" -ForegroundColor White
Write-Host "• Blocking is automatically removed after 24 hours" -ForegroundColor White