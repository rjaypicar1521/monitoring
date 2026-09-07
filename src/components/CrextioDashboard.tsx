import React, { useState } from 'react';
import { CCTVProject, ExecutiveStatus, AuthUser, TaskStatus, CCTVTask, AttendanceEvent, TechnicianMember, TechnicianStatus } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  Moon,
  Calendar, 
  User, 
  ArrowUpRight, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  HardDrive, 
  ShieldCheck, 
  Copy, 
  ClipboardCheck, 
  AlertTriangle, 
  Check, 
  Search, 
  FileText, 
  X, 
  Lock,
  Bell,
  LayoutDashboard,
  CheckSquare,
  Building2,
  ArrowRight,
  Menu,
  Activity,
  Sparkles
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { TaskPhotoEvidenceModal, PhotoLightboxModal, LightboxPhoto } from './TaskPhotoEvidenceModal';
import { WavyBackground } from './ui/wavy-background';
import { AttendanceToastBanner } from './AttendanceToastBanner';
import { 
  subscribeToAttendance, 
  showDesktopPushNotification, 
  playAttendanceChime, 
  requestNotificationPermission, 
  getNotificationPermission 
} from '../utils/attendanceService';

import { MiniCalendar } from './MiniCalendar';


interface CrextioDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  currentUser: AuthUser;
  onResolveBlocker?: (id: string) => void;
  onUpdateCameraCount: (installed: number, total: number) => void;
  onCopyReport: () => void;
  copied: boolean;
  onToggleRole: () => void;
  onAddNote?: (content: string, author: string, authorRole: 'client' | 'installer') => void;
  onDeleteNote?: (noteId: string) => void;
  onCompleteTaskWithEvidence?: (taskId: string, photoEvidence: string, photoCaption: string) => void;
  onOpenProjectSelector?: () => void;
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
  onCompleteTaskWithEvidence,
  onOpenProjectSelector
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'Dashboard' | 'Checklist' | 'Cameras' | 'Report'>('Dashboard');
  const [expandedSection, setExpandedSection] = useState<'devices' | 'specs' | 'wiring' | null>('devices');
  const [timerPlaying, setTimerPlaying] = useState(false);
  const [evidenceTask, setEvidenceTask] = useState<CCTVTask | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<LightboxPhoto | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cameraSearch, setCameraSearch] = useState('');
  const [cameraStatusFilter, setCameraStatusFilter] = useState<'All' | 'Mounted' | 'Pending Power'>('All');
  const [cameraZoneFilter, setCameraZoneFilter] = useState<string>('All');
  const [checklistFilter, setChecklistFilter] = useState<'All' | 'Done' | 'In progress' | 'Blocked'>('All');
  const [evidenceZoneFilter, setEvidenceZoneFilter] = useState<string>('All');

  const [attendanceNotification, setAttendanceNotification] = useState<AttendanceEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [attendanceOverride, setAttendanceOverride] = useState<Partial<TechnicianMember> | null>(null);

  const baseLeadTech: TechnicianMember = (project.technicians && (project.technicians.find(t => t.name.includes('Rjay') || t.id === 'tech-1') || project.technicians[0])) || {
    id: 'tech-1',
    name: project.teamLead || 'Rjay Picar',
    role: 'Lead Systems & CCTV Architect (RMVN Solutions)',
    status: 'Off Duty',
    assigned: 'CCTV Architecture & Live Monitoring',
    email: 'rjay@rmvn.com',
    isTimedIn: false,
    timeIn: undefined
  };

  const leadTech: TechnicianMember = {
    ...baseLeadTech,
    ...(attendanceOverride || {})
  };

  const isTechTimedIn = Boolean(leadTech.isTimedIn && leadTech.status !== 'Off Duty');

  // Clear temporary override whenever project technicians update from props/parent
  React.useEffect(() => {
    setAttendanceOverride(null);
  }, [project.technicians]);

  React.useEffect(() => {
    setNotificationPermission(getNotificationPermission());

    // If technician is currently timed in, show popup notification on client dashboard
    if (isTechTimedIn) {
      const dismissKey = `dismissed_attendance_${leadTech.id}_${leadTech.timeIn || 'today'}`;
      const isDismissed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(dismissKey);
      if (!isDismissed) {
        setAttendanceNotification({
          id: `att-timedin-${leadTech.id}-${leadTech.timeIn || 'today'}`,
          type: 'TIME_IN',
          technicianId: leadTech.id,
          technicianName: leadTech.name,
          technicianRole: leadTech.role,
          projectName: project.name,
          projectId: project.id,
          time: leadTech.timeIn || 'On Site',
          timestamp: Date.now(),
          status: 'On Site'
        });
      }
    }

    const unsubscribe = subscribeToAttendance((event: AttendanceEvent) => {
      // Immediately reflect attendance status on local technician card
      const isLead = event.technicianId === baseLeadTech.id ||
        event.technicianName === baseLeadTech.name ||
        (Boolean(event.technicianName?.includes('Rjay')) && baseLeadTech.name.includes('Rjay'));

      if (isLead) {
        const isReset = event.remarks === 'Shift reset by Admin';
        setAttendanceOverride({
          isTimedIn: isReset ? false : event.type === 'TIME_IN',
          status: (event.status as TechnicianStatus) || (event.type === 'TIME_IN' ? 'On Site' : 'Off Duty'),
          timeIn: isReset ? undefined : (event.type === 'TIME_IN' ? event.time : baseLeadTech.timeIn),
          timeOut: isReset ? undefined : (event.type === 'TIME_OUT' ? event.time : undefined),
          currentRemarks: isReset ? undefined : event.remarks
        });
      }

      // In-app rich toast banner on Client view
      setAttendanceNotification(event);

      // Play subtle audio chime via Web Audio API
      playAttendanceChime(event.type);

      // Trigger native Windows screen push notification
      showDesktopPushNotification(event);
    });

    return () => {
      unsubscribe();
    };
  }, [project.id, project.name, isTechTimedIn, leadTech.id, leadTech.timeIn, baseLeadTech.id, baseLeadTech.name, baseLeadTech.role, baseLeadTech.timeIn]);

  const handleDismissAttendance = () => {
    if (attendanceNotification) {
      const dismissKey = `dismissed_attendance_${attendanceNotification.technicianId}_${attendanceNotification.time}`;
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(dismissKey, 'true');
        }
      } catch {}
    }
    setAttendanceNotification(null);
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

  // Synchronized camera fleet from project data
  const cameraSpots = project.cameras || [];
  const totalCameraCount = Math.max(project.totalCameras || 0, cameraSpots.length);

  // Cameras Online metrics & signal health
  const onlineCount = cameraSpots.length > 0 
    ? cameraSpots.filter(c => c.status === 'Mounted').length 
    : project.installedCameras;
  const onlinePercent = totalCameraCount > 0 
    ? Math.min(Math.round((onlineCount / totalCameraCount) * 100), 100) 
    : 0;
  // Signal health / operational pacing: 0% if no online cameras, dynamically scaled if blockers exist, 100% when active
  const signalHealthPercent = onlineCount === 0
    ? 0
    : activeBlockers.length > 0
      ? Math.max(100 - activeBlockers.length * 15, 60)
      : 100;

  // Network & Hardware milestone status
  const isNetworkActive = project.tasks.some(t => 
    (t.category === 'Network & Cabling' || t.title.toLowerCase().includes('network') || t.title.toLowerCase().includes('nvr') || t.title.toLowerCase().includes('cabling')) && 
    (t.status === 'Done' || t.status === 'In progress')
  ) || doneTasks.length >= 2;

  // Dynamic installation pacing status
  const pacingStatus = activeBlockers.length > 0 
    ? (activeBlockers.length === 1 ? '1 Action Required' : `${activeBlockers.length} Actions Required`)
    : percentComplete >= 75 || taskPercent >= 60 
      ? 'Pacing Ahead' 
      : 'On Track';

  const pacingBadgeStyle = activeBlockers.length > 0
    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
    : percentComplete >= 75 || taskPercent >= 60 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  const rawCameraZones = Array.from(new Set(cameraSpots.map(c => {
    const parts = c.zone.split(' - ');
    return parts[0] || c.zone;
  }))).filter(Boolean);
  const cameraZoneCategories = ['All', ...rawCameraZones];

  const filteredCameras = cameraSpots.filter(c => {
    const q = cameraSearch.toLowerCase();
    const matchesSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.zone.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.ip.toLowerCase().includes(q) ||
      c.lens.toLowerCase().includes(q) ||
      c.port.toLowerCase().includes(q);
    const matchesStatus = cameraStatusFilter === 'All' || c.status === cameraStatusFilter;
    const matchesZone = cameraZoneFilter === 'All' || c.zone.toLowerCase().startsWith(cameraZoneFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesZone;
  });

  const filteredTasks = project.tasks.filter(t => {
    if (checklistFilter === 'All') return true;
    return t.status === checklistFilter;
  });

  // Real-time recent field activities & photographic updates
  const recentFieldActivities = [
    ...project.tasks.filter(t => Boolean(t.photoEvidence)),
    ...project.tasks.filter(t => !t.photoEvidence && t.status === 'Done'),
    ...project.tasks.filter(t => t.status === 'In progress')
  ].slice(0, 3);

  // Dynamic photographic field evidence
  const tasksWithEvidence = project.tasks.filter(t => Boolean(t.photoEvidence));
  const rawEvidenceZones = Array.from(new Set(tasksWithEvidence.map(t => t.area || t.category).filter(Boolean))) as string[];
  const evidenceZones = ['All', ...rawEvidenceZones];
  const filteredEvidenceTasks = evidenceZoneFilter === 'All'
    ? tasksWithEvidence
    : tasksWithEvidence.filter(t => (t.area || t.category) === evidenceZoneFilter);

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const todayDateShort = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#fbf9f2] flex flex-col md:flex-row text-slate-800 font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
      {/* Top-Right Floating Attendance Toast Banner */}
      <AttendanceToastBanner
        event={attendanceNotification}
        onDismiss={handleDismissAttendance}
      />

      {/* FIGMA SIDEBAR NAVIGATION (DESKTOP) */}
      <aside className="hidden md:flex md:w-60 lg:w-64 bg-white border-r border-slate-200/90 flex-col justify-between p-4 lg:p-5 shrink-0 z-30 shadow-xs h-screen sticky top-0 overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar">
        <div className="space-y-4 lg:space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setActiveNavTab('Dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="Return to Dashboard"
            >
              <BrandLogo size="sm" />
              <div>
                <div className="font-black text-sm text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition-colors">RMVN CCTV</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Client Portal</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">v2.5</span>
          </div>

          {/* Active Project Switcher Card in Sidenav */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider flex items-center justify-between">
              <span>Project</span>
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">Active</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenProjectSelector?.()}
              className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 transition group cursor-pointer shadow-sm"
              title="Click to select or switch project"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                    {project.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-700 shrink-0 shadow-sm">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          </div>

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-1 tracking-wider">Navigation</div>
            
            {/* Dashboard */}
            <button
              onClick={() => setActiveNavTab('Dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNavTab === 'Dashboard' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Checklist */}
            <button
              onClick={() => setActiveNavTab('Checklist')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNavTab === 'Checklist' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Checklist</span>
              </div>
              {activeBlockers.length > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {activeBlockers.length}
                </span>
              )}
            </button>

            {/* Cameras */}
            <button
              onClick={() => setActiveNavTab('Cameras')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNavTab === 'Cameras' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4" />
                <span>Cameras</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeNavTab === 'Cameras' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalCameraCount}
              </span>
            </button>

            {/* Report */}
            <button
              onClick={() => setActiveNavTab('Report')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNavTab === 'Report' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Report</span>
              </div>
            </button>
          </div>

          {/* Mini Calendar Widget with Date Today */}
          <MiniCalendar />
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {/* Windows Desktop Push Notification Alert Request */}
          {notificationPermission === 'default' && (
            <button
              type="button"
              onClick={async () => {
                const res = await requestNotificationPermission();
                setNotificationPermission(res);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold shadow-sm transition cursor-pointer"
              title="Enable Windows desktop popups when technicians arrive"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>Enable Windows Alerts</span>
            </button>
          )}

          {/* User Profile Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#111317] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">Client</div>
              </div>
            </div>
          </div>

          {/* Switch to Admin View Button */}
          <button
            onClick={onToggleRole}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-between shadow-sm transition cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Switch to Admin View</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR (visible only on <md) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo size="xs" />
          <span className="font-black text-xs text-slate-900 tracking-tight uppercase">RMVN CCTV</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Compact Today's Date Pill on Mobile */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/90 rounded-full text-[10px] text-slate-800 font-semibold shadow-xs">
            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="hidden min-[380px]:inline truncate">{todayDateFormatted}</span>
            <span className="inline min-[380px]:hidden truncate">{todayDateShort}</span>
          </div>

          {/* Copy Report Pill on Mobile */}
          <button
            type="button"
            onClick={onCopyReport}
            className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer transition flex items-center gap-1"
            title="Copy 1-minute email update"
          >
            {copied ? (
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {notificationPermission === 'default' && (
            <button
              type="button"
              onClick={async () => {
                const res = await requestNotificationPermission();
                setNotificationPermission(res);
              }}
              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-full shadow-xs transition cursor-pointer"
              title="Enable Windows screen alerts"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleRole}
            className="p-1.5 rounded-full bg-[#111317] text-amber-300 font-bold text-[10px] size-7 flex items-center justify-center cursor-pointer ml-1"
            title="Switch to Admin View"
          >
            {currentUser.name.charAt(0)}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl p-5 z-10 animate-in slide-in-from-left duration-200 flex flex-col justify-between overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar">
            <div className="space-y-4">
              {/* Brand Header & Close Button */}
              <div className="flex items-center justify-between">
                <div 
                  onClick={() => {
                    setActiveNavTab('Dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  title="Return to Dashboard"
                >
                  <BrandLogo size="sm" />
                  <div>
                    <div className="font-black text-sm text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition-colors">RMVN CCTV</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Client Portal</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">v2.5</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Project Switcher Card in Mobile Sidenav */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider flex items-center justify-between">
                  <span>Project</span>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProjectSelector?.();
                  }}
                  className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 transition group cursor-pointer shadow-sm"
                  title="Click to select or switch project"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                        {project.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-700 shrink-0 shadow-sm">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Main Nav Links */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-1 tracking-wider">Navigation</div>
                <button
                  onClick={() => {
                    setActiveNavTab('Dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    activeNavTab === 'Dashboard' 
                      ? 'bg-[#111317] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveNavTab('Checklist');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    activeNavTab === 'Checklist' 
                      ? 'bg-[#111317] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Checklist</span>
                  </div>
                  {activeBlockers.length > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      {activeBlockers.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveNavTab('Cameras');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    activeNavTab === 'Cameras' 
                      ? 'bg-[#111317] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4" />
                    <span>Cameras</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    activeNavTab === 'Cameras' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {totalCameraCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveNavTab('Report');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    activeNavTab === 'Report' 
                      ? 'bg-[#111317] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Report</span>
                  </div>
                </button>
              </div>

              {/* Mini Calendar Widget with Date Today */}
              <MiniCalendar />
            </div>

            {/* Bottom of Mobile Drawer */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {notificationPermission === 'default' && (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await requestNotificationPermission();
                    setNotificationPermission(res);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold shadow-sm transition cursor-pointer"
                  title="Enable Windows desktop popups when technicians arrive"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                  <span>Enable Windows Alerts</span>
                </button>
              )}

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#111317] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">Client</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onToggleRole();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-between shadow-sm transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Switch to Admin View</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar p-3.5 sm:p-6 lg:p-8 space-y-6 relative">
        {/* Subtle Ambient Warm Yellow / Cream Corner Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Centered Constrained Container for Large & Ultrawide Displays */}
        <div className="w-full max-w-[1600px] mx-auto space-y-5 sm:space-y-6 lg:space-y-7 min-w-0 relative z-10">
          {/* Desktop Top Utility Bar */}
          <div className="hidden md:flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 relative z-20 pb-1.5 border-b border-slate-200/60 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {project.name}
              </span>
              <span className="text-slate-400 text-xs shrink-0">•</span>
              <span className="text-xs text-slate-500 font-mono truncate">
                {percentComplete}% Milestone Deployment Completion
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Compact Today's Date Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-800 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{todayDateFormatted}</span>
              </div>

              <button
                onClick={onCopyReport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
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
            </div>
          </div>

        {/* 2. TAB CONTENT ROUTER */}

        {/* TAB 1: MAIN DASHBOARD (CREXTIO 3-COLUMN LAYOUT) */}
        {activeNavTab === 'Dashboard' && (
          <div className="space-y-6 lg:space-y-8 animate-in fade-in">
            {/* Hero Greeting & Status Capsule Row with Ambient WavyBackground */}
            <section className="relative z-10 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0b0f19]">
              {/* Fluid Telemetry Wavy Background Canvas Layer */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <WavyBackground
                  containerClassName="w-full h-full min-h-0 bg-transparent"
                  colors={["#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#059669"]}
                  speed="slow"
                  waveOpacity={0.35}
                  blur={12}
                  waveWidth={60}
                  backgroundFill="#0b0f19"
                />
              </div>

              {/* Foreground Content Container */}
              <div className="relative z-10 p-5 sm:p-7 space-y-4 bg-gradient-to-b from-black/40 via-black/20 to-black/60 backdrop-blur-[1px]">
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
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveNavTab('Cameras')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveNavTab('Cameras');
                      }
                    }}
                    aria-label={`Live Cameras: ${onlineCount} online of ${totalCameraCount} total endpoints (${onlinePercent}%). Click to inspect camera fleet.`}
                    className="stats shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-transform active:scale-98"
                    title="Click to inspect Camera fleet and live feeds"
                  >
                    <div className="stat">
                      <div className="stat-title">Live Cameras</div>
                      <div className="stat-value">{onlineCount}</div>
                      <div className="stat-desc">{onlinePercent}% online ({totalCameraCount} total cameras)</div>
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
                  <div 
                    role="progressbar"
                    aria-valuenow={Math.min(Math.max(percentComplete, 0), 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-labelledby="InstallationProgressLabel"
                    aria-valuetext={`${percentComplete}% Mounted, Status: ${pacingStatus}`}
                    className="space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span id="InstallationProgressLabel" className="font-bold text-white text-sm">Installation Progress</span>
                        <span className="text-[11px] font-medium text-slate-300">
                          ({project.installedCameras} of {totalCameraCount} Endpoints Mounted)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] flex items-center gap-1.5 shadow-2xs ${pacingBadgeStyle}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${activeBlockers.length > 0 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                          {pacingStatus}
                        </span>
                        <span className="font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {percentComplete}% Mounted
                        </span>
                        <span className="text-slate-300 text-[11px] hidden sm:inline">
                          Handover: <strong className="text-white">{project.targetLaunchDate || '2026-09-12'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Main Visual Progress Track & Bar (Neo-brutalist with animated gradient pulse & shimmer) */}
                    <div className="w-full border-2 border-white/90 bg-slate-950 p-1 shadow-[3px_3px_0_0_#f59e0b] rounded-sm overflow-hidden">
                      <div 
                        className="h-3.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 rounded-2xs transition-all duration-700 relative overflow-hidden"
                        style={{ width: `${percentComplete > 0 ? Math.min(Math.max(percentComplete, 3), 100) : 0}%` }}
                      >
                        <div className="absolute inset-0 bg-white/25 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-shimmer animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>

                  {/* Progress Stages - Interactive Milestone Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('Checklist')}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition cursor-pointer text-left group focus:outline-none focus:ring-1 focus:ring-amber-400"
                      title="Wiring Milestone: 100% complete. Click to view checklist"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Wiring: <strong className="text-white">100%</strong></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('Cameras')}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition cursor-pointer text-left group focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      title="Mounting Progress: Click to inspect camera fleet"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Mounting: <strong className="text-white">{percentComplete}%</strong></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('Checklist')}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition cursor-pointer text-left truncate group focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      title={`Network & Hardware: ${isNetworkActive ? 'Active' : 'Pending'}. Click to view details in checklist`}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform ${isNetworkActive ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span className="truncate">
                        Network: <strong className={isNetworkActive ? 'text-white' : 'text-amber-300'}>
                          {isNetworkActive ? 'Active' : 'Pending'}
                        </strong>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('Checklist')}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition cursor-pointer text-left sm:justify-end group focus:outline-none focus:ring-1 focus:ring-amber-400"
                      title="Target Handover Date: Click to view tasks"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Handover: <strong className="text-white">Scheduled</strong></span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* BALANCED 2-COLUMN GRID (ADAPTIVE ACROSS MOBILE, TABLET & DESKTOP) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">
              
              {/* LEFT COLUMN: Technician Status, Fleet Telemetry & Field Activity */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-5 flex flex-col">
                {/* On Duty / Off Duty Technician Card (No Photo) */}
                <div className="bg-[#191b20] text-white rounded-3xl p-5 border border-slate-700/70 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isTechTimedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`} />
                      <span className={`text-[10px] font-mono uppercase font-bold tracking-wider truncate ${
                        isTechTimedIn ? 'text-amber-300' : 'text-slate-400'
                      }`}>
                        {isTechTimedIn ? 'TECHNICIAN ON SITE' : 'TECHNICIAN OFF DUTY'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full border font-mono text-[10px] font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                      isTechTimedIn
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50 shadow-xs'
                        : 'bg-slate-700/50 text-slate-300 border-slate-600'
                    }`}>
                      {isTechTimedIn ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          <span>● {leadTech.status === 'Off Duty' ? 'On Site' : (leadTech.status || 'On Site')}</span>
                          {leadTech.timeIn && (
                            <span className="text-[9px] text-amber-300 font-mono">({leadTech.timeIn})</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span>● Off Duty</span>
                          {leadTech.timeOut && leadTech.timeOut.trim() && (
                            <span className="text-[9px] text-slate-300 font-mono">({leadTech.timeOut})</span>
                          )}
                        </>
                      )}
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

                  {isTechTimedIn && leadTech.currentRemarks && (
                    <div className="text-[11px] text-amber-200/90 font-mono bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">Activity: <strong className="text-amber-300 font-semibold">{leadTech.currentRemarks}</strong></span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
                    <span className="truncate">Zone: <strong className="text-slate-200">{leadTech.zone || 'Ground Floor & Perimeter'}</strong></span>
                    {isTechTimedIn ? (
                      <span className="text-emerald-300 font-mono text-[10px] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>Timed In: {leadTech.timeIn || 'On Site'}</span>
                      </span>
                    ) : leadTech.timeOut && leadTech.timeOut.trim() ? (
                      <span className="text-slate-400 font-mono text-[10px] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Timed Out: {leadTech.timeOut}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Moon className="w-3 h-3 text-amber-400/80" />
                        <span>Off Duty</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mid-Row: Dual Progress & Live Cameras Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Progress Card with Bar Chart */}
                  <div 
                    onClick={() => setActiveNavTab('Cameras')}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Progress</span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition flex items-center justify-center text-slate-700">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
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

                  {/* Cameras Online Simple Clean Card */}
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveNavTab('Cameras')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveNavTab('Cameras');
                      }
                    }}
                    aria-label={`Cameras Online: ${onlineCount} of ${totalCameraCount} cameras online (${onlinePercent}%). Click to view cameras.`}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer group hover:border-emerald-300/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    title="Click to view Cameras Online"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">Cameras Online</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center text-slate-700">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                          {onlineCount}
                        </span>
                        <span className="text-sm font-bold text-slate-400 font-mono">
                          / {totalCameraCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{onlineCount > 0 ? 'Cameras Online & Streaming' : 'All Cameras Standby'}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${onlinePercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold font-mono">
                        <span className="text-emerald-700">{onlinePercent}% Live</span>
                        <span>{onlineCount} of {totalCameraCount} Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Field Activity & Photo Updates */}
                <div 
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Field Activity & Evidence</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Real-time installation logs</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {project.tasks.filter(t => t.photoEvidence).length} Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs pt-0.5">
                    {recentFieldActivities.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-xs text-slate-500 font-medium">No field activity logged yet</p>
                      </div>
                    ) : (
                      recentFieldActivities.map((task) => {
                        const hasEvidence = Boolean(task.photoEvidence);
                        return (
                          <div
                            key={task.id}
                            onClick={() => {
                              if (hasEvidence) {
                                setLightboxPhoto({
                                  url: task.photoEvidence!,
                                  title: task.title,
                                  caption: task.photoCaption,
                                  area: task.area
                                });
                              } else {
                                setActiveNavTab('Checklist');
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (hasEvidence) {
                                  setLightboxPhoto({
                                    url: task.photoEvidence!,
                                    title: task.title,
                                    caption: task.photoCaption,
                                    area: task.area
                                  });
                                } else {
                                  setActiveNavTab('Checklist');
                                }
                              }
                            }}
                            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              hasEvidence
                                ? 'bg-slate-50/80 hover:bg-amber-50/50 border-slate-200/80 hover:border-amber-300/80 cursor-pointer group shadow-2xs'
                                : 'bg-slate-50/50 border-slate-200/60 hover:border-slate-300 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {hasEvidence ? (
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200/90 shadow-2xs group-hover:scale-105 transition-transform bg-slate-100">
                                  <img
                                    src={task.photoEvidence}
                                    alt={task.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-3.5 h-3.5 text-white drop-shadow" />
                                  </div>
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                                  task.status === 'Done'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {task.status === 'Done' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-900 transition-colors">
                                  {task.area ? task.area : task.title}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                                  <span>{task.completedDate || task.targetDate || 'Recent'}</span>
                                  <span>•</span>
                                  <span className="text-slate-500">{task.owner || leadTech.name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {hasEvidence ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 group-hover:bg-amber-200 transition-colors">
                                  <Camera className="w-3 h-3 text-amber-700" />
                                  <span>Photo</span>
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  task.status === 'Done'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {task.status}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveNavTab('Checklist')}
                      className="text-xs font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1.5 transition-colors group/btn py-0.5"
                    >
                      <span>View All Verified Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {doneTasks.length}/{project.tasks.length} Done
                    </span>
                  </div>
                </div>

                {/* Hardware Specs & Server Accordion */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2.5">
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
                            <div className="font-semibold text-slate-900 truncate">Hikvision 4K UltraHD Fleet (Dome, Bullet, Turret)</div>
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
                        <div>• 32-Channel Central Enterprise NVR Unit</div>
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

              {/* RIGHT COLUMN: Priority Work & Installation Tasks */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-5 flex flex-col">
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveNavTab('Checklist')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveNavTab('Checklist');
                    }
                  }}
                  aria-label={`Priority Work: ${project.overallCompletion ?? percentComplete}% complete. Click to view Checklist.`}
                  className="bg-white/90 backdrop-blur-sm rounded-[26px] p-5 border border-slate-200/80 shadow-xs space-y-3 cursor-pointer group hover:border-amber-300/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  title="Click to view Priority Work in Checklist"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">Priority Work</span>
                        <span className="text-[10px] text-slate-500 font-medium">Milestone Delivery</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black font-mono text-slate-900">
                        {project.overallCompletion ?? percentComplete}%
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Interactive Priority Milestone Stage Chips */}
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNavTab('Checklist');
                      }}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-[11px] px-2 py-1.5 rounded-xl text-center shadow-2xs border border-amber-500/20 truncate transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 active:scale-95"
                      title="Wiring Milestone: 100% complete. Click to view Checklist."
                    >
                      Wiring 100%
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNavTab('Cameras');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] px-2 py-1.5 rounded-xl text-center shadow-2xs border border-slate-800 truncate transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 active:scale-95"
                      title={`Mounting Milestone: ${percentComplete}% complete. Click to inspect Camera fleet.`}
                    >
                      Mounting {percentComplete}%
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNavTab('Checklist');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] px-2 py-1.5 rounded-xl text-center border border-slate-200 truncate transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 active:scale-95"
                      title={`Network & Hardware (${isNetworkActive ? 'Active' : 'Pending'}). Click to view Checklist.`}
                    >
                      <span className="hidden xl:inline">Network & HW: </span>
                      <span className="xl:hidden">Net: </span>
                      {isNetworkActive ? 'Active' : 'Pending'}
                    </button>
                  </div>

                  {/* Blocker Warning Pill if activeBlockers.length > 0 */}
                  {activeBlockers.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNavTab('Checklist');
                      }}
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 font-medium transition cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-amber-500 active:scale-98"
                      title="Active blockers requiring attention. Click to view in Checklist."
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="font-bold truncate">
                          {activeBlockers.length} {activeBlockers.length === 1 ? 'Blocker' : 'Blockers'} Pending
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded shrink-0">
                        Review →
                      </span>
                    </button>
                  )}
                </div>

                {/* Bottom Big Dark Card: Priority Installation Task List */}
                <div className="bg-[#1e2025] text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex-1 flex flex-col justify-between border border-slate-800">
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
                        const hasEvidence = Boolean(task.photoEvidence);

                        return (
                          <div 
                            key={task.id}
                            className="flex items-center justify-between gap-2.5 group"
                          >
                            <div 
                              className={`flex items-center gap-3 min-w-0 ${hasEvidence ? 'cursor-pointer hover:opacity-85' : ''}`}
                              onClick={() => {
                                if (hasEvidence) {
                                  setLightboxPhoto({
                                    url: task.photoEvidence!,
                                    title: task.title,
                                    caption: task.photoCaption,
                                    area: task.area
                                  });
                                }
                              }}
                              title={hasEvidence ? 'Click to inspect photographic evidence' : undefined}
                            >
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
                              isInstaller ? (
                                <button
                                  onClick={() => {
                                    const b = project.blockers.find(x => !x.resolved);
                                    if (b && onResolveBlocker) onResolveBlocker(b.id);
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shrink-0 transition cursor-pointer shadow-xs"
                                >
                                  Unblock
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] shrink-0 border border-rose-500/30">
                                  Blocked
                                </span>
                              )
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
                              isInstaller ? (
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
                              ) : task.photoEvidence ? (
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
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800/40 shrink-0" title="Pending task" />
                              )
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

            {/* COMPLETED WORK - DYNAMIC PHOTOGRAPHIC EVIDENCE GALLERY */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold border border-amber-500/20 shrink-0">
                    <Camera className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex flex-wrap items-center gap-2">
                      <span>Completed Work - Photographic Evidence</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        Verified Proof
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Physical inspection photos from the official installation report for {project.name}. Click any photo to inspect high-resolution evidence.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
                    {tasksWithEvidence.length} Verified {tasksWithEvidence.length === 1 ? 'Area' : 'Areas'}
                  </span>
                </div>
              </div>

              {/* Zone / Area Filter Tabs */}
              {evidenceZones.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Zone:</span>
                  {evidenceZones.map(zone => {
                    const count = zone === 'All'
                      ? tasksWithEvidence.length
                      : tasksWithEvidence.filter(t => (t.area || t.category) === zone).length;
                    const isActive = evidenceZoneFilter === zone;
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setEvidenceZoneFilter(zone)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                          isActive
                            ? 'bg-[#111317] text-white shadow-xs font-bold'
                            : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        <span>{zone}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Gallery Grid */}
              {filteredEvidenceTasks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-2">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No photographic evidence in this category</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Technicians upload photographic verification as installation milestones are completed.
                  </p>
                  {evidenceZoneFilter !== 'All' && (
                    <button
                      type="button"
                      onClick={() => setEvidenceZoneFilter('All')}
                      className="mt-1 text-xs font-bold text-amber-600 hover:text-amber-700 underline"
                    >
                      Reset filter to All
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredEvidenceTasks.map((task) => {
                    const isDone = task.status === 'Done';
                    const isBlocked = task.status === 'Blocked';
                    const isLive = task.area?.toLowerCase().includes('nvr') || task.title.toLowerCase().includes('live');

                    return (
                      <div
                        key={task.id}
                        onClick={() => setLightboxPhoto({
                          url: task.photoEvidence!,
                          title: `${task.area || task.category} (${isDone ? '100% Complete' : task.status})`,
                          caption: task.photoCaption || task.verifiedStatus || task.title,
                          area: task.area || task.category
                        })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setLightboxPhoto({
                              url: task.photoEvidence!,
                              title: `${task.area || task.category} (${isDone ? '100% Complete' : task.status})`,
                              caption: task.photoCaption || task.verifiedStatus || task.title,
                              area: task.area || task.category
                            });
                          }
                        }}
                        className="group/card rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-pointer shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Thumbnail Frame */}
                          <div className="relative h-36 overflow-hidden bg-slate-900">
                            <img
                              src={task.photoEvidence}
                              alt={task.title}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                              loading="lazy"
                            />
                            
                            {/* Badges on top of photo */}
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 max-w-[90%]">
                              <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono font-bold text-[10px] truncate">
                                {task.area || task.category}
                              </div>
                              {isLive ? (
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                                  Live Feeds
                                </div>
                              ) : isDone ? (
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-mono font-bold text-[10px]">
                                  100%
                                </div>
                              ) : isBlocked ? (
                                <div className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[10px]">
                                  Deferred / On Hold
                                </div>
                              ) : null}
                            </div>

                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/20">
                                <Camera className="w-3 h-3 text-amber-400" />
                                <span>Inspect</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Text Content */}
                          <div className="p-3 bg-white space-y-1">
                            <div className="font-bold text-xs text-slate-900 group-hover/card:text-amber-900 transition-colors line-clamp-1">
                              {task.title}
                            </div>
                            <div className={`text-[11px] font-semibold line-clamp-1 ${
                              isDone 
                                ? 'text-emerald-600' 
                                : isBlocked 
                                  ? 'text-amber-700' 
                                  : 'text-slate-600'
                            }`}>
                              {task.verifiedStatus || (isDone ? 'Installed, tested, and working' : task.status)}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer with Lead Tech Signature */}
                        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <div className="flex items-center gap-1 truncate mr-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{task.owner || leadTech.name}</span>
                          </div>
                          <span className="shrink-0 text-slate-400">
                            {task.completedDate || 'Verified'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                const hasEvidence = Boolean(t.photoEvidence);

                return (
                  <div
                    key={t.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div 
                      className={`flex items-center gap-3 ${hasEvidence ? 'cursor-pointer hover:opacity-85' : ''}`}
                      onClick={() => {
                        if (hasEvidence) {
                          setLightboxPhoto({
                            url: t.photoEvidence!,
                            title: t.title,
                            caption: t.photoCaption,
                            area: t.area
                          });
                        }
                      }}
                      title={hasEvidence ? 'Click to inspect photographic evidence' : undefined}
                    >
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
                      {hasEvidence && (
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

                      {!isDone && isInstaller && onCompleteTaskWithEvidence && (
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
                      {isBlocked && isInstaller && (
                        <button
                          onClick={() => {
                            const b = project.blockers.find(x => !x.resolved);
                            if (b && onResolveBlocker) onResolveBlocker(b.id);
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
                  Camera Spots Directory ({totalCameraCount} Total)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {onlineCount} Mounted & Tested • {Math.max(0, totalCameraCount - onlineCount)} Pending Installation / Power
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search node, room, IP..."
                  value={cameraSearch}
                  onChange={(e) => setCameraSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-full text-xs bg-white border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400 w-full sm:w-60 shadow-2xs"
                />
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'Mounted', 'Pending Power'] as const).map((status) => {
                  const isActive = cameraStatusFilter === status;
                  const count = status === 'All' 
                    ? cameraSpots.length 
                    : cameraSpots.filter(c => c.status === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setCameraStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#1a1c22] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90'
                      }`}
                    >
                      {status === 'Mounted' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      {status === 'Pending Power' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      <span>{status === 'Pending Power' ? 'Pending' : status}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Zone Filter Chips */}
              {cameraZoneCategories.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar py-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Zone:</span>
                  {cameraZoneCategories.map((zone) => {
                    const isActive = cameraZoneFilter === zone;
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setCameraZoneFilter(zone)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                        }`}
                      >
                        {zone}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 18 Camera Cards Grid or Empty State */}
            {filteredCameras.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="text-3xl">📹</div>
                <div className="font-bold text-sm text-slate-800">No cameras found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No camera endpoints match your current search query or filter selection.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCameraSearch('');
                    setCameraStatusFilter('All');
                    setCameraZoneFilter('All');
                  }}
                  className="px-4 py-1.5 bg-[#1a1c22] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-2xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredCameras.map((cam) => {
                  const isMounted = cam.status === 'Mounted';

                  return (
                    <div 
                      key={cam.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 shadow-2xs hover:shadow-xs ${
                        isMounted 
                          ? 'bg-white border-slate-200/90 hover:border-emerald-500/50' 
                          : 'bg-slate-50/80 border-slate-200/80 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-slate-400">{cam.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isMounted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isMounted ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            {cam.status}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5 leading-snug">
                          {cam.name}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600 font-medium truncate max-w-[130px]" title={cam.zone}>{cam.zone}</span>
                          <span className="text-slate-400 font-mono shrink-0">{cam.lens.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span>{cam.port}</span>
                          <span className="text-cyan-700 font-semibold">{cam.ip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFICIAL CLIENT UPDATE REPORT (8 SECTIONS) */}
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
        </div>
      </main>

      {/* Task Photo Evidence Requirement Modal */}
      {evidenceTask && onCompleteTaskWithEvidence && isInstaller && (
        <TaskPhotoEvidenceModal
          task={evidenceTask}
          isOpen={!!evidenceTask}
          onClose={() => setEvidenceTask(null)}
          currentUserRole={currentUser.role}
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
  );
};
