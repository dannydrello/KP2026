# Test webhook database persistence
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$orderId = "TEST-$timestamp"

$webhookData = @{
    event = "success"
    data = @{
        payReference = $orderId
        amount = 3500
        currency = "NGN"
        customerName = "Webhook Test"
        customerEmail = "webhook@test.com"
        customerPhone = "+2348069747505"
    }
} | ConvertTo-Json -Depth 10

Write-Host "🧪 Testing webhook with order ID: $orderId"
Write-Host "📤 Sending webhook data..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/payment/webhook" -Method POST -Body $webhookData -ContentType "application/json"
    Write-Host "✅ Webhook response:" $response
} catch {
    Write-Host "❌ Webhook failed:" $_.Exception.Message
}

Write-Host "`n⏳ Waiting 2 seconds for database update..."
Start-Sleep -Seconds 2

Write-Host "🔍 Checking database for new transaction..."
try {
    $checkResponse = Invoke-RestMethod -Uri "http://localhost:3001/check-orders" -Method GET
    Write-Host "📊 Current test orders in database:"
    $found = $false
    foreach ($order in $checkResponse) {
        if ($order.orderId -eq $orderId) {
            Write-Host "✅ FOUND NEW ORDER!"
            Write-Host "   Order ID: $($order.orderId)"
            Write-Host "   Status: $($order.status)"
            Write-Host "   Amount: ₦$($order.amount)"
            Write-Host "   Customer: $($order.customerName)"
            Write-Host "   Created: $($order.created_at)"
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Host "❌ Order not found in database"
        Write-Host "   Available orders:"
        foreach ($order in $checkResponse) {
            Write-Host "   - $($order.orderId) ($($order.status))"
        }
    }
} catch {
    Write-Host "❌ Database check failed:" $_.Exception.Message
}