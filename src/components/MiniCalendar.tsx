import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export interface MiniCalendarProps {
  className?: string;
  showClock?: boolean;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

/**
 * Sleek Mini Calendar Widget with Integrated Precision Digital Clock
 * Adheres to /impeccable design principles:
 * - Real-time live updating clock with 1-second interval and clean teardown
 * - Tabular monospace numerals (font-mono tabular-nums tracking-wider) with zero layout jitter
 * - Seconds indicator in brand amber accent
 * - 12h / 24h toggle with instant cross-instance sync and localStorage persistence
 * - Timezone detection (Asia/Manila -> PHT) calculated once on mount
 * - Accessible live status beacon with prefers-reduced-motion support
 * - Midnight rollover safety: auto-advances month view if viewing current month
 * - Obsidian dark instrument panel (#0e1117) with WCAG AA compliant contrast ratios
 */
export const MiniCalendar: React.FC<MiniCalendarProps> = ({ 
  className = '',
  showClock = true,
  selectedDate,
  onSelectDate,
}) => {
  // Live clock state updated every second
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  
  // 12h / 24h format state with localStorage persistence
  const [is24Hour, setIs24Hour] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rmvn_clock_is24h') === 'true';
    } catch {
      return false;
    }
  });

  // Track if user manually navigated away from current month (null = automatically track current month)
  const [navigatedDate, setNavigatedDate] = useState<Date | null>(null);

  // Real-time interval with clean unmount cleanup
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Multi-instance synchronization (e.g. desktop sidebar & mobile drawer)
  useEffect(() => {
    const handleFormatSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIs24Hour(customEvent.detail);
      }
    };
    window.addEventListener('rmvn_clock_format_change', handleFormatSync);
    return () => {
      window.removeEventListener('rmvn_clock_format_change', handleFormatSync);
    };
  }, []);

  // Format toggle handler (broadcasts sync event across instances)
  const toggleTimeFormat = useCallback(() => {
    setIs24Hour((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rmvn_clock_is24h', String(next));
        window.dispatchEvent(new CustomEvent('rmvn_clock_format_change', { detail: next }));
      } catch {}
      return next;
    });
  }, []);

  // Time components
  const rawHours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const period = rawHours >= 12 ? 'PM' : 'AM';
  
  const displayHours = is24Hour 
    ? String(rawHours).padStart(2, '0') 
    : String(rawHours % 12 || 12).padStart(2, '0');

  // Timezone label calculated once on mount to avoid continuous re-computation
  const timeZoneLabel = useMemo(() => {
    try {
      const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolvedTz === 'Asia/Manila') return 'PHT';
      const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === 'timeZoneName')?.value;
      if (tzName) {
        if (tzName === 'GMT+8') return 'PHT';
        return tzName;
      }
    } catch {}
    return 'PHT';
  }, []);

  // Date references
  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth();
  const todayDate = currentTime.getDate();

  // Active view date: auto-follows current month unless user manually navigated
  const viewDate = navigatedDate ?? new Date(currentYear, currentMonth, 1);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const isCurrentMonth = navigatedDate === null || 
    (viewYear === currentYear && viewMonth === currentMonth);

  // Month navigation handlers
  const prevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    if (prev.getFullYear() === currentYear && prev.getMonth() === currentMonth) {
      setNavigatedDate(null);
    } else {
      setNavigatedDate(prev);
    }
  };

  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next.getFullYear() === currentYear && next.getMonth() === currentMonth) {
      setNavigatedDate(null);
    } else {
      setNavigatedDate(next);
    }
  };

  const jumpToToday = () => setNavigatedDate(null);

  // Formatted date labels
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekdayFull = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDayYear = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fullDateFormatted = `${weekdayFull}, ${monthDayYear}`;

  // Month grid day calculations
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const days: { day: number; dateObj: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    days.push({
      day: d,
      dateObj: new Date(viewYear, viewMonth - 1, d),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      dateObj: new Date(viewYear, viewMonth, d),
      isCurrentMonth: true,
      isToday: isCurrentMonth && d === todayDate,
    });
  }

  // Next month leading days to complete full 7-day rows
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      dateObj: new Date(viewYear, viewMonth + 1, i),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const weekDayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`bg-slate-50/95 border border-slate-200/80 rounded-2xl p-3 shadow-2xs space-y-2.5 ${className}`}>
      {/* Live Digital Clock Instrument Panel */}
      {showClock && (
        <div 
          className="bg-[#0e1117] border border-slate-800/90 rounded-xl p-2.5 text-white select-none shadow-2xs relative overflow-hidden"
          title={`Live system clock (${is24Hour ? '24-hour' : '12-hour'}). Click 12H/24H badge to switch format`}
        >
          {/* Top Status Row: Live Beacon, Timezone & Interactive Format Toggle */}
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="motion-reduce:hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              </span>
              <span className="font-mono font-bold tracking-wider text-emerald-400 text-[10px]">
                LIVE
              </span>
              <span className="text-slate-600 font-mono text-[9px]">•</span>
              <span className="font-mono font-medium tracking-wider text-slate-400 text-[10px]">
                {timeZoneLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTimeFormat}
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
              title={`Switch to ${is24Hour ? '12-hour (AM/PM)' : '24-hour'} format`}
              aria-label={`Time format toggle. Currently ${is24Hour ? '24-hour' : '12-hour'}. Click to switch.`}
            >
              {is24Hour ? '24H' : '12H'}
            </button>
          </div>

          {/* Time Display with Tabular Monospace Digits */}
          <time 
            dateTime={currentTime.toISOString()}
            className="flex items-baseline justify-between pt-0.5 block"
          >
            <div className="flex items-baseline font-mono tabular-nums tracking-wider">
              <span className="text-2xl font-black text-white">
                {displayHours}:{minutes}
              </span>
              <span className="text-xs font-bold text-amber-400 ml-1">
                :{seconds}
              </span>
              {!is24Hour && (
                <span className="text-[9px] font-mono font-black text-amber-300 uppercase ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30">
                  {period}
                </span>
              )}
            </div>

            <div className="text-right shrink-0 pl-1.5">
              <div className="text-[11px] font-bold text-slate-200 leading-tight">
                {weekdayFull.slice(0, 3)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                {monthDayYear}
              </div>
            </div>
          </time>
        </div>
      )}

      {/* Month Header & Controls */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span className="font-bold text-xs text-slate-900 truncate">
            {monthName}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-slate-200/80 active:scale-95 text-slate-500 hover:text-slate-800 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-slate-200/80 active:scale-95 text-slate-500 hover:text-slate-800 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* If viewing different month, show Return to Today banner */}
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={jumpToToday}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] border border-amber-400/40 hover:border-amber-500 rounded-xl transition text-left cursor-pointer group shadow-2xs focus:outline-none focus:ring-1 focus:ring-amber-400"
          title="Click to return to current month"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <RotateCcw className="w-3 h-3 text-amber-600 shrink-0 group-hover:-rotate-45 transition-transform" />
            <span className="text-[10px] font-bold text-amber-950 truncate">
              Viewing {monthName}
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-200/90 px-1.5 py-0.5 rounded-md shrink-0 shadow-2xs">
            Jump to Today
          </span>
        </button>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center" aria-hidden="true">
        {weekDayLabels.map((lbl, idx) => (
          <span
            key={lbl + idx}
            className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono py-0.5"
          >
            {lbl}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Calendar grid for ${monthName}`}>
        {days.map((item, idx) => {
          const cellKey = `${viewYear}-${viewMonth}-${idx}-${item.day}`;
          const isSelected = selectedDate ? (
            item.dateObj.getFullYear() === selectedDate.getFullYear() &&
            item.dateObj.getMonth() === selectedDate.getMonth() &&
            item.dateObj.getDate() === selectedDate.getDate()
          ) : false;

          if (item.isToday) {
            return (
              <button
                key={cellKey}
                type="button"
                onClick={() => onSelectDate?.(item.dateObj)}
                className={`h-6 w-full flex items-center justify-center text-[10px] font-mono font-black rounded-lg bg-amber-400 text-slate-950 shadow-2xs ring-2 ring-amber-500/50 transition ${
                  onSelectDate ? 'cursor-pointer hover:bg-amber-300' : 'cursor-default'
                }`}
                title={`Today: ${fullDateFormatted}`}
                aria-current="date"
                aria-label={`Today, ${fullDateFormatted}`}
              >
                {item.day}
              </button>
            );
          }

          if (isSelected) {
            return (
              <button
                key={cellKey}
                type="button"
                onClick={() => onSelectDate?.(item.dateObj)}
                className="h-6 w-full flex items-center justify-center text-[10px] font-mono font-black rounded-lg bg-slate-900 text-white shadow-2xs ring-1 ring-slate-700 cursor-pointer"
                aria-selected="true"
                aria-label={item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              >
                {item.day}
              </button>
            );
          }

          return (
            <button
              key={cellKey}
              type="button"
              onClick={() => onSelectDate?.(item.dateObj)}
              disabled={!onSelectDate && !item.isCurrentMonth}
              className={`h-6 w-full flex items-center justify-center text-[10px] font-mono rounded-lg transition ${
                onSelectDate ? 'cursor-pointer hover:bg-slate-200/70' : 'cursor-default'
              } ${
                item.isCurrentMonth
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-400/70 font-normal'
              }`}
              aria-label={item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
