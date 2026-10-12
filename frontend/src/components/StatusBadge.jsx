import React from 'react';
import { Clock, CheckCircle2, Navigation, Users, ShieldAlert, Check } from 'lucide-react';

export const StatusBadge = ({ status, size = "md" }) => {
  let style = "bg-slate-800 text-slate-300 border-slate-700";
  let icon = <Clock className="w-3.5 h-3.5" />;

  switch (status) {
    case "Emergency Reported":
      style = "bg-red-500/10 text-red-400 border-red-500/30";
      icon = <ShieldAlert className="w-3.5 h-3.5" />;
      break;
    case "Report Received":
      style = "bg-sky-500/10 text-sky-400 border-sky-500/30";
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    case "Under Authority Review":
      style = "bg-purple-500/15 text-purple-300 border-purple-500/30";
      icon = <Users className="w-3.5 h-3.5" />;
      break;
    case "Rescue Team Assigned":
      style = "bg-blue-500/15 text-blue-300 border-blue-500/30";
      icon = <Users className="w-3.5 h-3.5" />;
      break;
    case "Rescue Team Dispatched":
      style = "bg-amber-500/15 text-amber-300 border-amber-500/30";
      icon = <Navigation className="w-3.5 h-3.5" />;
      break;
    case "Response in Progress":
      style = "bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse";
      icon = <Navigation className="w-3.5 h-3.5" />;
      break;
    case "Emergency Resolved":
      style = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      break;
    default:
      style = "bg-slate-800 text-slate-300 border-slate-700";
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style} ${padding}`}>
      {icon}
      <span>{status || "Unknown Status"}</span>
    </span>
  );
};
