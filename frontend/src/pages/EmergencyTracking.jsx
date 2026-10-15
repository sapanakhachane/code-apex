import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AISeverityCard } from '../components/AISeverityCard';
import {
  Search, ShieldAlert, CheckCircle2, Clock, Navigation, Users,
  Check, Phone, MapPin, AlertTriangle, ArrowRight, RefreshCw, Radio
} from 'lucide-react';

const STATUS_STAGES = [
  { id: 'Emergency Reported', label: 'Emergency Reported', desc: 'Distress SOS beacon registered' },
  { id: 'Report Received', label: 'Report Received', desc: 'Ingested into CrisisMesh central queue' },
  { id: 'Under Authority Review', label: 'Under Authority Review', desc: 'Gemini AI triage verified by command chief' },
  { id: 'Rescue Team Assigned', label: 'Rescue Team Assigned', desc: 'Specialized unit assigned to coordinates' },
  { id: 'Rescue Team Dispatched', label: 'Rescue Team Dispatched', desc: 'Responders mobilised & en route' },
  { id: 'Response in Progress', label: 'Response in Progress', desc: 'On-scene tactical operations underway' },
  { id: 'Emergency Resolved', label: 'Emergency Resolved', desc: 'Casualties secured & scene safe' },
];

export const EmergencyTracking = () => {
  const { emergencies, refreshData, openWeatherModal, weatherData } = useEmergency();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [searchId, setSearchId] = useState(queryId || 'INC-2026-9041');
  const [activeIncident, setActiveIncident] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync with incident
  useEffect(() => {
    if (!emergencies || emergencies.length === 0) return;
    const targetId = queryId || searchId;
    const match = emergencies.find((e) => e.incidentId.toLowerCase() === targetId?.toLowerCase());
    if (match) {
      setActiveIncident(match);
    } else {
      setActiveIncident(emergencies[0]);
      setSearchId(emergencies[0].incidentId);
    }
  }, [emergencies, queryId]);

  const handleSearch = (e) => {
    e.preventDefault();
    const match = emergencies.find((e) => e.incidentId.toLowerCase() === searchId.trim().toLowerCase());
    if (match) {
      setActiveIncident(match);
    } else {
      alert(`Incident ID "${searchId}" not found in current records.`);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Find index of current stage in STATUS_STAGES
  const currentStageIndex = activeIncident
    ? STATUS_STAGES.findIndex((s) => s.id === activeIncident.status)
    : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME DISPATCH TELEMETRY</span>
        </div>
        <h1 className="text-3xl font-black text-white">Live Emergency Tracking</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Track rescue team dispatch progression, AI triage status, and situational updates in real time.
        </p>
      </div>

      {/* Incident Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Incident ID (e.g. INC-2026-9041)"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition-all"
        >
          Track ID
        </button>
      </form>

      {/* Quick Incident Pill Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-500 text-[11px]">Quick Samples:</span>
        {emergencies.slice(0, 4).map((inc) => (
          <button
            key={inc.incidentId}
            onClick={() => {
              setSearchId(inc.incidentId);
              setActiveIncident(inc);
            }}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
              activeIncident?.incidentId === inc.incidentId
                ? 'bg-red-950/60 text-red-300 border-red-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {inc.incidentId}
          </button>
        ))}
      </div>

      {activeIncident ? (
        <div className="space-y-6">
          {/* Main Status Overview Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-white font-mono">{activeIncident.incidentId}</h2>
                  <PriorityBadge score={activeIncident.priorityScore} severity={activeIncident.severity} size="md" />
                </div>
                <p className="text-base font-bold text-slate-200 mt-1">{activeIncident.emergencyType}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  📍 {activeIncident.location?.address} {activeIncident.location?.landmark ? `(${activeIncident.location.landmark})` : ''}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <StatusBadge status={activeIncident.status} size="lg" />
                <button
                  onClick={handleManualRefresh}
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Latest update: {new Date(activeIncident.updatedAt).toLocaleTimeString()}</span>
                </button>
              </div>
            </div>

            {/* Live Open-Meteo Meteorological Incident Briefing */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-xl">{weatherData?.interpretation?.icon || '🌤️'}</span>
                <div>
                  <span className="font-bold text-white block">
                    Micro-Climate at Incident Site: {weatherData?.current?.temperature_2m !== undefined ? `${Math.round(weatherData.current.temperature_2m)}°C` : '31°C'} ({weatherData?.interpretation?.description || 'Mainly Clear'})
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>💨 Wind: {weatherData?.current?.wind_speed_10m || 8} km/h</span>
                    <span>•</span>
                    <span>💧 Humidity: {weatherData?.current?.relative_humidity_2m || 60}%</span>
                    <span>•</span>
                    <span>🌧️ Precip: {weatherData?.current?.precipitation || 0} mm</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openWeatherModal(activeIncident.location?.latitude, activeIncident.location?.longitude, activeIncident.location?.address)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <span>🌦️ Weather Radar</span>
              </button>
            </div>

            {/* Visual 7-Step Progress Stepper */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Emergency Response Lifecycle Timeline
              </h3>

              <div className="relative">
                {/* Horizontal progress bar for desktop */}
                <div className="hidden md:grid grid-cols-7 gap-2">
                  {STATUS_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.id} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse ring-2 ring-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-2 leading-tight ${
                            isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-600'
                          }`}
                        >
                          {stage.label}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">
                          {stage.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Vertical Stepper for mobile screens */}
                <div className="md:hidden space-y-4">
                  {STATUS_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.id} className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-red-600 text-white ring-2 ring-white animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                            {stage.label}
                          </p>
                          <p className="text-[10px] text-slate-500">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Responder Unit Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xl">
                  🚑
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Assigned Emergency Responder</span>
                  <strong className="text-sm text-white">
                    {activeIncident.assignedTeamName || 'Dispatching Closest Available Unit...'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/rescue-dashboard"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  View Responder Mission
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeIncident.location?.latitude},${activeIncident.location?.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-xs font-semibold text-cyan-400"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* AI Analysis and History Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Assessment */}
            <div>
              <AISeverityCard analysis={activeIncident.aiAnalysis} />
            </div>

            {/* Historical Action Audit Log */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Tactical Audit Trail</span>
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activeIncident.history && activeIncident.history.length > 0 ? (
                  activeIncident.history.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                        <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                        <span className="text-cyan-400 font-semibold">{h.performedBy}</span>
                      </div>
                      <p className="font-semibold text-white">{h.action}</p>
                      {h.notes && <p className="text-slate-400 text-[11px]">{h.notes}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No previous audit logs.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs">
          Loading incident information...
        </div>
      )}
    </div>
  );
};
