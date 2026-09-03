import React, { useState, useEffect } from 'react';
import { CCTVProject, CCTVTask, TaskStatus, RiskItem, AuthUser, ExecutiveStatus, CameraEndpoint, TechnicianMember, BlockerItem, ProjectNote } from './types';
import { loadProjects, saveProjects } from './utils/storage';
import { computeExecutiveStatus, computeHealthScore, generateProjectMonitoringUpdate } from './utils/assistantEngine';
import { Header } from './components/Header';
import { SimpleDashboard } from './components/SimpleDashboard';
import { CrextioDashboard } from './components/CrextioDashboard';
import { EnterpriseAdminDashboard } from './components/EnterpriseAdminDashboard';
import { TechyAdminDashboard } from './components/TechyAdminDashboard';
import { UserInputModal } from './components/UserInputModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PRESET_USERS } from './components/LoginModal';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<CCTVProject[]>(() => loadProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const projs = loadProjects();
    return projs[0]?.id || '';
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('cctv_admin_password') || 'admin@123';
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'project' | 'task' | 'risk';
  }>({
    isOpen: false,
    mode: 'project'
  });

  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('cctv_monitoring_user_role_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_USERS.client;
  });

  // Sync projects to localStorage
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Sync user role to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cctv_monitoring_user_role_v1', JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const execStatus: ExecutiveStatus = currentProject ? computeExecutiveStatus(currentProject) : {
    overall: 'Green',
    schedule: 'On track',
    scope: 'Stable',
    resourcing: 'Adequate',
    overallReason: 'All systems ready.',
    keyAsk: 'None'
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleToggleRole = () => {
    if (currentUser.role === 'client') {
      setShowAdminAuthModal(true);
    } else {
      setCurrentUser(PRESET_USERS.client);
    }
  };

  const handleAdminAuthSuccess = () => {
    setCurrentUser(PRESET_USERS.installer);
    setShowAdminAuthModal(false);
  };

  const handleUpdateAdminPassword = (newPassword: string) => {
    setAdminPassword(newPassword);
    localStorage.setItem('cctv_admin_password', newPassword);
  };

  const handleAddProject = (newProject: CCTVProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

  const handleAddTask = (newTask: CCTVTask) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        return { ...p, tasks: [...p.tasks, newTask] };
      })
    );
  };

  const handleAddRisk = (newRisk: RiskItem) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        return { ...p, risks: [...p.risks, newRisk] };
      })
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus, blockerReason?: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const updatedTasks = p.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            completedDate: newStatus === 'Done' ? new Date().toISOString().split('T')[0] : undefined,
            blockerReason: newStatus === 'Blocked' ? blockerReason : undefined
          };
        });

        const updatedBlockers = [...p.blockers];
        if (newStatus === 'Blocked' && blockerReason) {
          const existingBlocker = updatedBlockers.find(b => b.description.includes(blockerReason));
          if (!existingBlocker) {
            updatedBlockers.unshift({
              id: `b-${Date.now()}`,
              description: blockerReason,
              owner: p.tasks.find(t => t.id === taskId)?.owner || p.teamLead,
              since: new Date().toISOString().split('T')[0],
              unblockAction: 'Investigate root cause and assign escalation owner.',
              resolved: false
            });
          }
        }

        return {
          ...p,
          tasks: updatedTasks,
          blockers: updatedBlockers
        };
      })
    );
  };

  const handleResolveBlocker = (blockerId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        return {
          ...p,
          blockers: p.blockers.map((b) => (b.id === blockerId ? { ...b, resolved: true } : b))
        };
      })
    );
  };

  const handleUpdateCameraCount = (installed: number, total: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProject.id
          ? { ...p, installedCameras: installed, totalCameras: total }
          : p
      )
    );
  };

  const handleAddCamera = (camera: CameraEndpoint) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentCams = p.cameras || [];
        const updatedCams = [...currentCams, camera];
        const newInstalled = updatedCams.filter((c) => c.status === 'Mounted').length;
        return {
          ...p,
          cameras: updatedCams,
          totalCameras: updatedCams.length,
          installedCameras: newInstalled
        };
      })
    );
  };

  const handleUpdateCamera = (updatedCamera: CameraEndpoint) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentCams = p.cameras || [];
        const updatedCams = currentCams.map((c) => (c.id === updatedCamera.id ? updatedCamera : c));
        const newInstalled = updatedCams.filter((c) => c.status === 'Mounted').length;
        return {
          ...p,
          cameras: updatedCams,
          totalCameras: updatedCams.length,
          installedCameras: newInstalled
        };
      })
    );
  };

  const handleDeleteCamera = (cameraId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentCams = p.cameras || [];
        const updatedCams = currentCams.filter((c) => c.id !== cameraId);
        const newInstalled = updatedCams.filter((c) => c.status === 'Mounted').length;
        return {
          ...p,
          cameras: updatedCams,
          totalCameras: updatedCams.length,
          installedCameras: newInstalled
        };
      })
    );
  };

  const handleBatchDeleteCameras = (cameraIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentCams = p.cameras || [];
        const updatedCams = currentCams.filter((c) => !cameraIds.includes(c.id));
        const newInstalled = updatedCams.filter((c) => c.status === 'Mounted').length;
        return {
          ...p,
          cameras: updatedCams,
          totalCameras: updatedCams.length,
          installedCameras: newInstalled
        };
      })
    );
  };

  const handleBatchUpdateCameraStatus = (cameraIds: string[], status: 'Mounted' | 'Pending Power') => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentCams = p.cameras || [];
        const updatedCams = currentCams.map((c) =>
          cameraIds.includes(c.id) ? { ...c, status } : c
        );
        const newInstalled = updatedCams.filter((c) => c.status === 'Mounted').length;
        return {
          ...p,
          cameras: updatedCams,
          totalCameras: updatedCams.length,
          installedCameras: newInstalled
        };
      })
    );
  };

  const handleAddBlocker = (blocker: BlockerItem) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        return {
          ...p,
          blockers: [blocker, ...p.blockers]
        };
      })
    );
  };

  const handleAddTechnician = (tech: TechnicianMember) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentTechs = p.technicians || [];
        return {
          ...p,
          technicians: [...currentTechs, tech]
        };
      })
    );
  };

  const handleDeleteTechnician = (techId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentTechs = p.technicians || [];
        return {
          ...p,
          technicians: currentTechs.filter((t) => t.id !== techId)
        };
      })
    );
  };

  const handleAddNote = (content: string, author: string, authorRole: 'client' | 'installer') => {
    const newNote: ProjectNote = {
      id: `note-${Date.now()}`,
      author,
      authorRole,
      content,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentNotes = p.notes || [];
        return {
          ...p,
          notes: [newNote, ...currentNotes]
        };
      })
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentNotes = p.notes || [];
        return {
          ...p,
          notes: currentNotes.filter((n) => n.id !== noteId)
        };
      })
    );
  };

  const handleResetProjectData = () => {
    localStorage.removeItem('cctv_monitoring_projects_v1');
    const fresh = loadProjects();
    setProjects(fresh);
  };

  const handleCopyReport = () => {
    if (!currentProject) return;
    const md = generateProjectMonitoringUpdate(currentProject);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="text-3xl">📹</div>
          <h2 className="text-base font-bold text-white">No camera project connected yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select your facility from the top menu or ask your lead installer for an access link.
          </p>
          <button
            onClick={() => setModalState({ isOpen: true, mode: 'project' })}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            Create or Connect Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* USER DASHBOARD: Super Simple, Warm, Human-Friendly Crextio Template */}
      {currentUser.role === 'client' ? (
        <CrextioDashboard
          project={currentProject}
          execStatus={execStatus}
          currentUser={currentUser}
          onResolveBlocker={handleResolveBlocker}
          onUpdateCameraCount={handleUpdateCameraCount}
          onCopyReport={handleCopyReport}
          copied={copied}
          onToggleRole={handleToggleRole}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      ) : (
        /* REDESIGNED ADMIN DASHBOARD: Clean Enterprise SaaS with Interactive Kanban, Camera Fleet & Team Management */
        <EnterpriseAdminDashboard
          project={currentProject}
          execStatus={execStatus}
          currentUser={currentUser}
          onResolveBlocker={handleResolveBlocker}
          onUpdateCameraCount={handleUpdateCameraCount}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onAddTask={handleAddTask}
          onAddCamera={handleAddCamera}
          onUpdateCamera={handleUpdateCamera}
          onDeleteCamera={handleDeleteCamera}
          onBatchDeleteCameras={handleBatchDeleteCameras}
          onBatchUpdateCameraStatus={handleBatchUpdateCameraStatus}
          onAddBlocker={handleAddBlocker}
          onAddTechnician={handleAddTechnician}
          onDeleteTechnician={handleDeleteTechnician}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onResetProjectData={handleResetProjectData}
          onToggleRole={handleToggleRole}
          onCopyReport={handleCopyReport}
          copied={copied}
          adminPassword={adminPassword}
          onUpdateAdminPassword={handleUpdateAdminPassword}
        />
      )}

      {/* Admin Password Gate Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={handleAdminAuthSuccess}
        expectedPassword={adminPassword}
      />

      {/* Modals for when explicitly needed */}
      <UserInputModal
        mode={modalState.mode}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'project' })}
        onAddProject={handleAddProject}
        onAddTask={handleAddTask}
        onAddRisk={handleAddRisk}
        currentProject={currentProject}
      />
    </div>
  );
};
