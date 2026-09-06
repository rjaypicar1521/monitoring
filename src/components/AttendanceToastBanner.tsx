import React, { useEffect, useState } from 'react';
import { Clock, X, Bell, ShieldCheck, MapPin } from 'lucide-react';
import { AttendanceEvent } from '../types';
import { requestNotificationPermission, getNotificationPermission, showDesktopPushNotification } from '../utils/attendanceService';

interface AttendanceToastBannerProps {
  event: AttendanceEvent | null;
  onDismiss: () => void;
  autoDismissTimeout?: number; // ms, default 10000
}

export const AttendanceToastBanner: React.FC<AttendanceToastBannerProps> = ({
  event,
  onDismiss,
  autoDismissTimeout = 10000
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (!event) return;

    setProgress(100);
    let elapsed = 0;
    const stepMs = 100;

    const interval = setInterval(() => {
      if (!isPaused) {
        elapsed += stepMs;
        const remainingPct = Math.max(0, 100 - (elapsed / autoDismissTimeout) * 100);
        setProgress(remainingPct);

        if (elapsed >= autoDismissTimeout) {
          clearInterval(interval);
          onDismiss();
        }
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [event, autoDismissTimeout, onDismiss, isPaused]);

  if (!event) return null;

  const isTimeIn = event.type === 'TIME_IN';
  const techInitials = event.technicianName
    ? event.technicianName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'RP';

  const handleRequestPermission = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted' && event) {
      showDesktopPushNotification(event);
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed top-5 right-5 z-50 w-[92vw] max-w-md bg-[#12141a]/95 backdrop-blur-md text-white rounded-3xl p-4 sm:p-5 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
    >
      {/* Top row: Status Tag, Timestamp, Dismiss */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isTimeIn ? 'bg-emerald-400' : 'bg-slate-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isTimeIn ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </span>

          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isTimeIn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-700/50 text-slate-300 border-slate-600'
            }`}
          >
            {isTimeIn ? 'Technician Timed In • On Site' : 'Technician Timed Out • Off Duty'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{event.time}</span>
          </span>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Avatar & Tech details */}
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
            {techInitials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-[#12141a] flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white truncate">
              {event.technicianName}
            </h4>
            <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase shrink-0">
              {event.status}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {event.technicianRole}
          </p>

          <div className="mt-2 text-xs text-slate-300 bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-700/60 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate font-medium">
              Project: <strong className="text-white">{event.projectName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Windows Push Notification Permission Prompt (if not granted) */}
      {permission === 'default' && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
            <span>Enable Windows screen popup?</span>
          </div>
          <button
            type="button"
            onClick={handleRequestPermission}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer shadow-xs"
          >
            Allow
          </button>
        </div>
      )}

      {/* Dismiss Progress Bar */}
      <div className="mt-3.5 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
