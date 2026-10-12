# Start CrisisMesh AI React Frontend
Write-Host "🌐 Starting CrisisMesh AI Frontend on http://0.0.0.0:5173 ..." -ForegroundColor Green
$env:PATH = "C:\Users\ASUS\.gemini\antigravity\scratch\nodejs;$env:PATH"
Set-Location -Path "$PSScriptRoot\frontend"
npm run dev -- --host 0.0.0.0 --port 5173
