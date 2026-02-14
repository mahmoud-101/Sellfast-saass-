@echo off
echo ===================================================
echo   Ebdaa Pro - Local Build Diagnosis
echo ===================================================
echo.
echo Running 'npm run build' to capture errors...
echo This might take a minute...

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    echo Check your internet or node installation.
    exit /b 1
)

call npm run build > build_log.txt 2>&1

if %errorlevel% equ 0 (
    echo.
    echo   SUCCESS! Build passed locally.
    echo   The issue might be on AWS side.
) else (
    echo.
    echo   FAILURE! Build failed.
    echo   Please share the content of 'build_log.txt'.
)
pause
