import React, { useState } from 'react';
import { CCTVProject } from '../types';
import { generateProjectMonitoringUpdate, computeExecutiveStatus } from '../utils/assistantEngine';
import { 
  ClipboardCheck, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  Calendar, 
  Users, 
  HelpCircle, 
  ShieldCheck,
  FileText
} from 'lucide-react';

interface ProjectMonitoringViewProps {
  project: CCTVProject;
}

export const ProjectMonitoringView: React.FC<ProjectMonitoringViewProps> = ({ project }) => {
  const [copied, setCopied] = useState(false);
  const exec = computeExecutiveStatus(project);
  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const upcomingTasks = project.tasks.filter(t => t.status !== 'Done');
  const activeBlockers = project.blockers.filter(b => !b.resolved);
  const activeRisks = project.risks;
  const today = new Date().toISOString().split('T')[0];
  const nextCheckInDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleCopy = () => {
    const md = generateProjectMonitoringUpdate(project);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = {
    'On track': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'At risk': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Off track': 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }[exec.schedule];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-wide">
              PROJECT MONITORING UPDATE
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusBadge}`}>
              ● {exec.schedule}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
            <span>Project: <strong className="text-slate-200 font-sans">{project.name}</strong></span>
            <span>Period: <strong className="text-slate-200">Current week</strong></span>
            <span>Lead: <strong className="text-slate-200">{project.teamLead}</strong></span>
            <span>Updated: <strong className="text-slate-200">{today}</strong></span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="self-start sm:self-center flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition shadow-sm"
          title="Copy markdown report for stakeholders"
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Copied Report!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Markdown Report</span>
            </>
          )}
        </button>
      </div>

      {/* 8-Section Grid Dashboard */}
      <div className="p-5 space-y-5">
        {/* 1) Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            1) Status
          </div>
          <div className="text-sm font-semibold text-white">
            Overall: <span className="font-mono text-sky-400">{exec.schedule}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {exec.overallReason}
          </p>
        </div>

        {/* 2) Progress (since last update) & 3) Current Focus (next 7 days) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2) Progress */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                2) Progress (since last update)
              </div>
              {doneTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">None reported yet.</p>
              ) : (
                <ul className="space-y-2">
                  {doneTasks.slice(0, 4).map(t => (
                    <li key={t.id} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✔</span>
                      <div>
                        <span className="font-medium text-white">{t.title}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">({t.owner})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
              {doneTasks.length} milestone(s) completed
            </div>
          </div>

          {/* 3) Current Focus (next 7 days) */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                3) Current Focus (next 7 days)
              </div>
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">None scheduled.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasks.slice(0, 4).map(t => (
                    <li key={t.id} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">▸</span>
                      <div>
                        <span className="font-medium text-white">{t.title}</span>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Owner: <span className="text-slate-300">{t.owner}</span> • Target: <span className="text-sky-300">{t.targetDate || 'This week'}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
              {upcomingTasks.length} active priority item(s)
            </div>
          </div>
        </div>

        {/* 4) Risks / Blockers */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            4) Risks / Blockers
          </div>
          {activeBlockers.length === 0 && activeRisks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">None - no active blockers or high risks.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeBlockers.map(b => (
                <div key={b.id} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <span className="text-rose-400">⚠️</span>
                    <span>{b.description}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <strong className="text-slate-400">Impact:</strong> Outside cameras cannot be powered on for testing yet
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <strong className="text-slate-400">Needed:</strong> {b.unblockAction}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">
                    Owner: {b.owner} • By: Immediate
                  </div>
                </div>
              ))}
              {activeRisks.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{r.description}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <strong className="text-slate-400">Impact:</strong> Could delay final camera checks by a few days
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <strong className="text-slate-400">Needed:</strong> {r.mitigation}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">
                    Owner: {r.owner} • By: {r.dueDate || 'Launch'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5) Timeline / Milestones & 6) Decisions Needed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 5) Timeline / Milestones */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              5) Timeline / Milestones
            </div>
            <ul className="space-y-2">
              {project.tasks.slice(0, 4).map(t => {
                const st = t.status === 'Done' ? 'On track' : (t.status === 'Blocked' ? 'Off track' : 'On track');
                return (
                  <li key={t.id} className="text-xs text-slate-300 flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                    <span className="font-medium text-white truncate mr-2">{t.title}</span>
                    <span className="text-[11px] font-mono shrink-0 text-slate-400">
                      {t.targetDate || t.completedDate || 'Target'} • <strong className={st === 'Off track' ? 'text-rose-400' : 'text-emerald-400'}>{st}</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 6) Decisions Needed */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              6) Decisions Needed
            </div>
            {project.decisions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">None required this week.</p>
            ) : (
              <ul className="space-y-2">
                {project.decisions.map(d => (
                  <li key={d.id} className="text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    <div className="font-medium text-white">{d.decision}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Needed by: {d.date} • Owner: {d.decisionMaker}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 7) Support Needed & 8) Next Check-in */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 7) Support Needed */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              7) Support Needed
            </div>
            {activeBlockers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">None - team fully supported.</p>
            ) : (
              <ul className="space-y-2">
                {activeBlockers.map(b => (
                  <li key={b.id} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <div>
                      <strong className="text-white">From Facility / Sponsor:</strong> {b.unblockAction}
                      <span className="text-slate-400 font-mono ml-1.5 text-[11px]">(By: Immediate)</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 8) Next Check-in */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              8) Next Check-in
            </div>
            <div className="text-xs text-slate-300 font-mono mb-2">
              Date: <strong className="text-white">{nextCheckInDate}</strong>
            </div>
            <div className="text-[11px] text-slate-400 mb-1">We will confirm:</div>
            <ul className="space-y-1 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Outside power hooked up & security badges issued
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Total cameras mounted ({project.installedCameras}/{project.totalCameras} cameras)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Test video picture and recording storage check
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
