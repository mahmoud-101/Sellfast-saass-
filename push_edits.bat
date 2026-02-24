@echo off
echo ===================================================
echo   Sellfast AI - UX Polish Batch 2: Onboarding
echo ===================================================
echo.
echo Changes in this batch:
echo  [+] NEW: Onboarding Modal (3-step guide for first-time users)
echo       Step 1: مركز ذكاء السوق - product analysis
echo       Step 2: مصنع الحملات - campaign builder
echo       Step 3: الاستوديو الإبداعي - storyboard
echo       Shows ONCE per device (localStorage), skippable
echo.
echo  [FIX] Hub titles fully translated to Arabic
echo  [FIX] "Advanced Tools" translated to "أدوات الخبراء"
echo  [FIX] Pricing plans show real deliverables not just credits
echo  [FIX] Product Analysis as primary output (not trends)
echo  [FIX] [object Object] bug resolved
echo  [+]   sessionStorage state persistence
echo  [+]   Image compression + Supabase campaigns
echo.
cd /d "%~dp0"
git add .
git commit -m "ux: onboarding modal + arabic translations + credits clarity + product analysis fix"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Vercel deploying...
    echo First-time users will now see the 3-step guide!
) else (
    echo Error - check above.
)
echo ===================================================
pause
