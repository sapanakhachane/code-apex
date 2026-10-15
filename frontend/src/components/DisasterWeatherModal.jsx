import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { searchLocations } from '../services/openMeteoService';
import {
  X, CloudSun, Wind, Droplets, Compass, AlertTriangle, ShieldCheck,
  Search, MapPin, RefreshCw, Flame, Waves, Plane, Thermometer,
  Gauge, CloudRain, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DisasterWeatherModal = () => {
  const {
    isWeatherModalOpen,
    setIsWeatherModalOpen,
    weatherData,
    weatherLocationName,
    weatherCoords,
    refreshWeather,
    isWeatherLoading,
    emergencies
  } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, hourly, 7day

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isWeatherModalOpen) return null;

  const current = weatherData?.current || {};
  const interp = weatherData?.interpretation || { description: 'Clear', icon: '☀️' };
  const risk = weatherData?.disasterAssessment || {
    threatLevel: 'Low',
    threatScore: 15,
    fireRisk: 'Low',
    floodRisk: 'Low',
    aviationViability: 'Optimal',
    hazards: []
  };

  const handleSelectLocation = (loc) => {
    refreshWeather(loc.latitude, loc.longitude, `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''} (${loc.country})`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        refreshWeather(pos.coords.latitude, pos.coords.longitude, "My Current GPS Location");
      },
      (err) => {
        console.warn("GPS error:", err);
        alert("Could not access your location. Using default coordinate sector.");
      }
    );
  };

  const getThreatColor = (level) => {
    if (level === 'Critical') return 'text-red-400 bg-red-950/80 border-red-500/50';
    if (level === 'High') return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
    if (level === 'Moderate') return 'text-yellow-400 bg-yellow-950/80 border-yellow-500/50';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-navy-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl shadow-inner">
              {interp.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Tactical Weather & Disaster Intelligence
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  OPEN-METEO API
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span className="font-semibold text-slate-300">{weatherLocationName}</span>
                <span className="text-slate-500 font-mono">({weatherCoords.lat.toFixed(3)}°N, {weatherCoords.lon.toFixed(3)}°E)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshWeather(weatherCoords.lat, weatherCoords.lon, weatherLocationName)}
              disabled={isWeatherLoading}
              title="Refresh weather telemetry"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isWeatherLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => setIsWeatherModalOpen(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Location Bar */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800/80 space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search global city or disaster zone via Open-Meteo Geocoding..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
              />
              {isSearching && (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin absolute right-3 top-3" />
              )}
            </div>

            <button
              onClick={handleUseCurrentGPS}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Use My GPS</span>
            </button>
          </div>

          {/* Autocomplete Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="p-2 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-xl max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((loc) => (
                <button
                  key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <span className="font-medium">
                    {loc.name}, {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                  </span>
                  <span className="font-mono text-[11px] text-cyan-400">
                    {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Disaster Incident Sites */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 font-mono text-[10px] uppercase shrink-0">Incident Sites:</span>
            {emergencies.slice(0, 4).map((inc) => (
              <button
                key={inc.incidentId}
                onClick={() => refreshWeather(inc.location?.latitude, inc.location?.longitude, `${inc.emergencyType} (${inc.location?.address?.split(',')[0] || 'Zone'})`)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-400 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <span>🚨</span>
                <span>{inc.incidentId}: {inc.location?.address?.split(',')[0] || inc.emergencyType}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Weather Card & Threat Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Real-Time Current Weather */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-navy-950 to-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Current Meteorological Observation</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                      {current.temperature_2m !== undefined ? Math.round(current.temperature_2m) : '--'}°C
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-cyan-400">
                      {interp.description}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Feels like <span className="text-slate-200 font-semibold">{current.apparent_temperature ? Math.round(current.apparent_temperature) : '--'}°C</span> • {current.is_day ? 'Daytime' : 'Nighttime'}
                  </p>
                </div>
                <div className="text-5xl select-none filter drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  {interp.icon}
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Wind Speed</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono mt-1">
                    {current.wind_speed_10m ?? '--'} <span className="text-[10px] text-slate-400">km/h</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Gusts: {current.wind_gusts_10m ?? '--'} km/h</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>Humidity</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono mt-1">
                    {current.relative_humidity_2m ?? '--'}%
                  </p>
                  <p className="text-[10px] text-slate-400">Precip: {current.precipitation ?? 0} mm</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pressure</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono mt-1">
                    {current.surface_pressure ? Math.round(current.surface_pressure) : '1012'} <span className="text-[10px] text-slate-400">hPa</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Barometric Normal</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cloud Cover</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono mt-1">
                    {current.cloud_cover ?? 20}%
                  </p>
                  <p className="text-[10px] text-slate-400">WMO Code: {current.weather_code ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Right: Tactical Disaster Operations Impact Assessment */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                    Disaster Operations Threat
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getThreatColor(risk.threatLevel)}`}>
                    {risk.threatLevel.toUpperCase()} ({risk.threatScore}/100)
                  </span>
                </div>

                {/* Tactical Indicators */}
                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Fire Propagation Hazard</span>
                    </span>
                    <span className={`font-mono font-bold ${risk.fireRisk === 'Extreme' ? 'text-red-400' : risk.fireRisk === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {risk.fireRisk}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Waves className="w-4 h-4 text-cyan-400" />
                      <span>Urban Flood / Water Risk</span>
                    </span>
                    <span className={`font-mono font-bold ${risk.floodRisk === 'Critical' ? 'text-red-400' : risk.floodRisk === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {risk.floodRisk}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Plane className="w-4 h-4 text-purple-400" />
                      <span>Drone & Chopper Rescue</span>
                    </span>
                    <span className={`font-mono font-bold ${risk.aviationViability === 'Grounded' ? 'text-red-400' : risk.aviationViability === 'Caution' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {risk.aviationViability}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hazard advisories list */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 space-y-1">
                  {risk.hazards.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-300">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Tabs for Hourly and 7-Day Forecast */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                  24-Hour Weather Strip
                </button>
                <button
                  onClick={() => setActiveTab('7day')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === '7day' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                  7-Day Tactical Outlook
                </button>
              </div>

              <Link
                to="/emergency-map"
                onClick={() => setIsWeatherModalOpen(false)}
                className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono"
              >
                <span>View on Live GIS Map</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Hourly Strip */}
            {activeTab === 'overview' && weatherData?.hourly && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
                  {weatherData.hourly.time.slice(0, 16).map((timeStr, idx) => {
                    const temp = weatherData.hourly.temperature_2m[idx];
                    const rainProb = weatherData.hourly.precipitation_probability ? weatherData.hourly.precipitation_probability[idx] : 0;
                    const wind = weatherData.hourly.wind_speed_10m ? weatherData.hourly.wind_speed_10m[idx] : 0;
                    const dateObj = new Date(timeStr);
                    const hours = dateObj.getHours();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHour = hours % 12 || 12;

                    return (
                      <div
                        key={timeStr}
                        className="flex-shrink-0 w-24 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-1.5 hover:border-cyan-500/40 transition-colors"
                      >
                        <p className="text-[11px] font-mono text-slate-400">{displayHour} {ampm}</p>
                        <p className="text-base font-bold text-white font-mono">{Math.round(temp)}°</p>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-blue-400">
                          <CloudRain className="w-2.5 h-2.5" />
                          <span>{rainProb}%</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {Math.round(wind)} km/h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            {activeTab === '7day' && weatherData?.daily && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {weatherData.daily.time.map((dateStr, idx) => {
                  const maxTemp = weatherData.daily.temperature_2m_max[idx];
                  const minTemp = weatherData.daily.temperature_2m_min[idx];
                  const rainMax = weatherData.daily.precipitation_probability_max[idx];
                  const code = weatherData.daily.weather_code[idx];
                  const wmo = weatherData.interpretation || { icon: '🌤️', description: 'Fair' };
                  const dayName = idx === 0 ? 'Today' : new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <div
                      key={dateStr}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{dayName}</span>
                        <span className="text-base">{wmo.icon}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="text-white font-bold">{Math.round(maxTemp)}°C</span>
                        <span className="text-slate-400">{Math.round(minTemp)}°C</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span className="text-blue-400 flex items-center gap-1">
                          <CloudRain className="w-3 h-3" />
                          <span>{rainMax}% rain</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Open-Meteo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open-Meteo API v1 Live Dispatch Synchronization</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Telemetry Updated: {weatherData?.fetchTime ? new Date(weatherData.fetchTime).toLocaleTimeString() : 'Realtime'}
          </span>
        </div>

      </div>
    </div>
  );
};
