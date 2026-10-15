# 🚨 CrisisMesh AI – Emergency Response Intelligence

> **Tagline:** Connecting People, AI, and Responders to Save Lives Faster.  
> **Team:** Cognix  
> **Project Category:** AI for Social Good / Disaster Management / International Hackathon MVP

---

## 🌟 Executive Summary

**CrisisMesh AI** is a full-stack, AI-powered emergency command and dispatch intelligence platform. It bridges citizens, emergency dispatch authorities, specialized rescue teams (Fire, Hazmat, Medical ALS, Disaster SDRF, Police), and nearby trauma hospitals into a single unified telemetry and response system.

---

## 🚀 Key Innovations & Features

### 1. 🔴 AI-Powered Emergency SOS Reporting
- **Instant Geolocation:** Browser Geolocation API detects GPS coordinates with manual fallback.
- **Multi-Factor Triage Input:** Casualties, trapped status, hazards, image uploads, and description.
- **Large Animated SOS Trigger:** Immediate transmission with zero delay.

### 2. 🧠 Google Gemini AI Severity Prediction (0–100 Triage Score)
- **Triage Priority Spectrum:**
  - 🟢 **0–25:** Low Priority (Municipal maintenance, non-life threats)
  - 🟡 **26–50:** Moderate Priority (Urgent caution, property risks)
  - 🟠 **51–75:** High Priority (Direct injury risk, structural damage)
  - 🔴 **76–100:** Critical Priority (Immediate danger to life, multi-casualty)
- **Multi-Factor Reasoning:** Danger keywords, injury counts, and urgency heuristics.
- **Resilient Fallback Engine:** If `GEMINI_API_KEY` is not provided, an integrated clinical heuristic triage engine ensures zero downtime.
- **Ethical Safeguard:** AI scores are strictly advisory. Human dispatchers retain full override authority. No distress beacon is ever rejected automatically.

### 3. 🗺️ Live Emergency Tactical Map
- Real-time GIS map powered by OpenStreetMap (OSM) tiles and Leaflet.
- Color-coded severity markers (Critical, High, Moderate, Low).
- Interactive popup overlays with status and responder assignments.
- Toggleable Trauma Hospital layer with direct directions via Google Maps.
- Filter by Incident Type, Severity, and Lifecycle Status.

### 4. 🎖️ Authority Command Cockpit
- Real-time KPIs: Active cases, critical alerts, pending reviews, available teams.
- **Interactive Recharts Visualizations:**
  - Emergency Type Distribution (Bar Chart)
  - Severity Proportions (Donut Chart)
  - 24-Hour Inflow Trends (Area Chart)
- **Command Action Suite:** Override priority, adjust status, and assign specialized rescue teams with smart proximity recommendations.

### 5. 🚒 Rescue Team Field HUD
- Dedicated responder interface displaying assigned missions and GPS coordinates.
- **6-Stage Mission Progression:**
  1. `Assigned` ➔ 2. `Accepted` ➔ 3. `On the Way` ➔ 4. `Arrived` ➔ 5. `Rescue in Progress` ➔ 6. `Completed`
- Instant synchronization with Central Command and Citizen Live Tracker.
- Unit equipment and tactical gear checklist.

### 6. ⏱️ 7-Stage Live Citizen Tracking
- Real-time lifecycle stepper tracking:
  `Emergency Reported` ➔ `Report Received` ➔ `Under Authority Review` ➔ `Rescue Team Assigned` ➔ `Rescue Team Dispatched` ➔ `Response in Progress` ➔ `Emergency Resolved`
- Transparent tactical audit history trail.

### 7. 🤖 CrisisMesh AI Assistant
- Conversational emergency guidance powered by Google Gemini.
- Multilingual support: **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
- Step-by-step instructions for CPR, apartment fires, flash flooding, and vehicular triage.
- Prominent disclaimers and 1-click 112 / 911 calling integration.

### 8. 🏥 Nearby Trauma Hospital Discovery
- Geolocation distance calculation to Level-1 and Level-2 trauma centers.
- Details ICU availability, burn specialty units, and telephone hotlines.
- Direct Google Maps routing.

### 9. 💡 Advanced Innovative Hackathon Additions
- **A. Spatial Duplicate Detection:** Flags potential duplicate calls (<1.2km radius) to avoid redundant responder deployment.
- **B. Emergency Confidence Score:** Rates data completeness, contact validity, and photographic evidence.
- **C. Smart Unit Recommendation:** Algorithmic ranking of rescue teams by capability and proximity.
- **D. 1-Click Role Switcher:** Instant persona evaluation for hackathon juries (Citizen, Commander, Rescue Unit, Hospital Chief).

### 10. 🌤️ Open-Meteo Weather & Disaster Intelligence (New)
- **Zero-Key Meteorological Synchronization:** Real-time temperature, wind vectors, wind gusts, humidity, pressure, and precipitation via the free, open-source [Open-Meteo API](https://open-meteo.com/).
- **Tactical Disaster Threat Evaluation:**
  - 🔥 **Wildfire Spread Hazard:** Monitors high winds & heat indexing to alert dispatchers of accelerating fire lines.
  - 🌊 **Flash Flood Surge Risk:** Real-time precipitation rate monitoring against urban drainage thresholds.
  - 🚁 **Aerial Drone & Helicopter Rescue Status:** Evaluates wind shear and cloud ceiling for air ambulance / drone reconnaissance feasibility.
- **Live GIS Map Radar Overlay:** Micro-climate weather badges on every emergency marker popup with an interactive floating meteorological HUD.
- **Global Open-Meteo Geocoding Search:** Search and inspect real-time weather across any city or coordinates worldwide.
- **Incident Reporting Weather Telemetry:** Automatically fetches micro-climate conditions when coordinates or GPS are detected during SOS beacon generation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide React, Recharts, Leaflet |
| **Backend** | Python 3.13, FastAPI, Uvicorn, WebSockets, Pydantic, HTTPX |
| **Meteorology & GIS** | Open-Meteo Weather Forecast API, Open-Meteo Geocoding API, OpenStreetMap (OSM) |
| **AI Integration** | Google Gemini 1.5 Flash API + Algorithmic Triage Engine |
| **Database & Auth** | Firebase Firestore / Auth + Resilient In-Memory & Local Demo Adapter |
| **Deployment** | Vercel (`vercel.json`) & Render (`render.yaml`, `Procfile`) |

---

## 💻 Installation & Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ (Node.js portable included in scratch directory)

### 1. Clone & Setup Repository
```bash
git clone https://github.com/team-cognix/crisismesh-ai.git
cd crisismesh-ai
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Optional: Set GEMINI_API_KEY in .env
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API will be live at: `http://localhost:8000`
- Interactive Swagger docs at: `http://localhost:8000/docs`

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
- Web Application will be live at: `http://localhost:5173`

### 4. 1-Click Windows Batch Run
Double-click `start-all.bat` or run:
```powershell
.\start-all.bat
```

---

## 🎭 Demo Accounts (For Live Evaluation)

| Persona | Name | Role | Direct Dashboard |
|---|---|---|---|
| 👨‍💼 **Citizen** | Dr. Rajesh Sharma | Citizen Reporter | `/citizen-dashboard` |
| 🎖️ **Authority** | Dir. K. Verma | Authority Commander | `/authority-dashboard` |
| 🚑 **Rescue Unit** | Capt. Amit Singh | Paramedic ALS Lead | `/rescue-dashboard` |
| 🏥 **Hospital Chief** | Dr. Ananya Roy | Trauma Director | `/hospitals` |

*Note: Use the top-right persona dropdown in the navigation bar to switch roles in 1 click!*

---

## 🛡️ Ethical AI & Medical Safety Notice
CrisisMesh AI severity classification is an advisory operational tool designed to augment human responders. It is **not** a diagnostic medical instrument. In any real-world emergency, dial **112** (India) or **911** (US) immediately.

---

**Developed with ❤️ for International Hackathon by Team Cognix.**
