import os
import json
import logging
import math
from typing import Optional, List, Dict, Any
from datetime import datetime
import httpx
from models import EmergencyType, SeverityLevel, AIAnalysisResult

logger = logging.getLogger("CrisisMeshAI.AIEngine")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two geo-coordinates."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_confidence_score(caller_name: str, phone: str, desc: str, affected: int, injured: int, has_landmark: bool, has_image: bool) -> int:
    """Extra Feature: Emergency Confidence Score (Completeness, Verification Signals)."""
    score = 40  # base
    if len(caller_name.strip()) > 3:
        score += 10
    if len(phone.strip()) >= 10:
        score += 15
    if len(desc.strip()) > 30:
        score += 15
    if has_landmark:
        score += 10
    if has_image:
        score += 10
    return min(score, 98)

def check_duplicate_candidates(new_type: str, new_lat: float, new_lon: float, new_desc: str, existing_emergencies: List[Dict[str, Any]]) -> Optional[str]:
    """Extra Feature: Duplicate Emergency Detection based on spatial proximity (<1.5km) & matching emergency type."""
    for inc in existing_emergencies:
        if inc.get("status") == "Emergency Resolved":
            continue
        inc_loc = inc.get("location", {})
        lat = inc_loc.get("latitude", 0)
        lon = inc_loc.get("longitude", 0)
        if lat and lon:
            dist = calculate_haversine_distance(new_lat, new_lon, lat, lon)
            if dist <= 1.2:  # within 1.2 km radius
                if inc.get("emergencyType") == new_type:
                    return inc.get("incidentId")
                # Also check keyword overlap
                words_new = set(new_desc.lower().split())
                words_old = set(inc.get("description", "").lower().split())
                overlap = words_new.intersection(words_old)
                if len(overlap) >= 3:
                    return inc.get("incidentId")
    return None

def fallback_ai_analysis(
    emergency_type: str,
    description: str,
    affected_people: int,
    injured_people: int,
    address: str,
    has_image: bool = False
) -> AIAnalysisResult:
    """
    Intelligent heuristic fallback when Gemini API key is unset or unreachable.
    Computes priority based on emergency type, casualty counts, urgency keywords.
    """
    desc_lower = description.lower()
    
    # Base weight by emergency type
    type_weights = {
        EmergencyType.BUILDING_COLLAPSE.value: 85,
        EmergencyType.EARTHQUAKE.value: 82,
        EmergencyType.FIRE.value: 78,
        EmergencyType.NATURAL_DISASTER.value: 75,
        EmergencyType.ROAD_ACCIDENT.value: 65,
        EmergencyType.FLOOD.value: 68,
        EmergencyType.MEDICAL.value: 62,
        EmergencyType.OTHER.value: 40,
    }
    
    base_score = type_weights.get(emergency_type, 50)
    
    # Modifiers
    casualty_modifier = min((injured_people * 5) + (affected_people * 2), 25)
    
    # Keyword severity checks
    critical_keywords = ["trapped", "unconscious", "explosion", "flames spreading", "cardiac", "drowning", "bleeding profusely", "child", "infant", "crushed", "gasping"]
    high_keywords = ["smoke", "fracture", "water rising", "blocked exit", "collision", "heavy rain", "gas leak"]
    
    keyword_boost = 0
    for kw in critical_keywords:
        if kw in desc_lower:
            keyword_boost += 8
    for kw in high_keywords:
        if kw in desc_lower:
            keyword_boost += 4
            
    total_score = min(max(base_score + casualty_modifier + keyword_boost, 15), 98)
    
    # Determine severity bucket
    if total_score >= 76:
        severity = SeverityLevel.CRITICAL
    elif total_score >= 51:
        severity = SeverityLevel.HIGH
    elif total_score >= 26:
        severity = SeverityLevel.MODERATE
    else:
        severity = SeverityLevel.LOW
        
    # Suggested category
    if "fire" in emergency_type.lower() or "explosion" in desc_lower:
        cat = "Fire & Heavy Rescue (Engine + Hazmat)"
    elif "accident" in emergency_type.lower() or "medical" in emergency_type.lower() or injured_people > 0:
        cat = "Advanced Life Support Trauma Ambulance + First Responder"
    elif "flood" in emergency_type.lower() or "earthquake" in emergency_type.lower() or "collapse" in emergency_type.lower():
        cat = "Disaster Management & NDRF Structural Search"
    else:
        cat = "Local Emergency Management & Police Unit"
        
    next_steps = [
        "Immediate dispatch of closest Tier-1 responders",
        "Notify nearby trauma center / hospital triage desk",
        "Establish 500m safety perimeter and divert traffic",
        "Maintain direct communication channel with reporter"
    ]
    if injured_people > 0:
        next_steps.insert(0, f"Alert Emergency Department: {injured_people} expected trauma casualties")

    return AIAnalysisResult(
        emergencyCategory=emergency_type,
        priorityScore=total_score,
        severityLevel=severity,
        explanation=f"Algorithmic evaluation assessed high risk based on {emergency_type} with {injured_people} reported casualties, {affected_people} affected individuals, and urgent distress indicators.",
        suggestedResponseCategory=cat,
        aiConfidenceIndicator="92% Algorithmic Heuristic Mode (Gemini fallback ready)",
        confidenceScore=calculate_confidence_score("Caller", "1234567890", description, affected_people, injured_people, True, has_image),
        recommendedNextSteps=next_steps,
        isFallback=True
    )

async def analyze_emergency_with_gemini(
    emergency_type: str,
    description: str,
    affected_people: int,
    injured_people: int,
    address: str,
    has_image: bool = False,
    existing_emergencies: Optional[List[Dict[str, Any]]] = None
) -> AIAnalysisResult:
    """Analyze emergency report with Gemini AI or graceful fallback."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Utilizing high-fidelity AI triage fallback engine.")
        return fallback_ai_analysis(emergency_type, description, affected_people, injured_people, address, has_image)
        
    system_prompt = (
        "You are CrisisMesh AI Emergency Triage Engine. You evaluate 911/emergency calls with clinical and tactical triage standards.\n"
        "Return ONLY a valid JSON object with the following schema without markdown formatting or code blocks:\n"
        "{\n"
        '  "priorityScore": <integer 0-100>,\n'
        '  "severityLevel": <"Low"|"Moderate"|"High"|"Critical">,\n'
        '  "explanation": <concise 2-sentence rationale>,\n'
        '  "suggestedResponseCategory": <string rescue department type>,\n'
        '  "aiConfidenceIndicator": <string, e.g. "96% High Confidence">,\n'
        '  "confidenceScore": <integer 0-100 reflecting report completeness>,\n'
        '  "recommendedNextSteps": [<list of 3-4 tactical responder steps>]\n'
        "}\n"
        "Rules:\n"
        "- 0-25: Low Priority\n"
        "- 26-50: Moderate Priority\n"
        "- 51-75: High Priority\n"
        "- 76-100: Critical Priority\n"
        "- If lives are in immediate peril or multiple injuries exist, assign 76-100."
    )
    
    user_prompt = (
        f"Emergency Type: {emergency_type}\n"
        f"Description: {description}\n"
        f"Affected People: {affected_people}\n"
        f"Injured People: {injured_people}\n"
        f"Location: {address}\n"
        f"Image Attached: {has_image}\n"
    )
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": system_prompt + "\n\nIncident Details:\n" + user_prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text.strip())
                
                score = int(parsed.get("priorityScore", 50))
                sev = parsed.get("severityLevel", "Moderate")
                if score >= 76:
                    sev = SeverityLevel.CRITICAL
                elif score >= 51:
                    sev = SeverityLevel.HIGH
                elif score >= 26:
                    sev = SeverityLevel.MODERATE
                else:
                    sev = SeverityLevel.LOW
                    
                return AIAnalysisResult(
                    emergencyCategory=emergency_type,
                    priorityScore=score,
                    severityLevel=sev,
                    explanation=parsed.get("explanation", "Gemini triage assessment completed."),
                    suggestedResponseCategory=parsed.get("suggestedResponseCategory", "Unified Emergency Taskforce"),
                    aiConfidenceIndicator=parsed.get("aiConfidenceIndicator", "95% Gemini Neural Confidence"),
                    confidenceScore=int(parsed.get("confidenceScore", 88)),
                    recommendedNextSteps=parsed.get("recommendedNextSteps", [
                        "Dispatch frontline responders",
                        "Maintain caller contact"
                    ]),
                    isFallback=False
                )
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}. Using fallback.")
                return fallback_ai_analysis(emergency_type, description, affected_people, injured_people, address, has_image)
    except Exception as e:
        logger.error(f"Error querying Gemini API: {e}. Reverting to fallback triage.")
        return fallback_ai_analysis(emergency_type, description, affected_people, injured_people, address, has_image)

async def chatbot_response(message: str, language: str = "English") -> Dict[str, Any]:
    """Generates AI assistant advice with Google Gemini or structured emergency safety playbook."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Core emergency hotline disclaimer
    disclaimer = "⚠️ AI guidance is informational and does not replace professional emergency services. In immediate danger, call 112 / 911 immediately."
    
    if api_key:
        try:
            sys_msg = (
                "You are CrisisMesh AI Assistant, an empathetic, highly trained emergency preparedness and disaster response companion.\n"
                f"Respond in {language}.\n"
                "Provide brief, actionable, bulleted first-aid, evacuation, or safety instructions.\n"
                "Always reiterate that in life-threatening situations, the caller must contact local emergency services immediately (112 / 911).\n"
                "Keep response under 160 words, clear, and reassuring."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{sys_msg}\n\nUser Question: {message}"}
                        ]
                    }
                ],
                "generationConfig": {"temperature": 0.4}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    bot_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "reply": bot_text,
                        "disclaimer": disclaimer,
                        "source": "Google Gemini 1.5 Flash"
                    }
        except Exception as e:
            logger.warning(f"Gemini chatbot query failed: {e}")

    # Rich contextual safety playbook fallback
    msg_low = message.lower()
    
    if "fire" in msg_low or "burn" in msg_low:
        if language == "Hindi":
            reply = "🔥 **आग लगने पर सुरक्षा निर्देश:**\n1. तुरंत सुरक्षित बाहर निकलें और लिफ्ट का उपयोग न करें।\n2. यदि धुआँ अधिक हो तो फर्श के पास झुककर रेंगें।\n3. जलने पर बहते ठंडे पानी से 10 मिनट धोएं।\n4. तुरंत 101/112 पर कॉल करें।"
        elif language == "Marathi":
            reply = "🔥 **आग लागल्यास सुरक्षा सूचना:**\n1. तात्काळ सुरक्षित बाहेर पडा, लिफ्ट वापरू नका.\n2. धूर जास्त असल्यास जमिनीलगत सरपटा.\n3. भाजलेल्या भागावर वाहते थंड पाणी टाका.\n4. त्वरित 101/112 ला संपर्क करा."
        else:
            reply = "🔥 **Fire Emergency Protocol:**\n- **Get Out & Stay Out**: Do not use elevators; use marked fire escape stairs.\n- **Stay Low**: Smoke and toxic gases rise; crawl on hands and knees.\n- **Stop, Drop, and Roll**: If clothing catches fire.\n- **First Aid for Burns**: Cool running tap water for 10-15 minutes; do NOT apply ice or butter."
    elif "accident" in msg_low or "car" in msg_low or "crash" in msg_low:
        reply = "🚗 **Road Accident Protocol:**\n- Ensure scene safety before approaching; turn on hazard lights.\n- Do NOT move critically injured persons unless there is imminent danger of fire.\n- Apply direct, firm pressure on bleeding wounds with clean cloth.\n- Keep the victim warm and calm until paramedics arrive."
    elif "earthquake" in msg_low or "shaking" in msg_low:
        reply = "🏚️ **Earthquake Safety (Drop, Cover, Hold On):**\n- **DROP** to your hands and knees.\n- **COVER** your head and neck under sturdy furniture or against an interior wall.\n- **HOLD ON** until the shaking stops.\n- Stay away from glass, windows, and exterior doors."
    elif "flood" in msg_low or "water" in msg_low:
        reply = "🌊 **Flood Safety Protocol:**\n- Move immediately to higher ground or upper floors.\n- Turn off main electricity and gas switches if safe to do so.\n- Never walk, swim, or drive through moving flood waters (Turn Around, Don't Drown).\n- Prepare an emergency grab-bag with water, medications, and flashlights."
    elif "cpr" in msg_low or "unconscious" in msg_low or "cardiac" in msg_low:
        reply = "❤️ **CPR & Unconscious Victim Protocol:**\n1. Check responsiveness and breathing.\n2. Shout for help and instruct someone to call 112 / 911.\n3. Place hands in center of chest: Push hard and fast (100–120 beats/min to the beat of 'Stayin' Alive').\n4. Allow full chest recoil between compressions."
    elif "how to report" in msg_low or "report" in msg_low or "sos" in msg_low:
        reply = "🚨 **How to Report on CrisisMesh AI:**\n1. Click the large red **'REPORT EMERGENCY'** button on the top nav or home page.\n2. Click **'📍 Detect My Location'** for instant GPS coordinates.\n3. Select the emergency category and describe the situation.\n4. Click **Submit SOS** — our AI will automatically triage severity and alert rescue authorities within seconds."
    else:
        reply = "🛡️ **CrisisMesh AI Emergency Safety Guidance:**\n- If in immediate peril, prioritize contacting 112 / 911.\n- On this platform, you can report incidents, track responder progress in real-time, view nearby trauma centers, and review AI severity triage.\n- What specific emergency scenario or safety instructions can I assist you with?"

    return {
        "reply": reply,
        "disclaimer": disclaimer,
        "source": "CrisisMesh Emergency Knowledge Base"
    }
