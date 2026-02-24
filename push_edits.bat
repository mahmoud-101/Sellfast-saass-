@echo off
echo 🚀 Starting Deployment Process...
git add .
git commit -m "Sync database schema, enhance content library, and update production types"
git push origin main
echo ✅ Deployment Complete!
pause
