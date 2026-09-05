import React, { useState } from 'react';
import { CCTVProject, ExecutiveStatus, AuthUser, TaskStatus, CCTVTask } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Settings, 
  User, 
  ArrowUpRight, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Laptop, 
  HardDrive, 
  ShieldCheck, 
  Copy, 
  ClipboardCheck,
  AlertTriangle,
  Layers,
  Wrench,
  Check,
  Search,
  FileText,
  X,
  ExternalLink,
  MessageSquare,
  Send,
  Trash2,
  Image as ImageIcon,
  Lock
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { TaskPhotoEvidenceModal, PhotoLightboxModal, LightboxPhoto } from './TaskPhotoEvidenceModal';
import { FloatingPathsBackground } from './ui/floating-paths';
import { Button as StatefulButton } from './ui/stateful-button';

interface CrextioDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  currentUser: AuthUser;
  onResolveBlocker: (id: string) => void;
  onUpdateCameraCount: (installed: number, total: number) => void;
  onCopyReport: () => void;
  copied: boolean;
  onToggleRole: () => void;
  onAddNote?: (content: string, author: string, authorRole: 'client' | 'installer') => void;
  onDeleteNote?: (noteId: string) => void;
  onCompleteTaskWithEvidence?: (taskId: string, photoEvidence: string, photoCaption: string) => void;
}

export const CrextioDashboard: React.FC<CrextioDashboardProps> = ({
  project,
  execStatus,
  currentUser,
  onResolveBlocker,
  onUpdateCameraCount,
  onCopyReport,
  copied,
  onToggleRole,
  onAddNote,
  onDeleteNote,
  onCompleteTaskWithEvidence
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'Dashboard' | 'Checklist' | 'Cameras' | 'Timeline' | 'Report'>('Dashboard');
  const [expandedSection, setExpandedSection] = useState<'devices' | 'specs' | 'wiring' | null>('devices');
  const [timerPlaying, setTimerPlaying] = useState(false);
  const [evidenceTask, setEvidenceTask] = useState<CCTVTask | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<LightboxPhoto | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cameraSearch, setCameraSearch] = useState('');
  const [checklistFilter, setChecklistFilter] = useState<'All' | 'Done' | 'In progress' | 'Blocked'>('All');



  const [newNoteText, setNewNoteText] = useState('');
  const projectNotes = project.notes || [];

  const handleSubmitNote = async (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    if (!newNoteText.trim() || !onAddNote) return;
    await new Promise((resolve) => setTimeout(resolve, 400));
    onAddNote(newNoteText.trim(), currentUser.name, 'client');
    setNewNoteText('');
  };

  const isInstaller = currentUser.role === 'installer';
  const percentComplete = project.totalCameras > 0 
    ? Math.round((project.installedCameras / project.totalCameras) * 100) 
    : 0;

  const activeBlockers = project.blockers.filter(b => !b.resolved);
  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const inProgressTasks = project.tasks.filter(t => t.status === 'In progress' || t.status === 'Blocked');
  const pendingTasks = project.tasks.filter(t => t.status === 'Not started');
  const taskPercent = project.tasks.length > 0 
    ? Math.round((doneTasks.length / project.tasks.length) * 100) 
    : 0;

  const leadTech = (project.technicians && project.technicians[0]) || {
    name: project.teamLead || 'Rjay Picar',
    role: 'Lead CCTV Installer',
    status: 'On Duty'
  };

  // Synchronized camera fleet from project data
  const cameraSpots = project.cameras || [];

  const filteredCameras = cameraSpots.filter(c => 
    c.name.toLowerCase().includes(cameraSearch.toLowerCase()) ||
    c.zone.toLowerCase().includes(cameraSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(cameraSearch.toLowerCase())
  );

  const filteredTasks = project.tasks.filter(t => {
    if (checklistFilter === 'All') return true;
    return t.status === checklistFilter;
  });

  return (
    <div className="min-h-screen bg-transparent p-0 sm:p-6 lg:p-10 font-sans text-slate-800 flex items-center justify-center selection:bg-white selection:text-black">
      {/* Outer Rounded Tablet Frame matching template (Edge-to-edge on mobile) */}
      <div className="w-full max-w-7xl bg-[#fbf9f2]/95 backdrop-blur-md rounded-none sm:rounded-[36px] lg:rounded-[44px] shadow-none sm:shadow-2xl overflow-hidden p-3.5 sm:p-8 lg:p-10 border-0 sm:border border-white/60 relative space-y-5 sm:space-y-6 lg:space-y-8 min-h-screen sm:min-h-0">
        
        {/* Subtle Ambient Warm Yellow / Cream Corner Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* 1. TOP NAVIGATION BAR */}
        <header className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Brand Pill Logo */}
            <div 
              onClick={() => setActiveNavTab('Dashboard')}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-300/70 shadow-xs cursor-pointer hover:bg-white transition"
            >
              <BrandLogo size="xs" />
              <span className="font-black tracking-wider text-xs sm:text-sm text-slate-900 uppercase">
                MONITORING
              </span>
            </div>

            {/* Mobile Utility Controls (<sm) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={onToggleRole}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/80 hover:bg-white rounded-full border border-slate-300/70 text-[11px] font-medium text-slate-700 shadow-xs"
                title="Switch View"
              >
                {isInstaller ? (
                  <>
                    <Wrench className="w-3 h-3 text-purple-600" />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-amber-600" />
                    <span>Client</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="w-8 h-8 rounded-full bg-[#1a1c22] hover:bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs border border-white overflow-hidden"
              >
                {currentUser.name.charAt(0)}
              </button>
            </div>
          </div>

          {/* Pill Navigation Links (Scrollable on mobile) */}
          <nav className="flex items-center gap-1 bg-white/70 backdrop-blur-sm p-1 sm:p-1.5 rounded-full border border-slate-200/80 shadow-xs text-xs font-medium overflow-x-auto max-w-full no-scrollbar">
            {(['Dashboard', 'Checklist', 'Cameras', 'Timeline', 'Report'] as const).map((tab) => {
              const isActive = activeNavTab === tab;
              const isTimeline = tab === 'Timeline';

              if (isTimeline) {
                return (
                  <button
                    key={tab}
                    type="button"
                    disabled
                    title="Timeline schedule is locked for client view"
                    className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full whitespace-nowrap text-slate-400 bg-slate-100/70 border border-slate-200/60 flex items-center gap-1.5 cursor-not-allowed opacity-60 text-xs font-medium"
                  >
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Timeline</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600">
                      Locked
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveNavTab(tab);
                    setShowProfileMenu(false);
                  }}
                  className={`px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full transition cursor-pointer whitespace-nowrap text-xs ${
                    isActive 
                      ? 'bg-[#1a1c22] text-white font-semibold shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab}
                  {tab === 'Checklist' && activeBlockers.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      {activeBlockers.length}
                    </span>
                  )}
                  {tab === 'Cameras' && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {project.totalCameras}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Controls (Desktop sm: and above) */}
          <div className="hidden sm:flex items-center gap-2 relative">
            {/* Role Switcher Pill */}
            <button
              onClick={onToggleRole}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 hover:bg-white rounded-full border border-slate-300/70 text-xs font-medium text-slate-700 shadow-xs transition cursor-pointer"
              title="Toggle between Client View and Installer Admin View"
            >
              {isInstaller ? (
                <>
                  <Wrench className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Client</span>
                </>
              )}
            </button>


            {/* Copy Report Pill */}
            <button
              onClick={onCopyReport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Copy 1-minute email update"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copy Update</span>
                </>
              )}
            </button>

            {/* Functional User Profile Avatar Button */}
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
              }}
              className="w-9 h-9 rounded-full bg-[#1a1c22] hover:bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs border border-white cursor-pointer transition overflow-hidden"
              title="Profile & Project Settings"
            >
              {currentUser.name.charAt(0)}
            </button>

            {/* PROFILE & SETTINGS DROPDOWN POPOVER */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 z-50 animate-in fade-in space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1c22] text-amber-300 font-bold flex items-center justify-center text-sm overflow-hidden">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500">{currentUser.title}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">

                  <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Workspace Role:</span>
                    <span className="font-bold text-slate-900 capitalize">{currentUser.role}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Current Project:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[120px]">{project.name}</span>
                  </div>

                </div>

                <button
                  onClick={() => {
                    onToggleRole();
                    setShowProfileMenu(false);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-purple-600" />
                  <span>Switch to {isInstaller ? 'Client View' : 'Admin View'}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 2. TAB CONTENT ROUTER */}

        {/* TAB 1: MAIN DASHBOARD (CREXTIO 3-COLUMN LAYOUT) */}
        {activeNavTab === 'Dashboard' && (
          <div className="space-y-6 lg:space-y-8 animate-in fade-in">
            {/* Hero Greeting & Status Capsule Row with Ambient Black and White Floating Paths */}
            <section className="relative z-10 rounded-3xl overflow-hidden border border-white/15 shadow-xl bg-black/70 backdrop-blur-md">
              {/* Floating Paths Background (Black and White) */}
              <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <FloatingPathsBackground
                  position={1}
                  className="w-full h-full bg-transparent"
                />
              </div>

              {/* Foreground Content Container */}
              <div className="relative z-10 p-5 sm:p-7 space-y-4 bg-gradient-to-b from-black/40 via-black/25 to-black/65 backdrop-blur-[1px]">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Site Telemetry</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      Welcome in, {currentUser.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                      {project.name} • {project.location}
                    </p>
                  </div>

                  {/* Live Cameras Stat Display */}
                  <div className="stats shadow cursor-pointer" onClick={() => setActiveNavTab('Cameras')}>
                    <div className="stat">
                      <div className="stat-title">Live Cameras</div>
                      <div className="stat-value">{project.installedCameras}</div>
                      <div className="stat-desc">{percentComplete}% online ({project.totalCameras} total cameras)</div>
                    </div>
                  </div>
                </div>

                {/* Gentle Live Alert Banner if blockers exist */}
                {activeBlockers.length > 0 && (
                  <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs backdrop-blur-md text-white animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      <div>
                        <span className="font-bold text-amber-300">Action Needed: </span>
                        <span className="text-white">{activeBlockers[0].description}</span>
                        <span className="text-amber-200 ml-1">({activeBlockers[0].unblockAction})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveNavTab('Checklist')}
                      className="text-[11px] font-bold text-amber-300 hover:text-white underline shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      View {activeBlockers.length} Item{activeBlockers.length > 1 ? 's' : ''} →
                    </button>
                  </div>
                )}

                {/* Visual Installation Progress Bar */}
                <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 shadow-xs space-y-2.5 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white text-sm">Installation Progress</span>
                      <span className="text-[11px] font-medium text-slate-300">
                        ({project.installedCameras} of {project.totalCameras} Endpoints Mounted)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono text-xs">
                      <span className="font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {percentComplete}% Mounted
                      </span>
                      <span className="text-slate-300 text-[11px]">
                        Handover: <strong className="text-white">{project.targetLaunchDate || '2026-09-12'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Main Visual Progress Track & Bar */}
                  <div className="relative w-full bg-slate-800/80 rounded-full h-3.5 overflow-hidden border border-white/10 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700 relative shadow-xs"
                      style={{ width: `${Math.max(percentComplete, 4)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Progress Stages Footnotes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Wiring: <strong className="text-white">100%</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Mounted: <strong className="text-white">{project.installedCameras}/{project.totalCameras}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${activeBlockers.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="truncate">
                        {activeBlockers.length > 0 ? (
                          <span className="text-amber-300 font-semibold">{activeBlockers.length} Pending Blocker</span>
                        ) : (
                          <span className="text-emerald-300 font-semibold">Hardware Nominal</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{taskPercent}% Tasks Done</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3-COLUMN BALANCED GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              
              {/* LEFT COLUMN: Profile Card & Accordion Details */}
              <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
                {/* On Duty Technician Card (No Photo) */}
                <div className="bg-[#191b20] text-white rounded-[24px] p-4 border border-slate-700/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-300 tracking-wider">
                        On Duty Technician
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                      ● {leadTech.status || 'On Duty'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-xs shrink-0">
                      {leadTech.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white truncate">
                        {leadTech.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {leadTech.role}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">Zone: <strong className="text-slate-200">Ground Floor & Perimeter</strong></span>
                    <span className="text-amber-300 font-mono text-[10px]">Lead Tech</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="border-b border-slate-100 pb-2">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'devices' ? null : 'devices')}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-800 py-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>Hardware Specs</span>
                      </div>
                      {expandedSection === 'devices' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedSection === 'devices' && (
                      <div className="pt-2 pb-1 space-y-1.5 animate-in fade-in">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                            4K
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">Hikvision 4K Dome</div>
                            <div className="text-[10px] text-slate-500">
                              {project.totalCameras} Units ({project.installedCameras} Mounted) • PoE
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-b border-slate-100 pb-2">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'specs' ? null : 'specs')}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-800 py-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                        <span>Recording Server Box</span>
                      </div>
                      {expandedSection === 'specs' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedSection === 'specs' && (
                      <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                        <div>• 16-Channel Central NVR Unit</div>
                        <div>• 30-Day Continuous Storage</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => setActiveNavTab('Cameras')}
                      className="w-full flex items-center justify-between text-xs font-bold text-amber-600 py-1 hover:underline cursor-pointer"
                    >
                      <span>View All {project.totalCameras} Camera Spots</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: Bar Chart + Countdown Timer + Calendar */}
              <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Progress Card with Bar Chart */}
                  <div 
                    onClick={() => setActiveNavTab('Cameras')}
                    className="bg-white/90 backdrop-blur-sm rounded-[26px] p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Progress</span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition flex items-center justify-center text-slate-700">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                        {project.installedCameras} / {project.totalCameras}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Cameras Mounted & Aimed
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-end justify-between gap-1.5 h-16 px-1">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-200 rounded-full h-3" />
                          <span className="text-[10px] text-slate-400 font-semibold">S</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-900 rounded-full h-11" />
                          <span className="text-[10px] text-slate-400 font-semibold">M</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-900 rounded-full h-9" />
                          <span className="text-[10px] text-slate-400 font-semibold">T</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-900 rounded-full h-7" />
                          <span className="text-[10px] text-slate-400 font-semibold">W</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-900 rounded-full h-10" />
                          <span className="text-[10px] text-slate-400 font-semibold">T</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1 relative">
                          <span className="absolute -top-5 bg-[#fcd34d] text-slate-900 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs whitespace-nowrap">
                            5 new
                          </span>
                          <div className="w-full bg-[#fcd34d] rounded-full h-12" />
                          <span className="text-[10px] text-slate-900 font-bold">F</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-200 rounded-full h-3" />
                          <span className="text-[10px] text-slate-400 font-semibold">S</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Circular Launch Countdown Clock */}
                  <div 
                    className="bg-white/90 backdrop-blur-sm rounded-[26px] p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Launch Clock</span>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80" title="Schedule locked by engineering">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Locked</span>
                      </div>
                    </div>

                    <div className="my-2 flex flex-col items-center justify-center relative">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          {/* Outer Ring: Camera Progress */}
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="42" 
                            fill="none" 
                            stroke="#fcd34d" 
                            strokeWidth="6" 
                            strokeDasharray="264" 
                            strokeDashoffset={264 - (264 * percentComplete) / 100}
                            strokeLinecap="round" 
                          />
                          {/* Inner Ring: Tasks Progress */}
                          <circle cx="50" cy="50" r="30" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="30" 
                            fill="none" 
                            stroke="#111317" 
                            strokeWidth="6" 
                            strokeDasharray="188" 
                            strokeDashoffset={188 - (188 * taskPercent) / 100}
                            strokeLinecap="round" 
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center text-center">
                          <span className="text-base font-black text-slate-900 font-mono leading-none">
                            21d
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">To Launch</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium px-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#fcd34d]" /> Cams {percentComplete}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#111317]" /> Tasks {taskPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Target: {project.targetLaunchDate || 'Sep 25'}</span>
                    </div>
                  </div>

                </div>

                {/* Calendar & Weekly Sync Schedule */}
                <div 
                  className="bg-white/90 backdrop-blur-sm rounded-[28px] p-5 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">August</span>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>September 2026</span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">October</span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-center text-[11px] font-semibold text-slate-500 border-b border-slate-100 pb-2">
                    <div>Mon<br/><span className="text-slate-900 font-bold">22</span></div>
                    <div>Tue<br/><span className="text-slate-900 font-bold">23</span></div>
                    <div className="text-amber-600 font-bold">Wed<br/><span>24</span></div>
                    <div>Thu<br/><span className="text-slate-900 font-bold">25</span></div>
                    <div>Fri<br/><span className="text-slate-900 font-bold">26</span></div>
                    <div>Sat<br/><span className="text-slate-900 font-bold">27</span></div>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <div className="bg-[#1e2025] text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Weekly Client Sync • 9:00 am
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Walkthrough completed hallway cameras & test angles
                        </div>
                      </div>
                      <div className="flex -space-x-1.5 shrink-0 ml-2">
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold text-[10px] flex items-center justify-center border-2 border-[#1e2025]">
                          M
                        </div>
                        <div className="w-6 h-6 rounded-full bg-sky-400 text-slate-900 font-bold text-[10px] flex items-center justify-center border-2 border-[#1e2025]">
                          A
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between text-slate-800">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Outside Power Hookup • 10:30 am
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Electrician connecting exterior breaker box
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Sep 10
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Installation Tasks */}
              <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                <div 
                  onClick={() => setActiveNavTab('Checklist')}
                  className="bg-white/90 backdrop-blur-sm rounded-[26px] p-5 border border-slate-200/80 shadow-xs space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Onboarding Progress</span>
                    <span className="text-sm font-black font-mono text-slate-900">{percentComplete}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="bg-[#fcd34d] text-slate-900 font-bold text-[11px] px-3 py-1.5 rounded-full flex-1 text-center shadow-xs">
                      Wiring 100%
                    </div>
                    <div className="bg-[#1e2025] text-white font-semibold text-[11px] px-3 py-1.5 rounded-full flex-1 text-center shadow-xs">
                      Mount 50%
                    </div>
                    <div className="bg-slate-200 text-slate-500 font-medium text-[11px] px-2.5 py-1.5 rounded-full text-center">
                      0%
                    </div>
                  </div>
                </div>

                {/* Bottom Big Dark Card: Onboarding Task List */}
                <div className="bg-[#1e2025] text-white rounded-[32px] p-6 shadow-xl space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-bold text-sm tracking-wide text-white">
                        Installation Tasks
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                        {doneTasks.length} / {project.tasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 pt-3">
                      {project.tasks.slice(0, 6).map((task, idx) => {
                        const isDone = task.status === 'Done';
                        const isBlocked = task.status === 'Blocked';

                        return (
                          <div 
                            key={task.id}
                            className="flex items-center justify-between gap-2.5 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                                isDone 
                                  ? 'bg-amber-400 text-slate-900 border-amber-400' 
                                  : isBlocked 
                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {isDone ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : isBlocked ? (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-[10px] font-mono">{idx + 1}</span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className={`text-xs font-semibold truncate ${
                                  isDone ? 'text-slate-300' : isBlocked ? 'text-rose-300' : 'text-slate-100'
                                }`}>
                                  {task.title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {task.owner} {task.targetDate && `• ${task.targetDate}`}
                                </div>
                              </div>
                            </div>

                            {isBlocked ? (
                              <button
                                onClick={() => {
                                  const b = project.blockers.find(x => !x.resolved);
                                  if (b) onResolveBlocker(b.id);
                                }}
                                className="px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shrink-0 transition cursor-pointer shadow-xs"
                              >
                                Unblock
                              </button>
                            ) : isDone ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {task.photoEvidence && (
                                  <button
                                    onClick={() => setLightboxPhoto({
                                      url: task.photoEvidence!,
                                      title: task.title,
                                      caption: task.photoCaption,
                                      area: task.area
                                    })}
                                    className="px-2 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400 hover:text-slate-900 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-amber-400/40"
                                    title="View Photo Evidence"
                                  >
                                    <Camera className="w-3 h-3" />
                                    <span>Proof</span>
                                  </button>
                                )}
                                <div className="w-4 h-4 rounded-full border border-amber-400 bg-amber-400/20 text-amber-400 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (onCompleteTaskWithEvidence) {
                                    setEvidenceTask(task);
                                  }
                                }}
                                className="w-5 h-5 rounded-full border border-slate-600 hover:border-amber-400 hover:bg-amber-400/20 flex items-center justify-center shrink-0 transition cursor-pointer"
                                title="Complete task (Requires photo evidence)"
                              >
                                <Check className="w-3 h-3 text-slate-500 hover:text-amber-400 opacity-0 hover:opacity-100" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNavTab('Checklist')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl text-center transition cursor-pointer"
                  >
                    View All Checklist Items &rarr;
                  </button>
                </div>

              </div>

            </div>

            {/* COMPLETED WORK - PHOTOGRAPHIC EVIDENCE GALLERY */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Camera className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Completed Work - Photographic Evidence</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        Physical Proof Attached
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Physical inspection photos from the official installation report for {project.name}. Click any photo to inspect high-resolution evidence.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-500">
                  {project.tasks.filter(t => t.photoEvidence).length} Verified Area{project.tasks.filter(t => t.photoEvidence).length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Photo 1: Cashier */}
                <div
                  onClick={() => setLightboxPhoto({
                    url: '/evidence/image1.jpg',
                    title: 'Cashier Area (100% Complete)',
                    caption: 'Dome camera installed and aligned; video feed verified on CCTV monitor',
                    area: 'Cashier'
                  })}
                  className="group/card rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-xs hover:shadow-md transition"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src="/evidence/image1.jpg"
                      alt="Cashier Dome Camera"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono font-bold text-[10px]">
                      Cashier 100%
                    </div>
                  </div>
                  <div className="p-3 bg-white space-y-1">
                    <div className="font-bold text-xs text-slate-900">Dome camera installed & aligned</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Installed, tested, and working</div>
                  </div>
                </div>

                {/* Photo 2: Front Desk */}
                <div
                  onClick={() => setLightboxPhoto({
                    url: '/evidence/image2.jpg',
                    title: 'Front Desk Reception (100% Complete)',
                    caption: 'Camera installed above reception signage; video feed verified on CCTV monitor',
                    area: 'Front Desk'
                  })}
                  className="group/card rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-xs hover:shadow-md transition"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src="/evidence/image2.jpg"
                      alt="Front Desk Camera"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono font-bold text-[10px]">
                      Front Desk 100%
                    </div>
                  </div>
                  <div className="p-3 bg-white space-y-1">
                    <div className="font-bold text-xs text-slate-900">Camera above reception</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Installed, tested, and working</div>
                  </div>
                </div>

                {/* Photo 3: CCTV Monitor Feeds */}
                <div
                  onClick={() => setLightboxPhoto({
                    url: '/evidence/image3.jpg',
                    title: 'Live Monitoring Confirmation (NVR Display)',
                    caption: 'Cashier and Front Desk camera feeds confirmed live on CCTV monitor (03 September 2026)',
                    area: 'NVR Station'
                  })}
                  className="group/card rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-xs hover:shadow-md transition"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src="/evidence/image3.jpg"
                      alt="CCTV Monitor Feed"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                      Live Feeds
                    </div>
                  </div>
                  <div className="p-3 bg-white space-y-1">
                    <div className="font-bold text-xs text-slate-900">NVR Multi-View Display</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Two Feeds Confirmed Live</div>
                  </div>
                </div>

                {/* Photo 4: Backdoor Site Condition */}
                <div
                  onClick={() => setLightboxPhoto({
                    url: '/evidence/image4.jpg',
                    title: 'Backdoor Site Condition (Deferred)',
                    caption: 'Existing cable is prepared at backdoor entrance; mounting deferred for occupant privacy',
                    area: 'Backdoor'
                  })}
                  className="group/card rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-xs hover:shadow-md transition"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src="/evidence/image4.jpg"
                      alt="Backdoor Camera Site Condition"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[10px]">
                      Deferred / On Hold
                    </div>
                  </div>
                  <div className="p-3 bg-white space-y-1">
                    <div className="font-bold text-xs text-slate-900">Cable prepared at entrance</div>
                    <div className="text-[11px] text-amber-700 font-semibold">Temporary sleeping quarters</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SHARED SITE DIRECTIVES & NOTES CARD (SYNCED WITH ADMIN CONSOLE) */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Site Notes & Directives</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                        Live 2-Way Sync with Admin
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Post operational notes, special site requests, and camera angle instructions visible directly on the Admin Console.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-500">
                  {projectNotes.length} Note{projectNotes.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Note Input Box */}
              <form onSubmit={handleSubmitNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a note or instruction for the installer & admin crew..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-2xs"
                />
                <StatefulButton
                  type="submit"
                  disabled={!newNoteText.trim()}
                  onClick={handleSubmitNote}
                  className="min-w-[130px] rounded-2xl bg-[#1a1c22] hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold py-2.5 shadow-xs"
                >
                  Send message
                </StatefulButton>
              </form>

              {/* Notes Stream */}
              <div className="space-y-2.5 pt-1">
                {projectNotes.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No site notes posted yet. Type above to send a note to the Admin Console.
                  </div>
                ) : (
                  projectNotes.map((note) => {
                    const isClient = note.authorRole === 'client';
                    return (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isClient
                            ? 'bg-amber-50/50 border-amber-200/70'
                            : 'bg-slate-50/90 border-slate-200/90'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isClient ? 'bg-amber-200/80 text-amber-950' : 'bg-[#111317] text-white'
                            }`}>
                              {isClient ? 'Client Sponsor' : 'Admin Ops'}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{note.author}</span>
                            <span className="text-[10px] text-slate-400 font-mono">• {note.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                            {note.content}
                          </p>
                        </div>

                        {onDeleteNote && (
                          <button
                            type="button"
                            onClick={() => onDeleteNote(note.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition cursor-pointer self-end sm:self-auto shrink-0"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL INSTALLATION CHECKLIST VIEW */}
        {activeNavTab === 'Checklist' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Milestone Installation Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete sequence of engineering and verification stages for {project.name}.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                {(['All', 'Done', 'In progress', 'Blocked'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setChecklistFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      checklistFilter === f ? 'bg-[#1a1c22] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredTasks.map((t, idx) => {
                const isDone = t.status === 'Done';
                const isBlocked = t.status === 'Blocked';

                return (
                  <div
                    key={t.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone ? 'bg-amber-400 text-slate-950' : isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isDone ? '✔' : isBlocked ? '!' : idx + 1}
                      </div>

                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>{t.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                            {t.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Assigned Lead: <strong>{t.owner}</strong> • Target Handover Date: <strong>{t.targetDate || 'Sep 25'}</strong>
                        </div>
                        {t.photoCaption && isDone && (
                          <div className="text-xs text-emerald-700 mt-1 font-medium bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Evidence: {t.photoCaption}</span>
                          </div>
                        )}
                        {t.blockerReason && (
                          <div className="text-xs text-rose-600 mt-1 font-medium bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                            Reason: {t.blockerReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {isDone && t.photoEvidence && (
                        <button
                          type="button"
                          onClick={() => setLightboxPhoto({
                            url: t.photoEvidence!,
                            title: t.title,
                            caption: t.photoCaption,
                            area: t.area
                          })}
                          className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold transition cursor-pointer shadow-xs"
                          title="View Photographic Evidence"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-700" />
                          <span>View Photo Proof</span>
                        </button>
                      )}

                      {!isDone && onCompleteTaskWithEvidence && (
                        <button
                          type="button"
                          onClick={() => setEvidenceTask(t)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1c22] hover:bg-slate-800 text-amber-300 rounded-full text-xs font-bold transition cursor-pointer shadow-xs"
                          title="Complete Task with Photo Evidence"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Complete (Attach Photo)</span>
                        </button>
                      )}

                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        isDone ? 'bg-emerald-100 text-emerald-800' : isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.status}
                      </span>
                      {isBlocked && (
                        <button
                          onClick={() => {
                            const b = project.blockers.find(x => !x.resolved);
                            if (b) onResolveBlocker(b.id);
                          }}
                          className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Resolve Blocker
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CAMERAS GRID DIRECTORY */}
        {activeNavTab === 'Cameras' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Camera className="w-6 h-6 text-amber-600" />
                  Camera Spots Directory ({project.totalCameras} Total)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {project.installedCameras} Mounted & Tested • {Math.max(0, project.totalCameras - project.installedCameras)} Pending Installation / Power
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search room or floor..."
                  value={cameraSearch}
                  onChange={(e) => setCameraSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-full text-xs bg-white border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400 w-56"
                />
              </div>
            </div>

            {/* 24 Camera Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCameras.map((cam) => {
                const isMounted = cam.status === 'Mounted';

                return (
                  <div 
                    key={cam.id}
                    className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2 shadow-2xs ${
                      isMounted 
                        ? 'bg-white border-slate-200 hover:border-emerald-500/60' 
                        : 'bg-slate-50/80 border-slate-200/80 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-slate-400">{cam.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMounted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cam.status}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-1 leading-snug">
                        {cam.name}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
                      <span>{cam.zone}</span>
                      <span>{cam.lens}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TIMELINE & CALENDAR SCHEDULE */}
        {activeNavTab === 'Timeline' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Locked Schedule Banner */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>Timeline & Handover Roadmap Locked</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                      Read Only
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Milestone schedule and completion dates are locked and managed by the Lead CCTV Installer.
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono shrink-0">
                Target: {project.targetLaunchDate || 'September 25, 2026'}
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  Project Handover Roadmap ({project.startDate || 'Aug 25'} – {project.targetLaunchDate || 'Sep 25'})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Handover: {project.targetLaunchDate || 'September 25, 2026'} • Lead: {leadTech.name}
                </p>
              </div>

              <div className={`px-3 py-1 font-bold text-xs rounded-full border ${
                activeBlockers.length > 0
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-200'
              }`}>
                Pacing: {percentComplete}% ({execStatus.schedule})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phase 1: Completed */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Phase 1 (Completed)
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {doneTasks.length} Done
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Cabling & Infrastructure</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {doneTasks.length > 0 ? (
                    doneTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No completed milestones yet.</div>
                  )}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold pt-1 border-t border-slate-100">
                  ✔ Verified and approved
                </div>
              </div>

              {/* Phase 2: Active / In Progress */}
              <div className={`bg-white p-5 rounded-2xl shadow-xs space-y-3 border ${
                activeBlockers.length > 0 
                  ? 'border-amber-400 ring-2 ring-amber-400/30' 
                  : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Phase 2 (Active Now)
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {inProgressTasks.length} In Flight
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Mounting & Hardware Tie-in</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {inProgressTasks.length > 0 ? (
                    inProgressTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="truncate flex-1 font-medium text-slate-800">{t.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          t.status === 'Blocked' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No tasks currently in progress.</div>
                  )}
                </div>
                {activeBlockers.length > 0 && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    ⚠️ {activeBlockers[0].description} ({activeBlockers[0].unblockAction})
                  </div>
                )}
              </div>

              {/* Phase 3: Upcoming */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Phase 3 (Upcoming)
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {pendingTasks.length} Queued
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Testing & Final Handover</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="truncate text-slate-600">{t.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{t.targetDate || 'Sep 25'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">All milestones initiated.</div>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                  Final Launch Date: {project.targetLaunchDate || 'Sep 25'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFICIAL CLIENT UPDATE REPORT (8 SECTIONS) */}
        {activeNavTab === 'Report' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-600" />
                  Weekly Project Monitoring Update
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project: {project.name} • Audience: Client Stakeholders & Executive Sponsor
                </p>
              </div>

              <button
                onClick={onCopyReport}
                className="px-4 py-2 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Report'}</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">1) Status</h3>
                <p className="text-slate-800">
                  <strong>{execStatus.schedule}.</strong> {execStatus.overallReason}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">2) Progress (Since Last Update)</h3>
                {doneTasks.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {doneTasks.map(t => (
                      <li key={t.id}>
                        {t.title} (Lead: {t.owner})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No milestones completed during this cycle.</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">3) Current Focus (Next 7 Days)</h3>
                {project.tasks.filter(t => t.status !== 'Done').length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {project.tasks.filter(t => t.status !== 'Done').slice(0, 5).map(t => (
                      <li key={t.id}>
                        {t.title} - Lead: {t.owner} - Target: {t.targetDate || 'Within 7 days'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">All scheduled tasks completed.</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">4) Risks / Blockers</h3>
                {activeBlockers.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {activeBlockers.map(b => (
                      <li key={b.id}>
                        <strong className="text-amber-800">{b.description}:</strong> Action needed: {b.unblockAction} (Owner: {b.owner})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-700 font-medium">None at this time. All pathways clear with zero active blockers.</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">5) Timeline / Milestones</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-800">
                  {project.tasks.slice(0, 6).map(t => (
                    <li key={t.id}>
                      {t.targetDate || 'Sep 25'}: {t.title} ({t.status})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">6) Decisions Needed</h3>
                {project.decisions && project.decisions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {project.decisions.map(d => (
                      <li key={d.id}>
                        {d.decision} (Due: {d.date} - Owner: {d.decisionMaker})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-800">None at this time.</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">7) Support Needed</h3>
                <p className="text-slate-800">{execStatus.keyAsk || 'No urgent external assistance requested at this time.'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-slate-500 font-mono text-[11px] flex items-center justify-between">
                <span>Target Handover: <strong>{project.targetLaunchDate || 'September 25, 2026'}</strong></span>
                <span>Team Lead: <strong>{leadTech.name}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Task Photo Evidence Requirement Modal */}
        {evidenceTask && onCompleteTaskWithEvidence && (
          <TaskPhotoEvidenceModal
            task={evidenceTask}
            isOpen={!!evidenceTask}
            onClose={() => setEvidenceTask(null)}
            onConfirm={(taskId, photoEvidence, photoCaption) => {
              onCompleteTaskWithEvidence(taskId, photoEvidence, photoCaption);
              setEvidenceTask(null);
            }}
          />
        )}

        {/* Full-Screen Photo Lightbox Modal */}
        {lightboxPhoto && (
          <PhotoLightboxModal
            photo={lightboxPhoto}
            onClose={() => setLightboxPhoto(null)}
          />
        )}

      </div>
    </div>
  );
};
