/**
 * Mock Emergency and Resource Dataset for CrisisMesh AI
 * Used as standalone and fallback data for client-only deployments (such as Netlify)
 */

export const INITIAL_EMERGENCIES = [
  {
    incidentId: "INC-2026-9041",
    userId: "usr_citizen_01",
    callerName: "Dr. Rajesh Sharma",
    contactNumber: "+91 98765 43210",
    emergencyType: "Road Accident",
    description: "Multi-vehicle collision on Western Express Highway flyover. Two passengers trapped inside compressed cab; fuel leaking onto road.",
    affectedPeople: 5,
    injuredPeople: 3,
    location: {
      latitude: 19.0600,
      longitude: 72.8520,
      address: "WEH Flyover, Near Kalanagar Junction, Bandra East",
      city: "Mumbai",
      landmark: "Near Kalanagar signal"
    },
    imageUrl: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?auto=format&fit=crop&w=800&q=80",
    priorityScore: 92,
    severity: "Critical",
    status: "Response in Progress",
    assignedTeamId: "TEAM-MED-02",
    assignedTeamName: "Rapid ALS Trauma Ambulance 12",
    aiAnalysis: {
      incidentId: "INC-2026-9041",
      emergencyCategory: "Road Accident",
      priorityScore: 92,
      severityLevel: "Critical",
      explanation: "Critical multi-casualty vehicular accident with structural entrapment and hazardous flammable fuel leak requiring dual-service emergency dispatch.",
      suggestedResponseCategory: "ALS Trauma Ambulance & Hydraulic Rescue",
      aiConfidenceIndicator: "97% Gemini Neural Triage",
      confidenceScore: 94,
      recommendedNextSteps: [
        "Divert expressway traffic to service road",
        "Deploy foam blanket for fuel hazard",
        "Extract trapped victims with Jaws of Life",
        "Triage with Lilavati Hospital Trauma Bay"
      ],
      isDuplicatePotential: false,
      duplicateIncidentId: null,
      isFallback: false
    },
    history: [
      {
        timestamp: "2026-10-12T18:15:20",
        action: "SOS Generated",
        previousStatus: null,
        newStatus: "Emergency Reported",
        performedBy: "Dr. Rajesh Sharma",
        notes: "Report submitted via Mobile SOS trigger."
      },
      {
        timestamp: "2026-10-12T18:16:02",
        action: "AI Severity Classification",
        previousStatus: "Emergency Reported",
        newStatus: "Under Authority Review",
        performedBy: "CrisisMesh AI Engine",
        notes: "Assigned Critical Priority Score (92/100)."
      },
      {
        timestamp: "2026-10-12T18:18:30",
        action: "Rescue Team Dispatched",
        previousStatus: "Under Authority Review",
        newStatus: "Response in Progress",
        performedBy: "Commander K. Verma (Command Control)",
        notes: "Assigned ALS Trauma Ambulance 12."
      }
    ],
    createdAt: "2026-10-12T18:15:20",
    updatedAt: "2026-10-12T18:18:30",
    isDemo: true
  },
  {
    incidentId: "INC-2026-8812",
    userId: "usr_citizen_02",
    callerName: "Pooja Deshmukh",
    contactNumber: "+91 97654 32109",
    emergencyType: "Fire Emergency",
    description: "Thick black smoke billowing from 4th floor chemical warehouse. Alarms ringing, workers evacuating, 2 security staff unaccounted for.",
    affectedPeople: 8,
    injuredPeople: 1,
    location: {
      latitude: 19.1197,
      longitude: 72.8850,
      address: "MIDC Industrial Estate, Andheri East",
      city: "Mumbai",
      landmark: "Near Seepz Gate 1"
    },
    imageUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
    priorityScore: 84,
    severity: "Critical",
    status: "Rescue Team Assigned",
    assignedTeamId: "TEAM-FIRE-01",
    assignedTeamName: "Metro Fire & Hazmat Unit 4",
    aiAnalysis: {
      incidentId: "INC-2026-8812",
      emergencyCategory: "Fire Emergency",
      priorityScore: 84,
      severityLevel: "Critical",
      explanation: "Industrial chemical fire with toxic smoke generation and potential unaccounted occupants; elevated flashover danger.",
      suggestedResponseCategory: "Fire & Hazmat Heavy Tender",
      aiConfidenceIndicator: "94% Gemini Neural Triage",
      confidenceScore: 91,
      recommendedNextSteps: [
        "Isolate 300m perimeter from downwind toxic gas",
        "Deploy aerial water monitor",
        "Search building ground access points"
      ],
      isDuplicatePotential: false,
      duplicateIncidentId: null,
      isFallback: false
    },
    history: [
      {
        timestamp: "2026-10-12T17:40:10",
        action: "SOS Generated",
        previousStatus: null,
        newStatus: "Emergency Reported",
        performedBy: "Pooja Deshmukh",
        notes: "Citizen verified report."
      },
      {
        timestamp: "2026-10-12T17:42:00",
        action: "Assigned Rescue Unit",
        previousStatus: "Under Authority Review",
        newStatus: "Rescue Team Assigned",
        performedBy: "Authority Dispatcher",
        notes: "Metro Fire & Hazmat Unit 4 dispatched."
      }
    ],
    createdAt: "2026-10-12T17:40:10",
    updatedAt: "2026-10-12T17:42:00",
    isDemo: true
  },
  {
    incidentId: "INC-2026-7734",
    userId: "usr_citizen_03",
    callerName: "Anand Kulkarni",
    contactNumber: "+91 99887 76655",
    emergencyType: "Flood",
    description: "Flash waterlogging under Milan subway reaching 4 feet. Two auto-rickshaws stalled with passengers waiting on roofs.",
    affectedPeople: 6,
    injuredPeople: 0,
    location: {
      latitude: 19.0905,
      longitude: 72.8425,
      address: "Milan Subway, Santacruz West",
      city: "Mumbai",
      landmark: "Near SV Road junction"
    },
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    priorityScore: 64,
    severity: "High",
    status: "Under Authority Review",
    assignedTeamId: null,
    assignedTeamName: null,
    aiAnalysis: {
      incidentId: "INC-2026-7734",
      emergencyCategory: "Flood",
      priorityScore: 64,
      severityLevel: "High",
      explanation: "Urban flash flooding with marooned civilian transport. Rising water levels pose hypothermia and electrical shock risk.",
      suggestedResponseCategory: "SDRF Water Rescue & Traffic Police",
      aiConfidenceIndicator: "91% Gemini Neural Triage",
      confidenceScore: 88,
      recommendedNextSteps: [
        "Shut down subway entrance barricades",
        "Deploy high-volume dewatering pumps",
        "Evacuate stranded passengers via safety ropes"
      ],
      isDuplicatePotential: false,
      duplicateIncidentId: null,
      isFallback: false
    },
    history: [
      {
        timestamp: "2026-10-12T18:02:15",
        action: "SOS Generated",
        previousStatus: null,
        newStatus: "Report Received",
        performedBy: "Anand Kulkarni",
        notes: "GPS Geolocation tagged."
      }
    ],
    createdAt: "2026-10-12T18:02:15",
    updatedAt: "2026-10-12T18:02:15",
    isDemo: true
  },
  {
    incidentId: "INC-2026-6219",
    userId: "usr_citizen_04",
    callerName: "Suresh Nair",
    contactNumber: "+91 91234 56780",
    emergencyType: "Medical Emergency",
    description: "Elderly gentleman collapsed on Jogger's Park walkway. Pulse weak, shallow breathing, bystanders attempting chest compressions.",
    affectedPeople: 1,
    injuredPeople: 1,
    location: {
      latitude: 19.0620,
      longitude: 72.8228,
      address: "Jogger's Park, Carter Road, Bandra West",
      city: "Mumbai",
      landmark: "Near waterfront amphitheatre"
    },
    imageUrl: null,
    priorityScore: 73,
    severity: "High",
    status: "Rescue Team Dispatched",
    assignedTeamId: "TEAM-MED-02",
    assignedTeamName: "Rapid ALS Trauma Ambulance 12",
    aiAnalysis: {
      incidentId: "INC-2026-6219",
      emergencyCategory: "Medical Emergency",
      priorityScore: 73,
      severityLevel: "High",
      explanation: "Presumed cardiac arrest in public space requiring rapid defibrillation and advanced airway support.",
      suggestedResponseCategory: "Advanced Cardiac Life Support",
      aiConfidenceIndicator: "93% Gemini Neural Triage",
      confidenceScore: 89,
      recommendedNextSteps: [
        "Direct bystander to keep rhythmic chest compressions",
        "Locate public AED if park clubhouse has one",
        "Dispatch nearest paramedic with defibrillator"
      ],
      isDuplicatePotential: false,
      duplicateIncidentId: null,
      isFallback: false
    },
    history: [
      {
        timestamp: "2026-10-12T18:25:00",
        action: "SOS Generated",
        previousStatus: null,
        newStatus: "Emergency Reported",
        performedBy: "Suresh Nair",
        notes: "Medical emergency flagged."
      }
    ],
    createdAt: "2026-10-12T18:25:00",
    updatedAt: "2026-10-12T18:25:00",
    isDemo: true
  },
  {
    incidentId: "INC-2026-5102",
    userId: "usr_citizen_05",
    callerName: "Kavita Rao",
    contactNumber: "+91 93456 78901",
    emergencyType: "Building Collapse",
    description: "Partial balcony and parapet wall collapse on 2nd floor of old residential chawl during renovation work. Debris fallen onto sidewalk.",
    affectedPeople: 4,
    injuredPeople: 2,
    location: {
      latitude: 19.0700,
      longitude: 72.8800,
      address: "Kurla West, Near Station Road",
      city: "Mumbai",
      landmark: "Opposite Municipal Market"
    },
    imageUrl: null,
    priorityScore: 81,
    severity: "Critical",
    status: "Under Authority Review",
    assignedTeamId: null,
    assignedTeamName: null,
    aiAnalysis: {
      incidentId: "INC-2026-5102",
      emergencyCategory: "Building Collapse",
      priorityScore: 81,
      severityLevel: "Critical",
      explanation: "Structural failure with secondary collapse hazard and pedestrian injury risk.",
      suggestedResponseCategory: "NDRF Urban Search and Structural Engineering",
      aiConfidenceIndicator: "95% Gemini Neural Triage",
      confidenceScore: 92,
      recommendedNextSteps: [
        "Cordon off perimeter",
        "Deploy structural inspection engineers",
        "Evacuate adjacent apartments"
      ],
      isDuplicatePotential: false,
      duplicateIncidentId: null,
      isFallback: false
    },
    history: [
      {
        timestamp: "2026-10-12T18:30:00",
        action: "SOS Generated",
        previousStatus: null,
        newStatus: "Emergency Reported",
        performedBy: "Kavita Rao",
        notes: "Collapse emergency reported."
      }
    ],
    createdAt: "2026-10-12T18:30:00",
    updatedAt: "2026-10-12T18:30:00",
    isDemo: true
  }
];

export const INITIAL_RESCUE_TEAMS = [
  {
    teamId: "TEAM-FIRE-01",
    teamName: "Metro Fire & Hazmat Unit 4",
    teamType: "Fire Emergency",
    contactNumber: "+91 98201 11001",
    baseLocation: {
      latitude: 19.0760,
      longitude: 72.8777,
      address: "Bandra Fire Station, Linking Rd",
      city: "Mumbai"
    },
    availabilityStatus: "Available",
    currentIncidentId: null,
    membersCount: 8,
    equipment: ["Thermal Imaging Camera", "Water Foam Tender", "Jaws of Life", "Hazmat Suits"]
  },
  {
    teamId: "TEAM-MED-02",
    teamName: "Rapid ALS Trauma Ambulance 12",
    teamType: "Medical Emergency",
    contactNumber: "+91 98202 22002",
    baseLocation: {
      latitude: 19.0178,
      longitude: 72.8478,
      address: "Dadar Emergency Depot, Senapati Bapat Marg",
      city: "Mumbai"
    },
    availabilityStatus: "En Route",
    currentIncidentId: "INC-2026-9041",
    membersCount: 4,
    equipment: ["Defibrillator (AED)", "Portable Ventilator", "Trauma Splints", "Blood Storage"]
  },
  {
    teamId: "TEAM-NDRF-03",
    teamName: "SDRF Disaster & Flood Rescue Unit 8",
    teamType: "Natural Disaster",
    contactNumber: "+91 98203 33003",
    baseLocation: {
      latitude: 19.1136,
      longitude: 72.8697,
      address: "Andheri Disaster Command Center",
      city: "Mumbai"
    },
    availabilityStatus: "Available",
    currentIncidentId: null,
    membersCount: 12,
    equipment: ["Zodiac Inflatable Boats", "Acoustic Life Detectors", "Heavy Concrete Cutters", "Drones"]
  },
  {
    teamId: "TEAM-POL-04",
    teamName: "Highway Emergency Patrol Unit 9",
    teamType: "Road Accident",
    contactNumber: "+91 98204 44004",
    baseLocation: {
      latitude: 19.0596,
      longitude: 72.8295,
      address: "Worli Sea Face Tactical Post",
      city: "Mumbai"
    },
    availabilityStatus: "Available",
    currentIncidentId: null,
    membersCount: 5,
    equipment: ["Spill Neutralizer", "Hydraulic Cutters", "Traffic Diverters", "First Aid Kit"]
  }
];

export const INITIAL_HOSPITALS = [
  {
    id: "HOSP-01",
    name: "Lilavati Hospital & Research Centre",
    address: "A-791, Bandra Reclamation, Bandra West, Mumbai",
    latitude: 19.0514,
    longitude: 72.8291,
    phone: "+91 22 2675 1000",
    specialties: ["Level-1 Trauma", "Emergency Medicine", "Cardiac ICU", "Neurology"],
    hasICU: true,
    hasBurnUnit: true,
    traumaLevel: "Level 1"
  },
  {
    id: "HOSP-02",
    name: "KEM Municipal Medical Hospital & Trauma Center",
    address: "Acharya Donde Marg, Parel, Mumbai",
    latitude: 19.0033,
    longitude: 72.8427,
    phone: "+91 22 2410 7000",
    specialties: ["Public Super-Specialty", "Major Trauma", "Burn ICU", "Pediatric Trauma"],
    hasICU: true,
    hasBurnUnit: true,
    traumaLevel: "Level 1"
  },
  {
    id: "HOSP-03",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West",
    latitude: 19.1311,
    longitude: 72.8252,
    phone: "+91 22 4269 6969",
    specialties: ["Critical Care", "Advanced Cardiac Life Support", "Spine Trauma", "Stroke Unit"],
    hasICU: true,
    hasBurnUnit: false,
    traumaLevel: "Level 1"
  },
  {
    id: "HOSP-04",
    name: "Hinduja Hospital & Medical Research",
    address: "Veer Savarkar Marg, Mahim, Mumbai",
    latitude: 19.0330,
    longitude: 72.8397,
    phone: "+91 22 2445 1515",
    specialties: ["24x7 Emergency", "Critical Resuscitation", "Cardiothoracic Surgery"],
    hasICU: true,
    hasBurnUnit: false,
    traumaLevel: "Level 2"
  },
  {
    id: "HOSP-05",
    name: "Nanavati Max Super Speciality Hospital",
    address: "SV Road, LIC Colony, Suresh Colony, Vile Parle West",
    latitude: 19.0968,
    longitude: 72.8413,
    phone: "+91 22 6836 0000",
    specialties: ["Accident Emergency", "Advanced Life Support", "Hyperbaric Oxygen"],
    hasICU: true,
    hasBurnUnit: true,
    traumaLevel: "Level 1"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    notificationId: "NOTIF-01",
    title: "🚨 Critical Incident Reported",
    message: "INC-2026-9041: Multi-vehicle crash with trapped victims at Bandra East. Severity: 92/100.",
    type: "CRITICAL",
    timestamp: "2026-10-15T18:16:00",
    read: false,
    incidentId: "INC-2026-9041"
  },
  {
    notificationId: "NOTIF-02",
    title: "🚒 Unit Dispatched",
    message: "Rapid ALS Trauma Ambulance 12 en route to Bandra Flyover.",
    type: "DISPATCH",
    timestamp: "2026-10-15T18:18:30",
    read: false,
    incidentId: "INC-2026-9041"
  },
  {
    notificationId: "NOTIF-03",
    title: "🌤️ Meteorological Alert (Open-Meteo)",
    message: "Live telemetry active. High humidity and elevated temperatures monitored across disaster grid.",
    type: "WEATHER",
    timestamp: "2026-10-15T18:20:00",
    read: true,
    incidentId: null
  }
];

export const INITIAL_STATS = {
  totalIncidents: 5,
  criticalCount: 3,
  activeOperations: 2,
  resolvedCount: 0,
  averageResponseTimeMinutes: 4.8,
  activeRescueTeams: 4
};
