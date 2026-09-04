import React, { useState } from 'react';
import { CCTVProject, ExecutiveStatus, HealthScore } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  Calendar, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Copy, 
  ClipboardCheck,
  Send,
  HelpCircle,
  X
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface UserDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  healthScore: HealthScore;
  onNavigateToReport: () => void;
  onNavigateToTasks: () => void;
  onResolveBlocker: (id: string) => void;
  onCopyReport: () => void;
  copied: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  project,
  execStatus,
  healthScore,
  onNavigateToReport,
  onNavigateToTasks,
  onResolveBlocker,
  onCopyReport,
  copied
}) => {
  const [noteSent, setNoteSent] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteMessage, setNoteMessage] = useState('');

  const percentComplete = project.totalCameras > 0 
    ? Math.round((project.installedCameras / project.totalCameras) * 100) 
    : 0;

  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const activeBlockers = project.blockers.filter(b => !b.resolved);

  const phases = [
    { title: '1. Walkthrough & Spots', status: 'Done', note: 'All camera spots confirmed' },
    { title: '2. Indoor Wiring', status: 'Done', note: 'Clean conduit routing finished' },
    { title: '3. Camera Mounting', status: 'In progress', note: '12 of 24 mounted & aimed' },
    { title: '4. Recording Box', status: 'In progress', note: 'Storage hard drives configured' },
    { title: '5. Screen View Check', status: 'Upcoming', note: 'Signal & video clarity test' },
    { title: '6. Staff Handover', status: 'Upcoming', note: 'Viewing angle walk & app training' },
  ];

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim()) return;
    setNoteSent(true);
    setShowNoteModal(false);
    setNoteMessage('');
    setTimeout(() => setNoteSent(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Client Purpose Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none scale-150">
          <BrandLogo size="xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                Client Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {project.location}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {execStatus.overallReason}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <span>View Weekly Update Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Camera Progress */}
        <div 
          onClick={onNavigateToTasks}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-slate-200">
              <Camera className="w-4 h-4 text-sky-400" />
              Camera Installation Progress
            </span>
            <span className="text-[11px] font-mono text-sky-400 group-hover:underline">View spots &rarr;</span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.installedCameras} <span className="text-sm font-medium text-slate-400">/ {project.totalCameras} Mounted</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Shows physical progress • <span className="text-emerald-400 font-semibold">{percentComplete}% complete</span>
          </p>
        </div>

        {/* Card 2: Ready Date */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-slate-200">
              <Calendar className="w-4 h-4 text-purple-400" />
              Target Ready Date
            </span>
            <span className="text-[11px] font-mono text-purple-400">21 Days Away</span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {project.targetLaunchDate || 'Sep 25, 2026'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Started: {project.startDate || 'Aug 25'} • On schedule
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Confirms when your staff can begin using system
          </p>
        </div>

        {/* Card 3: Items Needing You */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Items Needing You
            </span>
            <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              {activeBlockers.length} Pending
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {activeBlockers.length} Approvals
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {activeBlockers[0]?.description || 'All approvals cleared!'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Building permissions needed so crew can finish
          </p>
        </div>
      </div>

      {/* MAIN SECTION: Milestone Progress & Approvals Waiting On You */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Progress in Plain Language */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Milestone Progress (Plain Language)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ordered by project installation phase
                </p>
              </div>
              <button
                onClick={onNavigateToReport}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
              >
                Report &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {phases.map((p, idx) => {
                const isDone = p.status === 'Done';
                const isProgress = p.status === 'In progress';
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                      isDone 
                        ? 'bg-emerald-950/15 border-emerald-500/25 text-emerald-200' 
                        : isProgress 
                          ? 'bg-sky-950/25 border-sky-500/35 text-sky-200' 
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold font-mono">
                        {isDone ? '✔' : isProgress ? '▸' : '○'}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">{p.title}</div>
                        <div className="text-[11px] text-slate-400">{p.note}</div>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium ${
                      isDone ? 'bg-emerald-900/40 text-emerald-300' : isProgress ? 'bg-sky-900/40 text-sky-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Approvals Waiting On You */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Approvals Waiting on You
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sorted by urgency • Click when you have authorized
                </p>
              </div>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
                Action Required
              </span>
            </div>

            {activeBlockers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-white text-sm">All approvals are clear!</p>
                <p className="text-[11px] mt-1">The installation team has full access and is moving forward.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBlockers.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-amber-200 text-sm">{b.description}</span>
                      <button
                        onClick={() => onResolveBlocker(b.id)}
                        className="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shrink-0 transition cursor-pointer shadow-xs"
                      >
                        I’ve Handled This
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                      <strong className="text-amber-400">Impact on project:</strong> Outside cameras cannot turn on for testing until power is approved.
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Needed: {b.unblockAction} • Logged since {b.since}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Questions about approvals?</span>
            <button
              onClick={() => setShowNoteModal(true)}
              className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            >
              Ask Lead Installer &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY SECTION: Recent Completed Wins & Next Check-in Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completed Wins */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recent Completed Wins (This Week)
              </h3>
              <span className="text-xs text-emerald-400 font-mono font-semibold">{doneTasks.length} Done</span>
            </div>

            <div className="space-y-2.5">
              {doneTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <div>
                    <div className="font-semibold text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Responsible: {t.owner} {t.completedDate && `• Date: ${t.completedDate}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onCopyReport}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <span>Copied 1-Minute Email Update!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-sky-400" />
                <span>Copy 1-Minute Email Update</span>
              </>
            )}
          </button>
        </div>

        {/* Next Check-in Schedule */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Next Check-in Schedule
              </h3>
              <span className="text-xs text-purple-300 font-mono font-bold bg-purple-950/30 px-2 py-0.5 rounded border border-purple-800/40">
                Sep 10
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-950/15 border border-purple-500/25">
                <div className="text-purple-300 font-semibold mb-1">Weekly Check-in Date: Sep 10, 2026</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  On Sep 10, the installation crew will confirm:
                </p>
                <ul className="mt-2 space-y-1 text-slate-300 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> Outside power connection clearance
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> Final 12 cameras mounted (100% hardware complete)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> Video streaming verification on main screen
                  </li>
                </ul>
              </div>

              {noteSent && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Note sent to lead installer (Rjay Picar).</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowNoteModal(true)}
            className="mt-4 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Note to Lead Installer</span>
          </button>
        </div>
      </div>

      {/* Note to Lead Installer Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                Note to Lead Installer
              </h3>
              <button 
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNote} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">To:</label>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Rjay Picar (Lead Tech & Admin)</div>
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium">Your Message / Question:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Electrician is scheduled for Monday 9am, or please adjust camera #4 angle..."
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                >
                  Send Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
