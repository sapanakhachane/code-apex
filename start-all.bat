@echo off
title CrisisMesh AI - Launcher
echo ========================================================
echo  CrisisMesh AI - Emergency Response Intelligence
echo  Team Cognix - Connecting People, AI, and Responders
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://localhost:8000 ...
start "CrisisMesh Backend" cmd /k "cd /d %~dp0\backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
set "PATH=C:\Users\ASUS\.gemini\antigravity\scratch\nodejs;%PATH%"
start "CrisisMesh Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Both servers launched in dedicated windows!
echo Access the application at: http://localhost:5173
echo API Swagger documentation at: http://localhost:8000/docs
echo.
pause
