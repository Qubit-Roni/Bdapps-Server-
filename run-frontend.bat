@echo off
cd /d "%~dp0"
echo Starting Frontend...
start "Frontend (Next.js)" cmd /k "cd frontend && npm run dev"
echo Frontend started! Open http://localhost:3000 in your browser.
