import React from 'react';
import { Link } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { useLanguage } from '../context/LanguageContext';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ShieldAlert, Radio, Activity, Navigation, HeartHandshake,
  Bot, Hospital, Bell, ArrowRight, Zap, CheckCircle2,
  Users, AlertTriangle, ShieldCheck, Flame, Compass, Sparkles, CloudSun
} from 'lucide-react';

export const Home = () => {
  const { emergencies, stats, isLoading, openWeatherModal } = useEmergency();
  const { t } = useLanguage();

  const recentIncidents = emergencies.slice(0, 3);

  const featureCards = [
    {
      id: 1,
      title: "AI-Based SOS Reporting",
      desc: "Instant geolocation tagging, multi-factor casualty triage, and 1-click distress beacon submission.",
      icon: <Flame className="w-6 h-6 text-red-500" />,
      color: "border-red-500/30 hover:border-red-500/70",
      link: "/report-emergency",
      btnText: "Report Emergency"
    },
    {
      id: 2,
      title: "AI Severity Prediction",
      desc: "Google Gemini evaluates danger keywords, casualty count, and structural risk into a 0-100 triage score.",
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      color: "border-cyan-500/30 hover:border-cyan-500/70",
      link: "/report-emergency",
      btnText: "Explore AI Triage"
    },
    {
      id: 3,
      title: "Live Emergency Map",
      desc: "Interactive GIS command grid with color-coded severity markers, radius filters, and hospital layer.",
      icon: <Navigation className="w-6 h-6 text-blue-400" />,
      color: "border-blue-500/30 hover:border-blue-500/70",
      link: "/emergency-map",
      btnText: "Open Live Map"
    },
    {
      id: 4,
      title: "Open-Meteo Weather Radar",
      desc: "Live meteorological telemetry calculating wildfire wind spread, flash flood risk, and rescue drone viability.",
      icon: <CloudSun className="w-6 h-6 text-cyan-400" />,
      color: "border-cyan-500/30 hover:border-cyan-500/70",
      link: "/emergency-map",
      onClick: () => openWeatherModal(),
      btnText: "Launch Weather Radar"
    },
    {
      id: 5,
      title: "Emergency AI Chatbot",
      desc: "24/7 multilingual assistant for first aid guidance, CPR cadence, evacuation safety, and distress protocols.",
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      color: "border-purple-500/30 hover:border-purple-500/70",
      link: "/ai-assistant",
      btnText: "Chat with Assistant"
    },
    {
      id: 6,
      title: "Rescue Team Assignment",
      desc: "Tactical dispatch routing matching Fire, ALS Trauma, and NDRF disaster teams by proximity and capability.",
      icon: <Users className="w-6 h-6 text-amber-400" />,
      color: "border-amber-500/30 hover:border-amber-500/70",
      link: "/rescue-dashboard",
      btnText: "Rescue Operations"
    },
    {
      id: 7,
      title: "Nearby Hospital Recommendation",
      desc: "Live trauma center discovery with real-time distance calculations, trauma ratings, and direct routing.",
      icon: <Hospital className="w-6 h-6 text-emerald-400" />,
      color: "border-emerald-500/30 hover:border-emerald-500/70",
      link: "/hospitals",
      btnText: "Locate Hospitals"
    },
    {
      id: 8,
      title: "Authority Dashboard",
      desc: "Comprehensive command cockpit with priority override, incident history logs, and Recharts analytics.",
      icon: <Activity className="w-6 h-6 text-rose-400" />,
      color: "border-rose-500/30 hover:border-rose-500/70",
      link: "/authority-dashboard",
      btnText: "Authority Portal"
    },
    {
      id: 9,
      title: "Live Status Notifications",
      desc: "WebSocket-powered instant dispatcher updates tracking all 7 incident stages from report to full resolution.",
      icon: <Bell className="w-6 h-6 text-sky-400" />,
      color: "border-sky-500/30 hover:border-sky-500/70",
      link: "/track-emergency",
      btnText: "Track Live Status"
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Futuristic Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subheading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-red-500/40 text-xs font-mono text-red-400 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>AI-POWERED EMERGENCY TRIAGE & DISPATCH NETWORK</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Every Second Matters.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-cyan-400">
                  Every Life Counts.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                CrisisMesh AI uses artificial intelligence, real-time information, and intelligent emergency coordination to connect citizens with rescue teams faster.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/report-emergency"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:brightness-110 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <span className="text-xl group-hover:scale-125 transition-transform">🔴</span>
                  <span>REPORT EMERGENCY</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/emergency-map"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 font-bold text-base border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🔵</span>
                  <span>EXPLORE LIVE MAP</span>
                </Link>
              </div>

              {/* Sub-banner disclaimer */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  International Hackathon Prototype
                </span>
                <span>•</span>
                <span>Team Cognix</span>
                <span>•</span>
                <span className="text-slate-400">Simulated Dispatch Demo</span>
              </div>
            </div>

            {/* Right Column: Animated Futuristic Command Center Visualization */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl p-1 bg-gradient-to-br from-red-500/40 via-cyan-500/30 to-slate-800 shadow-2xl">
                <div className="rounded-2xl bg-navy-950/95 p-6 backdrop-blur-2xl border border-slate-800/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono text-xs font-bold text-slate-200">TACTICAL DISPATCH HUD</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      LIVE RADAR ACTIVE
                    </span>
                  </div>

                  {/* Simulated Radar Screen */}
                  <div className="relative h-48 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center overflow-hidden">
                    <div className="radar-ring" />
                    <div className="radar-ring" style={{ animationDelay: '1s' }} />
                    <div className="radar-ring" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                    <div className="relative z-10 text-center space-y-1">
                      <div className="w-10 h-10 mx-auto rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-white text-lg animate-pulse">
                        🚨
                      </div>
                      <p className="text-xs font-mono font-bold text-white">INC-2026-9041</p>
                      <p className="text-[11px] text-cyan-400">AI Priority: 92/100 (Critical)</p>
                      <span className="text-[10px] text-slate-400 font-mono">Bandra Flyover • ALS Unit En Route</span>
                    </div>
                  </div>

                  {/* Quick Incident Snippets */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Stream Alerts</p>
                    {recentIncidents.map((inc) => (
                      <Link
                        key={inc.incidentId}
                        to={`/track-emergency?id=${inc.incidentId}`}
                        className="block p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-400">{inc.incidentId}</span>
                          <PriorityBadge score={inc.priorityScore} severity={inc.severity} size="sm" />
                        </div>
                        <p className="text-slate-300 font-medium truncate mt-1">{inc.emergencyType} - {inc.location?.address}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-1 rounded-2xl bg-gradient-to-r from-red-600/30 via-slate-800 to-cyan-500/30">
          <div className="rounded-2xl bg-navy-950/95 p-6 sm:p-8 backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 border-b border-slate-800 pb-4 gap-2">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider font-mono">
                  Live Dispatch Metrics
                </h3>
                <p className="text-xs text-slate-400">Real-time statistics synchronized across responders</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-red-950 text-red-400 border border-red-500/40">
                DEMO MODE – Simulated Emergency Data
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Total Emergency Reports</span>
                <span className="text-3xl font-black font-mono text-white mt-1 block">
                  {stats?.totalIncidents ?? emergencies.length}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">100% Logged</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Active Emergencies</span>
                <span className="text-3xl font-black font-mono text-amber-400 mt-1 block">
                  {stats?.activeIncidents ?? 4}
                </span>
                <span className="text-[10px] text-amber-300 font-mono mt-0.5 block">Under Response</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Resolved Emergencies</span>
                <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
                  {stats?.resolvedIncidents ?? 1}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono mt-0.5 block">Completed</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Available Rescue Teams</span>
                <span className="text-3xl font-black font-mono text-cyan-400 mt-1 block">
                  {stats?.availableRescueTeams ?? 3}
                </span>
                <span className="text-[10px] text-cyan-300 font-mono mt-0.5 block">Ready on Standby</span>
              </div>

              <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
                <span className="text-xs text-red-300 block font-medium">High & Critical Incidents</span>
                <span className="text-3xl font-black font-mono text-red-400 mt-1 block">
                  {(stats?.criticalIncidents || 0) + (stats?.highPriorityIncidents || 0) || 3}
                </span>
                <span className="text-[10px] text-red-300 font-mono mt-0.5 block">Elevated Alert</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 INTERACTIVE FEATURE CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
            INTELLIGENT COMMAND ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Eight Integrated Emergency Response Pillars
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every module is engineered for rapid situational awareness, zero latency dispatch, and synchronized civil protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feat) => (
            <div
              key={feat.id}
              className={`p-6 rounded-2xl bg-slate-900/70 border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between group ${feat.color}`}
            >
              <div>
                <div className="p-3 rounded-xl bg-slate-800/80 w-fit mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <Link
                  to={feat.link}
                  onClick={(e) => {
                    if (feat.onClick) {
                      e.preventDefault();
                      feat.onClick();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group-hover:underline"
                >
                  <span>{feat.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAST ACCESS SOS CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950 via-slate-900 to-navy-950 border border-red-500/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600 flex items-center justify-center text-3xl shadow-xl shadow-red-600/40 animate-pulse">
            🚨
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-white">Witnessing or Experiencing an Emergency?</h2>
            <p className="text-sm text-slate-300">
              Submit your report now. CrisisMesh AI automatically parses your GPS location, classifies urgency, and dispatches the closest specialized unit.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              to="/report-emergency"
              className="px-10 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-xl shadow-red-600/40 transition-all flex items-center gap-3"
            >
              <Flame className="w-6 h-6 animate-bounce" />
              <span>LAUNCH SOS EMERGENCY REPORT</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
