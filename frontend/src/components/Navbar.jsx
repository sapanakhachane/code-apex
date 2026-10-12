import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert, Radio, Bell, Menu, X, Globe, User, LogOut,
  ChevronDown, Activity, Sparkles, MapPin, Truck
} from 'lucide-react';

export const Navbar = ({ onToggleNotifications }) => {
  const { currentUser, loginWithRole, logout } = useAuth();
  const { unreadCount, wsConnected } = useEmergency();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: t('navHome') },
    { path: '/report-emergency', label: t('navReport'), highlight: true },
    { path: '/emergency-map', label: t('navMap') },
    { path: '/track-emergency', label: t('navTracking') },
    { path: '/ai-assistant', label: t('navAssistant') },
    { path: '/authority-dashboard', label: t('navAuthority') },
    { path: '/rescue-dashboard', label: t('navRescue') },
    { path: '/hospitals', label: t('navHospitals') },
  ];

  const handleRoleSelect = (roleKey) => {
    loginWithRole(roleKey);
    setRoleMenuOpen(false);
    if (roleKey === 'authority') navigate('/authority-dashboard');
    else if (roleKey === 'rescue') navigate('/rescue-dashboard');
    else if (roleKey === 'citizen') navigate('/citizen-dashboard');
    else if (roleKey === 'hospital') navigate('/hospitals');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/85 backdrop-blur-xl">
      {/* Top Demo Notification Strip */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-cyan-950/70 border-b border-red-500/20 px-4 py-1 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-semibold border border-red-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-slate-400">
            Simulated Emergency Dispatch Network • Team Cognix
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-400">{wsConnected ? 'LIVE DISPATCH SYNC' : 'CONNECTING...'}</span>
          </div>
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 rounded px-1.5 py-0.5 border border-slate-700">
            <Globe className="w-3 h-3 text-cyan-400" />
            <button
              onClick={() => setLang('en')}
              className={`px-1 rounded text-[11px] ${lang === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              EN
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setLang('hi')}
              className={`px-1 rounded text-[11px] ${lang === 'hi' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              HI
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setLang('mr')}
              className={`px-1 rounded text-[11px] ${lang === 'mr' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              MR
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white font-mono group-hover:text-cyan-400 transition-colors">
              CRISISMESH <span className="text-red-500 font-bold">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-tight -mt-1 hidden sm:block">
              Emergency Response Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            if (link.highlight) {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="ml-2 px-3.5 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls: Notification Bell + Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-800/60 transition-all"
            title="Emergency Alert Center"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-[11px] font-bold text-white flex items-center justify-center animate-bounce shadow-md shadow-red-600/50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Switcher Dropdown (Interactive for Hackathon presentation) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-xs text-slate-200 transition-all"
            >
              <span className="text-base">{currentUser?.avatar || '👤'}</span>
              <div className="text-left hidden sm:block">
                <p className="font-semibold leading-none text-slate-100">{currentUser?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-cyan-400 leading-none mt-0.5">{currentUser?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demo Role Switcher</p>
                  <p className="text-[11px] text-slate-500">Instantly test persona workflows:</p>
                </div>
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => handleRoleSelect('citizen')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                  >
                    <span className="text-lg">👨‍💼</span>
                    <div>
                      <p className="font-medium text-slate-200">Citizen Reporter</p>
                      <p className="text-[10px] text-slate-400">Dr. Rajesh Sharma (Report & Track SOS)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('authority')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                  >
                    <span className="text-lg">🎖️</span>
                    <div>
                      <p className="font-medium text-purple-300">Authority Commander</p>
                      <p className="text-[10px] text-slate-400">Dir. K. Verma (Command & Override)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('rescue')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                  >
                    <span className="text-lg">🚑</span>
                    <div>
                      <p className="font-medium text-amber-300">Rescue Team Lead</p>
                      <p className="text-[10px] text-slate-400">Ambulance 12 (Mission Status)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('hospital')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                  >
                    <span className="text-lg">🏥</span>
                    <div>
                      <p className="font-medium text-emerald-300">Hospital Administrator</p>
                      <p className="text-[10px] text-slate-400">Dr. Ananya Roy (Trauma Center)</p>
                    </div>
                  </button>
                </div>
                <div className="pt-1 mt-1 border-t border-slate-800 flex justify-between px-2 py-1">
                  <Link
                    to="/about"
                    onClick={() => setRoleMenuOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-cyan-400"
                  >
                    About CrisisMesh
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setRoleMenuOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Login Page
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-navy-950/95 border-b border-slate-800 px-4 py-4 space-y-2 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                link.highlight
                  ? 'bg-red-600 text-white font-bold'
                  : location.pathname === link.path
                  ? 'text-cyan-400 bg-cyan-950/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Signed in as: <strong className="text-white">{currentUser?.role}</strong></span>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-cyan-400">
              Team Cognix
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
