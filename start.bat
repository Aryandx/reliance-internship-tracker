@echo off
echo ================================================
echo  Reliance New Energy - Internship Tracker v2
echo ================================================
echo.

:: Start MongoDB if not running
echo [1/4] Starting MongoDB service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo MongoDB service not found, trying mongod directly...
    start "MongoDB" /MIN "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db"
    timeout /t 4 /nobreak >nul
)
echo.

:: Run migration (safe to run multiple times — idempotent)
echo [2/4] Running database migration...
cd /d "%~dp0backend"
node src/migrate.js
echo.

:: Start Backend
echo [3/4] Starting Backend (port 5000)...
start "Backend - Internship Tracker" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 3 /nobreak >nul
echo.

:: Start Frontend
echo [4/4] Starting Frontend (port 5173)...
start "Frontend - Internship Tracker" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 4 /nobreak >nul
echo.

echo ================================================
echo  App running at: http://localhost:5173
echo  API running at: http://localhost:5000/api/v1
echo  Health check:   http://localhost:5000/api/v1/health
echo ================================================
echo.
echo  Test accounts (password: password123):
echo  - manager@reliance.com  (MANAGER)
echo  - intern@reliance.com   (INTERN)
echo  - buddy@reliance.com    (BUDDY)
echo  - hr@reliance.com       (HR)
echo  - techlead@reliance.com (TECH_LEAD)
echo.
echo  New interns get login password: Welcome@123
echo.
start http://localhost:5173
pause
