import React, { useState, useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { WeatherBadge } from '../components/WeatherBadge';
import {
  Filter, Search, RefreshCw, MapPin, Hospital, Layers,
  ShieldAlert, ChevronRight, Phone, Eye, ExternalLink,
  CloudSun, Wind, Droplets, AlertTriangle, Compass
} from 'lucide-react';

export const LiveEmergencyMap = () => {
  const {
    emergencies,
    hospitals,
    refreshData,
    weatherData,
    weatherLocationName,
    openWeatherModal,
    refreshWeather
  } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const emergencyTypes = [
    'ALL',
    'Fire Emergency',
    'Road Accident',
    'Flood',
    'Earthquake',
    'Medical Emergency',
    'Building Collapse',
    'Natural Disaster',
    'Other Emergency'
  ];

  const priorities = ['ALL', 'Critical', 'High', 'Moderate', 'Low'];
  const statuses = [
    'ALL',
    'Emergency Reported',
    'Under Authority Review',
    'Rescue Team Assigned',
    'Rescue Team Dispatched',
    'Response in Progress',
    'Emergency Resolved'
  ];

  // Filtered incidents
  const filteredEmergencies = useMemo(() => {
    return emergencies.filter((inc) => {
      if (selectedType !== 'ALL' && inc.emergencyType !== selectedType) return false;
      if (selectedPriority !== 'ALL' && inc.severity !== selectedPriority) return false;
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = inc.incidentId?.toLowerCase().includes(q);
        const matchDesc = inc.description?.toLowerCase().includes(q);
        const matchAddr = inc.location?.address?.toLowerCase().includes(q);
        if (!matchId && !matchDesc && !matchAddr) return false;
      }
      return true;
    });
  }, [emergencies, selectedType, selectedPriority, selectedStatus, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Live Emergency Tactical Map</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              GIS COMMAND
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial visualization of distress beacons, rescue units, and trauma facilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <WeatherBadge className="hidden sm:flex" />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, ID, keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Emergency Type */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {emergencyTypes.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Incident Types' : t}</option>)}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {priorities.map(p => <option key={p} value={p}>{p === 'ALL' ? 'All Severities' : `${p} Priority`}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Open-Meteo Meteorological Intelligence Radar Ribbon */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-navy-950 to-slate-900/90 border border-cyan-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg">
            {weatherData?.interpretation?.icon || '🌤️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white">
                {weatherLocationName}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                LIVE METEOROLOGY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {weatherData?.current?.temperature_2m !== undefined ? `${Math.round(weatherData.current.temperature_2m)}°C` : '31°C'} • {weatherData?.interpretation?.description || 'Mainly Clear'} • Wind: {weatherData?.current?.wind_speed_10m || 8} km/h • Precip: {weatherData?.current?.precipitation || 0} mm/h
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">Disaster Threat:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
              weatherData?.disasterAssessment?.threatLevel === 'Critical'
                ? 'bg-red-950 text-red-400 border-red-800'
                : weatherData?.disasterAssessment?.threatLevel === 'High'
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
            }`}>
              {weatherData?.disasterAssessment?.threatLevel || 'LOW'}
            </span>
          </div>

          <button
            onClick={() => openWeatherModal()}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <span>🌦️ Weather Center</span>
          </button>
        </div>
      </div>

      {/* Main Map View + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-8">
          <InteractiveMap
            emergencies={filteredEmergencies}
            hospitals={hospitals}
            selectedIncidentId={selectedIncident?.incidentId}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="620px"
          />
        </div>

        {/* Incidents List & Detail Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Map Incidents ({filteredEmergencies.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Click card to focus</span>
          </div>

          <div className="max-h-[570px] overflow-y-auto space-y-3 pr-1">
            {filteredEmergencies.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-xs">
                No incidents match current filters.
              </div>
            ) : (
              filteredEmergencies.map((inc) => {
                const isSelected = selectedIncident?.incidentId === inc.incidentId;
                return (
                  <div
                    key={inc.incidentId}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{inc.incidentId}</span>
                      <PriorityBadge score={inc.priorityScore} severity={inc.severity} size="sm" />
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1.5">{inc.emergencyType}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{inc.description}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[160px]">📍 {inc.location?.address}</span>
                      <StatusBadge status={inc.status} size="sm" />
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2 border-t border-slate-700/80 flex gap-2">
                        <a
                          href={`/track-emergency?id=${inc.incidentId}`}
                          className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold text-center"
                        >
                          Track Full Flow
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openWeatherModal(
                              inc.location?.latitude,
                              inc.location?.longitude,
                              `${inc.emergencyType} – ${inc.location?.address?.split(',')[0] || 'Incident Site'}`
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-400 text-xs font-semibold flex items-center gap-1"
                          title="View live Open-Meteo micro-climate for this incident location"
                        >
                          <span>🌦️ Weather</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
