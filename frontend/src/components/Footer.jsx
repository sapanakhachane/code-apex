import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PhoneCall, Heart, Award, Shield, AlertTriangle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950 text-slate-400 mt-20">
      {/* Emergency Call Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/20 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/40">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-wide">IMMEDIATE LIFE-THREATENING EMERGENCY?</h4>
              <p className="text-xs text-slate-300">Do not wait for web responses. Dial direct emergency helplines immediately:</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:112"
              className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-black text-sm font-mono shadow-lg hover:bg-red-500 transition-colors"
            >
              📞 112 (National Emergency)
            </a>
            <a
              href="tel:101"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700 hover:border-red-500 transition-colors"
            >
              🚒 101 (Fire)
            </a>
            <a
              href="tel:108"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700 hover:border-red-500 transition-colors"
            >
              🚑 108 (Ambulance)
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                🚨
              </div>
              <span className="text-base font-black text-white font-mono tracking-wider">
                CRISISMESH <span className="text-red-500">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connecting People, AI, and Responders to Save Lives Faster. Built for international disaster resilience and real-time coordination.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Developed by <strong>Team Cognix</strong></span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Navigation</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home Landing</Link></li>
              <li><Link to="/report-emergency" className="text-red-400 font-semibold hover:text-red-300 transition-colors">🔴 Report Emergency (SOS)</Link></li>
              <li><Link to="/emergency-map" className="hover:text-cyan-400 transition-colors">Live Emergency Map</Link></li>
              <li><Link to="/track-emergency" className="hover:text-cyan-400 transition-colors">Incident Tracking</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-cyan-400 transition-colors">CrisisMesh AI Assistant</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Command Portals</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/authority-dashboard" className="hover:text-cyan-400 transition-colors">Authority Command Center</Link></li>
              <li><Link to="/rescue-dashboard" className="hover:text-cyan-400 transition-colors">Rescue Team Operations</Link></li>
              <li><Link to="/citizen-dashboard" className="hover:text-cyan-400 transition-colors">Citizen Emergency Portal</Link></li>
              <li><Link to="/hospitals" className="hover:text-cyan-400 transition-colors">Nearby Trauma Hospitals</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About & System Architecture</Link></li>
            </ul>
          </div>

          {/* System Safety Notice */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">System Advisory</h5>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Advisory AI Notice</span>
              </div>
              <p>
                AI priority scoring is strictly decision-support intelligence. Human dispatchers retain full override authority.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CrisisMesh AI. Built by Team Cognix. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
              <Shield className="w-3.5 h-3.5" /> Systems Fully Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
