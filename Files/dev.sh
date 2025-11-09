#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Backend
cd backend
python3 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACK_PID=$!
# Frontend
cd ../frontend
npm install
npm run dev &
FRONT_PID=$!
trap "kill $BACK_PID $FRONT_PID 2>/dev/null || true" EXIT
echo "SmartRisk Lite running:"
echo "- Backend:  http://localhost:8000"
echo "- Frontend: http://localhost:3000"
wait
