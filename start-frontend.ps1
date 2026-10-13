# Start CrisisMesh AI React Frontend
Write-Host "🌐 Starting CrisisMesh AI Frontend on http://localhost:5173 ..." -ForegroundColor Green
$env:PATH = "C:\Users\ASUS\.gemini\antigravity\scratch\nodejs;$env:PATH"
Set-Location -Path "$PSScriptRoot\frontend"
npm run dev
