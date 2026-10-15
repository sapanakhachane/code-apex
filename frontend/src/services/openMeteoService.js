/**
 * Open-Meteo Weather API Integration Service
 * CrisisMesh AI – Emergency Response Intelligence
 * 
 * Free, open-source meteorological API with zero API keys required.
 * Docs: https://open-meteo.com/en/docs
 */

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// In-memory cache to prevent redundant calls within 5 minutes
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * WMO Weather interpretation codes (WMO code -> info)
 */
export const WMO_WEATHER_CODES = {
  0: { description: 'Clear Sky', icon: '☀️', severity: 'Low', hazard: 'None' },
  1: { description: 'Mainly Clear', icon: '🌤️', severity: 'Low', hazard: 'None' },
  2: { description: 'Partly Cloudy', icon: '⛅', severity: 'Low', hazard: 'None' },
  3: { description: 'Overcast', icon: '☁️', severity: 'Low', hazard: 'None' },
  45: { description: 'Fog', icon: '🌫️', severity: 'Moderate', hazard: 'Low Visibility' },
  48: { description: 'Depositing Rime Fog', icon: '🌫️', severity: 'Moderate', hazard: 'Low Visibility & Ice' },
  51: { description: 'Light Drizzle', icon: '🌦️', severity: 'Low', hazard: 'Slick Roads' },
  53: { description: 'Moderate Drizzle', icon: '🌦️', severity: 'Moderate', hazard: 'Slick Roads' },
  55: { description: 'Dense Drizzle', icon: '🌧️', severity: 'Moderate', hazard: 'Reduced Visibility' },
  56: { description: 'Light Freezing Drizzle', icon: '🌨️', severity: 'High', hazard: 'Road Ice' },
  57: { description: 'Dense Freezing Drizzle', icon: '🌨️', severity: 'Critical', hazard: 'Severe Road Ice' },
  61: { description: 'Slight Rain', icon: '🌦️', severity: 'Low', hazard: 'Wet Surface' },
  63: { description: 'Moderate Rain', icon: '🌧️', severity: 'Moderate', hazard: 'Runoff & Slick Roads' },
  65: { description: 'Heavy Rain', icon: '🌧️', severity: 'High', hazard: 'Flash Flood Risk' },
  66: { description: 'Light Freezing Rain', icon: '🌨️', severity: 'High', hazard: 'Black Ice' },
  67: { description: 'Heavy Freezing Rain', icon: '🌨️', severity: 'Critical', hazard: 'Severe Black Ice' },
  71: { description: 'Slight Snow Fall', icon: '🌨️', severity: 'Moderate', hazard: 'Cold / Snow' },
  73: { description: 'Moderate Snow Fall', icon: '❄️', severity: 'High', hazard: 'Blocked Access' },
  75: { description: 'Heavy Snow Fall', icon: '❄️', severity: 'Critical', hazard: 'Severe Blizzard' },
  77: { description: 'Snow Grains', icon: '❄️', severity: 'Moderate', hazard: 'Cold Hazard' },
  80: { description: 'Slight Rain Showers', icon: '🌦️', severity: 'Low', hazard: 'Minor Waterlogging' },
  81: { description: 'Moderate Rain Showers', icon: '🌧️', severity: 'Moderate', hazard: 'Localized Flooding' },
  82: { description: 'Violent Rain Showers', icon: '⛈️', severity: 'Critical', hazard: 'Severe Flash Flooding' },
  85: { description: 'Slight Snow Showers', icon: '🌨️', severity: 'Moderate', hazard: 'Visibility Penalty' },
  86: { description: 'Heavy Snow Showers', icon: '❄️', severity: 'Critical', hazard: 'Road Closure Risk' },
  95: { description: 'Thunderstorm', icon: '⛈️', severity: 'High', hazard: 'Lightning & High Winds' },
  96: { description: 'Thunderstorm with Slight Hail', icon: '⛈️', severity: 'Critical', hazard: 'Hail Damage & Lightning' },
  99: { description: 'Thunderstorm with Heavy Hail', icon: '⛈️', severity: 'Critical', hazard: 'Severe Structural & Hail Hazard' },
};

/**
 * Returns readable weather info from a WMO code
 */
export function getWeatherInterpretation(code) {
  return WMO_WEATHER_CODES[code] || {
    description: 'Unknown Conditions',
    icon: '🌤️',
    severity: 'Low',
    hazard: 'None'
  };
}

/**
 * Evaluates tactical disaster hazards based on live meteorological data
 */
export function evaluateDisasterWeatherRisk(weather, emergencyType = '') {
  if (!weather || !weather.current) {
    return {
      threatLevel: 'Low',
      threatScore: 15,
      fireRisk: 'Low',
      floodRisk: 'Low',
      aviationViability: 'Optimal',
      hazards: ['Standard conditions']
    };
  }

  const {
    temperature_2m = 25,
    relative_humidity_2m = 50,
    wind_speed_10m = 10,
    wind_gusts_10m = 15,
    precipitation = 0,
    weather_code = 0
  } = weather.current;

  const hazards = [];
  let threatScore = 10;

  // 1. Fire spread danger (high temp, low humidity, high wind)
  let fireRisk = 'Low';
  if (temperature_2m >= 35 && relative_humidity_2m <= 30 && wind_speed_10m >= 20) {
    fireRisk = 'Extreme';
    threatScore += 45;
    hazards.push('Critical wildfire / rapid flame spread index due to high wind & low humidity');
  } else if (temperature_2m >= 30 && wind_speed_10m >= 18) {
    fireRisk = 'High';
    threatScore += 30;
    hazards.push('Elevated fire propagation rate; wind-assisted convection');
  } else if (wind_speed_10m >= 15) {
    fireRisk = 'Moderate';
    threatScore += 15;
  }

  // 2. Flood & Rain danger
  let floodRisk = 'Low';
  if (precipitation >= 10 || [65, 82, 96, 99].includes(weather_code)) {
    floodRisk = 'Critical';
    threatScore += 40;
    hazards.push('Severe flash flood warning: intense precipitation exceeding urban drainage capacity');
  } else if (precipitation >= 4 || [63, 81, 95].includes(weather_code)) {
    floodRisk = 'High';
    threatScore += 25;
    hazards.push('Moderate to heavy rainfall causing rapid road waterlogging');
  } else if (precipitation > 0 || [51, 53, 55, 61, 80].includes(weather_code)) {
    floodRisk = 'Moderate';
    threatScore += 10;
  }

  // 3. Aerial rescue drone & helicopter viability
  let aviationViability = 'Optimal';
  if (wind_gusts_10m >= 45 || [95, 96, 99, 82].includes(weather_code)) {
    aviationViability = 'Grounded';
    threatScore += 30;
    hazards.push('Aerial rescue & drone reconnaissance suspended due to severe wind shear / lightning');
  } else if (wind_gusts_10m >= 28 || [45, 48].includes(weather_code)) {
    aviationViability = 'Caution';
    threatScore += 15;
    hazards.push('Drone and chopper flight caution: crosswinds and low visual ceiling');
  }

  // 4. Heat stress on victims & rescue personnel
  if (temperature_2m >= 40) {
    threatScore += 20;
    hazards.push('Extreme heat exhaustion risk for responders in protective tactical gear');
  }

  // Clamp threat score 0 - 100
  threatScore = Math.min(100, Math.max(0, threatScore));

  let threatLevel = 'Low';
  if (threatScore >= 75) threatLevel = 'Critical';
  else if (threatScore >= 50) threatLevel = 'High';
  else if (threatScore >= 25) threatLevel = 'Moderate';

  return {
    threatLevel,
    threatScore,
    fireRisk,
    floodRisk,
    aviationViability,
    hazards: hazards.length ? hazards : ['Meteorological parameters within standard operational baseline.']
  };
}

/**
 * Fetch weather forecast for latitude and longitude from Open-Meteo
 */
export async function fetchWeather(lat, lon, forceRefresh = false) {
  const roundedLat = Number(lat).toFixed(3);
  const roundedLon = Number(lon).toFixed(3);
  const cacheKey = `${roundedLat},${roundedLon}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const params = new URLSearchParams({
    latitude: roundedLat,
    longitude: roundedLon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'wind_speed_10m_max'
    ].join(','),
    timezone: 'auto'
  });

  try {
    const res = await fetch(`${OPEN_METEO_BASE_URL}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP Error: ${res.status}`);
    }
    const data = await res.json();
    
    // Enrich with parsed condition and disaster risk
    const currentCode = data.current?.weather_code ?? 0;
    const interpretation = getWeatherInterpretation(currentCode);
    const disasterAssessment = evaluateDisasterWeatherRisk(data);

    const enriched = {
      ...data,
      interpretation,
      disasterAssessment,
      fetchTime: new Date().toISOString()
    };

    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: enriched
    });

    return enriched;
  } catch (err) {
    console.error("Open-Meteo API Fetch Failed:", err);
    // Return graceful fallback data so UI never breaks
    return getFallbackWeatherData(lat, lon);
  }
}

/**
 * Search locations using Open-Meteo Free Geocoding API
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `${OPEN_METEO_GEO_URL}?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn("Geocoding search failed:", err);
    return [];
  }
}

/**
 * Fallback weather data in case user is completely offline
 */
function getFallbackWeatherData(lat, lon) {
  const isNight = new Date().getHours() < 6 || new Date().getHours() > 19;
  return {
    latitude: lat,
    longitude: lon,
    current: {
      temperature_2m: 31.5,
      apparent_temperature: 35.8,
      relative_humidity_2m: 62,
      precipitation: 0.0,
      weather_code: 1,
      wind_speed_10m: 8.5,
      wind_direction_10m: 310,
      wind_gusts_10m: 14.2,
      cloud_cover: 25,
      surface_pressure: 1010.5,
      is_day: isNight ? 0 : 1,
      time: new Date().toISOString()
    },
    interpretation: {
      description: 'Mainly Clear',
      icon: '🌤️',
      severity: 'Low',
      hazard: 'None'
    },
    disasterAssessment: {
      threatLevel: 'Low',
      threatScore: 18,
      fireRisk: 'Low',
      floodRisk: 'Low',
      aviationViability: 'Optimal',
      hazards: ['Standard weather conditions - operational baseline intact.']
    },
    hourly: {
      time: Array.from({ length: 24 }, (_, i) => {
        const d = new Date();
        d.setHours(d.getHours() + i);
        return d.toISOString().slice(0, 16);
      }),
      temperature_2m: Array.from({ length: 24 }, (_, i) => 29 + Math.sin(i / 3) * 4),
      precipitation_probability: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15)),
      weather_code: Array.from({ length: 24 }, () => 1),
      wind_speed_10m: Array.from({ length: 24 }, () => 7 + Math.floor(Math.random() * 6))
    },
    daily: {
      time: Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
      }),
      weather_code: [1, 2, 2, 3, 1, 80, 1],
      temperature_2m_max: [35, 34, 33, 33, 34, 32, 35],
      temperature_2m_min: [26, 26, 25, 25, 26, 24, 26],
      precipitation_probability_max: [10, 15, 20, 25, 10, 45, 10],
      wind_speed_10m_max: [14, 15, 18, 16, 14, 20, 15]
    },
    fetchTime: new Date().toISOString(),
    isSimulatedFallback: true
  };
}
