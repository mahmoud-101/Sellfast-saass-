@echo off
echo ==========================================
echo      INITIALIZING AND UPLOADING
echo ==========================================
echo.

echo 1. Cleaning old Git configuration...
if exist .git rmdir /s /q .git

echo 2. Initializing new repository...
git init
git branch -M main

echo 3. Connecting to GitHub...
git remote add origin https://github.com/mahmoud-101/Sellfast-saass-.git

echo 4. Preparing files...
git add .
git commit -m "Fresh upload from Agent"

echo 5. Uploading...
git push -u origin main --force

echo.
echo ==========================================
if %errorlevel% neq 0 (
    echo [ERROR] Upload failed.
    echo Please take a photo of the error.
) else (
    echo [SUCCESS] Upload completed!
    echo Your site should be live in a few minutes.
)
echo ==========================================
pause
