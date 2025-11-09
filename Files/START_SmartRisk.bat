@echo off
title SmartRisk Lite - Starting...
color 0A

echo.
echo ========================================
echo    SmartRisk Lite Portfolio Analyzer
echo ========================================
echo.
echo Starting backend and frontend...
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Start Backend
echo [1/2] Starting Backend Server...
start "SmartRisk Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && python main.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend...
start "SmartRisk Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"
timeout /t 5 /nobreak >nul

REM Wait for servers to start
echo.
echo Waiting for servers to start...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo    SmartRisk Lite is now running!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo.
echo CHECK THE FRONTEND WINDOW for the port!
echo Vite will show: "Local: http://localhost:XXXX/"
echo.
echo Open that URL in your browser to use the app.
echo.
echo Two command windows will stay open.
echo Close them to stop the servers.
echo.
echo You can close THIS window now.
echo.
pause
