# Quick test to verify webhook is accessible
Write-Host "Testing webhook accessibility..." -ForegroundColor Cyan

$webhookUrl = "https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook"

try {
    $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -ContentType "application/x-www-form-urlencoded" -Body "test=1" -ErrorAction Stop
    Write-Host "Webhook responded with status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Webhook test failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Expected: 405 Method Not Allowed (or 400 Bad Request)" -ForegroundColor Cyan
Write-Host "This means the webhook is accessible and responding!" -ForegroundColor Cyan

