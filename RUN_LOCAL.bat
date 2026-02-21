@echo off
echo ===================================================
echo   Ebdaa Pro - Running Full Application
echo ===================================================
echo.
echo 1. Checking system...
if not exist node_modules (
    echo    Installing dependencies (First run only)...
    call npm install
)

echo 2. Starting Local Server...
echo    Please wait 10 seconds for the browser to open...
echo.

start "" "http://localhost:5173"
call npm run dev
pause
