# Manual webhook test - simulates LiqPay callback
# This tests the webhook WITHOUT making a real payment

Write-Host "Testing webhook manually..." -ForegroundColor Cyan

# Create test payload (simulating LiqPay callback)
$testOrderId = "test_$(Get-Date -Format 'yyyyMMddHHmmss')"
$testPayload = @{
    public_key = "i86224349673"
    status = "success"
    order_id = $testOrderId
    payment_id = "LP_TEST_123"
    amount = 100
    currency = "UAH"
}

$payloadJson = $testPayload | ConvertTo-Json -Compress
$payloadBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($payloadJson))

# Create signature (SHA-1)
$privateKey = "gwxU7Bt9xkQqtEzOFx5ONf9NNfPSjNVeRw6ia6vC"
$signString = $privateKey + $payloadBase64 + $privateKey
$sha1 = [System.Security.Cryptography.SHA1]::Create()
$signatureBytes = $sha1.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signString))
$signature = [Convert]::ToBase64String($signatureBytes)

Write-Host "Order ID: $testOrderId" -ForegroundColor Yellow
Write-Host "Sending test webhook..." -ForegroundColor Cyan

# Send to webhook
$webhookUrl = "https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook"
$body = @{
    data = $payloadBase64
    signature = $signature
}

try {
    $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body -ErrorAction Stop
    Write-Host "SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Check Supabase Dashboard -> Edge Functions -> liqpay-webhook -> Logs" -ForegroundColor Cyan
Write-Host "Check orders table for order_id: $testOrderId" -ForegroundColor Cyan

