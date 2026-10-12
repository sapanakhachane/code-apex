import os
import json
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from models import (
    EmergencyIncident, EmergencyType, SeverityLevel, EmergencyStatus,
    RescueTeam, Hospital, AIAnalysisResult, LocationModel, HistoryEntry
)
from ai_engine import calculate_haversine_distance

logger = logging.getLogger("CrisisMeshAI.Database")

class CrisisMeshDatabase:
    def __init__(self):
        self.emergencies: Dict[str, Dict[str, Any]] = {}
        self.rescue_teams: Dict[str, Dict[str, Any]] = {}
        self.hospitals: List[Dict[str, Any]] = []
        self.notifications: List[Dict[str, Any]] = []
        self.users: Dict[str, Dict[str, Any]] = {}
        self.is_demo_mode: bool = True
        self.init_demo_dataset()

    def init_demo_dataset(self):
        """Initializes rich, realistic demo incidents, rescue teams, and hospitals."""
        now_str = datetime.now().isoformat()
        
        # 1. Demo Rescue Teams
        teams = [
            {
                "teamId": "TEAM-FIRE-01",
                "teamName": "Metro Fire & Hazmat Unit 4",
                "teamType": "Fire Emergency",
                "contactNumber": "+91 98201 11001",
                "baseLocation": {
                    "latitude": 19.0760,
                    "longitude": 72.8777,
                    "address": "Bandra Fire Station, Linking Rd",
                    "city": "Mumbai"
                },
                "availabilityStatus": "Available",
                "currentIncidentId": None,
                "membersCount": 8,
                "equipment": ["Thermal Imaging Camera", "Water Foam Tender", "Jaws of Life", "Hazmat Suits"]
            },
            {
                "teamId": "TEAM-MED-02",
                "teamName": "Rapid ALS Trauma Ambulance 12",
                "teamType": "Medical Emergency",
                "contactNumber": "+91 98202 22002",
                "baseLocation": {
                    "latitude": 19.0178,
                    "longitude": 72.8478,
                    "address": "Dadar Emergency Depot, Senapati Bapat Marg",
                    "city": "Mumbai"
                },
                "availabilityStatus": "En Route",
                "currentIncidentId": "INC-2026-9041",
                "membersCount": 4,
                "equipment": ["Defibrillator (AED)", "Portable Ventilator", "Trauma Splints", "Blood Storage"]
            },
            {
                "teamId": "TEAM-NDRF-03",
                "teamName": "SDRF Disaster & Flood Rescue Unit 8",
                "teamType": "Natural Disaster",
                "contactNumber": "+91 98203 33003",
                "baseLocation": {
                    "latitude": 19.1136,
                    "longitude": 72.8697,
                    "address": "Andheri Disaster Command Center",
                    "city": "Mumbai"
                },
                "availabilityStatus": "Available",
                "currentIncidentId": None,
                "membersCount": 12,
                "equipment": ["Zodiac Inflatable Boats", "Acoustic Life Detectors", "Heavy Concrete Cutters", "Drones"]
            },
            {
                "teamId": "TEAM-POL-04",
                "teamName": "Highway Emergency Patrol Unit 9",
                "teamType": "Road Accident",
                "contactNumber": "+91 98204 44004",
                "baseLocation": {
                    "latitude": 19.0596,
                    "longitude": 72.8295,
                    "address": "Worli Sea Face Tactical Post",
                    "city": "Mumbai"
                },
                "availabilityStatus": "Available",
                "currentIncidentId": None,
                "membersCount": 5,
                "equipment": ["Spill Neutralizer", "Hydraulic Cutters", "Traffic Diverters", "First Aid Kit"]
            }
        ]
        self.rescue_teams = {t["teamId"]: t for t in teams}

        # 2. Demo Hospitals (Near Mumbai / Central Metro region for accurate real maps)
        self.hospitals = [
            {
                "id": "HOSP-01",
                "name": "Lilavati Hospital & Research Centre",
                "address": "A-791, Bandra Reclamation, Bandra West, Mumbai",
                "latitude": 19.0514,
                "longitude": 72.8291,
                "phone": "+91 22 2675 1000",
                "specialties": ["Level-1 Trauma", "Emergency Medicine", "Cardiac ICU", "Neurology"],
                "hasICU": True,
                "hasBurnUnit": True,
                "traumaLevel": "Level 1"
            },
            {
                "id": "HOSP-02",
                "name": "KEM Municipal Medical Hospital & Trauma Center",
                "address": "Acharya Donde Marg, Parel, Mumbai",
                "latitude": 19.0033,
                "longitude": 72.8427,
                "phone": "+91 22 2410 7000",
                "specialties": ["Public Super-Specialty", "Major Trauma", "Burn ICU", "Pediatric Trauma"],
                "hasICU": True,
                "hasBurnUnit": True,
                "traumaLevel": "Level 1"
            },
            {
                "id": "HOSP-03",
                "name": "Kokilaben Dhirubhai Ambani Hospital",
                "address": "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West",
                "latitude": 19.1311,
                "longitude": 72.8252,
                "phone": "+91 22 4269 6969",
                "specialties": ["Critical Care", "Advanced Cardiac Life Support", "Spine Trauma", "Stroke Unit"],
                "hasICU": True,
                "hasBurnUnit": False,
                "traumaLevel": "Level 1"
            },
            {
                "id": "HOSP-04",
                "name": "Hinduja Hospital & Medical Research",
                "address": "Veer Savarkar Marg, Mahim, Mumbai",
                "latitude": 19.0330,
                "longitude": 72.8397,
                "phone": "+91 22 2445 1515",
                "specialties": ["24x7 Emergency", "Critical Resuscitation", "Cardiothoracic Surgery"],
                "hasICU": True,
                "hasBurnUnit": False,
                "traumaLevel": "Level 2"
            },
            {
                "id": "HOSP-05",
                "name": "Nanavati Max Super Speciality Hospital",
                "address": "SV Road, LIC Colony, Suresh Colony, Vile Parle West",
                "latitude": 19.0968,
                "longitude": 72.8413,
                "phone": "+91 22 6836 0000",
                "specialties": ["Accident Emergency", "Advanced Life Support", "Hyperbaric Oxygen"],
                "hasICU": True,
                "hasBurnUnit": True,
                "traumaLevel": "Level 1"
            }
        ]

        # 3. Pre-populated Incidents across Priority spectrum
        incidents = [
            {
                "incidentId": "INC-2026-9041",
                "userId": "usr_citizen_01",
                "callerName": "Dr. Rajesh Sharma",
                "contactNumber": "+91 98765 43210",
                "emergencyType": "Road Accident",
                "description": "Multi-vehicle collision on Western Express Highway flyover. Two passengers trapped inside compressed cab; fuel leaking onto road.",
                "affectedPeople": 5,
                "injuredPeople": 3,
                "location": {
                    "latitude": 19.0600,
                    "longitude": 72.8520,
                    "address": "WEH Flyover, Near Kalanagar Junction, Bandra East",
                    "city": "Mumbai",
                    "landmark": "Near Kalanagar signal"
                },
                "imageUrl": "https://images.unsplash.com/photo-1543465077-db45d34b88a5?auto=format&fit=crop&w=800&q=80",
                "priorityScore": 92,
                "severity": "Critical",
                "status": "Response in Progress",
                "assignedTeamId": "TEAM-MED-02",
                "assignedTeamName": "Rapid ALS Trauma Ambulance 12",
                "aiAnalysis": {
                    "incidentId": "INC-2026-9041",
                    "emergencyCategory": "Road Accident",
                    "priorityScore": 92,
                    "severityLevel": "Critical",
                    "explanation": "Critical multi-casualty vehicular accident with structural entrapment and hazardous flammable fuel leak requiring dual-service emergency dispatch.",
                    "suggestedResponseCategory": "ALS Trauma Ambulance & Hydraulic Rescue",
                    "aiConfidenceIndicator": "97% Gemini Neural Triage",
                    "confidenceScore": 94,
                    "recommendedNextSteps": [
                        "Divert expressway traffic to service road",
                        "Deploy foam blanket for fuel hazard",
                        "Extract trapped victims with Jaws of Life",
                        "Triage with Lilavati Hospital Trauma Bay"
                    ],
                    "isDuplicatePotential": False,
                    "duplicateIncidentId": None,
                    "isFallback": False
                },
                "history": [
                    {
                        "timestamp": "2026-10-12T18:15:20",
                        "action": "SOS Generated",
                        "previousStatus": None,
                        "newStatus": "Emergency Reported",
                        "performedBy": "Dr. Rajesh Sharma",
                        "notes": "Report submitted via Mobile SOS trigger."
                    },
                    {
                        "timestamp": "2026-10-12T18:16:02",
                        "action": "AI Severity Classification",
                        "previousStatus": "Emergency Reported",
                        "newStatus": "Under Authority Review",
                        "performedBy": "CrisisMesh AI Engine",
                        "notes": "Assigned Critical Priority Score (92/100)."
                    },
                    {
                        "timestamp": "2026-10-12T18:18:30",
                        "action": "Rescue Team Dispatched",
                        "previousStatus": "Under Authority Review",
                        "newStatus": "Response in Progress",
                        "performedBy": "Commander K. Verma (Command Control)",
                        "notes": "Assigned ALS Trauma Ambulance 12."
                    }
                ],
                "createdAt": "2026-10-12T18:15:20",
                "updatedAt": "2026-10-12T18:18:30",
                "isDemo": True
            },
            {
                "incidentId": "INC-2026-8812",
                "userId": "usr_citizen_02",
                "callerName": "Pooja Deshmukh",
                "contactNumber": "+91 97654 32109",
                "emergencyType": "Fire Emergency",
                "description": "Thick black smoke billowing from 4th floor chemical warehouse. Alarms ringing, workers evacuating, 2 security staff unaccounted for.",
                "affectedPeople": 8,
                "injuredPeople": 1,
                "location": {
                    "latitude": 19.1197,
                    "longitude": 72.8850,
                    "address": "MIDC Industrial Estate, Andheri East",
                    "city": "Mumbai",
                    "landmark": "Near Seepz Gate 1"
                },
                "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
                "priorityScore": 84,
                "severity": "Critical",
                "status": "Rescue Team Assigned",
                "assignedTeamId": "TEAM-FIRE-01",
                "assignedTeamName": "Metro Fire & Hazmat Unit 4",
                "aiAnalysis": {
                    "incidentId": "INC-2026-8812",
                    "emergencyCategory": "Fire Emergency",
                    "priorityScore": 84,
                    "severityLevel": "Critical",
                    "explanation": "Industrial chemical fire with toxic smoke generation and potential unaccounted occupants; elevated flashover danger.",
                    "suggestedResponseCategory": "Fire & Hazmat Heavy Tender",
                    "aiConfidenceIndicator": "94% Gemini Neural Triage",
                    "confidenceScore": 91,
                    "recommendedNextSteps": [
                        "Isolate 300m perimeter from downwind toxic gas",
                        "Deploy aerial water monitor",
                        "Search building ground access points"
                    ],
                    "isDuplicatePotential": False,
                    "duplicateIncidentId": None,
                    "isFallback": False
                },
                "history": [
                    {
                        "timestamp": "2026-10-12T17:40:10",
                        "action": "SOS Generated",
                        "previousStatus": None,
                        "newStatus": "Emergency Reported",
                        "performedBy": "Pooja Deshmukh",
                        "notes": "Citizen verified report."
                    },
                    {
                        "timestamp": "2026-10-12T17:42:00",
                        "action": "Assigned Rescue Unit",
                        "previousStatus": "Under Authority Review",
                        "newStatus": "Rescue Team Assigned",
                        "performedBy": "Authority Dispatcher",
                        "notes": "Metro Fire & Hazmat Unit 4 dispatched."
                    }
                ],
                "createdAt": "2026-10-12T17:40:10",
                "updatedAt": "2026-10-12T17:42:00",
                "isDemo": True
            },
            {
                "incidentId": "INC-2026-7734",
                "userId": "usr_citizen_03",
                "callerName": "Anand Kulkarni",
                "contactNumber": "+91 99887 76655",
                "emergencyType": "Flood",
                "description": "Flash waterlogging under Milan subway reaching 4 feet. Two auto-rickshaws stalled with passengers waiting on roofs.",
                "affectedPeople": 6,
                "injuredPeople": 0,
                "location": {
                    "latitude": 19.0905,
                    "longitude": 72.8425,
                    "address": "Milan Subway, Santacruz West",
                    "city": "Mumbai",
                    "landmark": "Near SV Road junction"
                },
                "imageUrl": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
                "priorityScore": 64,
                "severity": "High",
                "status": "Under Authority Review",
                "assignedTeamId": None,
                "assignedTeamName": None,
                "aiAnalysis": {
                    "incidentId": "INC-2026-7734",
                    "emergencyCategory": "Flood",
                    "priorityScore": 64,
                    "severityLevel": "High",
                    "explanation": "Urban flash flooding with marooned civilian transport. Rising water levels pose hypothermia and electrical shock risk.",
                    "suggestedResponseCategory": "SDRF Water Rescue & Traffic Police",
                    "aiConfidenceIndicator": "91% Gemini Neural Triage",
                    "confidenceScore": 88,
                    "recommendedNextSteps": [
                        "Shut down subway entrance barricades",
                        "Deploy high-volume dewatering pumps",
                        "Evacuate stranded passengers via safety ropes"
                    ],
                    "isDuplicatePotential": False,
                    "duplicateIncidentId": None,
                    "isFallback": False
                },
                "history": [
                    {
                        "timestamp": "2026-10-12T18:02:15",
                        "action": "SOS Generated",
                        "previousStatus": None,
                        "newStatus": "Report Received",
                        "performedBy": "Anand Kulkarni",
                        "notes": "GPS Geolocation tagged."
                    }
                ],
                "createdAt": "2026-10-12T18:02:15",
                "updatedAt": "2026-10-12T18:02:15",
                "isDemo": True
            },
            {
                "incidentId": "INC-2026-6219",
                "userId": "usr_citizen_04",
                "callerName": "Suresh Nair",
                "contactNumber": "+91 91234 56780",
                "emergencyType": "Medical Emergency",
                "description": "Elderly gentleman collapsed on Jogger's Park walkway. Pulse weak, shallow breathing, bystanders attempting chest compressions.",
                "affectedPeople": 1,
                "injuredPeople": 1,
                "location": {
                    "latitude": 19.0620,
                    "longitude": 72.8228,
                    "address": "Jogger's Park, Carter Road, Bandra West",
                    "city": "Mumbai",
                    "landmark": "Near waterfront amphitheatre"
                },
                "imageUrl": None,
                "priorityScore": 73,
                "severity": "High",
                "status": "Rescue Team Dispatched",
                "assignedTeamId": "TEAM-MED-02",
                "assignedTeamName": "Rapid ALS Trauma Ambulance 12",
                "aiAnalysis": {
                    "incidentId": "INC-2026-6219",
                    "emergencyCategory": "Medical Emergency",
                    "priorityScore": 73,
                    "severityLevel": "High",
                    "explanation": "Presumed cardiac arrest in public space requiring rapid defibrillation and advanced airway support.",
                    "suggestedResponseCategory": "Advanced Cardiac Life Support",
                    "aiConfidenceIndicator": "93% Gemini Neural Triage",
                    "confidenceScore": 89,
                    "recommendedNextSteps": [
                        "Direct bystander to keep rhythmic chest compressions",
                        "Locate public AED if park clubhouse has one",
                        "Dispatch nearest paramedic with defibrillator"
                    ],
                    "isDuplicatePotential": False,
                    "duplicateIncidentId": None,
                    "isFallback": False
                },
                "history": [
                    {
                        "timestamp": "2026-10-12T18:25:00",
                        "action": "SOS Generated",
                        "previousStatus": None,
                        "newStatus": "Emergency Reported",
                        "performedBy": "Suresh Nair",
                        "notes": "Medical emergency flagged."
                    }
                ],
                "createdAt": "2026-10-12T18:25:00",
                "updatedAt": "2026-10-12T18:27:00",
                "isDemo": True
            },
            {
                "incidentId": "INC-2026-5100",
                "userId": "usr_citizen_05",
                "callerName": "Sunita Patil",
                "contactNumber": "+91 94567 89012",
                "emergencyType": "Other Emergency",
                "description": "Fallen banyan tree branch blocking one lane of residential road. No injuries, power line hanging low but intact.",
                "affectedPeople": 0,
                "injuredPeople": 0,
                "location": {
                    "latitude": 19.0200,
                    "longitude": 72.8350,
                    "address": "Prabhadevi Road, Near Siddhivinayak Temple",
                    "city": "Mumbai",
                    "landmark": "Opposite municipal garden"
                },
                "imageUrl": None,
                "priorityScore": 32,
                "severity": "Moderate",
                "status": "Emergency Resolved",
                "assignedTeamId": "TEAM-POL-04",
                "assignedTeamName": "Highway Emergency Patrol Unit 9",
                "aiAnalysis": {
                    "incidentId": "INC-2026-5100",
                    "emergencyCategory": "Other Emergency",
                    "priorityScore": 32,
                    "severityLevel": "Moderate",
                    "explanation": "Obstruction of public roadway with low hazard level; no casualties reported.",
                    "suggestedResponseCategory": "Municipal Tree & Road Maintenance",
                    "aiConfidenceIndicator": "90% Gemini Neural Triage",
                    "confidenceScore": 82,
                    "recommendedNextSteps": [
                        "Cord off electrical wire zone",
                        "Deploy municipal chainsaw team",
                        "Restore lane flow"
                    ],
                    "isDuplicatePotential": False,
                    "duplicateIncidentId": None,
                    "isFallback": False
                },
                "history": [
                    {
                        "timestamp": "2026-10-12T15:00:00",
                        "action": "Reported",
                        "previousStatus": None,
                        "newStatus": "Report Received",
                        "performedBy": "Sunita Patil",
                        "notes": "Standard submission."
                    },
                    {
                        "timestamp": "2026-10-12T16:15:00",
                        "action": "Completed Cleanup",
                        "previousStatus": "Response in Progress",
                        "newStatus": "Emergency Resolved",
                        "performedBy": "Patrol Officer",
                        "notes": "Obstruction removed safely."
                    }
                ],
                "createdAt": "2026-10-12T15:00:00",
                "updatedAt": "2026-10-12T16:15:00",
                "isDemo": True
            }
        ]
        self.emergencies = {inc["incidentId"]: inc for inc in incidents}

        # 4. Demo Notifications
        self.notifications = [
            {
                "notificationId": "notif-01",
                "userId": "usr_authority",
                "incidentId": "INC-2026-9041",
                "title": "🚨 CRITICAL: Multi-Vehicle Collision",
                "message": "AI priority score 92/100 on WEH Flyover Bandra. 3 casualties reported.",
                "read": False,
                "createdAt": "2026-10-12T18:15:20",
                "severity": "Critical"
            },
            {
                "notificationId": "notif-02",
                "userId": "usr_rescue_med",
                "incidentId": "INC-2026-9041",
                "title": "🚑 Mission Assigned",
                "message": "Trauma Ambulance 12 dispatched to WEH Flyover incident.",
                "read": False,
                "createdAt": "2026-10-12T18:18:30",
                "severity": "Critical"
            },
            {
                "notificationId": "notif-03",
                "userId": "usr_authority",
                "incidentId": "INC-2026-8812",
                "title": "🔥 Industrial Fire Alert",
                "message": "Chemical warehouse fire in MIDC Andheri East assigned to Hazmat Unit 4.",
                "read": True,
                "createdAt": "2026-10-12T17:42:00",
                "severity": "Critical"
            }
        ]

        # 5. Demo Role Users
        self.users = {
            "citizen@crisismesh.ai": {
                "uid": "usr_citizen_01",
                "email": "citizen@crisismesh.ai",
                "name": "Dr. Rajesh Sharma",
                "phone": "+91 98765 43210",
                "role": "Citizen",
                "approved": True
            },
            "commander@crisismesh.ai": {
                "uid": "usr_authority",
                "email": "commander@crisismesh.ai",
                "name": "Director K. Verma",
                "phone": "+91 99999 11223",
                "role": "Authority",
                "approved": True
            },
            "rescue@crisismesh.ai": {
                "uid": "usr_rescue_med",
                "email": "rescue@crisismesh.ai",
                "name": "Capt. Amit Singh (Ambulance 12)",
                "phone": "+91 98202 22002",
                "role": "Rescue Team",
                "teamId": "TEAM-MED-02",
                "approved": True
            },
            "hospital@crisismesh.ai": {
                "uid": "usr_hosp_admin",
                "email": "hospital@crisismesh.ai",
                "name": "Dr. Ananya Roy (Lilavati Trauma Chief)",
                "phone": "+91 22 2675 1000",
                "role": "Hospital Administrator",
                "approved": True
            }
        }

    # Data Accessors
    def get_all_emergencies(self, status: Optional[str] = None, priority: Optional[str] = None, emergency_type: Optional[str] = None) -> List[Dict[str, Any]]:
        results = list(self.emergencies.values())
        if status:
            results = [r for r in results if r.get("status") == status]
        if priority:
            results = [r for r in results if r.get("severity") == priority]
        if emergency_type:
            results = [r for r in results if r.get("emergencyType") == emergency_type]
        # Sort descending by priority score and recency
        results.sort(key=lambda x: (x.get("priorityScore", 0), x.get("createdAt", "")), reverse=True)
        return results

    def get_emergency_by_id(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self.emergencies.get(incident_id)

    def add_emergency(self, emergency_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.emergencies[emergency_dict["incidentId"]] = emergency_dict
        # Auto-create notification for authorities
        notif = {
            "notificationId": f"notif-{uuid.uuid4().hex[:8]}",
            "userId": "usr_authority",
            "incidentId": emergency_dict["incidentId"],
            "title": f"🚨 NEW {emergency_dict.get('severity', 'Emergency').upper()}: {emergency_dict.get('emergencyType')}",
            "message": f"Score {emergency_dict.get('priorityScore')}/100 reported at {emergency_dict.get('location', {}).get('address', 'Unknown location')}",
            "read": False,
            "createdAt": datetime.now().isoformat(),
            "severity": emergency_dict.get("severity")
        }
        self.notifications.insert(0, notif)
        return emergency_dict

    def update_emergency_status(self, incident_id: str, new_status: str, notes: Optional[str] = None, updated_by: str = "Authority Control") -> Optional[Dict[str, Any]]:
        inc = self.emergencies.get(incident_id)
        if not inc:
            return None
        prev_status = inc.get("status")
        inc["status"] = new_status
        inc["updatedAt"] = datetime.now().isoformat()
        
        history_item = {
            "timestamp": datetime.now().isoformat(),
            "action": f"Status updated to {new_status}",
            "previousStatus": prev_status,
            "newStatus": new_status,
            "performedBy": updated_by,
            "notes": notes or "Status progression logged."
        }
        inc.setdefault("history", []).append(history_item)
        
        # Also notify caller citizen
        self.notifications.insert(0, {
            "notificationId": f"notif-{uuid.uuid4().hex[:8]}",
            "userId": inc.get("userId"),
            "incidentId": incident_id,
            "title": f"Status Updated: {new_status}",
            "message": f"Incident {incident_id} is now marked as {new_status}.",
            "read": False,
            "createdAt": datetime.now().isoformat(),
            "severity": inc.get("severity")
        })
        return inc

    def override_priority(self, incident_id: str, new_score: int, new_severity: str, reason: str, override_by: str) -> Optional[Dict[str, Any]]:
        inc = self.emergencies.get(incident_id)
        if not inc:
            return None
        old_score = inc.get("priorityScore")
        inc["priorityScore"] = new_score
        inc["severity"] = new_severity
        inc["updatedAt"] = datetime.now().isoformat()
        
        history_item = {
            "timestamp": datetime.now().isoformat(),
            "action": f"Priority overridden from {old_score} to {new_score} ({new_severity})",
            "previousStatus": inc.get("status"),
            "newStatus": inc.get("status"),
            "performedBy": override_by,
            "notes": f"Authority Override Reason: {reason}"
        }
        inc.setdefault("history", []).append(history_item)
        return inc

    def assign_rescue_team(self, incident_id: str, team_id: str, assigned_by: str = "Authority Dispatcher") -> Optional[Dict[str, Any]]:
        inc = self.emergencies.get(incident_id)
        team = self.rescue_teams.get(team_id)
        if not inc or not team:
            return None
            
        inc["assignedTeamId"] = team_id
        inc["assignedTeamName"] = team["teamName"]
        inc["status"] = "Rescue Team Assigned"
        inc["updatedAt"] = datetime.now().isoformat()
        
        team["availabilityStatus"] = "Assigned"
        team["currentIncidentId"] = incident_id
        
        history_item = {
            "timestamp": datetime.now().isoformat(),
            "action": f"Dispatched Team: {team['teamName']}",
            "previousStatus": "Under Authority Review",
            "newStatus": "Rescue Team Assigned",
            "performedBy": assigned_by,
            "notes": f"Primary dispatch of {team['teamName']} to incident coordinates."
        }
        inc.setdefault("history", []).append(history_item)
        return inc

    def get_nearby_hospitals(self, user_lat: float, user_lon: float) -> List[Dict[str, Any]]:
        """Calculates distance to hospitals and returns sorted list."""
        hospitals_with_distance = []
        for h in self.hospitals:
            h_copy = dict(h)
            dist = calculate_haversine_distance(user_lat, user_lon, h["latitude"], h["longitude"])
            h_copy["distanceKm"] = dist
            hospitals_with_distance.append(h_copy)
        hospitals_with_distance.sort(key=lambda x: x["distanceKm"])
        return hospitals_with_distance

    def get_dashboard_statistics(self) -> Dict[str, Any]:
        total = len(self.emergencies)
        active = sum(1 for e in self.emergencies.values() if e.get("status") != "Emergency Resolved")
        resolved = sum(1 for e in self.emergencies.values() if e.get("status") == "Emergency Resolved")
        critical = sum(1 for e in self.emergencies.values() if e.get("severity") == "Critical" and e.get("status") != "Emergency Resolved")
        high = sum(1 for e in self.emergencies.values() if e.get("severity") == "High" and e.get("status") != "Emergency Resolved")
        available_teams = sum(1 for t in self.rescue_teams.values() if t.get("availabilityStatus") == "Available")
        
        # Distribution by type
        type_counts = {}
        for e in self.emergencies.values():
            t = e.get("emergencyType", "Other")
            type_counts[t] = type_counts.get(t, 0) + 1
            
        type_distribution = [{"name": k, "count": v} for k, v in type_counts.items()]
        
        # Priority breakdown
        priority_counts = {"Critical": 0, "High": 0, "Moderate": 0, "Low": 0}
        for e in self.emergencies.values():
            sev = e.get("severity", "Moderate")
            if sev in priority_counts:
                priority_counts[sev] += 1
        priority_distribution = [{"name": k, "count": v} for k, v in priority_counts.items()]
        
        # Timeline trend (simulated 24-hr breakdown)
        trend_series = [
            {"time": "00:00", "reports": 1, "resolved": 1},
            {"time": "04:00", "reports": 0, "resolved": 0},
            {"time": "08:00", "reports": 3, "resolved": 2},
            {"time": "12:00", "reports": 4, "resolved": 3},
            {"time": "16:00", "reports": 6, "resolved": 4},
            {"time": "20:00", "reports": total, "resolved": resolved},
        ]
        
        return {
            "totalIncidents": total,
            "activeIncidents": active,
            "resolvedIncidents": resolved,
            "criticalIncidents": critical,
            "highPriorityIncidents": high,
            "availableRescueTeams": available_teams,
            "totalRescueTeams": len(self.rescue_teams),
            "emergencyTypeDistribution": type_distribution,
            "priorityDistribution": priority_distribution,
            "trendSeries": trend_series,
            "isDemo": self.is_demo_mode
        }

db = CrisisMeshDatabase()
