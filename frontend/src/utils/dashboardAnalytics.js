/**
 * CrisisMesh AI - Dashboard Analytics Utility
 * Dynamically computes real-time GIS and incident analytics directly from live incident records.
 */

export const SEVERITY_COLORS = {
  Critical: '#EF4444',
  High: '#F97316',
  Moderate: '#EAB308',
  Low: '#10B981'
};

export const CHART_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6'  // Blue
];

export const TIME_SLOTS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

/**
 * Calculates dashboard statistics, distributions, and 24-hr inflow from actual incident records.
 * Ensures zero fake or simulated data.
 *
 * @param {Array} emergencies - Array of emergency incident records
 * @param {Array} rescueTeams - Array of rescue team units
 * @returns {Object} Complete real-time dashboard analytics
 */
export function calculateDashboardAnalytics(emergencies = [], rescueTeams = []) {
  const safeEmergencies = Array.isArray(emergencies) ? emergencies : [];
  const safeTeams = Array.isArray(rescueTeams) ? rescueTeams : [];
  const totalIncidents = safeEmergencies.length;

  // Active / Resolved counts
  const activeIncidents = safeEmergencies.filter(
    (e) => e.status !== 'Emergency Resolved'
  ).length;
  const resolvedIncidents = safeEmergencies.filter(
    (e) => e.status === 'Emergency Resolved'
  ).length;
  const criticalIncidents = safeEmergencies.filter(
    (e) => e.severity === 'Critical' && e.status !== 'Emergency Resolved'
  ).length;
  const highPriorityIncidents = safeEmergencies.filter(
    (e) => e.severity === 'High' && e.status !== 'Emergency Resolved'
  ).length;
  const availableRescueTeams = safeTeams.filter(
    (t) => t.availabilityStatus === 'Available'
  ).length;

  // 1. Emergency Type Distribution (for Bar Chart)
  const typeMap = {};
  safeEmergencies.forEach((inc) => {
    const t = inc.emergencyType || 'Other Emergency';
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  const emergencyTypeDistribution = Object.entries(typeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 2. Severity Proportions (for Doughnut Chart)
  const severityCounts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
  safeEmergencies.forEach((inc) => {
    const s = inc.severity || 'Moderate';
    if (severityCounts[s] !== undefined) {
      severityCounts[s] += 1;
    } else {
      severityCounts[s] = 1;
    }
  });

  // Only include slices with count > 0 in doughnut chart to prevent rendering glitches
  const priorityDistribution = ['Critical', 'High', 'Moderate', 'Low']
    .map((name) => ({
      name,
      count: severityCounts[name] || 0,
      value: severityCounts[name] || 0,
      color: SEVERITY_COLORS[name] || '#64748B'
    }))
    .filter((entry) => entry.count > 0);

  // 3. 24-Hour Case Inflow (for Line Chart)
  // Computes actual chronological distribution across 4-hour telemetry intervals
  const trendSeries = TIME_SLOTS.map((time) => ({
    time,
    reports: 0,
    resolved: 0
  }));

  if (totalIncidents > 0) {
    safeEmergencies.forEach((inc) => {
      let hour = 12; // fallback default if date is unparseable
      const ts = inc.createdAt || inc.history?.[0]?.timestamp;
      if (ts) {
        const parsed = new Date(ts);
        if (!isNaN(parsed.getTime())) {
          hour = parsed.getHours();
        }
      }
      const slotIndex = Math.min(5, Math.max(0, Math.floor(hour / 4)));
      trendSeries[slotIndex].reports += 1;
      if (inc.status === 'Emergency Resolved') {
        trendSeries[slotIndex].resolved += 1;
      }
    });
  }

  return {
    totalIncidents,
    activeIncidents,
    resolvedIncidents,
    criticalIncidents,
    highPriorityIncidents,
    availableRescueTeams,
    totalRescueTeams: safeTeams.length,
    emergencyTypeDistribution,
    priorityDistribution,
    trendSeries: totalIncidents > 0 ? trendSeries : [],
    hasData: totalIncidents > 0
  };
}
