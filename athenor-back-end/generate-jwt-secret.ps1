# Generate a secure JWT secret for Athenor
Write-Host "Generating secure JWT secret..." -ForegroundColor Cyan
Write-Host ""

# Generate 64 random characters
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "Your JWT Secret:" -ForegroundColor Green
Write-Host $secret -ForegroundColor Yellow
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the secret above" -ForegroundColor White
Write-Host "2. For Development - Run:" -ForegroundColor White
Write-Host "   dotnet user-secrets set 'JwtSettings:Secret' '$secret'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. For Production (Azure) - Add to App Settings:" -ForegroundColor White
Write-Host "   JWT_SECRET = $secret" -ForegroundColor Gray
Write-Host ""
Write-Host "4. NEVER commit this secret to version control!" -ForegroundColor Red
Write-Host ""

# Optional: Copy to clipboard if available
if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
    $secret | Set-Clipboard
    Write-Host "✓ Secret copied to clipboard!" -ForegroundColor Green
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
