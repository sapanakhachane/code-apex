import React, { useState, useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AISeverityCard } from '../components/AISeverityCard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
  ShieldAlert, Activity, Users, Flame, CheckCircle, AlertTriangle,
  Search, Filter, ExternalLink, RefreshCw, X, Shield, ArrowUpRight,
  Sliders, UserCheck, Check, Radio, Award
} from 'lucide-react';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#06B6D4', '#8B5CF6'];

export const AuthorityDashboard = () => {
  const { emergencies, rescueTeams, stats, updateStatus, overridePriority, assignRescueTeam, refreshData } = useEmergency();
  const { currentUser } = useAuth();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Command Action Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalTab, setModalTab] = useState('overview'); // 'overview' | 'override' | 'assign' | 'status'

  // Override Form State
  const [newScore, setNewScore] = useState(85);
  const [newSeverity, setNewSeverity] = useState('Critical');
  const [overrideReason, setOverrideReason] = useState('Ground personnel verified active fire hazard spread.');

  // Assign Team State
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Status Update State
  const [selectedNewStatus, setSelectedNewStatus] = useState('Response in Progress');
  const [statusNotes, setStatusNotes] = useState('');

  // Action status feedback
  const [actionSuccess, setActionSuccess] = useState('');

  // Filtered List
  const filteredIncidents = useMemo(() => {
    return emergencies.filter((inc) => {
      if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && inc.severity !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          inc.incidentId?.toLowerCase().includes(q) ||
          inc.emergencyType?.toLowerCase().includes(q) ||
          inc.location?.address?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [emergencies, statusFilter, priorityFilter, search]);

  // Open Modal Helper
  const handleOpenActionModal = (inc) => {
    setSelectedIncident(inc);
    setNewScore(inc.priorityScore);
    setNewSeverity(inc.severity);
    setSelectedNewStatus(inc.status);
    setSelectedTeamId(inc.assignedTeamId || (rescueTeams[0]?.teamId || ''));
    setModalTab('overview');
    setActionSuccess('');
  };

  // Submit Override
  const handleApplyOverride = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    await overridePriority(
      selectedIncident.incidentId,
      Number(newScore),
      newSeverity,
      overrideReason,
      currentUser?.name || "Commander"
    );
    setActionSuccess("Priority updated successfully.");
    setTimeout(() => setSelectedIncident(null), 1200);
  };

  // Submit Team Assignment
  const handleApplyAssignment = async (e) => {
    e.preventDefault();
    if (!selectedIncident || !selectedTeamId) return;
    await assignRescueTeam(
      selectedIncident.incidentId,
      selectedTeamId,
      currentUser?.name || "Authority Dispatcher"
    );
    setActionSuccess("Rescue unit assigned and mobilized.");
    setTimeout(() => setSelectedIncident(null), 1200);
  };

  // Submit Status Update
  const handleApplyStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    await updateStatus(
      selectedIncident.incidentId,
      selectedNewStatus,
      statusNotes,
      currentUser?.name || "Authority Dispatch"
    );
    setActionSuccess("Status updated and logged to audit trail.");
    setTimeout(() => setSelectedIncident(null), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Authority Command Cockpit</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              TACTICAL AUTHORITY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency triage validation, resource dispatching, and audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            Commander: <strong className="text-white">{currentUser?.name || 'Chief Director'}</strong>
          </div>
          <button
            onClick={refreshData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh All Records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Incidents</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">
            {stats?.totalIncidents ?? emergencies.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Active Incidents</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
            {stats?.activeIncidents ?? 4}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
          <span className="text-[11px] text-red-300 uppercase tracking-wider block">Critical Emergencies</span>
          <span className="text-2xl font-black font-mono text-red-400 mt-1 block">
            {stats?.criticalIncidents ?? 2}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black font-mono text-purple-400 mt-1 block">
            {emergencies.filter(e => e.status === 'Under Authority Review').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Assigned Teams</span>
          <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
            {rescueTeams.filter(t => t.availabilityStatus !== 'Available').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Resolved Cases</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
            {stats?.resolvedIncidents ?? 1}
          </span>
        </div>
      </div>

      {/* Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident Type Distribution BarChart */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Emergency Type Distribution</span>
            <span className="text-[10px] text-slate-500 font-mono">Live Ingestion</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.emergencyTypeDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E172A', borderColor: '#1E2D4F', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {(stats?.emergencyTypeDistribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Severity Breakdown PieChart */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Severity Proportions
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.priorityDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  <Cell fill="#EF4444" />
                  <Cell fill="#F97316" />
                  <Cell fill="#EAB308" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E172A', borderColor: '#1E2D4F', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Ingestion Trend */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            24-Hr Case Inflow
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trendSeries || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E172A', borderColor: '#1E2D4F', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#EF4444" fill="rgba(239,68,68,0.2)" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" fill="rgba(16,185,129,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Emergency Management Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Emergency Incident Management</h3>
            <p className="text-xs text-slate-400">Click "Manage" on any incident to assign units or override priority.</p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, location..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="Under Authority Review">Under Review</option>
              <option value="Rescue Team Assigned">Assigned</option>
              <option value="Response in Progress">In Progress</option>
              <option value="Emergency Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">AI Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Team</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3 text-right">Command Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.map((inc) => (
                <tr key={inc.incidentId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    {inc.incidentId}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {inc.emergencyType}
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                    {inc.location?.address}
                  </td>
                  <td className="py-3 px-3">
                    <PriorityBadge score={inc.priorityScore} severity={inc.severity} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={inc.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {inc.assignedTeamName ? (
                      <span className="text-cyan-300">{inc.assignedTeamName}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenActionModal(inc)}
                      className="px-3 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-[11px] shadow-md transition-all"
                    >
                      Command Unit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTHORITY ACTION MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-navy-950 border border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold text-sm">{selectedIncident.incidentId}</span>
                  <PriorityBadge score={selectedIncident.priorityScore} severity={selectedIncident.severity} size="sm" />
                </div>
                <h3 className="text-base font-black text-white mt-0.5">{selectedIncident.emergencyType}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 gap-2 text-xs">
              <button
                onClick={() => setModalTab('overview')}
                className={`pb-2 px-2 font-bold ${modalTab === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
              >
                Incident Overview
              </button>
              <button
                onClick={() => setModalTab('override')}
                className={`pb-2 px-2 font-bold ${modalTab === 'override' ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-400'}`}
              >
                Override Priority
              </button>
              <button
                onClick={() => setModalTab('assign')}
                className={`pb-2 px-2 font-bold ${modalTab === 'assign' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
              >
                Assign Rescue Unit
              </button>
              <button
                onClick={() => setModalTab('status')}
                className={`pb-2 px-2 font-bold ${modalTab === 'status' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}
              >
                Advance Status
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {modalTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <p><strong>Description:</strong> {selectedIncident.description}</p>
                  <p><strong>Location:</strong> {selectedIncident.location?.address} ({selectedIncident.location?.landmark || 'No landmark'})</p>
                  <p><strong>Reporter:</strong> {selectedIncident.callerName} ({selectedIncident.contactNumber})</p>
                  <p><strong>Affected / Injured:</strong> {selectedIncident.affectedPeople} affected, {selectedIncident.injuredPeople} injured</p>
                </div>

                <AISeverityCard analysis={selectedIncident.aiAnalysis} />
              </div>
            )}

            {/* TAB 2: OVERRIDE PRIORITY */}
            {modalTab === 'override' && (
              <form onSubmit={handleApplyOverride} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200">
                  <p><strong>Human Override Rule:</strong> Responders have ultimate authority. Overriding modifies dispatch prioritization queue and records this action into the immutable audit trail.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">New Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Severity Category</label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="Critical">Critical (76-100)</option>
                      <option value="High">High (51-75)</option>
                      <option value="Moderate">Moderate (26-50)</option>
                      <option value="Low">Low (0-25)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Override Justification *</label>
                  <textarea
                    required
                    rows="2"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="State reason for overriding AI recommendation..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Commit Priority Override
                </button>
              </form>
            )}

            {/* TAB 3: ASSIGN RESCUE TEAM (Smart Recommendation Feature 17C) */}
            {modalTab === 'assign' && (
              <form onSubmit={handleApplyAssignment} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-300">
                  <p><strong>Smart Team Recommendation:</strong> Specialized teams sorted by distance, equipment capability, and availability status.</p>
                </div>

                <div className="space-y-2">
                  {rescueTeams.map((team) => {
                    const isSelected = selectedTeamId === team.teamId;
                    const isAvailable = team.availabilityStatus === 'Available';

                    return (
                      <div
                        key={team.teamId}
                        onClick={() => setSelectedTeamId(team.teamId)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white">{team.teamName}</strong>
                            <span className="font-mono text-[10px] text-slate-400">({team.teamId})</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{team.baseLocation?.address}</p>
                          <p className="text-[10px] text-cyan-300">Equipped: {team.equipment.slice(0, 2).join(', ')}</p>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isAvailable ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                            {team.availabilityStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={!selectedTeamId}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-50"
                >
                  Confirm Tactical Dispatch Assignment
                </button>
              </form>
            )}

            {/* TAB 4: ADVANCE STATUS */}
            {modalTab === 'status' && (
              <form onSubmit={handleApplyStatusUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Select Workflow Status</label>
                  <select
                    value={selectedNewStatus}
                    onChange={(e) => setSelectedNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Under Authority Review">Under Authority Review</option>
                    <option value="Rescue Team Assigned">Rescue Team Assigned</option>
                    <option value="Rescue Team Dispatched">Rescue Team Dispatched</option>
                    <option value="Response in Progress">Response in Progress</option>
                    <option value="Emergency Resolved">Emergency Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Operational Notes</label>
                  <textarea
                    rows="2"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Log status milestone details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Update & Synchronize Incident Status
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
