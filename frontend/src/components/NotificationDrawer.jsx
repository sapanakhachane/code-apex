import React from 'react';
import { Link } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { Bell, X, CheckCircle, AlertTriangle, ShieldAlert, ExternalLink } from 'lucide-react';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useEmergency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-navy-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Emergency Notifications</h3>
            <p className="text-xs text-slate-400">{notifications.length} alerts received</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No emergency alerts</p>
            <p className="text-xs">Incoming incidents will appear here in real time.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.read;
            const isCritical = n.severity === 'Critical';

            return (
              <div
                key={n.notificationId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-red-950/30 border-red-500/40 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                } ${isUnread ? 'ring-1 ring-cyan-500/30' : 'opacity-80'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                    <h4 className="text-xs font-bold text-white tracking-wide">{n.title}</h4>
                  </div>
                  {isUnread && (
                    <button
                      onClick={() => markNotificationRead(n.notificationId)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{n.message}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                  {n.incidentId && (
                    <Link
                      to={`/track-emergency?id=${n.incidentId}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-mono"
                    >
                      <span>Track {n.incidentId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-center">
        <p className="text-[11px] text-slate-500 font-mono">CrisisMesh AI Real-Time WebSocket Dispatcher</p>
      </div>
    </div>
  );
};
