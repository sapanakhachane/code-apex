import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { useEmergency } from '../context/EmergencyContext';
import {
  MapPin, Navigation, Layers, Hospital as HospIcon
} from 'lucide-react';

export const InteractiveMap = ({
  emergencies = [],
  hospitals = [],
  selectedIncidentId = null,
  onSelectIncident = null,
  showHospitalsToggle = true,
  height = "600px",
  center = [19.0760, 72.8777],
  zoom = 12
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const hospitalsLayerRef = useRef(null);
  const [showHospitals, setShowHospitals] = useState(true);
  const [osmNightMode, setOsmNightMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const {
    weatherData,
    openWeatherModal,
    refreshWeather,
    weatherLocationName
  } = useEmergency();

  const current = weatherData?.current || {};
  const interp = weatherData?.interpretation || { description: 'Clear', icon: '☀️' };

  // Expose helper to window for Leaflet popup click handlers
  useEffect(() => {
    window.crisisMeshOpenWeather = (lat, lon, title) => {
      openWeatherModal(lat, lon, title);
    };
    return () => {
      delete window.crisisMeshOpenWeather;
    };
  }, [openWeatherModal]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // OpenStreetMap (OSM) tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | CrisisMesh AI',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    hospitalsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update incident markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    emergencies.forEach((inc) => {
      const lat = inc.location?.latitude;
      const lon = inc.location?.longitude;
      if (!lat || !lon) return;

      const score = inc.priorityScore || 50;
      let markerColor = '#10B981'; // green

      if (inc.severity === 'Critical' || score >= 76) {
        markerColor = '#EF4444';
      } else if (inc.severity === 'High' || (score >= 51 && score <= 75)) {
        markerColor = '#F97316';
      } else if (inc.severity === 'Moderate' || (score >= 26 && score <= 50)) {
        markerColor = '#EAB308';
      }

      const iconHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${markerColor}; opacity: 0.3; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background-color: ${markerColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 0 12px ${markerColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">
            🚨
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-emergency-pin',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      const safeAddress = (inc.location?.address || 'Disaster Zone').replace(/'/g, "\\'");

      // Build popup content with Open-Meteo live micro-climate preview
      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '260px';
      popupContent.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1E2D4F; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #00E5FF;">${inc.incidentId}</span>
            <span style="font-size: 11px; font-weight: bold; color: ${markerColor};">${inc.severity} (${inc.priorityScore}/100)</span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; color: #FFFFFF; margin: 0 0 4px 0;">${inc.emergencyType}</h4>
          <p style="font-size: 11px; color: #94A3B8; margin: 0 0 8px 0; line-height: 1.4;">${inc.description ? inc.description.substring(0, 90) + '...' : ''}</p>
          <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 4px;">
            📍 <strong>Location:</strong> ${inc.location?.address || 'Unknown'}
          </div>
          <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 4px;">
            🔄 <strong>Status:</strong> ${inc.status}
          </div>
          ${inc.assignedTeamName ? `<div style="font-size: 11px; color: #38BDF8; margin-bottom: 6px;">🚑 <strong>Team:</strong> ${inc.assignedTeamName}</div>` : ''}

          <!-- Open-Meteo Meteorological Micro-Climate Ribbon -->
          <div style="margin: 8px 0; padding: 6px 8px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; color: #94A3B8;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #38BDF8; font-weight: bold; font-size: 10px; font-family: monospace;">OPEN-METEO METRICS</span>
              <span style="color: #E2E8F0; font-weight: bold;">${current.temperature_2m !== undefined ? Math.round(current.temperature_2m) + '°C' : '31°C'} ${interp.icon}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #CBD5E1;">
              <span>💨 Wind: ${current.wind_speed_10m || 8} km/h</span>
              <span>🌧️ Precip: ${current.precipitation || 0}mm</span>
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="/track-emergency?id=${inc.incidentId}" style="flex: 1; text-align: center; background: #EF4444; color: white; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">Track SOS</a>
            <button onclick="window.crisisMeshOpenWeather(${lat}, ${lon}, '${safeAddress}')" style="cursor: pointer; background: #0F172A; color: #38BDF8; padding: 5px 8px; border-radius: 6px; font-size: 11px; border: 1px solid #38BDF8; font-weight: 600;">🌦️ Weather</button>
            <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" style="background: #1E293B; color: #00E5FF; padding: 5px 8px; border-radius: 6px; font-size: 11px; text-decoration: none; border: 1px solid #334155;">Maps</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      marker.addTo(markersLayerRef.current);

      if (selectedIncidentId && inc.incidentId === selectedIncidentId) {
        marker.openPopup();
        mapInstanceRef.current.setView([lat, lon], 14, { animate: true });
      }
    });
  }, [emergencies, selectedIncidentId, mapReady, current, interp]);

  // Update hospital markers
  useEffect(() => {
    if (!mapInstanceRef.current || !hospitalsLayerRef.current) return;

    hospitalsLayerRef.current.clearLayers();
    if (!showHospitals) return;

    hospitals.forEach((h) => {
      if (!h.latitude || !h.longitude) return;

      const hospHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #0284C7; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(2,132,199,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
            🏥
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        className: 'custom-hospital-pin',
        html: hospHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const hMarker = L.marker([h.latitude, h.longitude], { icon: hospIcon });
      hMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 4px; border-bottom: 1px solid #1E2D4F; padding-bottom: 4px; margin-bottom: 6px;">
            <span style="font-size: 14px;">🏥</span>
            <strong style="color: #38BDF8; font-size: 12px;">${h.name}</strong>
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 4px;">📍 ${h.address}</div>
          <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 4px;">🚑 Trauma: <strong>${h.traumaLevel || 'Level 1'}</strong></div>
          <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 6px;">📞 Phone: <a href="tel:${h.phone}" style="color: #00E5FF;">${h.phone}</a></div>
          <a href="https://www.google.com/maps/search/?api=1&query=${h.latitude},${h.longitude}" target="_blank" style="display: block; text-align: center; background: #0284C7; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; text-decoration: none;">Directions in Google Maps</a>
        </div>
      `);
      hMarker.addTo(hospitalsLayerRef.current);
    });
  }, [hospitals, showHospitals, mapReady]);

  // Center on user geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
        
        L.circleMarker([latitude, longitude], {
          radius: 9,
          color: '#00E5FF',
          fillColor: '#00E5FF',
          fillOpacity: 0.8,
        })
          .addTo(mapInstanceRef.current)
          .bindPopup('<strong style="color:#00E5FF">📍 You Are Here</strong>')
          .openPopup();
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
      }
    );
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-navy-950 ${osmNightMode ? 'osm-night-mode' : ''}`} style={{ height }}>
      {/* Map DOM Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Control HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <button
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-cyan-400 border border-slate-700/80 text-xs font-semibold backdrop-blur hover:bg-slate-800 hover:border-cyan-500 transition-all shadow-lg"
          title="Detect Current Location"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My Location</span>
        </button>

        {/* OpenStreetMap Night / Daylight View Toggle */}
        <button
          onClick={() => setOsmNightMode(!osmNightMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur border transition-all shadow-lg ${
            osmNightMode
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/70'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70'
          }`}
          title="Toggle OpenStreetMap Standard / Tactical Night Mode"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>OSM {osmNightMode ? 'Night Mode' : 'Standard'}</span>
        </button>

        {showHospitalsToggle && (
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur border transition-all shadow-lg ${
              showHospitals
                ? 'bg-sky-950/80 text-sky-300 border-sky-600/70'
                : 'bg-slate-900/90 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
          >
            <HospIcon className="w-3.5 h-3.5" />
            <span>Hospitals {showHospitals ? '(Visible)' : '(Hidden)'}</span>
          </button>
        )}

      </div>

      {/* Legend Overlay at Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 p-3 rounded-xl bg-navy-950/90 border border-slate-800 backdrop-blur-md text-[11px] text-slate-300 shadow-2xl space-y-1.5 hidden sm:block">
        <p className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
          Live Severity Markers
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>Critical Emergency (76-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>High Priority (51-75)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Moderate Priority (26-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Low Priority (0-25)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="w-2.5 h-2.5 rounded bg-sky-500" />
          <span>Trauma Center / Hospital</span>
        </div>
      </div>
    </div>
  );
};
