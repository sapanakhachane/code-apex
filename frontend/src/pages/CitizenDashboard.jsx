import React from 'react';
import { Link } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Flame, ShieldCheck, MapPin, Clock, Phone, AlertCircle,
  ArrowRight, Radio, ExternalLink, Heart
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { emergencies } = useEmergency();
  const { currentUser } = useAuth();

  // Find incidents reported by this citizen or general demo citizen
  const myReports = emergencies.filter(
    (e) => e.userId === currentUser?.uid || e.callerName === currentUser?.name
  );

  const displayReports = myReports.length > 0 ? myReports : emergencies.slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Citizen Safety Portal</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              CITIZEN PROFILE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review your submitted emergency reports, track dispatched aid, and access local community alert bulletins.
          </p>
        </div>

        <Link
          to="/report-emergency"
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 shrink-0"
        >
          <Flame className="w-4 h-4 animate-pulse" />
          <span>REPORT NEW INCIDENT</span>
        </Link>
      </div>

      {/* Citizen Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-3xl">
            {currentUser?.avatar || '👨‍💼'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{currentUser?.name || 'Citizen User'}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Citizen
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser?.email} • {currentUser?.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-center">
            <span className="text-[10px] text-slate-500 block">Submitted SOS Beacons</span>
            <strong className="text-white font-mono text-base">{displayReports.length}</strong>
          </div>
        </div>
      </div>

      {/* My Reported Incidents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            My Submitted Emergency SOS Reports
          </h2>
          <span className="text-xs text-slate-400">Live Status Stream</span>
        </div>

        <div className="space-y-4">
          {displayReports.map((inc) => (
            <div
              key={inc.incidentId}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-cyan-400 text-sm">{inc.incidentId}</span>
                  <PriorityBadge score={inc.priorityScore} severity={inc.severity} size="sm" />
                </div>
                <StatusBadge status={inc.status} size="sm" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{inc.emergencyType}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{inc.location?.address}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-400">
                  <span>Assigned Unit: </span>
                  <strong className="text-cyan-300 font-mono">
                    {inc.assignedTeamName || 'Under Command Review'}
                  </strong>
                </div>

                <Link
                  to={`/track-emergency?id=${inc.incidentId}`}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Track Real-Time Progress</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Emergency Bulletins */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Active Civil Defense Advisories (Mumbai Metro Zone)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Western Express Highway Traffic Diversion</strong>
            <p className="text-slate-400">
              Multiple vehicle collision at Kalanagar Junction flyover. Motorists advised to divert to SV Road or Bandra-Worli Sea Link.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-cyan-300 block">Monsoon High Tide Safety Alert</strong>
            <p className="text-slate-400">
              High tide anticipated at 21:15 IST. Coastal promenades and low-lying subways are equipped with SDRF water rescue teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
