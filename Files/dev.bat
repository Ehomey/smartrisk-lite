@echo off
setlocal enabledelayedexpansion
REM Install backend deps
cd backend
python -m pip install -r requirements.txt
REM Start backend
start "backend" /B python -m uvicorn main:app --reload --port 8000
cd ..
REM Install frontend deps
npm install --prefix frontend
REM Start frontend
start "frontend" npm run dev --prefix frontend
pause
echo SmartRisk Lite running:
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:3000
exit /b 0
