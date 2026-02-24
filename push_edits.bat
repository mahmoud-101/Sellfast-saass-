@echo off
setlocal
echo =====================================================
echo   Sellfast AI - Enterprise Upgrade Deployment
echo =====================================================
echo.
echo Preparing to push the following updates:
echo  1. AI Resilience (safeJsonParse)
echo  2. Full Interactivity (Editable Hubs)
echo  3. AI Visuals (Shot/Concept Images)
echo  4. Progressive Loading UX
echo  5. Campaign Versioning (V1, V2)
echo.
echo [1/3] Adding changes...
git add .
echo [2/3] Committing changes...
git commit -m "feat: Enterprise Upgrade - Resilience, Interactivity, Visuals & Versioning"
echo [3/3] Pushing to server...
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo =====================================================
    echo   SUCCESS! Your update is now live.
    echo =====================================================
) else (
    echo =====================================================
    echo   ERROR: Deployment failed. Please check your connection.
    echo =====================================================
)
pause
