@echo off
echo ===================================================
echo   Sellfast AI - UX Polish Batch 4: Demo Section
echo ===================================================
echo.
echo Changes in this batch:
echo  [+] Demo Section on Landing Page (before subscribing)
echo       Tab 1: تحليل المنتج - audience, USP, positioning cards
echo       Tab 2: الحملة الإعلانية - angles + full Arabic ad copy
echo       Tab 3: السيناريو المرئي - 4-scene storyboard with dialogues
echo       Product: كبسولات كيتو سليم (real-looking Arabic output)
echo       CTA: "جرّب الآن مجاناً" button
echo.
echo  [+] AIProgressSteps component (named steps + progress bar)
echo  [+] Onboarding 3-step guide (shows once per device)
echo  [FIX] Hub titles translated to Arabic
echo  [FIX] Pricing plan descriptions in real deliverables
echo  [FIX] Product Analysis as primary output in Market Hub
echo.
cd /d "%~dp0"
git add .
git commit -m "ux: demo section + progress steps + onboarding + arabic ux fixes"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Vercel deploying...
    echo Visitors can now see real outputs BEFORE subscribing!
) else (
    echo Error - check above.
)
echo ===================================================
pause
