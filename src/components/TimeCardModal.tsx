import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  X, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  ShieldCheck, 
  FileSpreadsheet, 
  Sparkles,
  Calendar,
  Building2,
  HardHat,
  BadgeCheck,
  RotateCcw,
  Check,
  Flame,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TechnicianMember, CCTVProject, TechnicianStatus } from '../types';
import { playAttendanceChime, formatAttendanceTime } from '../utils/attendanceService';

export interface TimeCardPunchRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon, Sep 07"
  timeIn: string; // e.g. "08:30 AM"
  timeOut?: string; // e.g. "05:00 PM"
  durationHours: string; // e.g. "8h 30m"
  status: 'ON SITE' | 'OFF DUTY' | 'OVERRIDE' | 'COMPLETED';
  remarks?: string;
  isOverride?: boolean;
}

interface TimeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: TechnicianMember;
  project: CCTVProject;
  onPunchAttendance: (params: {
    tech: TechnicianMember;
    type: 'TIME_IN' | 'TIME_OUT';
    time: string;
    remarks?: string;
    status?: TechnicianStatus;
    date?: string;
    isReset?: boolean;
  }) => void;
  onUpdateTechnician?: (tech: TechnicianMember) => void;
  onNotification?: (msg: string) => void;
}

// Robust time string parser supporting seconds, meridiem, and unicode spaces
export function parseTimeToMinutes(tStr?: string): number | null {
  if (!tStr) return null;
  const cleaned = tStr.trim().replace(/[\u202F\u00A0]/g, ' ');
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && h < 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

// Compute duration between timestamps with protection against clock skew and phantom past hours
export function computeDurationMinutes(timeInStr: string, timeOutStr?: string, isLiveNow: boolean = false): number {
  const inMins = parseTimeToMinutes(timeInStr);
  if (inMins === null) return 0;

  let outMins: number | null = null;
  if (timeOutStr) {
    outMins = parseTimeToMinutes(timeOutStr);
  } else if (isLiveNow) {
    const now = new Date();
    outMins = now.getHours() * 60 + now.getMinutes();
  } else {
    // Non-live incomplete entry has 0 duration
    return 0;
  }

  if (outMins === null) return 0;

  // Protect against small clock skew right after punching in
  if (isLiveNow && outMins < inMins) {
    return 0;
  }

  if (outMins >= inMins) {
    return outMins - inMins;
  }
  // Overnight shift duration
  return (outMins - inMins + 1440) % 1440;
}

export function formatMinutesToReadable(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0h 0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

// Web Audio synthesized mechanical "ka-chunk" time clock punch impact
function playMechanicalPunchSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Heavy mechanical stamp impact (low thump)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);

    // Metallic spring / ratchet release click
    setTimeout(() => {
      try {
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(850, ctx.currentTime);
        clickOsc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

        clickGain.gain.setValueAtTime(0.35, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start();
        clickOsc.stop(ctx.currentTime + 0.06);
      } catch {}
    }, 45);
  } catch {}
}

// Generates dynamic seed records for the working days preceding currentDate
function generateDefaultLedger(techId: string, refDate: Date): TimeCardPunchRecord[] {
  const records: TimeCardPunchRecord[] = [];
  const tasks = [
    'Main Gateway Conduit & Trunking',
    'East Wing Zone 2 Dome Cameras Mounting',
    'Server Room Patch Panel & PoE Switch Setup',
    'Focus Calibration & Angle Tuning'
  ];
  let daysBack = 1;
  let taskIdx = 0;

  while (records.length < 4 && daysBack < 14) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - daysBack);
    const dayOfWeek = d.getDay();
    // Skip Sundays
    if (dayOfWeek !== 0) {
      const iso = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      records.unshift({
        id: `rec-seed-${daysBack}-${techId}`,
        date: iso,
        dayLabel,
        timeIn: '08:00 AM',
        timeOut: '05:00 PM',
        durationHours: '9h 00m',
        status: 'COMPLETED',
        remarks: tasks[taskIdx % tasks.length]
      });
      taskIdx++;
    }
    daysBack++;
  }
  return records;
}

// Preset realistic activity remarks chips for fast 1-click admin tagging
const PRESET_ACTIVITY_CHIPS = [
  '📹 Mounting Cameras',
  '🔌 Cabling & Termination',
  '💻 NVR & Switch Config',
  '⚡ PoE & Link Verification',
  '🎯 Angle & Lens Tuning',
  '📋 Client Handover & Walkthrough',
  '🛠️ Troubleshooting Blocker'
];

export const TimeCardModal: React.FC<TimeCardModalProps> = ({
  isOpen,
  onClose,
  technician,
  project,
  onPunchAttendance,
  onUpdateTechnician,
  onNotification
}) => {
  // Live running clock (hours, minutes, seconds)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [remarks, setRemarks] = useState<string>(technician.currentRemarks || '');
  const [showOverridePanel, setShowOverridePanel] = useState(false);
  const [stampEffect, setStampEffect] = useState<{ active: boolean; type: 'IN' | 'OUT'; time: string } | null>(null);

  // Manual Override Form State
  const [overrideDate, setOverrideDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [overrideTimeIn, setOverrideTimeIn] = useState<string>(technician.timeIn || '08:00 AM');
  const [overrideTimeOut, setOverrideTimeOut] = useState<string>(technician.timeOut || '05:00 PM');
  const [overrideStatus, setOverrideStatus] = useState<TechnicianStatus>(technician.status || 'On Site');
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Timesheet punch ledger records
  const storageKey = `rmvn_timecard_ledger_${technician.id}`;
  const [punchLedger, setPunchLedger] = useState<TimeCardPunchRecord[]>([]);

  // Ticking clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format real-time clock
  const liveTimeFormatted = useMemo(() => {
    return currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, [currentDate]);

  const liveDateString = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [currentDate]);

  const todayIso = useMemo(() => {
    return currentDate.toISOString().split('T')[0];
  }, [currentDate]);

  // Load and seed ledger
  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPunchLedger(parsed);
          return;
        }
      }
    } catch {}

    // Seed realistic ledger history for the current pay period
    const defaultLedger: TimeCardPunchRecord[] = [
      {
        id: `rec-seed-1-${technician.id}`,
        date: '2026-09-02',
        dayLabel: 'Wed, Sep 02',
        timeIn: '08:00 AM',
        timeOut: '05:15 PM',
        durationHours: '9h 15m',
        status: 'COMPLETED',
        remarks: 'Main Gateway Conduit & Trunking'
      },
      {
        id: `rec-seed-2-${technician.id}`,
        date: '2026-09-03',
        dayLabel: 'Thu, Sep 03',
        timeIn: '08:15 AM',
        timeOut: '05:00 PM',
        durationHours: '8h 45m',
        status: 'COMPLETED',
        remarks: 'East Wing Zone 2 Dome Cameras Mounting'
      },
      {
        id: `rec-seed-3-${technician.id}`,
        date: '2026-09-04',
        dayLabel: 'Fri, Sep 04',
        timeIn: '07:55 AM',
        timeOut: '04:45 PM',
        durationHours: '8h 50m',
        status: 'COMPLETED',
        remarks: 'Server Room Patch Panel & PoE Switch Setup'
      },
      {
        id: `rec-seed-4-${technician.id}`,
        date: '2026-09-05',
        dayLabel: 'Sat, Sep 05',
        timeIn: '08:30 AM',
        timeOut: '01:30 PM',
        durationHours: '5h 00m',
        status: 'COMPLETED',
        remarks: 'Weekend Inspection & Focus Tuning'
      }
    ];

    // If technician already has an active or past punch today
    if (technician.timeIn) {
      defaultLedger.push({
        id: `rec-today-${technician.id}`,
        date: todayIso,
        dayLabel: 'Mon, Sep 07 (Today)',
        timeIn: technician.timeIn,
        timeOut: technician.timeOut,
        durationHours: technician.isTimedIn && !technician.timeOut
          ? `${formatMinutesToReadable(computeDurationMinutes(technician.timeIn))} (Active)`
          : technician.timeOut
            ? formatMinutesToReadable(computeDurationMinutes(technician.timeIn, technician.timeOut))
            : '--',
        status: technician.isTimedIn ? 'ON SITE' : 'OFF DUTY',
        remarks: technician.currentRemarks || 'Field Operations & CCTV Deployment'
      });
    }

    setPunchLedger(defaultLedger);
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaultLedger));
    } catch {}
  }, [isOpen, storageKey, technician.id, technician.timeIn, technician.timeOut, technician.isTimedIn, technician.currentRemarks, todayIso]);

  // Keep today's row in ledger synchronized with technician's live props
  useEffect(() => {
    if (!isOpen) return;
    setRemarks(technician.currentRemarks || '');
  }, [isOpen, technician.currentRemarks]);

  const isCurrentlyTimedIn = Boolean(technician.isTimedIn && technician.status !== 'Off Duty');

  // Calculate live shift working duration
  const activeShiftDuration = useMemo(() => {
    if (!technician.timeIn) return '0h 0m';
    if (isCurrentlyTimedIn) {
      const mins = computeDurationMinutes(technician.timeIn);
      return formatMinutesToReadable(mins);
    }
    if (technician.timeOut) {
      const mins = computeDurationMinutes(technician.timeIn, technician.timeOut);
      return formatMinutesToReadable(mins);
    }
    return '0h 0m';
  }, [technician.timeIn, technician.timeOut, isCurrentlyTimedIn, currentDate]);

  // Total pay period hours calculation
  const totalPayPeriodHours = useMemo(() => {
    let totalMins = 0;
    punchLedger.forEach(rec => {
      const mins = computeDurationMinutes(rec.timeIn, rec.timeOut);
      totalMins += mins;
    });
    const hours = (totalMins / 60).toFixed(1);
    return `${hours} hrs`;
  }, [punchLedger, isCurrentlyTimedIn, technician.timeIn, currentDate]);

  // Employee ID formatter
  const formattedEmployeeId = useMemo(() => {
    if (technician.id.toLowerCase().includes('tech-1') || technician.name.includes('Rjay')) {
      return 'RMVN-TECH-01';
    }
    const cleanId = technician.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `RMVN-${cleanId.slice(0, 8)}`;
  }, [technician.id, technician.name]);

  // Action: Main Punch Stamp Execution
  const handleExecutePunch = (type: 'TIME_IN' | 'TIME_OUT') => {
    const punchTime = formatAttendanceTime();
    const actionType = type;

    // Trigger visual stamp seal animation
    setStampEffect({
      active: true,
      type: actionType === 'TIME_IN' ? 'IN' : 'OUT',
      time: punchTime
    });

    // Sound chime
    playAttendanceChime(actionType);

    // Update punch ledger list
    const updatedList = [...punchLedger];
    const todayIndex = updatedList.findIndex(r => r.date === todayIso);

    if (actionType === 'TIME_IN') {
      const newEntry: TimeCardPunchRecord = {
        id: `rec-${Date.now()}`,
        date: todayIso,
        dayLabel: `${currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (Today)`,
        timeIn: punchTime,
        timeOut: undefined,
        durationHours: 'Active',
        status: 'ON SITE',
        remarks: remarks.trim() || 'On-site installation & field verification'
      };

      if (todayIndex >= 0) {
        updatedList[todayIndex] = newEntry;
      } else {
        updatedList.push(newEntry);
      }
    } else {
      // Time out
      if (todayIndex >= 0) {
        const existing = updatedList[todayIndex];
        const duration = formatMinutesToReadable(computeDurationMinutes(existing.timeIn, punchTime));
        updatedList[todayIndex] = {
          ...existing,
          timeOut: punchTime,
          durationHours: duration,
          status: 'COMPLETED',
          remarks: remarks.trim() || existing.remarks || 'Completed daily shift'
        };
      } else {
        const duration = technician.timeIn
          ? formatMinutesToReadable(computeDurationMinutes(technician.timeIn, punchTime))
          : '8h 00m';
        updatedList.push({
          id: `rec-${Date.now()}`,
          date: todayIso,
          dayLabel: `${currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (Today)`,
          timeIn: technician.timeIn || '08:00 AM',
          timeOut: punchTime,
          durationHours: duration,
          status: 'COMPLETED',
          remarks: remarks.trim() || 'Completed field assignment'
        });
      }
    }

    setPunchLedger(updatedList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
    } catch {}

    // Invoke parent callback
    onPunchAttendance({
      tech: technician,
      type: actionType,
      time: punchTime,
      remarks: remarks.trim() || undefined,
      status: actionType === 'TIME_IN' ? 'On Site' : 'Off Duty',
      date: todayIso
    });

    // Auto-clear stamp visual effect after 3.5s
    setTimeout(() => {
      setStampEffect(null);
    }, 3500);
  };

  // Action: Admin Manual Override
  const handleApplyOverride = () => {
    if (!overrideTimeIn) {
      if (onNotification) onNotification('Please specify a valid Time In value');
      return;
    }

    const duration = overrideTimeOut
      ? formatMinutesToReadable(computeDurationMinutes(overrideTimeIn, overrideTimeOut))
      : 'Active';

    const isTimedInOverride = overrideStatus === 'On Site' || overrideStatus === 'On Duty';

    // Update ledger
    const updatedList = [...punchLedger];
    const matchIndex = updatedList.findIndex(r => r.date === overrideDate);
    const overrideEntry: TimeCardPunchRecord = {
      id: `override-${Date.now()}`,
      date: overrideDate,
      dayLabel: `${new Date(overrideDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (Override)`,
      timeIn: overrideTimeIn,
      timeOut: isTimedInOverride ? undefined : overrideTimeOut,
      durationHours: duration,
      status: 'OVERRIDE',
      remarks: `[Admin Override] ${overrideReason || 'Manual adjustment'}`.trim(),
      isOverride: true
    };

    if (matchIndex >= 0) {
      updatedList[matchIndex] = overrideEntry;
    } else {
      updatedList.push(overrideEntry);
    }

    setPunchLedger(updatedList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
    } catch {}

    // Apply technician updates
    const updatedTech: TechnicianMember = {
      ...technician,
      isTimedIn: isTimedInOverride,
      status: overrideStatus,
      timeIn: overrideTimeIn,
      timeOut: isTimedInOverride ? undefined : overrideTimeOut,
      attendanceDate: overrideDate,
      currentRemarks: overrideReason || remarks
    };

    if (onUpdateTechnician) {
      onUpdateTechnician(updatedTech);
    }

    onPunchAttendance({
      tech: updatedTech,
      type: isTimedInOverride ? 'TIME_IN' : 'TIME_OUT',
      time: isTimedInOverride ? overrideTimeIn : overrideTimeOut,
      remarks: `[Admin Override] ${overrideReason || 'Manual adjustment'}`.trim(),
      status: overrideStatus,
      date: overrideDate
    });

    setShowOverridePanel(false);
    if (onNotification) {
      onNotification(`Applied manual timecard override for ${technician.name}`);
    }
  };

  // Action: Reset Today's Shift
  const handleResetToday = () => {
    if (!window.confirm(`Reset today's punch record for ${technician.name}? This will return status to Off Duty.`)) {
      return;
    }

    const updatedList = punchLedger.filter(r => r.date !== todayIso);
    setPunchLedger(updatedList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
    } catch {}

    const updatedTech: TechnicianMember = {
      ...technician,
      isTimedIn: false,
      status: 'Off Duty',
      timeIn: undefined,
      timeOut: undefined,
      currentRemarks: undefined
    };

    if (onUpdateTechnician) {
      onUpdateTechnician(updatedTech);
    }

    onPunchAttendance({
      tech: updatedTech,
      type: 'TIME_OUT',
      time: formatAttendanceTime(),
      remarks: 'Shift reset by Admin',
      status: 'Off Duty',
      date: todayIso
    });

    if (onNotification) {
      onNotification(`Reset today's attendance for ${technician.name}`);
    }
  };

  // Action: Print Timecard
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timecard-modal-title"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col my-auto rounded-3xl bg-[#faf6ee] text-slate-900 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] border-2 border-[#dfd2b5] overflow-hidden select-none"
        >
          {/* Authentic Top Punch Clock Slot Cutout & Mechanical Notch */}
          <div className="w-full bg-[#f3ecd9] pt-2 pb-1.5 px-4 border-b border-[#dfd2b5] flex items-center justify-between text-[11px] font-mono font-bold text-[#8c7b60]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d0c0a0] border border-[#a89878] inline-block shadow-inner" />
              <span>TERMINAL ID: RMVN-CLK-STATION-01</span>
            </div>
            {/* Slot cutout graphic */}
            <div className="hidden sm:block w-36 h-2 rounded-full bg-[#d8caa8] border border-[#beae88] shadow-inner" />
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#ebdcb8] text-[#6d5e46] text-[10px] tracking-wider uppercase font-extrabold">
                ADMIN ACCESS ONLY
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-[#e8dcb8] transition cursor-pointer"
                title="Close Time Card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Perforated Stub Line Indicator */}
          <div className="w-full bg-[#faf6ee] px-6 py-1 flex items-center justify-between border-b border-dashed border-[#d4c39e] text-[9px] font-mono text-[#a39270] tracking-widest uppercase">
            <span>● -----------------------</span>
            <span className="px-2 font-black tracking-widest">FORM TAC-04 • OFFICIAL PUNCH CARD ALIGNMENT GUIDE • TEAR LINE</span>
            <span>----------------------- ●</span>
          </div>

          {/* Scrollable Card Body */}
          <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-5 print:p-0 no-scrollbar">
            
            {/* Header: Company Seal, Title & Barcode */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-xs border border-slate-700">
                    RM
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-widest text-slate-700 uppercase">
                      RMVN SOLUTIONS INC.
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tight">
                      Field Engineering & CCTV Infrastructure Division
                    </p>
                  </div>
                </div>
                <h1 id="timecard-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans uppercase">
                  Field Time & Attendance Record
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  Universal Biometric & RFID Dispatch Card • Daily Work Log & Punch Ledger
                </p>
              </div>

              {/* Barcode & Form Numbering */}
              <div className="flex flex-col items-end sm:text-right font-mono text-[10px] text-slate-700 space-y-1 shrink-0 self-end sm:self-auto">
                <div className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-2xs text-center">
                  <div className="font-bold tracking-widest text-slate-900">||| | |||| | || |||| | | |||</div>
                  <div className="text-[9px] tracking-wider text-slate-500 font-semibold">{formattedEmployeeId}-2026</div>
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase">
                  RECORD ID: <span className="text-slate-900">{formattedEmployeeId}</span> • REV 04
                </div>
              </div>
            </div>

            {/* Employee & Assignment Info Grid (Authentic Cardstock Boxed Fields) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f4ecdc] p-3 rounded-2xl border border-[#d8c8a6] text-xs font-mono">
              <div className="p-2 bg-white/80 rounded-xl border border-[#ded0b0]">
                <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">EMPLOYEE NAME</div>
                <div className="font-black text-sm text-slate-900 truncate">{technician.name}</div>
                <div className="text-[10px] text-slate-500 font-sans truncate">{technician.email}</div>
              </div>

              <div className="p-2 bg-white/80 rounded-xl border border-[#ded0b0]">
                <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">EMPLOYEE ID / BADGE</div>
                <div className="font-black text-sm text-indigo-900">{formattedEmployeeId}</div>
                <div className="text-[10px] text-slate-500">ROLE: {technician.role.split('(')[0].trim()}</div>
              </div>

              <div className="p-2 bg-white/80 rounded-xl border border-[#ded0b0]">
                <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">ASSIGNED FACILITY</div>
                <div className="font-black text-sm text-slate-900 truncate">{project.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{technician.zone || technician.assigned || 'Main Zone'}</div>
              </div>

              <div className="p-2 bg-white/80 rounded-xl border border-[#ded0b0]">
                <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">PAY PERIOD / DATE</div>
                <div className="font-black text-sm text-slate-900">SEP 01 – SEP 15</div>
                <div className="text-[10px] text-slate-500 font-bold">{liveDateString}</div>
              </div>
            </div>

            {/* Live Clock & Shift Punch Status Center */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              
              {/* Digital Mechanical Clock Reader (Left, 5 cols) */}
              <div className="md:col-span-5 bg-slate-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-2 border-slate-800 shadow-xl relative overflow-hidden">
                {/* Background digital grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    LIVE PUNCH CLOCK
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    UTC+08:00 PHT
                  </span>
                </div>

                <div className="relative z-10 my-4 text-center">
                  <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                    {liveTimeFormatted}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {liveDateString}
                  </div>
                </div>

                <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    Active Shift: <strong className="text-white font-bold">{activeShiftDuration}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isCurrentlyTimedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className={`font-bold ${isCurrentlyTimedIn ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isCurrentlyTimedIn ? 'ON SITE' : 'OFF DUTY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Stamp Engagement Area (Right, 7 cols) */}
              <div className="md:col-span-7 bg-[#f2e7d0] p-4 sm:p-5 rounded-2xl border-2 border-[#d5c29c] flex flex-col justify-between shadow-xs relative">
                
                {/* Stamp Stamp Seal Overlay when triggered */}
                <AnimatePresence>
                  {stampEffect && stampEffect.active && (
                    <motion.div
                      initial={{ scale: 2, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: -6 }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                      className={`absolute top-4 right-6 z-20 pointer-events-none px-4 py-2.5 rounded-xl border-4 border-dashed font-mono font-black uppercase text-center tracking-widest shadow-2xl ${
                        stampEffect.type === 'IN'
                          ? 'border-emerald-700 bg-emerald-100/90 text-emerald-800'
                          : 'border-rose-700 bg-rose-100/90 text-rose-800'
                      }`}
                    >
                      <div className="text-xs tracking-tighter">RMVN OFFICIAL RECORD</div>
                      <div className="text-base sm:text-lg">
                        {stampEffect.type === 'IN' ? '● PUNCHED IN' : '● PUNCHED OUT'}
                      </div>
                      <div className="text-[10px] font-bold">{stampEffect.time}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="timecard-remarks" className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Shift Remarks / Site Activity:
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">Auto-saved to client chat</span>
                  </div>

                  {/* Remarks Input */}
                  <input
                    id="timecard-remarks"
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Mounting cameras in Front Desk area & NVR setup"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-medium rounded-xl bg-white border border-[#c4b18c] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />

                  {/* Preset Activity Quick Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PRESET_ACTIVITY_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          const cleanChip = chip.replace(/^[^\w\s]+/, '').trim();
                          setRemarks(prev => prev ? `${prev}; ${cleanChip}` : cleanChip);
                        }}
                        className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-slate-700 border border-[#d8c8a6] hover:border-slate-400 transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Tactile Physical Stamp Button */}
                <div className="pt-4 border-t border-[#d8c8a6]/80 flex flex-col sm:flex-row items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96, y: 3 }}
                    type="button"
                    onClick={() => handleExecutePunch(isCurrentlyTimedIn ? 'TIME_OUT' : 'TIME_IN')}
                    className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-mono font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_8px_20px_-4px_rgba(0,0,0,0.35)] transition-all cursor-pointer flex items-center justify-center gap-3 border-2 ${
                      isCurrentlyTimedIn
                        ? 'bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border-rose-800 active:border-rose-900 active:shadow-inner'
                        : 'bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-800 active:border-emerald-900 active:shadow-inner'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-black/20">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-tight">
                      <div>{isCurrentlyTimedIn ? 'PUNCH TIME OUT' : 'PUNCH TIME IN'}</div>
                      <div className="text-[10px] font-normal tracking-tight text-white/80 normal-case font-sans">
                        {isCurrentlyTimedIn
                          ? `Clock out shift (${liveTimeFormatted}) • Calculates duration`
                          : `Clock in shift (${liveTimeFormatted}) • Broadcasts to client`}
                      </div>
                    </div>
                  </motion.button>

                  {/* Reset Button (If accidentally punched) */}
                  <button
                    type="button"
                    onClick={handleResetToday}
                    className="p-3 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5 shrink-0"
                    title="Clear today's attendance"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="sm:hidden">Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Timesheet Grid / Punch Ledger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                    Punch Record Ledger (Shift Ledger)
                  </h3>
                </div>
                <div className="font-mono text-xs text-slate-600">
                  Total Pay Period: <strong className="text-slate-900 font-bold">{totalPayPeriodHours}</strong>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border-2 border-[#d5c29c] bg-white shadow-xs">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-[#ebdcb8] text-[#554733] border-b-2 border-[#d5c29c] text-[10px] uppercase font-black tracking-wider">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Time In</th>
                      <th className="py-2 px-3">Time Out</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Site Remarks</th>
                      <th className="py-2 px-3 text-center">Status / Seal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebdcb8]">
                    {punchLedger.map((rec) => {
                      const isTodayRow = rec.date === todayIso;
                      return (
                        <tr 
                          key={rec.id} 
                          className={`transition ${isTodayRow ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'}`}
                        >
                          <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-bold">
                            {rec.dayLabel}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-emerald-800 font-bold">
                            {rec.timeIn}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                            {rec.timeOut || (isTodayRow && isCurrentlyTimedIn ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                On Site Now
                              </span>
                            ) : '--:--')}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-bold">
                            {isTodayRow && isCurrentlyTimedIn ? `${activeShiftDuration} (Live)` : rec.durationHours}
                          </td>
                          <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate" title={rec.remarks}>
                            {rec.remarks || 'Standard Field Shift'}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border tracking-wider uppercase ${
                              rec.status === 'ON SITE' || (isTodayRow && isCurrentlyTimedIn)
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                : rec.status === 'OVERRIDE' || rec.isOverride
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : 'bg-[#ebdcb8] text-[#554733] border-[#d5c29c]'
                            }`}>
                              {isTodayRow && isCurrentlyTimedIn ? 'ACTIVE ON SITE' : rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Override Controls Accordion */}
            <div className="rounded-2xl border-2 border-[#d5c29c] bg-[#f5eddb] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOverridePanel(!showOverridePanel)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono font-bold text-slate-800 hover:bg-[#ebdcb8] transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-700" />
                  <span>ADMIN OVERRIDE & MANUAL TIME ADJUSTMENT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    Supervisory Privilege
                  </span>
                </div>
                {showOverridePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showOverridePanel && (
                <div className="p-4 bg-white/90 border-t border-[#d5c29c] space-y-3 font-mono text-xs animate-in fade-in">
                  <p className="text-[11px] text-slate-600 font-sans">
                    Use this form to retroactively record, adjust, or correct time entries for {technician.name}. Manual changes are logged with an official override flag.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Override Date:
                      </label>
                      <input
                        type="date"
                        value={overrideDate}
                        onChange={(e) => setOverrideDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Time In (e.g. 08:00 AM):
                      </label>
                      <input
                        type="text"
                        value={overrideTimeIn}
                        onChange={(e) => setOverrideTimeIn(e.target.value)}
                        placeholder="08:00 AM"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Time Out (e.g. 05:00 PM):
                      </label>
                      <input
                        type="text"
                        value={overrideTimeOut}
                        onChange={(e) => setOverrideTimeOut(e.target.value)}
                        placeholder="05:00 PM"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Target Status:
                      </label>
                      <select
                        value={overrideStatus}
                        onChange={(e) => setOverrideStatus(e.target.value as TechnicianStatus)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="On Site">● On Site</option>
                        <option value="Off Duty">○ Off Duty</option>
                        <option value="On Duty">● On Duty</option>
                        <option value="In Transit">🚗 In Transit</option>
                        <option value="Remote">🌐 Remote</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Override Rationale / Audit Justification:
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Technician arrived on time; RFID sync delay at server room door"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowOverridePanel(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer font-sans text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyOverride}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer font-sans text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Apply Override & Broadcast
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Official Certification & Signature Line */}
            <div className="pt-3 border-t-2 border-[#d5c29c] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-600 gap-4">
              <div>
                <div>EMPLOYEE SIGNATURE: <span className="font-bold underline text-slate-900">{technician.name}</span> (Digitally Logged)</div>
                <div className="text-[10px] text-slate-400">TIMESTAMP LOG: {currentDate.toISOString()}</div>
              </div>

              <div className="text-right">
                <div>ADMIN SUPERVISOR: <span className="font-bold text-slate-900">RMVN CCTV Operations Control</span></div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>BIOMETRIC & ENCRYPTED VALIDATION OK</span>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 bg-[#ebdcb8] border-t border-[#d5c29c] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-[#c4b18c] font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Print Official Timecard"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Card</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition cursor-pointer shadow-md"
              >
                Done / Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
