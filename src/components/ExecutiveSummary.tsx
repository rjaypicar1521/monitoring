import React from 'react';
import { CCTVProject, ExecutiveStatus } from '../types';
import { Calendar, ShieldAlert, Users, Target, CheckCircle2, AlertTriangle, XCircle, HardDrive } from 'lucide-react';

interface ExecutiveSummaryProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ project, execStatus }) => {
  const cameraProgress = project.totalCameras > 0 
    ? Math.round((project.installedCameras / project.totalCameras) * 100) 
    : 0;

  const scheduleIcon = {
    'On track': <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    'At risk': <AlertTriangle className="w-4 h-4 text-amber-400" />,
    'Off track': <XCircle className="w-4 h-4 text-rose-400" />
  }[execStatus.schedule];

  const overallTheme = {
    Green: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
    Yellow: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
    Red: 'border-rose-500/30 bg-rose-950/20 text-rose-300'
  }[execStatus.overall];

  return (
    <div className="space-y-4">
      {/* 5-Line Executive Status Banner */}
      <div className={`p-4 rounded-xl border ${overallTheme} backdrop-blur shadow-sm transition`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold opacity-75">Executive Status</span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Overall Health:</span>
              <span className="underline decoration-2">{execStatus.overall}</span>
              <span className="text-xs font-normal text-slate-300">({execStatus.overallReason})</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-900/60 border border-slate-700">
              Cadence: {project.updateCadence}
            </span>
            <span className="px-2 py-1 rounded bg-slate-900/60 border border-slate-700">
              Audience: {project.audience}
            </span>
          </div>
        </div>

        {/* 4 Pillars: Schedule, Scope, Resourcing, Key Ask */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
            {scheduleIcon}
            <div>
              <div className="text-xs text-slate-400">Schedule</div>
              <div className="font-semibold text-white">{execStatus.schedule}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
            <Target className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-xs text-slate-400">Scope</div>
              <div className="font-semibold text-white">{execStatus.scope}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs text-slate-400">Resourcing</div>
              <div className="font-semibold text-white">{execStatus.resourcing}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <div className="overflow-hidden">
              <div className="text-xs text-slate-400">Key Ask</div>
              <div className="font-semibold text-white text-xs truncate" title={execStatus.keyAsk}>
                {execStatus.keyAsk}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar: Cameras Mounted & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Camera Progress */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              Camera Mounting Progress
            </span>
            <span className="font-mono text-sky-400 font-bold">{project.installedCameras} / {project.totalCameras} ({cameraProgress}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, cameraProgress)}%` }}
            />
          </div>
        </div>

        {/* Timeline & Location */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Target Launch Date
            </span>
            <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
              {project.targetLaunchDate || '(date not provided)'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Start Date</span>
            <span className="text-sm text-slate-300 font-mono block">
              {project.startDate || '(date not provided)'}
            </span>
          </div>
        </div>

        {/* Team Lead & Location */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Site Lead / Owner
            </span>
            <span className="text-sm font-semibold text-white truncate block mt-0.5">
              {project.teamLead || 'Unassigned'}
            </span>
          </div>
          <div className="text-right truncate pl-2">
            <span className="text-xs text-slate-400">Location</span>
            <span className="text-xs text-slate-300 truncate block mt-0.5" title={project.location}>
              {project.location || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
