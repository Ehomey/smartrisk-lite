@echo off
title SmartRisk Lite - Stopping...
color 0C

echo.
echo ========================================
echo    Stopping SmartRisk Lite...
echo ========================================
echo.

REM Stop backend server (port 8000)
echo Stopping backend server on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)

REM Stop frontend server (common Vite ports: 5173, 5174, 5175, etc.)
echo Stopping frontend server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":517" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

REM Also try window titles as backup
taskkill /FI "WINDOWTITLE eq SmartRisk Backend*" /F 2>nul
taskkill /FI "WINDOWTITLE eq SmartRisk Frontend*" /F 2>nul

REM Final fallback: Kill Python processes running main.py
for /f "tokens=2" %%a in ('wmic process where "name='python.exe' and commandline like '%%main.py%%'" get processid 2^>nul ^| findstr [0-9]') do taskkill /F /PID %%a 2>nul

echo.
echo ========================================
echo    SmartRisk Lite stopped!
echo ========================================
echo.
echo All servers have been terminated.
echo.
pause
