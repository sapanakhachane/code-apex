import os
import uuid
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from models import (
    EmergencyCreateRequest, EmergencyStatus, StatusUpdateRequest,
    PriorityOverrideRequest, RescueTeamAssignRequest, RescueTeamStatusUpdateRequest,
    ChatbotRequest, AIAnalysisResult, SeverityLevel
)
from database import db
from ai_engine import analyze_emergency_with_gemini, chatbot_response, check_duplicate_candidates, calculate_haversine_distance

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("CrisisMeshAI.API")

app = FastAPI(
    title="CrisisMesh AI API",
    description="Emergency Response Intelligence backend connecting citizens, AI, authorities, and rescue teams.",
    version="1.0.0"
)

# Enable CORS for Vite dev server & production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager for live real-time incident broadcast
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Error broadcasting to client: {e}")
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial welcome state
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to CrisisMesh AI Real-Time Dispatch Stream",
            "timestamp": datetime.now().isoformat()
        }))
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                if payload.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "timestamp": datetime.now().isoformat()}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket exception: {e}")
        manager.disconnect(websocket)

# ----------------- ENDPOINTS -----------------

@app.get("/")
def root():
    return {
        "project": "CrisisMesh AI – Emergency Response Intelligence",
        "tagline": "Connecting People, AI, and Responders to Save Lives Faster",
        "status": "Operational",
        "demoMode": db.is_demo_mode,
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/dashboard/statistics")
def get_dashboard_statistics():
    """Returns real-time emergency metrics, distributions, and trends for charts."""
    return db.get_dashboard_statistics()

@app.get("/api/emergencies")
def get_emergencies(
    status: Optional[str] = Query(None, description="Filter by emergency status"),
    priority: Optional[str] = Query(None, description="Filter by severity level"),
    emergencyType: Optional[str] = Query(None, description="Filter by emergency category"),
    search: Optional[str] = Query(None, description="Search query")
):
    """Retrieve list of emergency incidents with optional filters."""
    emergencies = db.get_all_emergencies(status=status, priority=priority, emergency_type=emergencyType)
    if search:
        s = search.lower()
        emergencies = [
            e for e in emergencies
            if s in e.get("incidentId", "").lower()
            or s in e.get("description", "").lower()
            or s in e.get("callerName", "").lower()
            or s in e.get("location", {}).get("address", "").lower()
        ]
    return emergencies

@app.get("/api/emergencies/{incident_id}")
def get_emergency_by_id(incident_id: str):
    """Get single emergency incident details by unique ID."""
    inc = db.get_emergency_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@app.post("/api/ai/analyze-emergency")
async def analyze_emergency_preview(payload: Dict[str, Any] = Body(...)):
    """Run AI analysis on emergency description without saving."""
    emergency_type = payload.get("emergencyType", "Other Emergency")
    description = payload.get("description", "")
    affected = int(payload.get("affectedPeople", 1))
    injured = int(payload.get("injuredPeople", 0))
    address = payload.get("address", "Unknown Location")
    has_image = bool(payload.get("imageUrl"))

    analysis = await analyze_emergency_with_gemini(
        emergency_type=emergency_type,
        description=description,
        affected_people=affected,
        injured_people=injured,
        address=address,
        has_image=has_image
    )
    
    # Check duplicate candidates
    lat = float(payload.get("latitude", 0))
    lon = float(payload.get("longitude", 0))
    if lat and lon:
        dup_id = check_duplicate_candidates(emergency_type, lat, lon, description, list(db.emergencies.values()))
        if dup_id:
            analysis.isDuplicatePotential = True
            analysis.duplicateIncidentId = dup_id

    return analysis.model_dump()

@app.post("/api/emergencies", status_code=status.HTTP_201_CREATED)
async def create_emergency(req: EmergencyCreateRequest):
    """
    Submits emergency report:
    1. Validates fields
    2. Runs Gemini AI triage analysis (or heuristic fallback)
    3. Detects potential duplicate incidents
    4. Generates unique incident ID
    5. Saves to database
    6. Broadcasts to WebSocket subscribers
    """
    # 1. Generate unique incident ID
    seq_num = len(db.emergencies) + 9100
    incident_id = f"INC-2026-{seq_num}"

    # 2. Run AI Analysis
    ai_result = await analyze_emergency_with_gemini(
        emergency_type=req.emergencyType.value,
        description=req.description,
        affected_people=req.affectedPeople,
        injured_people=req.injuredPeople,
        address=req.address,
        has_image=bool(req.imageUrl),
        existing_emergencies=list(db.emergencies.values())
    )
    ai_result.incidentId = incident_id

    # 3. Duplicate check
    dup_id = check_duplicate_candidates(
        req.emergencyType.value,
        req.latitude,
        req.longitude,
        req.description,
        list(db.emergencies.values())
    )
    if dup_id:
        ai_result.isDuplicatePotential = True
        ai_result.duplicateIncidentId = dup_id

    # 4. Construct Incident Entity
    now_iso = datetime.now().isoformat()
    incident_data = {
        "incidentId": incident_id,
        "userId": req.userId or "anon_citizen",
        "callerName": req.callerName,
        "contactNumber": req.contactNumber,
        "emergencyType": req.emergencyType.value,
        "description": req.description,
        "affectedPeople": req.affectedPeople,
        "injuredPeople": req.injuredPeople,
        "location": {
            "latitude": req.latitude,
            "longitude": req.longitude,
            "address": req.address,
            "city": "Mumbai",
            "landmark": req.landmark
        },
        "imageUrl": req.imageUrl,
        "priorityScore": ai_result.priorityScore,
        "severity": ai_result.severityLevel.value,
        "status": EmergencyStatus.REPORTED.value,
        "assignedTeamId": None,
        "assignedTeamName": None,
        "aiAnalysis": ai_result.model_dump(),
        "history": [
            {
                "timestamp": now_iso,
                "action": "SOS Emergency Reported",
                "previousStatus": None,
                "newStatus": EmergencyStatus.REPORTED.value,
                "performedBy": req.callerName,
                "notes": "Citizen submitted emergency request via CrisisMesh SOS portal."
            },
            {
                "timestamp": now_iso,
                "action": "AI Triage Completed",
                "previousStatus": EmergencyStatus.REPORTED.value,
                "newStatus": EmergencyStatus.UNDER_REVIEW.value,
                "performedBy": "CrisisMesh AI Engine",
                "notes": f"Classified as {ai_result.severityLevel.value} Priority (Score {ai_result.priorityScore}/100)."
            }
        ],
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "isDemo": True
    }
    
    # Transition to Under Review
    incident_data["status"] = EmergencyStatus.UNDER_REVIEW.value

    # 5. Persist
    saved = db.add_emergency(incident_data)

    # 6. Real-time Broadcast
    await manager.broadcast({
        "type": "NEW_EMERGENCY",
        "incident": saved,
        "timestamp": now_iso
    })

    return saved

@app.patch("/api/emergencies/{incident_id}/status")
async def update_emergency_status(incident_id: str, req: StatusUpdateRequest):
    """Update emergency workflow status (Authority or Rescue dispatch)."""
    updated = db.update_emergency_status(
        incident_id=incident_id,
        new_status=req.status.value,
        notes=req.notes,
        updated_by=req.updatedBy or "Authority Command"
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")

    await manager.broadcast({
        "type": "STATUS_UPDATE",
        "incidentId": incident_id,
        "status": req.status.value,
        "incident": updated,
        "timestamp": datetime.now().isoformat()
    })
    return updated

@app.patch("/api/emergencies/{incident_id}/priority")
async def override_priority(incident_id: str, req: PriorityOverrideRequest):
    """Authority override of AI-generated priority score and severity level."""
    updated = db.override_priority(
        incident_id=incident_id,
        new_score=req.newPriorityScore,
        new_severity=req.newSeverity.value,
        reason=req.overrideReason,
        override_by=req.overrideBy or "Command Chief"
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")

    await manager.broadcast({
        "type": "PRIORITY_OVERRIDE",
        "incidentId": incident_id,
        "newPriorityScore": req.newPriorityScore,
        "newSeverity": req.newSeverity.value,
        "incident": updated,
        "timestamp": datetime.now().isoformat()
    })
    return updated

@app.get("/api/rescue-teams")
def get_rescue_teams():
    """Retrieve all emergency response teams and their real-time availability."""
    return list(db.rescue_teams.values())

@app.post("/api/rescue-teams/assign")
async def assign_rescue_team(req: RescueTeamAssignRequest):
    """Assigns rescue team to an incident and flags team availability."""
    updated = db.assign_rescue_team(
        incident_id=req.incidentId,
        team_id=req.teamId,
        assigned_by=req.assignedBy or "Authority Dispatcher"
    )
    if not updated:
        raise HTTPException(status_code=400, detail="Could not assign team. Verify incidentId and teamId.")

    await manager.broadcast({
        "type": "RESCUE_TEAM_ASSIGNED",
        "incidentId": req.incidentId,
        "teamId": req.teamId,
        "incident": updated,
        "timestamp": datetime.now().isoformat()
    })
    return updated

@app.patch("/api/rescue-teams/status")
async def update_rescue_team_mission_status(req: RescueTeamStatusUpdateRequest):
    """Rescue teams update their on-ground mission status (6 stages)."""
    team = db.rescue_teams.get(req.teamId)
    inc = db.emergencies.get(req.incidentId)
    if not team or not inc:
        raise HTTPException(status_code=404, detail="Team or Incident not found")

    status_val = req.status.value
    team["availabilityStatus"] = status_val
    
    # Map team status to incident status
    if status_val == "Accepted":
        inc_status = EmergencyStatus.TEAM_ASSIGNED.value
    elif status_val == "On the Way":
        inc_status = EmergencyStatus.DISPATCHED.value
    elif status_val in ["Arrived", "Rescue in Progress"]:
        inc_status = EmergencyStatus.IN_PROGRESS.value
    elif status_val == "Completed":
        inc_status = EmergencyStatus.RESOLVED.value
        team["availabilityStatus"] = "Available"
        team["currentIncidentId"] = None
    else:
        inc_status = inc["status"]

    updated_inc = db.update_emergency_status(
        incident_id=req.incidentId,
        new_status=inc_status,
        notes=f"Rescue Team '{team['teamName']}' reported status: {status_val}. {req.notes or ''}",
        updated_by=f"Responder ({team['teamName']})"
    )

    await manager.broadcast({
        "type": "TEAM_STATUS_UPDATE",
        "teamId": req.teamId,
        "teamStatus": status_val,
        "incidentId": req.incidentId,
        "incidentStatus": inc_status,
        "incident": updated_inc,
        "timestamp": datetime.now().isoformat()
    })
    return {"status": "success", "team": team, "incident": updated_inc}

@app.get("/api/hospitals")
def get_hospitals(
    lat: Optional[float] = Query(19.0760, description="Latitude for distance calculation"),
    lon: Optional[float] = Query(72.8777, description="Longitude for distance calculation")
):
    """Retrieve nearby hospitals with distance calculations and trauma facility info."""
    return db.get_nearby_hospitals(lat, lon)

@app.post("/api/chatbot")
async def chat_with_assistant(req: ChatbotRequest):
    """CrisisMesh AI Assistant powered by Google Gemini with emergency guidance."""
    res = await chatbot_response(req.message, language=req.language or "English")
    return res

@app.get("/api/notifications")
def get_notifications(userId: Optional[str] = Query(None)):
    """Retrieve active alert notifications."""
    if userId:
        return [n for n in db.notifications if n.get("userId") == userId or n.get("userId") == "usr_authority"]
    return db.notifications

@app.post("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Mark a notification as read."""
    for n in db.notifications:
        if n.get("notificationId") == notification_id:
            n["read"] = True
            return {"status": "success", "notificationId": notification_id}
    return {"status": "not_found"}

@app.post("/api/demo/reset")
def reset_demo_database():
    """Reset the database to rich pre-configured international hackathon sample dataset."""
    db.init_demo_dataset()
    return {"status": "success", "message": "Demo incidents, teams, and hospitals re-initialized."}
