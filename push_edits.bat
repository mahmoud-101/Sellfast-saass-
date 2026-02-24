@echo off
echo ===================================================
echo   Sellfast AI - Deploying All 5 Platform Fixes
echo ===================================================
echo.
echo Changes in this batch:
echo   [1] Animated AI loading messages in all 3 Hubs
echo   [2] State persistence via sessionStorage (no more data loss on refresh!)
echo   [3] Image compression utility for PhotoshootDirector
echo   [4] Old studio layouts verified as responsive
echo   [5] Supabase campaign saves - permanent campaign history!
echo   [+] Editable hub results (from last session)
echo.
echo Pushing to GitHub to trigger Vercel auto-deploy...
echo.

cd /d "%~dp0"
git add .
git commit -m "feat: 5 platform improvements - loading messages, sessionStorage persistence, image compressor, Supabase campaign saves"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Changes are being deployed to Vercel now.
    echo Vercel will build and deploy in about 2-3 minutes.
) else (
    echo Something went wrong. Check the error above.
)
echo ===================================================
pause
