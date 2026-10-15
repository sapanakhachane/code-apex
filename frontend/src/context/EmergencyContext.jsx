import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  INITIAL_EMERGENCIES,
  INITIAL_RESCUE_TEAMS,
  INITIAL_HOSPITALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STATS
} from '../data/mockCrisisData';
import { fetchWeather } from '../services/openMeteoService';
import { calculateDashboardAnalytics } from '../utils/dashboardAnalytics';

const EmergencyContext = createContext();

const STORAGE_KEY_EMERGENCIES = 'crisismesh_emergencies';

export const EmergencyProvider = ({ children }) => {
  // Load any locally cached emergencies if available
  const [emergencies, setEmergencies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMERGENCIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_EMERGENCIES;
  });

  const [rescueTeams, setRescueTeams] = useState(INITIAL_RESCUE_TEAMS);
  const [hospitals, setHospitals] = useState(INITIAL_HOSPITALS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [serverStats, setServerStats] = useState(null);

  // Live real-time statistics computed directly from actual incident records
  const stats = useMemo(() => {
    const computed = calculateDashboardAnalytics(emergencies, rescueTeams);
    if (serverStats && typeof serverStats === 'object') {
      return {
        ...computed,
        ...serverStats,
        // Ensure distributions always reflect actual incident records if available
        emergencyTypeDistribution: (computed.emergencyTypeDistribution && computed.emergencyTypeDistribution.length > 0)
          ? computed.emergencyTypeDistribution
          : (serverStats.emergencyTypeDistribution || []),
        priorityDistribution: (computed.priorityDistribution && computed.priorityDistribution.length > 0)
          ? computed.priorityDistribution
          : (serverStats.priorityDistribution || []),
        trendSeries: (computed.trendSeries && computed.trendSeries.length > 0)
          ? computed.trendSeries
          : (serverStats.trendSeries || []),
      };
    }
    return computed;
  }, [emergencies, rescueTeams, serverStats]);

  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  // Weather Intelligence Global State (Open-Meteo)
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLocationName, setWeatherLocationName] = useState('Mumbai Command Sector');
  const [weatherCoords, setWeatherCoords] = useState({ lat: 19.0760, lon: 72.8777 });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  // Fetch live Open-Meteo weather for current coordinates
  const refreshWeather = useCallback(async (lat = weatherCoords.lat, lon = weatherCoords.lon, locName = null) => {
    setIsWeatherLoading(true);
    try {
      const data = await fetchWeather(lat, lon);
      setWeatherData(data);
      setWeatherCoords({ lat, lon });
      if (locName) setWeatherLocationName(locName);
    } catch (err) {
      console.warn("Weather fetch error in context:", err);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weatherCoords.lat, weatherCoords.lon]);

  // Initial weather load
  useEffect(() => {
    refreshWeather(19.0760, 72.8777, 'Mumbai Command Sector');
  }, []);

  // Save emergencies to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMERGENCIES, JSON.stringify(emergencies));
    } catch (e) {
      // ignore
    }
  }, [emergencies]);

  // Fetch data from backend API with fallback
  const fetchData = useCallback(async () => {
    try {
      const tryFetch = async (url) => {
        try {
          const res = await fetch(url);
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            return await res.json();
          }
        } catch {
          // fall through
        }
        return null;
      };

      const [resEm, resTeams, resHosp, resNotif, resStats] = await Promise.all([
        tryFetch('/api/emergencies'),
        tryFetch('/api/rescue-teams'),
        tryFetch('/api/hospitals'),
        tryFetch('/api/notifications'),
        tryFetch('/api/dashboard/statistics'),
      ]);

      if (resEm && Array.isArray(resEm) && resEm.length > 0) setEmergencies(resEm);
      if (resTeams && Array.isArray(resTeams) && resTeams.length > 0) setRescueTeams(resTeams);
      if (resHosp && Array.isArray(resHosp) && resHosp.length > 0) setHospitals(resHosp);
      if (resNotif && Array.isArray(resNotif) && resNotif.length > 0) setNotifications(resNotif);
      if (resStats && typeof resStats === 'object') setServerStats(resStats);
    } catch (err) {
      console.warn("Backend API offline, keeping rich client-side demo state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket Connection for Real-Time Dispatch Alerts (when backend is available)
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let socket;
    let pingInterval;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setWsConnected(true);
        pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_EMERGENCY') {
            const inc = data.incident;
            setEmergencies(prev => [inc, ...prev.filter(x => x.incidentId !== inc.incidentId)]);
            setActiveToast({
              title: `🚨 NEW SOS: ${inc.emergencyType}`,
              message: `${inc.severity} Priority (${inc.priorityScore}/100) at ${inc.location?.address}`,
              severity: inc.severity,
              incidentId: inc.incidentId
            });
            fetchData();
          } else if (data.type === 'STATUS_UPDATE' || data.type === 'PRIORITY_OVERRIDE') {
            const updated = data.incident;
            setEmergencies(prev => prev.map(e => e.incidentId === updated.incidentId ? updated : e));
            fetchData();
          } else if (data.type === 'TEAM_STATUS_UPDATE') {
            setRescueTeams(prev => prev.map(t => t.teamId === data.teamId ? { ...t, availabilityStatus: data.teamStatus } : t));
            if (data.incident) {
              setEmergencies(prev => prev.map(e => e.incidentId === data.incidentId ? data.incident : e));
            }
          }
        } catch (e) {
          console.error("WS Parse error", e);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
        clearInterval(pingInterval);
      };

      socket.onerror = () => {
        setWsConnected(false);
      };
    } catch (err) {
      console.warn("WebSocket setup error", err);
    }

    return () => {
      clearInterval(pingInterval);
      if (socket) socket.close();
    };
  }, [fetchData]);

  // Action methods with seamless client-side capability
  const submitEmergency = async (formData) => {
    let result = null;
    try {
      const res = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        result = await res.json();
      }
    } catch (e) {
      console.log("Submitting in standalone demo mode:", e);
    }

    if (!result) {
      // Local creation
      const newId = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      result = {
        incidentId: newId,
        callerName: formData.callerName || 'Citizen Report',
        contactNumber: formData.contactNumber || '+91 90000 00000',
        emergencyType: formData.emergencyType || 'Other Emergency',
        description: formData.description || '',
        affectedPeople: Number(formData.affectedPeople) || 1,
        injuredPeople: Number(formData.injuredPeople) || 0,
        location: {
          latitude: formData.latitude || 19.0760,
          longitude: formData.longitude || 72.8777,
          address: formData.address || 'Reported Location',
          city: 'Mumbai',
          landmark: formData.landmark || ''
        },
        imageUrl: formData.imageUrl || null,
        priorityScore: formData.previewPriority || (formData.emergencyType === 'Fire Emergency' || formData.emergencyType === 'Building Collapse' ? 88 : 75),
        severity: (formData.previewPriority || 75) >= 80 ? 'Critical' : 'High',
        status: 'Emergency Reported',
        assignedTeamId: null,
        assignedTeamName: null,
        aiAnalysis: formData.aiAnalysis || {
          incidentId: newId,
          emergencyCategory: formData.emergencyType,
          priorityScore: 82,
          severityLevel: 'Critical',
          explanation: `Reported distress beacon for ${formData.emergencyType}. AI automated severity triage initialized.`,
          suggestedResponseCategory: 'Tactical Emergency Response Unit',
          aiConfidenceIndicator: '95% Gemini Neural Triage',
          confidenceScore: 92,
          recommendedNextSteps: [
            'Notify nearest sector command',
            'Establish 200m cordon',
            'Deploy trauma paramedic'
          ]
        },
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'SOS Generated',
            previousStatus: null,
            newStatus: 'Emergency Reported',
            performedBy: formData.callerName || 'Citizen',
            notes: 'Emergency registered into CrisisMesh Network.'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    setEmergencies(prev => [result, ...prev]);
    setActiveToast({
      title: `🚨 SOS SUBMITTED: ${result.emergencyType}`,
      message: `${result.severity} Priority assigned at ${result.location?.address}`,
      severity: result.severity,
      incidentId: result.incidentId
    });
    return result;
  };

  const updateStatus = async (incidentId, newStatus, notes, updatedBy) => {
    try {
      const res = await fetch(`/api/emergencies/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes, updatedBy })
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencies(prev => prev.map(e => e.incidentId === incidentId ? data : e));
        return data;
      }
    } catch (e) {
      console.log("Updating locally:", e);
    }

    // Local update
    setEmergencies(prev => prev.map(e => {
      if (e.incidentId === incidentId) {
        const newHist = [
          ...(e.history || []),
          {
            timestamp: new Date().toISOString(),
            action: `Status Updated to ${newStatus}`,
            previousStatus: e.status,
            newStatus: newStatus,
            performedBy: updatedBy || 'Dispatcher',
            notes: notes || `Progressed to ${newStatus}`
          }
        ];
        return { ...e, status: newStatus, history: newHist, updatedAt: new Date().toISOString() };
      }
      return e;
    }));
  };

  const overridePriority = async (incidentId, score, severity, reason, overrideBy) => {
    try {
      const res = await fetch(`/api/emergencies/${incidentId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPriorityScore: score, newSeverity: severity, overrideReason: reason, overrideBy })
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencies(prev => prev.map(e => e.incidentId === incidentId ? data : e));
        return data;
      }
    } catch (e) {
      console.log("Overriding priority locally:", e);
    }

    setEmergencies(prev => prev.map(e => {
      if (e.incidentId === incidentId) {
        return { ...e, priorityScore: score, severity, overrideReason: reason, overrideBy };
      }
      return e;
    }));
  };

  const assignRescueTeam = async (incidentId, teamId, assignedBy) => {
    const team = rescueTeams.find(t => t.teamId === teamId);
    try {
      const res = await fetch('/api/rescue-teams/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, teamId, assignedBy })
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencies(prev => prev.map(e => e.incidentId === incidentId ? data : e));
        return data;
      }
    } catch (e) {
      console.log("Assigning rescue team locally:", e);
    }

    setEmergencies(prev => prev.map(e => {
      if (e.incidentId === incidentId) {
        return {
          ...e,
          assignedTeamId: teamId,
          assignedTeamName: team ? team.teamName : teamId,
          status: 'Rescue Team Assigned'
        };
      }
      return e;
    }));
    setRescueTeams(prev => prev.map(t => t.teamId === teamId ? { ...t, availabilityStatus: 'Dispatched', currentIncidentId: incidentId } : t));
  };

  const updateRescueMissionStatus = async (incidentId, teamId, status, notes) => {
    try {
      const res = await fetch('/api/rescue-teams/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, teamId, status, notes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.log("Updating mission status locally:", e);
    }

    let mappedStatus = 'Response in Progress';
    if (status === 'Assigned') mappedStatus = 'Rescue Team Assigned';
    else if (status === 'On the Way') mappedStatus = 'Rescue Team Dispatched';
    else if (status === 'Completed') mappedStatus = 'Emergency Resolved';

    setEmergencies(prev => prev.map(e => {
      if (e.incidentId === incidentId) {
        return { ...e, status: mappedStatus };
      }
      return e;
    }));
    setRescueTeams(prev => prev.map(t => t.teamId === teamId ? { ...t, availabilityStatus: status === 'Completed' ? 'Available' : 'On Mission' } : t));
  };

  const markNotificationRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: true } : n));
  };

  const resetDemoData = async () => {
    localStorage.removeItem(STORAGE_KEY_EMERGENCIES);
    setEmergencies(INITIAL_EMERGENCIES);
    setRescueTeams(INITIAL_RESCUE_TEAMS);
    setHospitals(INITIAL_HOSPITALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setServerStats(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <EmergencyContext.Provider value={{
      emergencies,
      rescueTeams,
      hospitals,
      notifications,
      stats,
      isLoading,
      wsConnected,
      activeToast,
      clearToast: () => setActiveToast(null),
      submitEmergency,
      updateStatus,
      overridePriority,
      assignRescueTeam,
      updateRescueMissionStatus,
      markNotificationRead,
      resetDemoData,
      unreadCount,
      refreshData: fetchData,

      // Weather Intelligence Exports (Open-Meteo)
      weatherData,
      weatherLocationName,
      weatherCoords,
      isWeatherLoading,
      refreshWeather,
      isWeatherModalOpen,
      setIsWeatherModalOpen,
      openWeatherModal: (lat = null, lon = null, locName = null) => {
        if (lat !== null && lon !== null) {
          refreshWeather(lat, lon, locName);
        }
        setIsWeatherModalOpen(true);
      }
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
