@echo off
title CrisisMesh AI - Launcher
echo ========================================================
echo  CrisisMesh AI - Emergency Response Intelligence
echo  Team Cognix - Connecting People, AI, and Responders
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://0.0.0.0:8000 ...
start "CrisisMesh Backend" cmd /k "cd /d %~dp0\backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting React Vite Frontend on http://0.0.0.0:5173 ...
set "PATH=C:\Users\ASUS\.gemini\antigravity\scratch\nodejs;%PATH%"
start "CrisisMesh Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo Both servers successfully launched!
echo.
echo - Local Machine:  http://localhost:5173
echo - Mobile / Wi-Fi: http://10.253.126.6:5173
echo - API Docs:       http://localhost:8000/docs
echo.
pause
