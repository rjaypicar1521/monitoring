import React, { useState } from 'react';
import { CCTVProject, ExecutiveStatus, AuthUser, TaskStatus } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Copy, 
  ClipboardCheck, 
  Plus, 
  Minus,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SimpleDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  currentUser: AuthUser;
  onResolveBlocker: (id: string) => void;
  onUpdateCameraCount: (installed: number, total: number) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onCopyReport: () => void;
  copied: boolean;
  onOpenNewTaskModal?: () => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  project,
  execStatus,
  currentUser,
  onResolveBlocker,
  onUpdateCameraCount,
  onUpdateTaskStatus,
  onCopyReport,
  copied,
  onOpenNewTaskModal
}) => {
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const isInstaller = currentUser.role === 'installer';

  const percentComplete = project.totalCameras > 0 
    ? Math.round((project.installedCameras / project.totalCameras) * 100) 
    : 0;

  const activeBlockers = project.blockers.filter(b => !b.resolved);

  // 4 Simple Stages for clean client comprehension
  const simpleStages = [
    {
      id: 'stg-1',
      title: '1. Survey & Clean Indoor Wiring',
      detail: 'Hallways and conduit completed',
      status: 'Done' as const,
    },
    {
      id: 'stg-2',
      title: `2. Mounting & Aiming Cameras (${project.installedCameras}/${project.totalCameras})`,
      detail: 'Halfway through mounting spots',
      status: 'In progress' as const,
    },
    {
      id: 'stg-3',
      title: '3. Video Recording Box Setup',
      detail: 'Storage hard drives and monitor feeds',
      status: 'Upcoming' as const,
    },
    {
      id: 'stg-4',
      title: '4. Angle Check & Staff Training',
      detail: 'Final walkthrough and mobile app setup',
      status: 'Upcoming' as const,
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP CARD: Status & Camera Progress */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {project.name}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {project.location}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {execStatus.overallReason}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-slate-400 block">Target Ready Date</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">
              {project.targetLaunchDate || 'Sep 25, 2026'}
            </span>
          </div>
        </div>

        {/* Big Clean Progress Bar */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              Camera Installation Progress
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {project.installedCameras} of {project.totalCameras} Mounted ({percentComplete}%)
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Quick Admin Adjuster if Admin Mode */}
          {isInstaller && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/30">
              <span className="text-purple-300 font-medium">
                Admin Control: Installed Cameras
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateCameraCount(Math.max(0, project.installedCameras - 1), project.totalCameras)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Decrease count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-white px-2">
                  {project.installedCameras} / {project.totalCameras}
                </span>
                <button
                  onClick={() => onUpdateCameraCount(Math.min(project.totalCameras, project.installedCameras + 1), project.totalCameras)}
                  className="p-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
                  title="Increase count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD 2: Help Needed (Clear Actionable Items) */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Items Waiting on Help
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-300 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            {activeBlockers.length} Pending
          </span>
        </div>

        {activeBlockers.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All approvals are done! Field crew has everything they need.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeBlockers.map((b) => (
              <div 
                key={b.id} 
                className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white text-sm">
                    {b.description}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    What is needed: {b.unblockAction}
                  </p>
                </div>
                <button
                  onClick={() => onResolveBlocker(b.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer self-start sm:self-center shrink-0 shadow-xs"
                >
                  I’ve Handled This
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. CARD 3: Simple 4-Step Project Roadmap */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Installation Stages
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Stage 2 of 4 Active
          </span>
        </div>

        <div className="space-y-2.5">
          {simpleStages.map((stg) => {
            const isDone = stg.status === 'Done';
            const isCurrent = stg.status === 'In progress';

            return (
              <div
                key={stg.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                  isDone 
                    ? 'bg-emerald-950/15 border-emerald-500/25 text-emerald-200' 
                    : isCurrent
                      ? 'bg-cyan-950/20 border-cyan-500/35 text-cyan-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 bg-slate-900 border border-slate-700">
                    {isDone ? '✔' : isCurrent ? '⏳' : '○'}
                  </span>
                  <div>
                    <div className="font-semibold text-white text-xs">{stg.title}</div>
                    <div className="text-[11px] text-slate-400">{stg.detail}</div>
                  </div>
                </div>

                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                  isDone 
                    ? 'bg-emerald-900/40 text-emerald-300' 
                    : isCurrent 
                      ? 'bg-cyan-900/40 text-cyan-300 font-bold' 
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {stg.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CARD 4: Ready-to-Send Client Update Preview */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Weekly Client Email Update
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clean 8-part bullet points formatted for busy stakeholders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
            >
              <span>{showEmailPreview ? 'Hide Text' : 'Preview'}</span>
              {showEmailPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onCopyReport}
              className="text-xs px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showEmailPreview && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in max-h-72 overflow-y-auto">
{`Project: ${project.name}
Period: Sep 1–7, 2026

1) Status: Minor delay (easy fix)
- Indoor wiring and cameras are going great.
- Outside cameras ready as soon as power is hooked up.

2) Progress:
- Completed site walkthrough and spots
- Finished hallway conduit wiring
- Mounted 12 of 24 cameras (50% complete)

3) Current Focus (Next 7 days):
- Connect outside breaker power with electrician
- Mount remaining 12 cameras
- Set up central recording box

4) Risks / Blockers:
- Outside power permission (Needs building electrician)
- Security badges for 2 technicians

5) Timeline / Milestones:
- Sep 10: Power & full mounting check
- Sep 25: Final handover & viewing angle test

6) Decisions Needed: None
7) Support Needed: Electrician approval
8) Next check-in: Sep 10, 2026`}
          </div>
        )}
      </div>
    </div>
  );
};
