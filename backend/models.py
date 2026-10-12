from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class EmergencyType(str, Enum):
    FIRE = "Fire Emergency"
    ROAD_ACCIDENT = "Road Accident"
    FLOOD = "Flood"
    EARTHQUAKE = "Earthquake"
    MEDICAL = "Medical Emergency"
    BUILDING_COLLAPSE = "Building Collapse"
    NATURAL_DISASTER = "Natural Disaster"
    OTHER = "Other Emergency"

class SeverityLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"

class EmergencyStatus(str, Enum):
    REPORTED = "Emergency Reported"
    RECEIVED = "Report Received"
    UNDER_REVIEW = "Under Authority Review"
    TEAM_ASSIGNED = "Rescue Team Assigned"
    DISPATCHED = "Rescue Team Dispatched"
    IN_PROGRESS = "Response in Progress"
    RESOLVED = "Emergency Resolved"

class RescueTeamStatus(str, Enum):
    AVAILABLE = "Available"
    ASSIGNED = "Assigned"
    ACCEPTED = "Accepted"
    ON_THE_WAY = "On the Way"
    ARRIVED = "Arrived"
    RESCUE_IN_PROGRESS = "Rescue in Progress"
    COMPLETED = "Completed"

class UserRole(str, Enum):
    CITIZEN = "Citizen"
    AUTHORITY = "Authority"
    RESCUE_TEAM = "Rescue Team"
    HOSPITAL_ADMIN = "Hospital Administrator"

class LocationModel(BaseModel):
    latitude: float
    longitude: float
    address: str
    city: Optional[str] = "Mumbai"
    landmark: Optional[str] = None

class AIAnalysisResult(BaseModel):
    incidentId: Optional[str] = None
    emergencyCategory: str
    priorityScore: int = Field(ge=0, le=100)
    severityLevel: SeverityLevel
    explanation: str
    suggestedResponseCategory: str
    aiConfidenceIndicator: str  # e.g., "94% High Confidence"
    confidenceScore: int = Field(ge=0, le=100)  # Report completeness & freshness
    recommendedNextSteps: List[str]
    isDuplicatePotential: bool = False
    duplicateIncidentId: Optional[str] = None
    isFallback: bool = False

class EmergencyCreateRequest(BaseModel):
    callerName: str
    contactNumber: str
    emergencyType: EmergencyType
    description: str
    affectedPeople: int = 1
    injuredPeople: int = 0
    latitude: float
    longitude: float
    address: str
    landmark: Optional[str] = None
    imageUrl: Optional[str] = None
    userId: Optional[str] = "anon_citizen"

class StatusUpdateRequest(BaseModel):
    status: EmergencyStatus
    notes: Optional[str] = None
    updatedBy: Optional[str] = "Authority Control"

class PriorityOverrideRequest(BaseModel):
    newPriorityScore: int = Field(ge=0, le=100)
    newSeverity: SeverityLevel
    overrideReason: str
    overrideBy: Optional[str] = "Command Chief"

class RescueTeamAssignRequest(BaseModel):
    incidentId: str
    teamId: str
    assignedBy: Optional[str] = "Authority Dispatcher"

class RescueTeamStatusUpdateRequest(BaseModel):
    incidentId: str
    teamId: str
    status: RescueTeamStatus
    notes: Optional[str] = None

class ChatbotRequest(BaseModel):
    message: str
    contextLocation: Optional[str] = None
    emergencyType: Optional[str] = None
    language: Optional[str] = "English"

class HistoryEntry(BaseModel):
    timestamp: str
    action: str
    previousStatus: Optional[str] = None
    newStatus: Optional[str] = None
    performedBy: str
    notes: Optional[str] = None

class EmergencyIncident(BaseModel):
    incidentId: str
    userId: str
    callerName: str
    contactNumber: str
    emergencyType: EmergencyType
    description: str
    affectedPeople: int
    injuredPeople: int
    location: LocationModel
    imageUrl: Optional[str] = None
    priorityScore: int
    severity: SeverityLevel
    status: EmergencyStatus
    assignedTeamId: Optional[str] = None
    assignedTeamName: Optional[str] = None
    aiAnalysis: AIAnalysisResult
    history: List[HistoryEntry] = []
    createdAt: str
    updatedAt: str
    isDemo: bool = True

class RescueTeam(BaseModel):
    teamId: str
    teamName: str
    teamType: str # "Fire & Rescue", "Trauma Medical Unit", "Disaster Response NDRF", "Police Tactical"
    contactNumber: str
    baseLocation: LocationModel
    availabilityStatus: str # "Available", "Busy", "En Route", "Standby"
    currentIncidentId: Optional[str] = None
    membersCount: int = 6
    equipment: List[str] = []

class Hospital(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    phone: str
    specialties: List[str]
    hasICU: bool
    hasBurnUnit: bool
    traumaLevel: str
    distanceKm: Optional[float] = None
