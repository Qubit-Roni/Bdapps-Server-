@echo off
cd /d "%~dp0"
echo Starting all backend services in a single window...

start "Backend Services" cmd /k "cd backend && npm run dev"

echo All services started in a new window!
