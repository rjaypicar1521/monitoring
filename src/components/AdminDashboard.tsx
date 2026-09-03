import React, { useState } from 'react';
import { CCTVProject, ExecutiveStatus, HealthScore, TaskStatus, CCTVTask } from '../types';
import { 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Settings, 
  Users, 
  Wrench, 
  UserPlus, 
  Sliders, 
  FileText, 
  ExternalLink,
  Shield,
  Edit2,
  X,
  Send,
  Filter
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AdminDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  healthScore: HealthScore;
  onOpenHealthModal: () => void;
  onOpenAddTaskModal: () => void;
  onOpenAddRiskModal: () => void;
  onResolveBlocker: (id: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, blockerReason?: string) => void;
  onUpdateProject: (updated: CCTVProject) => void;
  onNavigateToReport: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  project,
  execStatus,
  healthScore,
  onOpenHealthModal,
  onOpenAddTaskModal,
  onOpenAddRiskModal,
  onResolveBlocker,
  onUpdateTaskStatus,
  onUpdateProject,
  onNavigateToReport
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'installer' | 'client'>('installer');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Settings form local state
  const [editTotalCameras, setEditTotalCameras] = useState(project.totalCameras);
  const [editInstalledCameras, setEditInstalledCameras] = useState(project.installedCameras);
  const [editTargetDate, setEditTargetDate] = useState(project.targetLaunchDate || '2026-09-25');

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject({
      ...project,
      totalCameras: Number(editTotalCameras),
      installedCameras: Number(editInstalledCameras),
      targetLaunchDate: editTargetDate
    });
    setShowSettingsModal(false);
    showNotification('Project specs and camera counts updated!');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setShowInviteModal(false);
    showNotification(`Invite sent to ${inviteEmail} as ${inviteRole === 'installer' ? 'Field Technician' : 'Client Viewer'}!`);
    setInviteEmail('');
  };

  const activeBlockers = project.blockers.filter(b => !b.resolved);

  const filteredTasks = project.tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  // People roster
  const teamMembers = [
    { name: 'Marcus Vance', role: 'Lead Tech & Administrator', access: 'Admin', email: 'marcus@rmvn-cctv.com', active: true },
    { name: 'Alex Kim', role: 'Field Technician (Wiring & Conduit)', access: 'Installer', email: 'alex.k@rmvn-cctv.com', active: true },
    { name: 'Dave Miller', role: 'Field Technician (Camera Mounts)', access: 'Installer', email: 'dave.m@rmvn-cctv.com', active: true },
    { name: 'Elena Rostova', role: 'Network & Recording Engineer', access: 'Installer', email: 'elena.r@rmvn-cctv.com', active: true },
    { name: 'Alex Morgan', role: 'Client Project Sponsor', access: 'Client Viewer', email: 'alex.morgan@client.org', active: true },
  ];

  // Recent activity logs
  const activityLogs = [
    { time: 'Today, 2:15 PM', user: 'Marcus Vance', action: 'Verified 12 mounted camera viewing angles' },
    { time: 'Yesterday, 4:30 PM', user: 'Alex Kim', action: 'Flagged outside power hookup blocker waiting on electrician' },
    { time: 'Sep 1, 11:00 AM', user: 'Dave Miller', action: 'Marked "Run indoor wiring" complete (100%)' },
    { time: 'Aug 29, 9:15 AM', user: 'Elena Rostova', action: 'Initialized central video recording box hard drives' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action toast notification */}
      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionSuccessMsg}
          </span>
          <button onClick={() => setActionSuccessMsg(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Hero Header */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-purple-950/30 border border-purple-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none scale-150">
          <BrandLogo size="xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                Installer Control Panel (Admin)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {project.location}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Coordinate technicians, manage camera mount milestones, log risks, and ensure timely client handover.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer shadow-sm"
              title="Hardware & Camera Specs"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={onOpenAddTaskModal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* HEALTH OVERVIEW (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Project Health Rating */}
        <div 
          onClick={onOpenHealthModal}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-emerald-400">
              <Activity className="w-4 h-4" />
              Project Health Rating
            </span>
            <span className="text-[11px] font-mono text-emerald-400 group-hover:underline">Audit &rarr;</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white font-mono">
              {healthScore.total} <span className="text-sm font-medium text-slate-400">/ 25</span>
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">
              Stable • Low schedule risk
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Catches supply & schedule delays early
          </p>
        </div>

        {/* Card 2: Active Blockers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
              Active Blockers
            </span>
            <span className="text-[11px] font-mono text-rose-300 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
              {activeBlockers.length} Critical
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-rose-400">
              {activeBlockers.length} Issues
            </div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-1">
              {activeBlockers[0]?.description || 'None active'}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Requires escalation to prevent delay
          </p>
        </div>

        {/* Card 3: Deployment Pacing */}
        <div 
          onClick={() => setShowSettingsModal(true)}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-sky-400">
              <Camera className="w-4 h-4" />
              Deployment Pacing
            </span>
            <span className="text-[11px] font-mono text-sky-400 group-hover:underline">Edit &rarr;</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white font-mono">
              {project.installedCameras} <span className="text-sm font-medium text-slate-400">/ {project.totalCameras}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
              <div 
                className="bg-sky-500 h-full rounded-full"
                style={{ width: `${Math.round((project.installedCameras / project.totalCameras) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Hardware points active • Tap to adjust
          </p>
        </div>

        {/* Card 4: Target Launch Deadline */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-purple-400">
              <Calendar className="w-4 h-4" />
              Target Launch Date
            </span>
            <span className="text-[11px] font-mono text-purple-300">On Track</span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {project.targetLaunchDate || 'Sep 25, 2026'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Final handover & app demo
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Contractor hours & testing locked to date
          </p>
        </div>
      </div>

      {/* NEEDS ATTENTION (Prioritized Action Items) */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Needs Attention (Installer Escalate & Resolve)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              High-priority items impacting installation workflow
            </p>
          </div>
          <button
            onClick={onOpenAddRiskModal}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Risk</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Item 1: High Priority External Power Blocker */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded font-bold font-mono text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  HIGH
                </span>
                <span className="font-bold text-white text-sm">External Power Hookup Blocker</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Waiting on building electrician to connect exterior breaker panel. Field crew cannot power-test outside cameras.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showNotification('Sent power schedule escalation note to Client Project Sponsor!')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                Nudge Sponsor
              </button>
              <button
                onClick={() => {
                  const b = project.blockers.find(x => x.description.includes('power') || !x.resolved);
                  if (b) onResolveBlocker(b.id);
                  showNotification('Marked external power hookup resolved!');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer"
              >
                Mark Resolved
              </button>
            </div>
          </div>

          {/* Item 2: High Priority Crew Badges */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded font-bold font-mono text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  HIGH
                </span>
                <span className="font-bold text-white text-sm">Security Entry Badges (2 Techs)</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Dave Miller & Elena Rostova need RFID access badges for basement electrical room.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showNotification('Re-sent badge credential request to facility security desk!')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition cursor-pointer"
              >
                Re-Send Request
              </button>
            </div>
          </div>

          {/* Item 3: Medium Priority Storage Retention */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded font-bold font-mono text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  MEDIUM
                </span>
                <span className="font-bold text-white text-sm">Video Storage Sign-off</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Client choice between 30-day standard or 60-day extended recording retention.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showNotification('Sent storage retention decision form to Alex Morgan!')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PEOPLE & ACCESS + RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* People & Access */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Team Roster & Access Roles
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  5 active members on this installation
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            </div>

            <div className="space-y-2">
              {teamMembers.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        m.access === 'Admin' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' :
                        m.access === 'Installer' ? 'bg-sky-900/50 text-sky-300 border border-sky-700/50' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {m.access}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{m.role} • {m.email}</div>
                  </div>
                  <button
                    onClick={() => showNotification(`Role permissions dialog for ${m.name}`)}
                    className="text-[11px] text-slate-500 hover:text-slate-300 font-mono"
                  >
                    Edit &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 bg-slate-950/40 p-2.5 rounded-xl text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Plain-Language Role Rules:</div>
            <div>• <strong className="text-purple-300">Admin:</strong> Full control over milestones, risks, hardware counts, and team roles.</div>
            <div>• <strong className="text-sky-300">Installer:</strong> Can update task progress, log blockers, and test cameras.</div>
            <div>• <strong className="text-slate-300">Client Viewer:</strong> Clean read-only view, approves decisions, clears sponsor blockers.</div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Recent Activity & Changes
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Live feed</span>
            </div>

            <div className="space-y-3">
              {activityLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="text-slate-200">
                      <strong className="text-white">{log.user}</strong> — {log.action}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToReport}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Generate Official Client 8-Part Report</span>
          </button>
        </div>
      </div>

      {/* RECORDS: Milestone Checklist with Quick Inline Toggles */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Installation Milestone Records
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any status pill to update milestone live in the database
            </p>
          </div>

          {/* Simple Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'Done', 'In progress', 'Blocked', 'Not started'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition capitalize ${
                  filterStatus === st
                    ? 'bg-sky-600 text-white border-sky-500 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
            No milestones match "{filterStatus}".
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((t) => (
              <div 
                key={t.id}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{t.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({t.category})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Lead: {t.owner} {t.targetDate && `• Target: ${t.targetDate}`}
                  </div>
                </div>

                {/* Inline Status Toggle for Admin */}
                <div className="flex items-center gap-1 shrink-0">
                  {(['Not started', 'In progress', 'Blocked', 'Done'] as TaskStatus[]).map((st) => {
                    const isActive = t.status === st;
                    const colors: Record<TaskStatus, string> = {
                      'Done': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
                      'In progress': 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold',
                      'Blocked': 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
                      'Not started': 'bg-slate-800 text-slate-400 border-slate-700'
                    };
                    return (
                      <button
                        key={st}
                        onClick={() => onUpdateTaskStatus(t.id, st)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition cursor-pointer ${
                          isActive ? colors[st] : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SETTINGS MODAL (Hardware & Camera Specs) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Hardware & Camera Specifications
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Total Camera Hardware Count:</label>
                <input 
                  type="number" 
                  min="1"
                  value={editTotalCameras}
                  onChange={(e) => setEditTotalCameras(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mt-1 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Currently Mounted & Active Cameras:</label>
                <input 
                  type="number" 
                  min="0"
                  max={editTotalCameras}
                  value={editInstalledCameras}
                  onChange={(e) => setEditInstalledCameras(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mt-1 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Target Launch & Handover Date:</label>
                <input 
                  type="text" 
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mt-1 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                Default Recording Retention: <strong>30 Days Continuous</strong> (RAID Storage)
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE TEAM MEMBER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                Invite Team Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Email Address:</label>
                <input 
                  type="email" 
                  required
                  placeholder="tech@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Role Assignment:</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white mt-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="installer">Field Technician (Installer)</option>
                  <option value="client">Client Sponsor (Viewer)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
