import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { CloudSun, Wind, AlertTriangle, ShieldCheck, Thermometer } from 'lucide-react';

export const WeatherBadge = ({ compact = false, className = '' }) => {
  const {
    weatherData,
    weatherLocationName,
    isWeatherLoading,
    openWeatherModal
  } = useEmergency();

  const current = weatherData?.current;
  const interp = weatherData?.interpretation || { description: 'Fair', icon: '🌤️' };
  const risk = weatherData?.disasterAssessment || { threatLevel: 'Low', threatScore: 15 };

  const getBadgeStyle = (level) => {
    if (level === 'Critical') return 'border-red-500/50 bg-red-950/40 text-red-300';
    if (level === 'High') return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
    if (level === 'Moderate') return 'border-yellow-500/50 bg-yellow-950/40 text-yellow-300';
    return 'border-cyan-500/40 bg-slate-900/80 text-cyan-300';
  };

  if (compact) {
    return (
      <button
        onClick={() => openWeatherModal()}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all hover:brightness-125 ${getBadgeStyle(risk.threatLevel)} ${className}`}
        title="Open Live Meteorological Intelligence Center (Open-Meteo)"
      >
        <span className="text-sm">{interp.icon}</span>
        <span className="font-bold text-white">
          {current?.temperature_2m !== undefined ? `${Math.round(current.temperature_2m)}°C` : '31°C'}
        </span>
        <span className="hidden md:inline text-slate-400">
          • {current?.wind_speed_10m ? `${Math.round(current.wind_speed_10m)}km/h` : '8km/h'}
        </span>
        {risk.threatLevel !== 'Low' && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => openWeatherModal()}
      className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all hover:brightness-110 shadow-lg ${getBadgeStyle(risk.threatLevel)} ${className}`}
      title="Click to open Open-Meteo Weather & Disaster Intelligence Center"
    >
      <div className="text-xl group-hover:scale-110 transition-transform">
        {interp.icon}
      </div>
      <div className="text-left text-xs">
        <div className="flex items-center gap-1.5 font-mono font-bold text-white">
          <span>{current?.temperature_2m !== undefined ? `${Math.round(current.temperature_2m)}°C` : '--'}</span>
          <span className="text-slate-400 font-normal">({interp.description})</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>💨 {current?.wind_speed_10m ?? 8} km/h</span>
          <span>•</span>
          <span className="font-semibold text-cyan-400">Open-Meteo</span>
        </div>
      </div>
    </button>
  );
};
