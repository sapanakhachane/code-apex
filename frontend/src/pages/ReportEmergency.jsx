import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { AISeverityCard } from '../components/AISeverityCard';
import { fetchWeather } from '../services/openMeteoService';
import {
  Flame, MapPin, Phone, User, AlertTriangle, Sparkles,
  Camera, CheckCircle, Navigation, ShieldAlert, ArrowRight,
  Info, RefreshCw, PhoneCall, CloudSun, Wind, Droplets
} from 'lucide-react';

const EMERGENCY_TYPES = [
  { label: 'Fire Emergency', icon: '🔥', desc: 'Active fire, smoke, explosion risk' },
  { label: 'Road Accident', icon: '🚗', desc: 'Vehicular collision, trapped passengers' },
  { label: 'Medical Emergency', icon: '🚑', desc: 'Cardiac arrest, trauma, unconsciousness' },
  { label: 'Flood', icon: '🌊', desc: 'Flash flood, trapped in water, rising levels' },
  { label: 'Building Collapse', icon: '🏚️', desc: 'Structural failure, rubble entrapment' },
  { label: 'Earthquake', icon: '🌋', desc: 'Seismic tremors, debris, structural damage' },
  { label: 'Natural Disaster', icon: '🌪️', desc: 'Severe storm, cyclone, landslide' },
  { label: 'Other Emergency', icon: '⚠️', desc: 'Hazardous gas, public safety incident' },
];

export const ReportEmergency = () => {
  const { submitEmergency } = useEmergency();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [callerName, setCallerName] = useState(currentUser?.name || '');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '');
  const [emergencyType, setEmergencyType] = useState('Fire Emergency');
  const [description, setDescription] = useState('');
  const [affectedPeople, setAffectedPeople] = useState(2);
  const [injuredPeople, setInjuredPeople] = useState(1);
  const [address, setAddress] = useState('Bandra Reclamation, Western Express Junction, Mumbai');
  const [landmark, setLandmark] = useState('Near Sea Link Entry Gate');
  const [latitude, setLatitude] = useState(19.0514);
  const [longitude, setLongitude] = useState(72.8291);
  const [imageUrl, setImageUrl] = useState('');

  // UI state
  const [locating, setLocating] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [previewAnalysis, setPreviewAnalysis] = useState(null);
  const [isPreviewingAI, setIsPreviewingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [siteWeather, setSiteWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Auto-fetch Open-Meteo weather when latitude or longitude changes
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      if (!latitude || !longitude) return;
      setLoadingWeather(true);
      try {
        const data = await fetchWeather(latitude, longitude);
        if (isMounted) setSiteWeather(data);
      } catch (e) {
        console.warn("Could not fetch site weather:", e);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    }
    loadWeather();
    return () => { isMounted = false; };
  }, [latitude, longitude]);

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLatitude(lat);
        setLongitude(lon);
        setAddress(`GPS Coordinates: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (Near Mumbai Metro Zone)`);
        setLocating(false);
        setLocSuccess(true);
      },
      (err) => {
        console.warn("Location error:", err);
        setLocating(false);
        alert("Could not retrieve precise GPS. You can manually enter your address below.");
      },
      { timeout: 10000 }
    );
  };

  // Live AI Triage Preview
  const handlePreviewAI = async () => {
    if (!description.trim()) {
      setErrorMessage("Please enter an emergency description first to run AI triage.");
      return;
    }
    setErrorMessage('');
    setIsPreviewingAI(true);
    try {
      const res = await fetch('/api/ai/analyze-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyType,
          description,
          affectedPeople: Number(affectedPeople),
          injuredPeople: Number(injuredPeople),
          address,
          latitude,
          longitude,
          imageUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewAnalysis(data);
      }
    } catch (err) {
      console.warn("AI preview error", err);
    } finally {
      setIsPreviewingAI(false);
    }
  };

  // Submit SOS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!callerName.trim() || !contactNumber.trim() || !description.trim()) {
      setErrorMessage("Please fill out caller name, contact phone, and incident description.");
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        callerName,
        contactNumber,
        emergencyType,
        description,
        affectedPeople: Number(affectedPeople),
        injuredPeople: Number(injuredPeople),
        latitude: Number(latitude),
        longitude: Number(longitude),
        address,
        landmark,
        imageUrl: imageUrl || null,
        userId: currentUser?.uid || 'anon_citizen',
        weatherContext: siteWeather?.current ? {
          temperature: siteWeather.current.temperature_2m,
          condition: siteWeather.interpretation?.description,
          windSpeed: siteWeather.current.wind_speed_10m,
          threatLevel: siteWeather.disasterAssessment?.threatLevel
        } : null
      };

      const result = await submitEmergency(payload);
      setSubmittedIncident(result);
    } catch (err) {
      setErrorMessage("Failed to submit SOS report. Ensure backend server is reachable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>INSTANT DISPATCH PORTAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Emergency SOS Reporting</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Fill out critical incident details. CrisisMesh AI classifies priority and coordinates emergency responders in real time.
        </p>
      </div>

      {/* Direct Calling Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border border-red-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-200">
          <PhoneCall className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          <span>
            <strong>Need instant human voice assistance?</strong> Dial <strong>112</strong> immediately.
          </span>
        </div>
        <a
          href="tel:112"
          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold font-mono shrink-0 shadow-md"
        >
          Call 112 Now
        </a>
      </div>

      {/* Confirmation State if just submitted */}
      {submittedIncident ? (
        <div className="p-8 rounded-3xl bg-slate-900/95 border border-red-500/50 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Emergency Report Registered!</h2>
            <p className="text-sm text-slate-300">
              Your incident has been dispatched to emergency authorities and response teams.
            </p>
            <div className="inline-block p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-400 text-lg font-bold">
              Incident ID: {submittedIncident.incidentId}
            </div>
          </div>

          {/* AI Analysis Result */}
          {submittedIncident.aiAnalysis && (
            <div className="text-left max-w-2xl mx-auto">
              <AISeverityCard analysis={submittedIncident.aiAnalysis} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(`/track-emergency?id=${submittedIncident.incidentId}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
            >
              <span>TRACK LIVE STATUS NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedIncident(null);
                setDescription('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* SOS Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Emergency Type Selector */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
            <label className="text-sm font-bold text-white uppercase tracking-wider block">
              1. Select Emergency Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EMERGENCY_TYPES.map((t) => {
                const isSelected = emergencyType === t.label;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setEmergencyType(t.label)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-500'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-2xl mb-1">{t.icon}</span>
                    <span className="text-xs font-bold leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Location Detection & Manual Input */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-white uppercase tracking-wider">
                2. Emergency Location *
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 text-xs font-bold transition-all shadow-md"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{locating ? 'Detecting GPS...' : '📍 DETECT MY LOCATION'}</span>
              </button>
            </div>

            {locSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Geolocation captured successfully.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Street Address or Zone *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Near Kalanagar Flyover, Bandra East"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Prominent Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g., Opposite Metro Gate 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
              <div>Latitude: <span className="text-cyan-400">{latitude}</span></div>
              <div>Longitude: <span className="text-cyan-400">{longitude}</span></div>
            </div>

            {/* Live Meteorological Context from Open-Meteo */}
            {siteWeather && (
              <div className="mt-2 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{siteWeather.interpretation?.icon || '🌤️'}</span>
                    <div>
                      <span className="font-bold text-white">
                        {siteWeather.current?.temperature_2m !== undefined ? `${Math.round(siteWeather.current.temperature_2m)}°C` : '--'} ({siteWeather.interpretation?.description})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Open-Meteo Micro-Climate Telemetry
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    siteWeather.disasterAssessment?.threatLevel === 'Critical'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : siteWeather.disasterAssessment?.threatLevel === 'High'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    Weather Threat: {siteWeather.disasterAssessment?.threatLevel || 'LOW'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800">
                  <div>💨 Wind: <strong className="text-white">{siteWeather.current?.wind_speed_10m || 8} km/h</strong></div>
                  <div>💧 Humidity: <strong className="text-white">{siteWeather.current?.relative_humidity_2m || 60}%</strong></div>
                  <div>🌧️ Rain: <strong className="text-white">{siteWeather.current?.precipitation || 0} mm/h</strong></div>
                </div>

                {/* Weather Alert if applicable */}
                {siteWeather.current?.wind_speed_10m >= 18 && emergencyType === 'Fire Emergency' && (
                  <div className="flex items-center gap-1.5 text-amber-400 text-[11px] pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Elevated wind speed ({siteWeather.current?.wind_speed_10m} km/h) flagged to accelerate fire front.</span>
                  </div>
                )}
                {siteWeather.current?.precipitation >= 2 && emergencyType === 'Flood' && (
                  <div className="flex items-center gap-1.5 text-blue-400 text-[11px] pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Active rainfall detected. Urban waterlogging rate amplified.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Casualty & Description Details */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
            <label className="text-sm font-bold text-white uppercase tracking-wider block">
              3. Incident Details & Casualties *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Estimated Affected People</label>
                <input
                  type="number"
                  min="0"
                  value={affectedPeople}
                  onChange={(e) => setAffectedPeople(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Reported Injured People (if known)</label>
                <input
                  type="number"
                  min="0"
                  value={injuredPeople}
                  onChange={(e) => setInjuredPeople(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">Emergency Description *</label>
                <button
                  type="button"
                  onClick={handlePreviewAI}
                  disabled={isPreviewingAI}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isPreviewingAI ? 'Analyzing...' : 'Preview AI Triage Score'}</span>
                </button>
              </div>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current situation: flames, trapped individuals, vehicle collisions, gas smell, injuries..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Optional Image URL */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Incident Image URL (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/incident-photo.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* AI Preview Card if requested */}
            {previewAnalysis && (
              <div className="mt-4">
                <AISeverityCard analysis={previewAnalysis} compact />
              </div>
            )}
          </div>

          {/* Section 4: Caller Contact Info */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
            <label className="text-sm font-bold text-white uppercase tracking-wider block">
              4. Caller Contact Info *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LARGE ANIMATED RED SOS BUTTON */}
          <div className="pt-4 text-center space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative group w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xl tracking-wider uppercase shadow-[0_0_35px_rgba(239,68,68,0.5)] hover:shadow-[0_0_55px_rgba(239,68,68,0.8)] transition-all flex items-center justify-center gap-3 overflow-hidden active:scale-95 disabled:opacity-50"
            >
              <span className="w-4 h-4 rounded-full bg-white animate-ping" />
              <Flame className="w-7 h-7 animate-pulse text-amber-200" />
              <span>{isSubmitting ? 'TRIAGING & SUBMITTING SOS...' : 'TRANSMIT EMERGENCY SOS'}</span>
            </button>
            <p className="text-xs text-slate-400">
              By submitting, your distress beacon is instantaneously analyzed by Gemini AI and queued for frontline dispatch.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
