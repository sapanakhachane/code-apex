import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  Truck, ShieldAlert, CheckCircle, Navigation, MapPin,
  Clock, ArrowRight, Radio, AlertTriangle, PhoneCall, Check
} from 'lucide-react';

const RESCUE_STAGES = [
  'Assigned',
  'Accepted',
  'On the Way',
  'Arrived',
  'Rescue in Progress',
  'Completed'
];

export const RescueDashboard = () => {
  const {
    emergencies,
    rescueTeams,
    updateRescueMissionStatus,
    weatherData,
    openWeatherModal
  } = useEmergency();
  const { currentUser } = useAuth();

  // Pick logged in team or default demo team
  const currentTeam = rescueTeams.find(t => t.teamId === currentUser?.teamId) || rescueTeams[1] || rescueTeams[0];

  // Find missions assigned to this team
  const assignedIncidents = emergencies.filter(
    (e) => e.assignedTeamId === currentTeam?.teamId && e.status !== 'Emergency Resolved'
  );

  const activeMission = assignedIncidents[0] || emergencies[0];

  const [missionStatus, setMissionStatus] = useState(currentTeam?.availabilityStatus || 'En Route');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateStatus = async (stage) => {
    if (!activeMission) return;
    setIsUpdating(true);
    setMissionStatus(stage);
    try {
      await updateRescueMissionStatus(
        activeMission.incidentId,
        currentTeam.teamId,
        stage,
        statusNotes || `Stage progression to ${stage} confirmed by ${currentUser?.name || currentTeam.teamName}.`
      );
      setSuccessMsg(`Mission status advanced to "${stage}"! Authority and Citizen dashboards synchronized.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Rescue Unit Tactical Operations</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              FIELD RESPONDER HUD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time responder dispatch workflow, on-scene coordination, and milestone telemetry.
          </p>
        </div>

        {/* Current Team Identity Pill */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xl">
            🚒
          </div>
          <div className="text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Response Unit</span>
            <strong className="text-white text-sm">{currentTeam?.teamName}</strong>
            <p className="text-[11px] text-cyan-400 font-mono">ID: {currentTeam?.teamId} • Base: {currentTeam?.baseLocation?.address}</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Mission Control Layout */}
      {activeMission ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Mission Details & Stage Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-cyan-400">ASSIGNED DISPATCH TARGET</span>
                  <h2 className="text-xl font-black text-white">{activeMission.emergencyType}</h2>
                  <p className="text-xs font-mono text-slate-400">Incident ID: {activeMission.incidentId}</p>
                </div>
                <PriorityBadge score={activeMission.priorityScore} severity={activeMission.severity} size="lg" />
              </div>

              {/* Location & Navigation */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 block">Incident Coordinates:</span>
                    <strong className="text-white text-sm block mt-0.5">{activeMission.location?.address}</strong>
                    {activeMission.location?.landmark && (
                      <span className="text-cyan-400 text-xs block">Landmark: {activeMission.location.landmark}</span>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activeMission.location?.latitude},${activeMission.location?.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Open Navigation</span>
                  </a>
                </div>
              </div>

              {/* Casualty & Situation Brief */}
              <div className="text-xs space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block">Incident Situation Report:</strong>
                <p className="text-slate-300 leading-relaxed">{activeMission.description}</p>
                <div className="pt-2 flex items-center gap-6 text-slate-400 font-mono text-[11px]">
                  <span>Casualties: <strong className="text-red-400">{activeMission.injuredPeople} Injured</strong></span>
                  <span>Affected: <strong className="text-white">{activeMission.affectedPeople} People</strong></span>
                  <span>Caller: <strong className="text-white">{activeMission.callerName} ({activeMission.contactNumber})</strong></span>
                </div>
              </div>

              {/* On-Scene Tactical Weather Intelligence (Open-Meteo) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{weatherData?.interpretation?.icon || '🌤️'}</span>
                    <div>
                      <strong className="text-white block font-sans">
                        On-Scene Weather Telemetry ({weatherData?.interpretation?.description || 'Clear'})
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Open-Meteo Live API • Ground Wind & Precipitation Feed
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openWeatherModal(activeMission.location?.latitude, activeMission.location?.longitude, activeMission.location?.address)}
                    className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>🌦️ Full Radar</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Temperature:</span>
                    <strong className="text-white text-xs">{weatherData?.current?.temperature_2m !== undefined ? `${Math.round(weatherData.current.temperature_2m)}°C` : '31°C'}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ground Wind:</span>
                    <strong className="text-cyan-400 text-xs">{weatherData?.current?.wind_speed_10m || 8} km/h</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Precipitation:</span>
                    <strong className="text-blue-400 text-xs">{weatherData?.current?.precipitation || 0} mm/h</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Drone Flight:</span>
                    <strong className={`text-xs ${weatherData?.disasterAssessment?.aviationViability === 'Grounded' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {weatherData?.disasterAssessment?.aviationViability || 'Optimal'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 6-STAGE MISSION PROGRESSION BUTTONS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Update Field Mission Progression (6 Stages)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Current: {missionStatus}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {RESCUE_STAGES.map((stage, idx) => {
                    const isSelected = missionStatus === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleUpdateStatus(stage)}
                        disabled={isUpdating}
                        className={`p-3 rounded-xl border text-left transition-all text-xs font-bold flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30 ring-2 ring-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] opacity-75 font-mono">STAGE {idx + 1}</span>
                        <span className="mt-1">{stage}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  Note: Tactical status progressions instantly update the Central Command Cockpit and Citizen live tracker without GPS simulation latency.
                </p>
              </div>
            </div>

            {/* Tactical Gear & Equipment Checklist */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Assigned Unit Equipment Inventory
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(currentTeam?.equipment || []).map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Destination Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Destination Map
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">Target Marked</span>
              </div>
              <InteractiveMap
                emergencies={[activeMission]}
                selectedIncidentId={activeMission.incidentId}
                height="380px"
                center={[activeMission.location?.latitude || 19.076, activeMission.location?.longitude || 72.877]}
                zoom={14}
              />
            </div>

            {/* Mission Timeline Log */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Mission Action Log</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                {(activeMission.history || []).map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                      <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                      <span className="text-amber-400">{h.performedBy}</span>
                    </div>
                    <p className="text-slate-200 font-semibold mt-0.5">{h.action}</p>
                    {h.notes && <p className="text-slate-400 text-[10px]">{h.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
          No active rescue mission currently assigned to this unit.
        </div>
      )}
    </div>
  );
};
