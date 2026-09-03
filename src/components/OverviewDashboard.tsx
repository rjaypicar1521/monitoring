import React from 'react';
import { CCTVProject, ExecutiveStatus, HealthScore } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Users, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  HardDrive,
  FileCheck2
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface OverviewDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  healthScore: HealthScore;
  onNavigateToReport: () => void;
  onNavigateToTasks: () => void;
  onNavigateToBlockers: () => void;
  onResolveBlocker: (id: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  project,
  execStatus,
  healthScore,
  onNavigateToReport,
  onNavigateToTasks,
  onNavigateToBlockers,
  onResolveBlocker
}) => {
  const percentComplete = project.totalCameras > 0 
    ? Math.round((project.installedCameras / project.totalCameras) * 100) 
    : 0;

  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const inProgressTasks = project.tasks.filter(t => t.status === 'In progress');
  const activeBlockers = project.blockers.filter(b => !b.resolved);

  // Status styling
  const statusTheme = {
    'On track': {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    },
    'At risk': {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
    },
    'Off track': {
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />
    }
  }[execStatus.schedule];

  const phases = [
    { title: 'Site Walkthrough', status: 'Done', step: 1 },
    { title: 'Indoor Wiring', status: 'Done', step: 2 },
    { title: 'Mounting Cameras', status: 'In progress', step: 3 },
    { title: 'Recording Box Setup', status: 'In progress', step: 4 },
    { title: 'Screen & Angle Check', status: 'Upcoming', step: 5 },
    { title: 'Team Handover', status: 'Upcoming', step: 6 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome & Live Status Banner */}
      <div className={`p-6 rounded-2xl border ${statusTheme.border} ${statusTheme.bg} backdrop-blur-sm relative overflow-hidden shadow-xl`}>
        {/* Subtle background radar watermark */}
        <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none scale-150">
          <BrandLogo size="xl" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusTheme.badge}`}>
                ● {execStatus.schedule}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Last checked today • Weekly update cadence
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.name}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {execStatus.overallReason}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md hover:shadow-sky-500/25"
            >
              <span>View Full 8-Part Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Camera Progress */}
        <div 
          onClick={onNavigateToTasks}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/40 transition cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-sky-400" />
              Camera Progress
            </span>
            <span className="text-[11px] font-mono text-sky-400 group-hover:underline">Track &rarr;</span>
          </div>

          <div className="my-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {project.installedCameras} <span className="text-sm font-medium text-slate-400">/ {project.totalCameras}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{percentComplete}% of cameras mounted</span>
            <span className="text-emerald-400 font-medium">12 Online</span>
          </div>
        </div>

        {/* Card 2: Schedule & Launch */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              Target Ready Date
            </span>
            <span className="text-[11px] font-mono text-slate-400">Sept 2026</span>
          </div>

          <div className="my-3">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {project.targetLaunchDate || 'Sept 25, 2026'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Started: {project.startDate || 'Aug 25'}
            </p>
          </div>

          <div className="text-[11px] text-purple-300 bg-purple-950/30 px-2 py-0.5 rounded border border-purple-800/40 inline-block truncate">
            Lead: {project.teamLead}
          </div>
        </div>

        {/* Card 3: Action Items Waiting On Client */}
        <div 
          onClick={onNavigateToBlockers}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-amber-500/40 transition cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Help Needed
            </span>
            <span className="text-[11px] font-mono text-amber-400 group-hover:underline">Resolve &rarr;</span>
          </div>

          <div className="my-3">
            <div className="text-2xl font-black text-amber-300">
              {activeBlockers.length} Items
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {activeBlockers[0]?.description || 'No blockers active'}
            </p>
          </div>

          <div className="text-[11px] text-amber-400 font-medium">
            Click to review and clear &rarr;
          </div>
        </div>

        {/* Card 4: Health Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Overall Rating
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">Good</span>
          </div>

          <div className="my-3">
            <div className="text-2xl font-black text-white font-mono">
              {healthScore.total} <span className="text-sm font-normal text-slate-400">/ 25</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Schedule: {healthScore.schedule}/5 • Quality: {healthScore.quality}/5
            </p>
          </div>

          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Low overall risk profile</span>
          </div>
        </div>
      </div>

      {/* Interactive Project Roadmap Phases */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Installation Phases & Roadmap
          </h3>
          <span className="text-xs text-slate-400">Phase 3 & 4 Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {phases.map((p) => {
            const isDone = p.status === 'Done';
            const isProgress = p.status === 'In progress';
            return (
              <div 
                key={p.step}
                className={`p-3 rounded-xl border text-left transition ${
                  isDone 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                    : isProgress 
                      ? 'bg-sky-950/30 border-sky-500/40 text-sky-300 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono">0{p.step}</span>
                  <span>{isDone ? '✔ Done' : isProgress ? '🟦 Active' : '⏳ Next'}</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {p.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Detail: Accomplishments vs Immediate Asks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Wins this week */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Completed This Week (Wins)
              </h3>
              <span className="text-xs text-slate-400 font-mono">{doneTasks.length} Done</span>
            </div>

            <ul className="space-y-3">
              {doneTasks.map((t) => (
                <li key={t.id} className="text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <div>
                    <div className="font-semibold text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Responsible: {t.owner} {t.completedDate && `• Completed: ${t.completedDate}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onNavigateToTasks}
            className="mt-4 text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
          >
            <span>View All Tasks & Milestones</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Urgent Help Needed from Client */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                What We Need From You
              </h3>
              <span className="text-xs text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
                Action Required
              </span>
            </div>

            {activeBlockers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No items waiting on you! The team has all needed access and approvals.
              </div>
            ) : (
              <ul className="space-y-3">
                {activeBlockers.map((b) => (
                  <li key={b.id} className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-amber-200">{b.description}</span>
                      <button
                        onClick={() => onResolveBlocker(b.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shrink-0 transition"
                      >
                        I've Handled This
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-snug">
                      <strong className="text-amber-400">Action needed:</strong> {b.unblockAction}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Logged since {b.since} • Owner: {b.owner}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="text-slate-400">
              Have questions? Need to adjust camera spots?
            </div>
            <span className="text-sky-400 font-medium cursor-pointer hover:underline" onClick={onNavigateToReport}>
              See Next Check-in &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
