@echo off
cd /d "%~dp0"
echo Starting MongoDB Database Backup...
echo.

cd backend\auth-service
node backup_db.js

echo.
pause
