@echo off
echo ============================================
echo   RESET MYSQL ROOT PASSWORD
echo   Chay file nay voi quyen ADMINISTRATOR
echo ============================================
echo.

echo [1/4] Dang dung MySQL service...
net stop MySQL95
timeout /t 3

echo.
echo [2/4] Tao file init de reset password...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY '123456'; > "%TEMP%\mysql_init.txt"
echo FLUSH PRIVILEGES; >> "%TEMP%\mysql_init.txt"

echo.
echo [3/4] Khoi dong MySQL voi init-file de reset password...
echo     Vui long doi 10 giay...
start /b "" "C:\Program Files\MySQL\MySQL Server 9.5\bin\mysqld.exe" --init-file="%TEMP%\mysql_init.txt" --console
timeout /t 10

echo.
echo [4/4] Dung MySQL va khoi dong lai binh thuong...
taskkill /F /IM mysqld.exe
timeout /t 5
net start MySQL95

echo.
echo ============================================
echo   HOAN TAT! Mat khau root = 123456
echo   Hay chay lai backend.
echo ============================================
pause
