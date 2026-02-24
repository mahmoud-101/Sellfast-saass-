@echo off
echo ===================================================
echo   Sellfast AI - Hotfix: [object Object] Bug
echo ===================================================
echo.
echo Fixing: Market Intelligence Hub was showing [object Object]
echo         instead of actual trend text in the results.
echo.
echo Pushing to GitHub to trigger Vercel auto-deploy...
echo.

cd /d "%~dp0"
git add .
git commit -m "fix: [object Object] bug - properly serialize TrendItem objects in MarketIntelligenceHub + 5 platform improvements"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Vercel will rebuild and deploy in about 2-3 minutes.
    echo The trends will now show as proper Arabic text!
) else (
    echo Something went wrong. Check the error above.
)
echo ===================================================
pause
