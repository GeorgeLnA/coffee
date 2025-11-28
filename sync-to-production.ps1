# PowerShell script to verify and sync all changes to production
# Run this before deploying to ensure everything is pushed

Write-Host "=== Deployment Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "Current branch:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# Check for uncommitted changes
Write-Host "Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  WARNING: You have uncommitted changes!" -ForegroundColor Red
    git status --short
    Write-Host ""
    Write-Host "Would you like to commit these changes? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "y") {
        Write-Host "Enter commit message:" -ForegroundColor Yellow
        $message = Read-Host
        git add -A
        git commit -m $message
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    Write-Host ""
}

# Check for unpushed commits
Write-Host "Checking for unpushed commits..." -ForegroundColor Yellow
$unpushed = git log origin/1.3..HEAD --oneline
if ($unpushed) {
    Write-Host "⚠️  WARNING: You have unpushed commits!" -ForegroundColor Red
    Write-Host $unpushed
    Write-Host ""
    Write-Host "Would you like to push now? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "y") {
        git push origin 1.3
    }
} else {
    Write-Host "✅ All commits are pushed" -ForegroundColor Green
    Write-Host ""
}

# Show recent commits
Write-Host "Recent commits (last 5):" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Final status
Write-Host "=== Final Status ===" -ForegroundColor Cyan
git status -sb
Write-Host ""

$finalStatus = git status --porcelain
$finalUnpushed = git log origin/1.3..HEAD --oneline

if (-not $finalStatus -and -not $finalUnpushed) {
    Write-Host "✅ Everything is synced and ready for deployment!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please commit and push your changes before deploying" -ForegroundColor Red
}

