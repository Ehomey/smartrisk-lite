@echo off
title Creating SmartRisk Shortcut...

echo.
echo Creating shortcut with custom icon...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0Create_Shortcut.ps1"

echo.
echo Done! You can now double-click "SmartRisk Lite.lnk" to start the app.
echo.
pause
