import React, { useState } from 'react';
import { CCTVProject, ExecutiveStatus, AuthUser, TaskStatus, CCTVTask, CameraEndpoint, TechnicianMember, BlockerItem } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Camera, 
  Users, 
  Sliders, 
  ArrowRight, 
  UserPlus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Edit3, 
  HardDrive, 
  Zap, 
  User, 
  Wrench,
  ChevronRight,
  ChevronLeft,
  Copy,
  ClipboardCheck,
  ShieldCheck,
  RotateCcw,
  Layers,
  ChevronDown,
  Trash2,
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  MoreHorizontal,
  Bell,
  MessageSquare,
  Send,
  FileText
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { TaskPhotoEvidenceModal, PhotoLightboxModal } from './TaskPhotoEvidenceModal';

interface EnterpriseAdminDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  currentUser: AuthUser;
  onResolveBlocker: (id: string) => void;
  onUpdateCameraCount: (installed: number, total: number) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, blockerReason?: string, photoEvidence?: string, photoCaption?: string) => void;
  onCompleteTaskWithEvidence?: (taskId: string, photoEvidence: string, photoCaption?: string) => void;
  onAddTask: (task: CCTVTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddCamera: (camera: CameraEndpoint) => void;
  onUpdateCamera: (camera: CameraEndpoint) => void;
  onDeleteCamera: (cameraId: string) => void;
  onBatchDeleteCameras: (cameraIds: string[]) => void;
  onBatchUpdateCameraStatus: (cameraIds: string[], status: 'Mounted' | 'Pending Power') => void;
  onAddBlocker: (blocker: BlockerItem) => void;
  onAddTechnician: (tech: TechnicianMember) => void;
  onDeleteTechnician?: (techId: string) => void;
  onAddNote?: (content: string, author: string, authorRole: 'client' | 'installer') => void;
  onDeleteNote?: (noteId: string) => void;
  onResetProjectData?: () => void;
  onToggleRole: () => void;
  onCopyReport: () => void;
  copied: boolean;
  adminPassword?: string;
  onUpdateAdminPassword?: (newPassword: string) => void;
  onOpenImportModal?: () => void;
}

export const EnterpriseAdminDashboard: React.FC<EnterpriseAdminDashboardProps> = ({
  project,
  execStatus,
  currentUser,
  onResolveBlocker,
  onUpdateCameraCount,
  onUpdateTaskStatus,
  onCompleteTaskWithEvidence,
  onAddTask,
  onDeleteTask,
  onAddCamera,
  onUpdateCamera,
  onDeleteCamera,
  onBatchDeleteCameras,
  onBatchUpdateCameraStatus,
  onAddBlocker,
  onAddTechnician,
  onDeleteTechnician,
  onAddNote,
  onDeleteNote,
  onResetProjectData,
  onToggleRole,
  onCopyReport,
  copied,
  adminPassword = 'admin@123',
  onUpdateAdminPassword,
  onOpenImportModal
}) => {
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Cameras' | 'Board' | 'Team' | 'Settings'>('Dashboard');
  
  // Modals
  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [showAddBlockerModal, setShowAddBlockerModal] = useState(false);
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form States - Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<CCTVTask['category']>('Camera Mounting');
  const [newTaskOwner, setNewTaskOwner] = useState('Dave Miller');
  const [newTaskTargetDate, setNewTaskTargetDate] = useState('2026-09-15');

  // Form States - Camera
  const [newCamName, setNewCamName] = useState('');
  const [newCamZone, setNewCamZone] = useState('Floor 1');
  const [newCamLens, setNewCamLens] = useState('2.8mm Wide Angle');
  const [newCamPort, setNewCamPort] = useState(`Port ${(project.cameras?.length || project.totalCameras) + 1}`);
  const [newCamIp, setNewCamIp] = useState(`192.168.20.${101 + (project.cameras?.length || project.totalCameras)}`);
  const [newCamStatus, setNewCamStatus] = useState<'Mounted' | 'Pending Power'>('Mounted');

  // Form States - Blocker
  const [newBlockerDesc, setNewBlockerDesc] = useState('');
  const [newBlockerOwner, setNewBlockerOwner] = useState('Marcus Vance');
  const [newBlockerAction, setNewBlockerAction] = useState('');

  // Form States - Technician
  const [newTechName, setNewTechName] = useState('');
  const [newTechRole, setNewTechRole] = useState('Field Technician');
  const [newTechStatus, setNewTechStatus] = useState<'On Site' | 'Remote' | 'Off Duty'>('On Site');
  const [newTechAssigned, setNewTechAssigned] = useState('Indoor Corridors');
  const [newTechEmail, setNewTechEmail] = useState('');

  // Form States - Edit Camera
  const [editingCamera, setEditingCamera] = useState<CameraEndpoint | null>(null);
  const [editCamName, setEditCamName] = useState('');
  const [editCamZone, setEditCamZone] = useState('Floor 1');
  const [editCamLens, setEditCamLens] = useState('2.8mm Wide Angle');
  const [editCamPort, setEditCamPort] = useState('');
  const [editCamIp, setEditCamIp] = useState('');
  const [editCamStatus, setEditCamStatus] = useState<'Mounted' | 'Pending Power'>('Mounted');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [cameraSearch, setCameraSearch] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');
  const projectNotes = project.notes || [];

  const handleAdminSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNoteText.trim() || !onAddNote) return;
    onAddNote(adminNoteText.trim(), currentUser.name, 'installer');
    setAdminNoteText('');
    showNotification('Posted directive/note to project');
  };

  const [evidenceTask, setEvidenceTask] = useState<CCTVTask | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; caption?: string; area?: string } | null>(null);

  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassInput !== adminPassword) {
      setPassError('Current password does not match.');
      setPassSuccess(false);
      return;
    }
    if (newPassInput.trim().length < 4) {
      setPassError('New password must be at least 4 characters.');
      setPassSuccess(false);
      return;
    }
    if (onUpdateAdminPassword) {
      onUpdateAdminPassword(newPassInput.trim());
      setPassError(null);
      setPassSuccess(true);
      setCurrentPassInput('');
      setNewPassInput('');
      showNotification('Admin password updated successfully');
      setTimeout(() => setPassSuccess(false), 4000);
    }
  };

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleOpenEditCamera = (cam: CameraEndpoint) => {
    setEditingCamera(cam);
    setEditCamName(cam.name);
    setEditCamZone(cam.zone);
    setEditCamLens(cam.lens);
    setEditCamPort(cam.port);
    setEditCamIp(cam.ip);
    setEditCamStatus(cam.status);
    setShowDeleteConfirm(false);
  };

  const handleSaveEditCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamera || !editCamName.trim()) return;

    const updated: CameraEndpoint = {
      ...editingCamera,
      name: editCamName.trim(),
      zone: editCamZone,
      lens: editCamLens,
      port: editCamPort.trim() || editingCamera.port,
      ip: editCamIp.trim() || editingCamera.ip,
      status: editCamStatus
    };

    onUpdateCamera(updated);
    setEditingCamera(null);
    showNotification(`Updated ${updated.id} (${updated.name})`);
  };

  const handleDeleteCurrentCamera = () => {
    if (!editingCamera) return;
    const id = editingCamera.id;
    onDeleteCamera(id);
    setEditingCamera(null);
    setShowDeleteConfirm(false);
    showNotification(`Removed camera ${id}`);
  };

  const handleDeleteTaskCard = (taskId: string, taskTitle: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
    showNotification(`Task removed: "${taskTitle}"`);
  };

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: CCTVTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      status: 'Not started',
      owner: newTaskOwner,
      targetDate: newTaskTargetDate
    };

    onAddTask(newTask);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    showNotification(`Milestone created: "${newTask.title}"`);
  };

  const handleCreateCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName.trim()) return;

    const nextIdNum = (project.cameras?.length || project.totalCameras) + 1;
    const newCamera: CameraEndpoint = {
      id: `CAM-${String(nextIdNum).padStart(2, '0')}`,
      name: newCamName.trim(),
      zone: newCamZone,
      lens: newCamLens,
      ip: newCamIp.trim() || `192.168.20.${100 + nextIdNum}`,
      port: newCamPort.trim() || `Port ${nextIdNum}`,
      status: newCamStatus
    };

    onAddCamera(newCamera);
    setShowAddCameraModal(false);
    setNewCamName('');
    showNotification(`Added Camera: ${newCamera.id} (${newCamera.name})`);
  };

  const handleCreateBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockerDesc.trim()) return;

    const newBlocker: BlockerItem = {
      id: `b-${Date.now()}`,
      description: newBlockerDesc.trim(),
      owner: newBlockerOwner,
      since: new Date().toISOString().split('T')[0],
      unblockAction: newBlockerAction.trim() || 'Coordinate resolution with facility manager.',
      resolved: false
    };

    onAddBlocker(newBlocker);
    setShowAddBlockerModal(false);
    setNewBlockerDesc('');
    setNewBlockerAction('');
    showNotification(`Escalated Blocker: "${newBlocker.description}"`);
  };

  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName.trim()) return;

    const newTech: TechnicianMember = {
      id: `tech-${Date.now()}`,
      name: newTechName.trim(),
      role: newTechRole,
      status: newTechStatus,
      assigned: newTechAssigned,
      email: newTechEmail.trim() || `${newTechName.toLowerCase().replace(/\s+/g, '.')}@rmvn.com`
    };

    onAddTechnician(newTech);
    setShowAddTechModal(false);
    setNewTechName('');
    setNewTechEmail('');
    showNotification(`Added Technician: ${newTech.name}`);
  };

  const percentComplete = project.totalCameras > 0 
    ? Math.round((project.installedCameras / project.totalCameras) * 100) 
    : 0;

  const activeBlockers = project.blockers.filter(b => !b.resolved);
  const doneTasks = project.tasks.filter(t => t.status === 'Done');

  // Kanban Columns Data
  const columns: { status: TaskStatus; label: string; countColor: string; borderColor: string }[] = [
    { status: 'Not started', label: 'Not Started', countColor: 'bg-slate-200 text-slate-700', borderColor: 'border-slate-300' },
    { status: 'In progress', label: 'In Progress', countColor: 'bg-sky-100 text-sky-800', borderColor: 'border-sky-400' },
    { status: 'Blocked', label: 'Blocked / Escalated', countColor: 'bg-rose-100 text-rose-800', borderColor: 'border-rose-400' },
    { status: 'Done', label: 'Completed', countColor: 'bg-emerald-100 text-emerald-800', borderColor: 'border-emerald-400' }
  ];

  // Synchronized camera fleet list
  const cameraList = project.cameras || [];
  const filteredCameras = cameraList.filter(c => 
    c.name.toLowerCase().includes(cameraSearch.toLowerCase()) ||
    c.zone.toLowerCase().includes(cameraSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(cameraSearch.toLowerCase())
  );

  // Multi-Selection State for Cameras
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  const handleToggleSelectCamera = (id: string) => {
    setSelectedCameraIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllSelected = filteredCameras.length > 0 && filteredCameras.every(c => selectedCameraIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCameraIds([]);
    } else {
      setSelectedCameraIds(filteredCameras.map(c => c.id));
    }
  };

  const handleExecuteBatchDelete = () => {
    if (selectedCameraIds.length === 0) return;
    const count = selectedCameraIds.length;
    onBatchDeleteCameras(selectedCameraIds);
    setSelectedCameraIds([]);
    setShowBatchDeleteModal(false);
    showNotification(`Deleted ${count} camera${count > 1 ? 's' : ''} successfully`);
  };

  const handleExecuteBatchStatus = (status: 'Mounted' | 'Pending Power') => {
    if (selectedCameraIds.length === 0) return;
    const count = selectedCameraIds.length;
    onBatchUpdateCameraStatus(selectedCameraIds, status);
    setSelectedCameraIds([]);
    showNotification(`Marked ${count} camera${count > 1 ? 's' : ''} as "${status}"`);
  };
  // Synchronized technicians roster
  const technicianList = project.technicians || [];

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row text-slate-800 font-sans selection:bg-cyan-600 selection:text-white">
      {/* Toast feedback */}
      {actionSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* FIGMA SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 shrink-0 z-30 shadow-xs">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="sm" />
              <div>
                <div className="font-black text-sm text-slate-900 tracking-tight leading-none">RMVN CCTV</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Admin Ops Suite</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">v2.5</span>
          </div>

          {/* Main Nav Links */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-1 tracking-wider">Overview</div>
            <button
              onClick={() => setActiveTab('Dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'Dashboard' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              {activeBlockers.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('Cameras')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'Cameras' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4" />
                <span>Camera Fleet</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {cameraList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Board')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'Board' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Kanban Board</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {project.tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Team')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'Team' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Field Team</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {technicianList.length}
              </span>
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-1 tracking-wider">System</div>
            <button
              onClick={() => setActiveTab('Settings')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'Settings' 
                  ? 'bg-[#111317] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Project Settings</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenImportModal?.()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer text-amber-900 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 shadow-2xs group"
              title="Import project data from DOCX or JSON"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Import DOCX Report</span>
              </div>
              <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                Word
              </span>
            </button>
          </div>
        </div>

        {/* Bottom of Sidebar */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#111317] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleRole}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-between shadow-2xs transition cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Switch to Client View</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hi, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {project.name} • {percentComplete}% Milestone Deployment Completion
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter cameras or tasks..."
                value={cameraSearch}
                onChange={(e) => setCameraSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full text-xs bg-white border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 placeholder-slate-400 w-52 shadow-2xs"
              />
            </div>

            {/* Import DOCX Button */}
            <button
              type="button"
              onClick={() => onOpenImportModal?.()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
              title="Import CCTV Achievement Report (.docx / .json)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Import DOCX</span>
            </button>

            {/* Quick Create Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowQuickCreateMenu(!showQuickCreateMenu)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#111317] hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Track</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showQuickCreateMenu && (
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setShowAddTaskModal(true);
                      setShowQuickCreateMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-800 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    <span>+ New Milestone Task</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddCameraModal(true);
                      setShowQuickCreateMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-800 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>+ New Camera Endpoint</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddBlockerModal(true);
                      setShowQuickCreateMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-800 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>+ Report Blocker / Issue</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddTechModal(true);
                      setShowQuickCreateMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-800 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>+ Add Field Technician</span>
                  </button>

                  {onOpenImportModal && (
                    <button
                      onClick={() => {
                        onOpenImportModal();
                        setShowQuickCreateMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-amber-50/60 flex items-center gap-2 font-bold text-amber-900 cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>📄 Import Report (.docx)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('Board')}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition relative shadow-2xs cursor-pointer"
              title={`${activeBlockers.length} Active Blockers`}
            >
              <Bell className="w-4 h-4" />
              {activeBlockers.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white absolute top-1 right-1 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* SIGNATURE FIGMA DASHBOARD VIEW (TAB: DASHBOARD) */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* ROW 1: 3 TOP HERO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Card 1: High-Contrast Dark Hero Box (Col 4) */}
              <div className="md:col-span-4 bg-[#111317] text-white rounded-[28px] p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Overall Endpoints</span>
                  </span>
                  <button onClick={() => setActiveTab('Cameras')} className="text-slate-400 hover:text-white cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-5xl font-black font-mono tracking-tight text-white">
                    {cameraList.length}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    activeBlockers.length > 0 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {activeBlockers.length > 0 ? `+${activeBlockers.length} issues` : 'Nominal'}
                  </div>
                </div>

                {/* 3 Mini-Stat Capsules */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                  <div className="bg-white/10 rounded-2xl p-2.5 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">Mounted</div>
                    <div className="text-base font-bold font-mono text-emerald-400">{project.installedCameras}</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-2.5 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">Pending</div>
                    <div className="text-base font-bold font-mono text-amber-400">{Math.max(0, cameraList.length - project.installedCameras)}</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-2.5 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">Pacing</div>
                    <div className="text-base font-bold font-mono text-cyan-400">{percentComplete}%</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Weekly Velocity Spline Chart (Col 5) */}
              <div className="md:col-span-5 bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Weekly overview</span>
                    <span className="text-[10px] text-slate-400">Pace vs Target terminations</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#111317]" /> Cables
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" /> Mounts
                    </span>
                  </div>
                </div>

                {/* Dual Spline SVG */}
                <div className="h-28 w-full relative flex items-center justify-center">
                  <svg viewBox="0 0 300 90" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="splineGradientCyan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="20" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="50" x2="280" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="80" x2="280" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />

                    {/* Spline 1 (Cables - Dark) */}
                    <path
                      d="M20,70 C60,60 90,40 140,40 C190,40 220,15 280,10"
                      fill="none"
                      stroke="#111317"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Spline 2 (Mounts - Cyan with Area Fill) */}
                    <path
                      d="M20,80 C60,75 90,60 140,45 C190,30 220,35 280,20 L280,90 L20,90 Z"
                      fill="url(#splineGradientCyan)"
                    />
                    <path
                      d="M20,80 C60,75 90,60 140,45 C190,30 220,35 280,20"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    <circle cx="140" cy="40" r="3.5" fill="#111317" stroke="#fff" strokeWidth="2" />
                    <circle cx="280" cy="20" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="2" />
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-2 pt-1 border-t border-slate-100">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span className="font-bold text-slate-900">Fri</span>
                </div>
              </div>

              {/* Card 3: Concentric Radial Progress Rings (Col 3) */}
              <div className="md:col-span-3 bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between items-center text-center space-y-3">
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Total Progress</span>
                  <span className="text-[10px] font-mono text-cyan-700 font-bold">{percentComplete}%</span>
                </div>

                {/* Concentric Multi-Ring Radial Gauge */}
                <div className="relative w-32 h-32 flex items-center justify-center my-1">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Outer Ring Background */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    {/* Outer Ring Active (Camera Mounting) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="6"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * percentComplete) / 100}
                      strokeLinecap="round"
                    />
                    {/* Inner Ring Background */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    {/* Inner Ring Active (Task Milestones) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="6"
                      strokeDasharray="188"
                      strokeDashoffset={188 - (188 * (project.tasks.length > 0 ? (doneTasks.length / project.tasks.length) * 100 : 0)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-black font-mono text-slate-900 leading-none">
                      {percentComplete}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Overall</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  + Add Target
                </button>
              </div>
            </div>

            {/* ROW 2: MIDDLE OPERATIONAL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Card 1: Key Goals / Milestones Checklist (Col 5) */}
              <div className="md:col-span-5 bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-xs text-slate-900 tracking-wide uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key Milestones
                    </span>
                    <button onClick={() => setActiveTab('Board')} className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer">
                      View Board →
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-3">
                    {project.tasks.slice(0, 4).map(task => {
                      const isDone = task.status === 'Done';
                      const isBlocked = task.status === 'Blocked';

                      return (
                        <div key={task.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => {
                                if (isDone) {
                                  onUpdateTaskStatus(task.id, 'In progress');
                                } else {
                                  setEvidenceTask(task);
                                }
                              }}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition cursor-pointer ${
                                isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-slate-400'
                              }`}
                              title={isDone ? 'Mark as In Progress' : 'Complete task with Photo Evidence'}
                            >
                              {isDone && <Check className="w-3 h-3" />}
                            </button>
                            <div className="min-w-0">
                              <div className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task.title}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {task.owner} • {task.targetDate || 'Sep 25'}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Milestone</span>
                </button>
              </div>

              {/* Card 2: Field Technicians Team Cards (Col 4) */}
              <div className="md:col-span-4 bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-xs text-slate-900 tracking-wide uppercase flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Field Technicians
                    </span>
                    <button onClick={() => setActiveTab('Team')} className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer">
                      All ({technicianList.length}) →
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-3">
                    {technicianList.slice(0, 3).map(tech => (
                      <div key={tech.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#111317] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {tech.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{tech.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{tech.role}</div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          {tech.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowAddTechModal(true)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Technician</span>
                </button>
              </div>

              {/* Card 3: Quick Action Box (Col 3) */}
              <div className="md:col-span-3 flex flex-col gap-2.5">
                <div 
                  onClick={() => setShowAddCameraModal(true)}
                  className="flex-1 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white/40 hover:bg-white rounded-[22px] p-3.5 flex items-center gap-3 cursor-pointer transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#111317] group-hover:text-white transition flex items-center justify-center text-slate-700 shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-slate-900 group-hover:text-cyan-700 transition">
                      + Add Endpoint / Task
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Manual form entry
                    </div>
                  </div>
                </div>

                {onOpenImportModal && (
                  <div 
                    onClick={onOpenImportModal}
                    className="flex-1 border-2 border-amber-200/90 hover:border-amber-300 bg-gradient-to-r from-amber-50/70 to-orange-50/50 hover:bg-amber-100/50 rounded-[22px] p-3.5 flex items-center gap-3 cursor-pointer transition shadow-2xs group"
                    title="Import CCTV Achievement Report (.docx / .json)"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <span>Import DOCX Report</span>
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-black">NEW</span>
                      </div>
                      <div className="text-[10px] text-amber-700/80">
                        Upload Word or JSON data
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ROW 3: REPORTED AREA STATUS CAPSULES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111317] text-white rounded-[24px] p-5 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Area 1 & 2 • Complete</div>
                  <div className="font-bold text-sm">Cashier & Front Desk</div>
                  <div className="text-xs text-slate-400 font-mono">2 Cameras • Feeds Live Verified 100%</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="bg-[#111317] text-white rounded-[24px] p-5 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">Area 3 • On Hold</div>
                  <div className="font-bold text-sm">Backdoor Entrance</div>
                  <div className="text-xs text-slate-400 font-mono">Deferred for privacy • Cable prepared</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <div className="bg-[#111317] text-white rounded-[24px] p-5 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Area 4 & 5 • Pending</div>
                  <div className="font-bold text-sm">Entrance Door & AP Relocation</div>
                  <div className="text-xs text-slate-400 font-mono">Camera pending • Trace PoE injectors</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              </div>
            </div>

            {/* COMPLETED WORK — PHOTOGRAPHIC EVIDENCE GALLERY */}
            <div className="bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Camera className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Completed Work — Photographic Evidence</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        Verified Proof
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Physical inspection photos from the official RMVN Solutions installation report. Click to zoom.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-500">
                  2 Operational • 1 Deferred • 2 Pending
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
                      alt="CCTV Monitor Display"
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

            {/* ROW 4: SHARED SITE DIRECTIVES & NOTES (SYNCED WITH CLIENT DASHBOARD) */}
            <div className="bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Site Directives & Notes</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        Live 2-Way Sync with Client
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Collaborative feed between client sponsor and installation engineering team. Notes appear live on both consoles.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-500">
                  {projectNotes.length} Note{projectNotes.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Admin Note Input Box */}
              <form onSubmit={handleAdminSubmitNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an admin update or response to client..."
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!adminNoteText.trim()}
                  className="px-5 py-2.5 bg-[#111317] hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Note</span>
                </button>
              </form>

              {/* Notes Stream */}
              <div className="space-y-2.5 pt-1">
                {projectNotes.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No site notes recorded yet. Type above to post a note to the client dashboard.
                  </div>
                ) : (
                  projectNotes.map((note) => {
                    const isClient = note.authorRole === 'client';
                    return (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isClient
                            ? 'bg-amber-50/60 border-amber-200/80'
                            : 'bg-slate-50 border-slate-200/90'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isClient ? 'bg-amber-200/80 text-amber-950 font-mono' : 'bg-[#111317] text-white font-mono'
                            }`}>
                              {isClient ? 'Client Directive' : 'Admin / Tech'}
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
                            onClick={() => {
                              onDeleteNote(note.id);
                              showNotification('Deleted note');
                            }}
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

        {/* 3. TAB 1: INTERACTIVE KANBAN BOARD */}
        {activeTab === 'Board' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Field Operations Kanban Board
                </h2>
                <p className="text-xs text-slate-500">
                  Track technician assignments and milestone phases. Click arrows to move tasks between stages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenImportModal && (
                  <button
                    type="button"
                    onClick={onOpenImportModal}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Import CCTV Achievement Report (.docx / .json)"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Import DOCX</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3.5 py-1.5 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>New Milestone Task</span>
                </button>
              </div>
            </div>

            {/* 4 Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {columns.map((col) => {
                const columnTasks = project.tasks.filter(t => t.status === col.status);

                return (
                  <div 
                    key={col.status}
                    className="bg-white/80 backdrop-blur-sm rounded-[24px] p-4 border border-slate-200/90 shadow-xs space-y-3 min-h-[460px] flex flex-col justify-between"
                  >
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 tracking-wide uppercase">
                            {col.label}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${col.countColor}`}>
                          {columnTasks.length}
                        </span>
                      </div>

                      {/* Task Cards in Column */}
                      <div className="space-y-2.5">
                        {columnTasks.length === 0 ? (
                          <div className="py-10 text-center text-xs text-slate-400 font-medium">
                            No tasks in this stage
                          </div>
                        ) : (
                          columnTasks.map((task) => {
                            const isBlocked = task.status === 'Blocked';

                            return (
                              <div
                                key={task.id}
                                className={`p-3.5 rounded-2xl bg-white border transition shadow-xs space-y-2 hover:shadow-md ${
                                  isBlocked 
                                    ? 'border-rose-300 bg-rose-50/40' 
                                    : 'border-slate-200/90 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                    {task.category}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {task.targetDate || 'Sep 25'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTaskCard(task.id, task.title);
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                      title="Delete task"
                                      aria-label={`Delete task: ${task.title}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="font-bold text-xs text-slate-900 leading-snug">
                                  {task.title}
                                </div>

                                {/* Photographic Evidence Thumbnail or Upload Button */}
                                {task.photoEvidence ? (
                                  <div 
                                    onClick={() => setLightboxPhoto({ 
                                      url: task.photoEvidence!, 
                                      title: task.title, 
                                      caption: task.photoCaption, 
                                      area: task.area 
                                    })}
                                    className="rounded-xl overflow-hidden border border-slate-200 group/img relative cursor-pointer h-24 bg-slate-900 shadow-2xs hover:border-amber-400 transition"
                                  >
                                    <img 
                                      src={task.photoEvidence} 
                                      alt={task.title} 
                                      className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-2">
                                      <span className="text-[10px] text-white font-semibold truncate flex items-center gap-1">
                                        <Camera className="w-3 h-3 text-amber-300 shrink-0" />
                                        <span className="truncate">{task.photoCaption || 'Photo verified'}</span>
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[9px] font-bold text-white shrink-0">
                                        Proof
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEvidenceTask(task)}
                                    className="w-full py-1.5 px-2 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 text-[10px] text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                                  >
                                    <Camera className="w-3 h-3 text-amber-600" />
                                    <span>Attach Evidence</span>
                                  </button>
                                )}

                                {task.blockerReason && (
                                  <div className="p-2 rounded-xl bg-rose-100/70 border border-rose-200 text-[11px] text-rose-800 leading-tight">
                                    ⚠️ <strong>Blocker:</strong> {task.blockerReason}
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">
                                      {task.owner.charAt(0)}
                                    </div>
                                    <span className="truncate max-w-[90px]">{task.owner}</span>
                                  </div>

                                  {/* Quick Move Status Buttons */}
                                  <div className="flex items-center gap-1">
                                    {task.status !== 'Not started' && (
                                      <button
                                        onClick={() => onUpdateTaskStatus(task.id, 'Not started')}
                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                                        title="Move to Not Started"
                                      >
                                        <ChevronLeft className="w-3 h-3" />
                                      </button>
                                    )}
                                    {task.status !== 'In progress' && (
                                      <button
                                        onClick={() => onUpdateTaskStatus(task.id, 'In progress')}
                                        className="px-2 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold"
                                        title="Mark In Progress"
                                      >
                                        Progress
                                      </button>
                                    )}
                                    {task.status !== 'Blocked' && (
                                      <button
                                        onClick={() => onUpdateTaskStatus(task.id, 'Blocked', 'Waiting on site authorization')}
                                        className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold"
                                        title="Mark Blocked"
                                      >
                                        Block
                                      </button>
                                    )}
                                    {task.status !== 'Done' && (
                                      <button
                                        onClick={() => {
                                          if (task.photoEvidence) {
                                            onUpdateTaskStatus(task.id, 'Done');
                                            showNotification(`Task "${task.title}" marked completed!`);
                                          } else {
                                            setEvidenceTask(task);
                                          }
                                        }}
                                        className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer"
                                        title="Mark Done (Requires Photo Evidence)"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setNewTaskCategory(col.status === 'Done' ? 'Client Handover' : 'Camera Mounting');
                        setShowAddTaskModal(true);
                      }}
                      className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TAB 2: CAMERA FLEET TABLE */}
        {activeTab === 'Cameras' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Camera Fleet Telemetry ({cameraList.length} Endpoints)
                </h2>
                <p className="text-xs text-slate-500">
                  Hikvision 4K PoE endpoints mapped to Switch G24 on VLAN 20.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter by zone or spot..."
                    value={cameraSearch}
                    onChange={(e) => setCameraSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 rounded-full text-xs bg-white border border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder-slate-400 w-56 shadow-xs"
                  />
                </div>

                {onOpenImportModal && (
                  <button
                    type="button"
                    onClick={onOpenImportModal}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Import CCTV Achievement Report (.docx / .json)"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Import DOCX</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddCameraModal(true)}
                  className="px-3.5 py-1.5 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Camera</span>
                </button>
              </div>
            </div>

            {/* Bulk Selection Action Bar */}
            {selectedCameraIds.length > 0 && (
              <div className="bg-[#1a1c22] text-white px-5 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold text-xs">
                    {selectedCameraIds.length} Camera{selectedCameraIds.length > 1 ? 's' : ''} Selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExecuteBatchStatus('Mounted')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Mounted</span>
                  </button>

                  <button
                    onClick={() => handleExecuteBatchStatus('Pending Power')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Pending</span>
                  </button>

                  <button
                    onClick={() => setShowBatchDeleteModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedCameraIds.length})</span>
                  </button>

                  <button
                    onClick={() => setSelectedCameraIds([])}
                    className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* Enterprise Table Container */}
            <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer accent-[#1a1c22]"
                          title="Select all filtered cameras"
                        />
                      </th>
                      <th className="py-3 px-4">Node ID</th>
                      <th className="py-3 px-4">Camera Location</th>
                      <th className="py-3 px-4">Zone / Floor</th>
                      <th className="py-3 px-4">Lens Spec</th>
                      <th className="py-3 px-4">Switch Port & IP</th>
                      <th className="py-3 px-4">Hardware Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCameras.map((cam) => {
                      const isMounted = cam.status === 'Mounted';
                      const isSelected = selectedCameraIds.includes(cam.id);

                      return (
                        <tr 
                          key={cam.id} 
                          className={`transition ${isSelected ? 'bg-cyan-50/70 hover:bg-cyan-50' : 'hover:bg-slate-50/80'}`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectCamera(cam.id)}
                              className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer accent-[#1a1c22]"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {cam.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {cam.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {cam.zone}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {cam.lens}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {cam.port} • <span className="text-cyan-800">{cam.ip}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isMounted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isMounted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {cam.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditCamera(cam)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title={`Edit details for ${cam.id}`}
                              >
                                <Edit3 className="w-3 h-3 text-cyan-700" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => {
                                  onUpdateCamera({
                                    ...cam,
                                    status: isMounted ? 'Pending Power' : 'Mounted'
                                  });
                                  showNotification(`Toggled state for ${cam.id}`);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                  isMounted 
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {isMounted ? 'Unmount' : 'Mount'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB 3: TEAM MANAGEMENT */}
        {activeTab === 'Team' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Technician Roster & Workload Assignments ({technicianList.length} Members)
                </h2>
                <p className="text-xs text-slate-500">
                  Field crew and client stakeholders assigned to {project.name}.
                </p>
              </div>

              <button
                onClick={() => setShowAddTechModal(true)}
                className="px-3.5 py-1.5 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                <span>Add Technician</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicianList.map((member) => (
                <div key={member.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-300 font-bold flex items-center justify-center text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          member.status === 'On Site' ? 'bg-emerald-100 text-emerald-800' :
                          member.status === 'Remote' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          ● {member.status}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteTechnician) {
                            onDeleteTechnician(member.id);
                            showNotification(`Removed technician ${member.name}`);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={`Delete ${member.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{member.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{member.role}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                      <div>Assignment: <strong>{member.assigned}</strong></div>
                      <div>Contact: <span className="text-slate-500 font-mono">{member.email}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => showNotification(`Contact: ${member.email}`)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteTechnician) {
                          onDeleteTechnician(member.id);
                          showNotification(`Deleted "${member.name}" from technician roster`);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200/80 transition cursor-pointer flex items-center gap-1.5"
                      title={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TAB 4: SYSTEM SETTINGS & DATA RESET */}
        {activeTab === 'Settings' && (
          <div className="space-y-4 animate-in fade-in max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                System & Hardware Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Manage global parameters, storage retention, and reset test data.
              </p>
            </div>

            {/* DOCX Import Card */}
            <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-amber-50/50 p-6 rounded-3xl border-2 border-amber-200/90 shadow-xs space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Import DOCX Achievement Report
                    </h3>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      DOCX / JSON
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-xl">
                    Upload your official installation report (<code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-amber-900">.docx</code>) to replace project data and extract real embedded photo evidence automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenImportModal?.()}
                  className="px-4 py-2.5 bg-[#111317] hover:bg-slate-800 text-amber-300 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-sm text-xs shrink-0 self-start sm:self-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Import Wizard</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Total System Endpoints (Cameras)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={project.totalCameras}
                    onChange={(e) => onUpdateCameraCount(project.installedCameras, Number(e.target.value))}
                    className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                  <span className="text-slate-500 text-[11px]">Active endpoints count</span>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-800">Target Launch & Handover Date</label>
                <input
                  type="text"
                  value={project.targetLaunchDate}
                  readOnly
                  className="w-48 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-800">Recording Retention Schedule</label>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
                  <span>30 Days Continuous Loop (RAID-6 48TB)</span>
                  <span className="font-bold text-emerald-700">Active</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Reset Sample Data</div>
                  <div className="text-[11px] text-slate-500">Restore the initial 24 cameras and 8 default milestones.</div>
                </div>
                {onResetProjectData && (
                  <button
                    onClick={() => {
                      onResetProjectData();
                      showNotification('Reset project data to initial state!');
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                )}
              </div>
            </div>

            {/* Console Security & Password Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Admin Console Security & Password</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the administrative password required to switch into this console from Client View.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password..."
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 4 characters)..."
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                </div>

                {passError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin password successfully updated!</span>
                  </div>
                )}

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#111317] hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD MILESTONE TASK */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-700" />
                  Add New Installation Milestone
                </h3>
                <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800">Milestone Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aim and focus night vision lenses on Cams 13–18"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800">Category Stage:</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-cyan-600"
                  >
                    <option value="Site Survey">Site Survey</option>
                    <option value="Network & Cabling">Network & Cabling</option>
                    <option value="Camera Mounting">Camera Mounting</option>
                    <option value="NVR & Server Setup">NVR & Server Setup</option>
                    <option value="Testing & Commissioning">Testing & Commissioning</option>
                    <option value="Client Handover">Client Handover</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Assigned Technician Lead:</label>
                  <select
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-cyan-600"
                  >
                    {technicianList.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Target Completion Date:</label>
                  <input
                    type="date"
                    value={newTaskTargetDate}
                    onChange={(e) => setNewTaskTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Create Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD CAMERA ENDPOINT */}
        {showAddCameraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Add New Camera Endpoint
                </h3>
                <button onClick={() => setShowAddCameraModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCamera} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800">Camera Spot / Location Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Parking Exit Barrier"
                    value={newCamName}
                    onChange={(e) => setNewCamName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800">Floor / Zone:</label>
                    <select
                      value={newCamZone}
                      onChange={(e) => setNewCamZone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                    >
                      <option value="Floor 1">Floor 1</option>
                      <option value="Floor 2">Floor 2</option>
                      <option value="Basement">Basement</option>
                      <option value="Ground">Ground / Bay</option>
                      <option value="Exterior">Exterior</option>
                      <option value="Rooftop">Rooftop</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800">Lens Specification:</label>
                    <select
                      value={newCamLens}
                      onChange={(e) => setNewCamLens(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                    >
                      <option value="2.8mm Wide Angle">2.8mm Wide Angle</option>
                      <option value="4.0mm Standard">4.0mm Standard</option>
                      <option value="6.0mm Telephoto">6.0mm Telephoto</option>
                      <option value="8.0mm Varifocal">8.0mm Varifocal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800">Switch Port:</label>
                    <input
                      type="text"
                      value={newCamPort}
                      onChange={(e) => setNewCamPort(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800">Static IPv4 Address:</label>
                    <input
                      type="text"
                      value={newCamIp}
                      onChange={(e) => setNewCamIp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Initial Hardware State:</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setNewCamStatus('Mounted')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        newCamStatus === 'Mounted' 
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Mounted & Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCamStatus('Pending Power')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        newCamStatus === 'Pending Power' 
                          ? 'bg-amber-100 border-amber-500 text-amber-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Pending Power
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCameraModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Add Camera
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2.5: EDIT CAMERA ENDPOINT */}
        {editingCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Camera: <span className="font-mono text-cyan-800">{editingCamera.id}</span>
                  </h3>
                </div>
                <button onClick={() => setEditingCamera(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCamera} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800">Camera Spot / Location Name:</label>
                  <input
                    type="text"
                    required
                    value={editCamName}
                    onChange={(e) => setEditCamName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800">Floor / Zone:</label>
                    <select
                      value={editCamZone}
                      onChange={(e) => setEditCamZone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                    >
                      <option value="Floor 1">Floor 1</option>
                      <option value="Floor 2">Floor 2</option>
                      <option value="Basement">Basement</option>
                      <option value="Ground">Ground / Bay</option>
                      <option value="Exterior">Exterior</option>
                      <option value="Rooftop">Rooftop</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800">Lens Specification:</label>
                    <select
                      value={editCamLens}
                      onChange={(e) => setEditCamLens(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                    >
                      <option value="2.8mm Wide Angle">2.8mm Wide Angle</option>
                      <option value="4.0mm Standard">4.0mm Standard</option>
                      <option value="6.0mm Telephoto">6.0mm Telephoto</option>
                      <option value="8.0mm Varifocal">8.0mm Varifocal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800">Switch Port:</label>
                    <input
                      type="text"
                      value={editCamPort}
                      onChange={(e) => setEditCamPort(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800">Static IPv4 Address:</label>
                    <input
                      type="text"
                      value={editCamIp}
                      onChange={(e) => setEditCamIp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Hardware State:</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditCamStatus('Mounted')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        editCamStatus === 'Mounted' 
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Mounted & Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCamStatus('Pending Power')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        editCamStatus === 'Pending Power' 
                          ? 'bg-amber-100 border-amber-500 text-amber-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Pending Power
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation or Buttons */}
                {showDeleteConfirm ? (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 mt-2">
                    <div className="text-rose-800 font-bold text-xs">
                      Confirm permanently removing {editingCamera.id}?
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCurrentCamera}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer hover:underline"
                    >
                      Delete Camera
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCamera(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1a1c22] hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD BLOCKER / ISSUE */}
        {showAddBlockerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Report Blocker / Escalation
                </h3>
                <button onClick={() => setShowAddBlockerModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBlocker} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800">Issue / Blocker Description:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrical room locked; awaiting security badge key"
                    value={newBlockerDesc}
                    onChange={(e) => setNewBlockerDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800">Assigned Owner:</label>
                  <select
                    value={newBlockerOwner}
                    onChange={(e) => setNewBlockerOwner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                  >
                    {technicianList.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Action Needed to Unblock:</label>
                  <input
                    type="text"
                    placeholder="e.g. Request badge authorization from client facility sponsor"
                    value={newBlockerAction}
                    onChange={(e) => setNewBlockerAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBlockerModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Escalate Blocker
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: ADD TECHNICIAN */}
        {showAddTechModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  Add Field Technician
                </h3>
                <button onClick={() => setShowAddTechModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTechnician} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800">Technician Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800">Role / Specialization:</label>
                    <select
                      value={newTechRole}
                      onChange={(e) => setNewTechRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                    >
                      <option value="Field Technician">Field Technician</option>
                      <option value="Lead CCTV Installer">Lead CCTV Installer</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Network Engineer">Network Engineer</option>
                      <option value="Client Coordinator">Client Coordinator</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800">Shift Status:</label>
                    <select
                      value={newTechStatus}
                      onChange={(e) => setNewTechStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                    >
                      <option value="On Site">On Site</option>
                      <option value="Remote">Remote</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Assigned Zone / Task:</label>
                  <input
                    type="text"
                    placeholder="e.g. Parking Lot Cams 13–16"
                    value={newTechAssigned}
                    onChange={(e) => setNewTechAssigned(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800">Email Address:</label>
                  <input
                    type="email"
                    placeholder="jordan.h@rmvn.com"
                    value={newTechEmail}
                    onChange={(e) => setNewTechEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTechModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Save Technician
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: BULK CAMERA DELETION CONFIRMATION */}
        {showBatchDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Confirm Bulk Camera Deletion
                  </h3>
                </div>
                <button onClick={() => setShowBatchDeleteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p>
                  Are you sure you want to permanently delete <strong>{selectedCameraIds.length}</strong> selected camera endpoints?
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-40 overflow-y-auto space-y-1.5">
                  {selectedCameraIds.map(id => {
                    const c = cameraList.find(x => x.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-slate-900">{id}</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{c?.name || ''}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  ⚠️ Total camera count and completion pacing will automatically recalculate across both Admin and Client views.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchDeleteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBatchDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Yes, Delete {selectedCameraIds.length} Cameras
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHOTO EVIDENCE MODAL */}
        <TaskPhotoEvidenceModal
          task={evidenceTask}
          isOpen={!!evidenceTask}
          onClose={() => setEvidenceTask(null)}
          onConfirm={(taskId, photoEvidence, photoCaption) => {
            if (onCompleteTaskWithEvidence) {
              onCompleteTaskWithEvidence(taskId, photoEvidence, photoCaption);
            } else {
              onUpdateTaskStatus(taskId, 'Done', undefined, photoEvidence, photoCaption);
            }
            showNotification('Task completed with photographic evidence!');
          }}
        />

        {/* PHOTO LIGHTBOX MODAL */}
        <PhotoLightboxModal
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
        />

      </main>
    </div>
  );
};
