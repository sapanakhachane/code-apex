import React from 'react';
import { PriorityBadge } from './PriorityBadge';
import { Sparkles, ShieldAlert, Cpu, CheckCircle, AlertTriangle, Layers, Info } from 'lucide-react';

export const AISeverityCard = ({ analysis, compact = false }) => {
  if (!analysis) return null;

  const score = analysis.priorityScore || 50;
  const isCritical = score >= 76;
  const isHigh = score >= 51 && score <= 75;

  return (
    <div className={`rounded-2xl border transition-all ${
      isCritical
        ? 'bg-gradient-to-br from-red-950/40 via-slate-900/90 to-navy-950 border-red-500/40 shadow-xl shadow-red-950/30'
        : 'bg-gradient-to-br from-slate-900/90 via-navy-900/90 to-navy-950 border-cyan-800/40 shadow-xl'
    } p-5 backdrop-blur-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-cyan-500 text-white shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base">Gemini AI Triage Assessment</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                PROTOTYPE ADVISORY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {analysis.aiConfidenceIndicator || 'Automated Neural Incident Classification'}
            </p>
          </div>
        </div>

        <PriorityBadge score={score} severity={analysis.severityLevel} size="lg" />
      </div>

      {/* Duplicate Incident Warning if Detected */}
      {analysis.isDuplicatePotential && (
        <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-amber-300 font-semibold block">Potential Duplicate Incident Flagged</strong>
            <p className="text-slate-300 mt-0.5">
              Corroborating reports detected nearby matching incident{' '}
              <strong className="text-cyan-400 font-mono">{analysis.duplicateIncidentId}</strong>. Flagged for command verification to prevent redundant dispatch.
            </p>
          </div>
        </div>
      )}

      {/* Score Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Priority Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black font-mono ${isCritical ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-cyan-400'}`}>
              {score}
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {isCritical ? 'Immediate Life Risk' : isHigh ? 'Urgent Threat' : 'Standard Queue'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Report Confidence</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {analysis.confidenceScore || 85}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Based on data completeness</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Recommended Unit</span>
          <p className="text-xs font-semibold text-cyan-300 mt-1 line-clamp-2">
            {analysis.suggestedResponseCategory || 'Frontline Emergency Taskforce'}
          </p>
        </div>
      </div>

      {/* Rationale Explanation */}
      <div className="my-3 text-xs leading-relaxed text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
        <strong className="text-white block mb-1">AI Tactical Rationale:</strong>
        {analysis.explanation}
      </div>

      {/* Recommended Steps */}
      {analysis.recommendedNextSteps && analysis.recommendedNextSteps.length > 0 && !compact && (
        <div className="mt-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Recommended Tactical Actions:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {analysis.recommendedNextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span>Advisory scoring only. Emergency services must never reject or delay requests automatically. Human responders maintain full override authority.</span>
      </div>
    </div>
  );
};
