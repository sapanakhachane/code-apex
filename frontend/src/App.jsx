import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { FloatingChatbotWidget } from './components/FloatingChatbotWidget';
import { DisasterWeatherModal } from './components/DisasterWeatherModal';
import { useEmergency } from './context/EmergencyContext';

// Pages
import { Home } from './pages/Home';
import { ReportEmergency } from './pages/ReportEmergency';
import { LiveEmergencyMap } from './pages/LiveEmergencyMap';
import { EmergencyTracking } from './pages/EmergencyTracking';
import { AIAssistant } from './pages/AIAssistant';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { RescueDashboard } from './pages/RescueDashboard';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { NearbyHospitals } from './pages/NearbyHospitals';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About } from './pages/About';

import { X, ExternalLink, ShieldAlert } from 'lucide-react';

export function App() {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const { activeToast, clearToast } = useEmergency();

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Global Navbar */}
      <Navbar onToggleNotifications={() => setNotificationDrawerOpen(!notificationDrawerOpen)} />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report-emergency" element={<ReportEmergency />} />
          <Route path="/emergency-map" element={<LiveEmergencyMap />} />
          <Route path="/track-emergency" element={<EmergencyTracking />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
          <Route path="/rescue-dashboard" element={<RescueDashboard />} />
          <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
          <Route path="/hospitals" element={<NearbyHospitals />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      {/* Live WebSocket Toast Alert */}
      {activeToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-red-500/80 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h4 className="text-xs font-bold text-white font-mono">{activeToast.title}</h4>
            </div>
            <button onClick={clearToast} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeToast.message}</p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <Link
              to={`/track-emergency?id=${activeToast.incidentId}`}
              onClick={clearToast}
              className="text-cyan-400 hover:underline font-bold font-mono inline-flex items-center gap-1"
            >
              <span>Track Incident</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-slate-500 font-mono">Real-time WebSocket Push</span>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget on bottom right */}
      <FloatingChatbotWidget />

      {/* Global Open-Meteo Disaster Weather Intelligence Modal */}
      <DisasterWeatherModal />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default App;
