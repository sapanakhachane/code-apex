# Start CrisisMesh AI FastAPI Backend
Write-Host "🚨 Starting CrisisMesh AI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
