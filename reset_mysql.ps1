# Script reset MySQL root password
# Phai chay voi quyen Administrator

$myIniPath = "C:\ProgramData\MySQL\MySQL Server 9.5\my.ini"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 9.5\bin"

Write-Host "=== RESET MYSQL ROOT PASSWORD ===" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Doc file my.ini va them skip-grant-tables
Write-Host "[1/5] Them skip-grant-tables vao my.ini..." -ForegroundColor Yellow
$content = Get-Content $myIniPath -Raw
if ($content -notmatch "skip-grant-tables") {
    $content = $content -replace "(\[mysqld\])", "`$1`r`nskip-grant-tables"
    Set-Content -Path $myIniPath -Value $content -NoNewline
    Write-Host "  -> Da them skip-grant-tables" -ForegroundColor Green
} else {
    Write-Host "  -> skip-grant-tables da ton tai" -ForegroundColor Green
}

# Buoc 2: Restart MySQL
Write-Host "[2/5] Restart MySQL service..." -ForegroundColor Yellow
net stop MySQL95 2>$null
Start-Sleep -Seconds 3
net start MySQL95
Start-Sleep -Seconds 3
Write-Host "  -> MySQL da restart" -ForegroundColor Green

# Buoc 3: Doi mat khau
Write-Host "[3/5] Doi mat khau root thanh '123456'..." -ForegroundColor Yellow
& "$mysqlBin\mysql.exe" -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY '123456'; FLUSH PRIVILEGES;"
Write-Host "  -> Da doi mat khau" -ForegroundColor Green

# Buoc 4: Xoa skip-grant-tables khoi my.ini
Write-Host "[4/5] Xoa skip-grant-tables khoi my.ini..." -ForegroundColor Yellow
$content = Get-Content $myIniPath -Raw
$content = $content -replace "`r`nskip-grant-tables", ""
$content = $content -replace "`nskip-grant-tables", ""
$content = $content -replace "skip-grant-tables`r`n", ""
Set-Content -Path $myIniPath -Value $content -NoNewline
Write-Host "  -> Da xoa skip-grant-tables" -ForegroundColor Green

# Buoc 5: Restart MySQL lan cuoi
Write-Host "[5/5] Restart MySQL binh thuong..." -ForegroundColor Yellow
net stop MySQL95 2>$null
Start-Sleep -Seconds 3
net start MySQL95
Start-Sleep -Seconds 2

# Test ket noi
Write-Host ""
Write-Host "=== KIEM TRA KET NOI ===" -ForegroundColor Cyan
& "$mysqlBin\mysql.exe" -u root -p123456 -e "SELECT 'Ket noi thanh cong!' AS Result;"

Write-Host ""
Write-Host "=== HOAN TAT! Mat khau root = 123456 ===" -ForegroundColor Green
Write-Host "Hay quay lai chay backend." -ForegroundColor Green
Write-Host ""
Read-Host "Nhan Enter de dong"
