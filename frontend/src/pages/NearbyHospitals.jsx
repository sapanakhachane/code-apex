import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  Hospital, Phone, Navigation, MapPin, CheckCircle,
  ExternalLink, Search, ShieldCheck, HeartPulse, AlertTriangle
} from 'lucide-react';

export const NearbyHospitals = () => {
  const { hospitals } = useEmergency();
  const [userCoords, setUserCoords] = useState({ lat: 19.0760, lon: 72.8777 });
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [search, setSearch] = useState('');
  const [traumaFilter, setTraumaFilter] = useState('ALL');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setDetectingLoc(false);
      },
      () => {
        setDetectingLoc(false);
      }
    );
  };

  const filteredHospitals = hospitals.filter((h) => {
    if (traumaFilter !== 'ALL' && h.traumaLevel !== traumaFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Nearby Trauma Centers & Hospitals</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
              HEALTHCARE DIRECTORY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified emergency medical facilities, Level-1 trauma centers, and ICU resuscitation departments.
          </p>
        </div>

        <button
          onClick={handleDetectLocation}
          disabled={detectingLoc}
          className="px-4 py-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Navigation className="w-4 h-4" />
          <span>{detectingLoc ? 'Calculating Distances...' : '📍 Recalculate From My Location'}</span>
        </button>
      </div>

      {/* Safety Notice per Section 12 */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Emergency Facility Notice:</strong> This directory reflects physical facility capabilities and trauma tier ratings. Unverified live bed counts are intentionally excluded to adhere to medical safety regulations.
        </span>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital name, address..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={traumaFilter}
          onChange={(e) => setTraumaFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
        >
          <option value="ALL">All Trauma Tiers</option>
          <option value="Level 1">Level 1 Trauma Centers</option>
          <option value="Level 2">Level 2 Emergency Centers</option>
        </select>
      </div>

      {/* Hospitals Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4 hover:border-sky-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2.5 rounded-xl bg-sky-950 text-sky-400 border border-sky-800">
                  <Hospital className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-950 text-cyan-400 border border-slate-800">
                  {hosp.distanceKm !== undefined ? `~${hosp.distanceKm} km away` : 'Near Metro'}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3">{hosp.name}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{hosp.address}</span>
              </p>

              {/* Trauma Facilities */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800">
                  {hosp.traumaLevel || 'Level 1 Trauma'}
                </span>
                {hosp.hasICU && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                    24/7 Critical ICU
                  </span>
                )}
                {hosp.hasBurnUnit && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                    Burn Specialty Unit
                  </span>
                )}
              </div>

              {/* Specialties */}
              <div className="mt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Key Departments:</span>
                <p className="text-[11px] leading-relaxed">
                  {(hosp.specialties || []).join(' • ')}
                </p>
              </div>
            </div>

            {/* Actions: Call & Google Maps Navigation */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
              <a
                href={`tel:${hosp.phone}`}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{hosp.phone}</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
