import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [emergencies, setEmergencies] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      const [resEm, resTeams, resHosp, resNotif, resStats] = await Promise.all([
        fetch('/api/emergencies').then(r => r.ok ? r.json() : []),
        fetch('/api/rescue-teams').then(r => r.ok ? r.json() : []),
        fetch('/api/hospitals').then(r => r.ok ? r.json() : []),
        fetch('/api/notifications').then(r => r.ok ? r.json() : []),
        fetch('/api/dashboard/statistics').then(r => r.ok ? r.json() : null),
      ]);
      setEmergencies(resEm);
      setRescueTeams(resTeams);
      setHospitals(resHosp);
      setNotifications(resNotif);
      setStats(resStats);
    } catch (err) {
      console.warn("API offline or initial fetch failed, relying on mock cache:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket Connection for Real-Time Dispatch Alerts
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
            // Refresh stats
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

  // Action methods
  const submitEmergency = async (formData) => {
    const res = await fetch('/api/emergencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) throw new Error("Failed to submit emergency report");
    const data = await res.json();
    setEmergencies(prev => [data, ...prev]);
    fetchData();
    return data;
  };

  const updateStatus = async (incidentId, newStatus, notes, updatedBy) => {
    const res = await fetch(`/api/emergencies/${incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, notes, updatedBy })
    });
    if (!res.ok) throw new Error("Failed to update status");
    const data = await res.json();
    setEmergencies(prev => prev.map(e => e.incidentId === incidentId ? data : e));
    fetchData();
    return data;
  };

  const overridePriority = async (incidentId, score, severity, reason, overrideBy) => {
    const res = await fetch(`/api/emergencies/${incidentId}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPriorityScore: score,
        newSeverity: severity,
        overrideReason: reason,
        overrideBy
      })
    });
    if (!res.ok) throw new Error("Failed to override priority");
    const data = await res.json();
    setEmergencies(prev => prev.map(e => e.incidentId === incidentId ? data : e));
    fetchData();
    return data;
  };

  const assignRescueTeam = async (incidentId, teamId, assignedBy) => {
    const res = await fetch('/api/rescue-teams/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, teamId, assignedBy })
    });
    if (!res.ok) throw new Error("Failed to assign rescue team");
    const data = await res.json();
    setEmergencies(prev => prev.map(e => e.incidentId === incidentId ? data : e));
    fetchData();
    return data;
  };

  const updateRescueMissionStatus = async (incidentId, teamId, status, notes) => {
    const res = await fetch('/api/rescue-teams/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, teamId, status, notes })
    });
    if (!res.ok) throw new Error("Failed to update rescue mission status");
    const data = await res.json();
    fetchData();
    return data;
  };

  const markNotificationRead = async (notifId) => {
    await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: true } : n));
  };

  const resetDemoData = async () => {
    await fetch('/api/demo/reset', { method: 'POST' });
    fetchData();
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
      refreshData: fetchData
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
