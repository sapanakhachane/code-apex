import React, { useState, useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Filter, Search, RefreshCw, MapPin, Hospital, Layers,
  ShieldAlert, ChevronRight, Phone, Eye, ExternalLink
} from 'lucide-react';

export const LiveEmergencyMap = () => {
  const { emergencies, hospitals, refreshData } = useEmergency();

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
