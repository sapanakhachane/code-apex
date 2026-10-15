import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Award, Cpu, Database, Activity, CheckCircle2,
  Lock, ArrowRight, Heart, Users, Globe, Flame
} from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-red-500/40 text-xs font-mono text-red-400">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>TEAM COGNIX • INTERNATIONAL HACKATHON ENTRY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          CrisisMesh AI – Emergency Response Intelligence
        </h1>
        <p className="text-base text-slate-300 max-w-2xl mx-auto font-medium">
          Connecting People, AI, and Responders to Save Lives Faster.
        </p>
      </div>

      {/* Mission & Problem Statement */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white">The Core Challenge</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            During mass urban emergencies and natural disasters, traditional emergency dispatch pipelines suffer from communication bottlenecks, fragmented information, and delayed responder coordination.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            CrisisMesh AI solves this by integrating citizens, automated triage algorithms, centralized command authorities, and frontline responders onto one unified real-time telemetry canvas.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Platform Capabilities
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Sub-second Triage:</strong> Google Gemini analyzes multi-factor hazard reports into 0-100 severity scores.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Smart Dispatch:</strong> Proximity & capability matching to Fire, ALS Trauma, and NDRF units.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Duplicate Detection:</strong> Heuristic spatial deduplication prevents dispatch resource dilution.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Citizen Transparency:</strong> 7-stage real-time lifecycle tracking via live WebSocket broadcasts.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* System Architecture */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Full-Stack Technology Architecture</h2>
          <p className="text-xs text-slate-400">Engineered with modern, resilient, high-throughput technologies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xl">
              ⚛️
            </div>
            <h3 className="text-sm font-bold text-white">Modern Frontend</h3>
            <ul className="space-y-1 text-slate-400">
              <li>• React.js & Vite 5</li>
              <li>• Tailwind CSS & Dark Navy Theme</li>
              <li>• Framer Motion Transitions</li>
              <li>• Leaflet & OpenStreetMap (OSM) Tiles</li>
              <li>• Recharts Analytics Dashboards</li>
              <li>• Lucide React Iconography</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-xl">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-white">High-Speed Backend</h3>
            <ul className="space-y-1 text-slate-400">
              <li>• Python 3.13 & FastAPI</li>
              <li>• Real-Time WebSockets Engine</li>
              <li>• Pydantic Strict Data Validation</li>
              <li>• RESTful API Endpoints & Swagger</li>
              <li>• Haversine Distance Calculation</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center text-xl">
              🧠
            </div>
            <h3 className="text-sm font-bold text-white">AI & Persistence</h3>
            <ul className="space-y-1 text-slate-400">
              <li>• Google Gemini 1.5 Flash API</li>
              <li>• Algorithmic Triage Fallback Engine</li>
              <li>• Firebase Firestore Ready</li>
              <li>• Multilingual Assistant (EN / HI / MR)</li>
              <li>• Duplicate Detection Heuristics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ethical Safeguards */}
      <div className="p-6 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Ethical AI Safeguards & International Triage Standards</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <strong className="text-white block">Advisory Nature of AI:</strong>
            <p className="text-slate-400">
              AI scores are decision-support aids. No emergency request can ever be rejected or suppressed by an algorithm.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <strong className="text-white block">Human Responder Override:</strong>
            <p className="text-slate-400">
              Every priority score, team assignment, and incident disposition can be modified by human dispatch chiefs with full audit logging.
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon CTA */}
      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <span>Return to Command Platform</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
