@echo off
echo Starting Force Upload...
echo.
git add .
git commit -m "Force update all files"
git push -u origin main --force
if %errorlevel% neq 0 (
    echo.
    echo ERROR: The upload failed.
    echo Error Code: %errorlevel%
    echo.
    echo Please take a photo of this screen and send it to the developer.
) else (
    echo.
    echo SUCCESS: Upload completed!
)
pause
