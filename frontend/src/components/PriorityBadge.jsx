import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export const PriorityBadge = ({ score, severity, size = "md", showScore = true }) => {
  // Determine severity style
  const isCritical = severity === "Critical" || score >= 76;
  const isHigh = severity === "High" || (score >= 51 && score <= 75);
  const isModerate = severity === "Moderate" || (score >= 26 && score <= 50);
  const isLow = severity === "Low" || score <= 25;

  let bg = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
  let icon = <ShieldCheck className="w-3.5 h-3.5" />;
  let label = "Low Priority";
  let dotBg = "bg-emerald-400";

  if (isCritical) {
    bg = "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse";
    icon = <Flame className="w-3.5 h-3.5" />;
    label = "Critical";
    dotBg = "bg-red-500";
  } else if (isHigh) {
    bg = "bg-orange-500/20 border-orange-500/50 text-orange-400";
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
    label = "High";
    dotBg = "bg-orange-400";
  } else if (isModerate) {
    bg = "bg-amber-500/20 border-amber-500/40 text-amber-400";
    icon = <AlertCircle className="w-3.5 h-3.5" />;
    label = "Moderate";
    dotBg = "bg-amber-400";
  }

  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bg} ${padding} transition-all`}>
      <span className={`w-2 h-2 rounded-full ${dotBg} animate-ping-slow`} />
      {icon}
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono font-bold ml-1 opacity-90">({score}/100)</span>
      )}
    </span>
  );
};
