@echo off
echo =====================================================
echo   Sellfast AI - Output Quality + Creative Tools Fix
echo =====================================================
echo.
echo Changes in this batch:
echo.
echo  [FIX] Creative Studio - Output completely restructured:
echo       Was: مشاهد قصة (storyboard scenes)
echo       Now: سكريبت ريلز كامل + قائمة لقطات تقنية
echo.
echo  [+] سكريبت الريلز: نص صوتي كامل بالعامية
echo       Hook, مشكلة, حل, دليل اجتماعي, CTA
echo       قابل للتعديل + زر نسخ
echo.
echo  [+] قائمة اللقطات التقنية (Shot List):
echo       نوع اللقطة, المدة, الأكشن, النص على الشاشة
echo       ملاحظة تقنية للمخرج
echo.
echo  [FIX] أدوات الإخراج - ترجمة للعربية:
echo       Storyboard Studio, UGC Studio, Photoshoot, Library
echo.
echo  [FIX] Campaign Builder - خطة المحتوى (٧ أيام):
echo       Was: English generic text
echo       Now: JSON عربي هيكلي (hook/body/CTA/hashtags)
echo.
echo  [FIX] Market Intelligence - جودة التحليل أحسن
echo.
cd /d "%~dp0"
git add .
git commit -m "fix: reels script + shot list output, upgrade arabic ai prompts, translate creative tools"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Deploying to Vercel...
) else (
    echo Error - check above.
)
echo =====================================================
pause
