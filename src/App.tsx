import React, { useState, useEffect } from 'react';
import { CCTVProject, CCTVTask, TaskStatus, RiskItem, AuthUser, ExecutiveStatus, CameraEndpoint, TechnicianMember, BlockerItem, ProjectNote } from './types';
import { loadProjects, saveProjects, cleanMojibake, INITIAL_PROJECTS } from './utils/storage';
import { FolderCheck } from 'lucide-react';
import { computeExecutiveStatus, computeHealthScore, generateProjectMonitoringUpdate } from './utils/assistantEngine';
import { Header } from './components/Header';
import { SimpleDashboard } from './components/SimpleDashboard';
import { CrextioDashboard } from './components/CrextioDashboard';
import { EnterpriseAdminDashboard } from './components/EnterpriseAdminDashboard';
import { TechyAdminDashboard } from './components/TechyAdminDashboard';
import { UserInputModal } from './components/UserInputModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ImportProjectModal } from './components/ImportProjectModal';
import { PRESET_USERS } from './components/LoginModal';
import { GridBackground } from './components/ui/grid-dot-backgrounds';
import { FloatingMessenger } from './components/ui/chat';
import { ProjectSelectorDrawer } from './components/ProjectSelectorDrawer';

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

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
      if (saved) {
        const parsed = JSON.parse(cleanMojibake(saved));
        if (parsed.role === 'client') {
          parsed.name = 'UPCHQ';
          parsed.title = 'Client Project Sponsor (UPCHQ)';
        }
        return parsed;
      }
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
      localStorage.setItem('cctv_monitoring_user_role_v1', cleanMojibake(JSON.stringify(currentUser)));
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

  const handleImportProject = (importedProject: CCTVProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === importedProject.id);
      if (exists) {
        return prev.map((p) => (p.id === importedProject.id ? importedProject : p));
      }
      return [importedProject, ...prev];
    });
    setSelectedProjectId(importedProject.id);
  };

  const handleRemoveProject = (projectId: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(remaining[0]?.id || '');
      }
      return remaining;
    });
  };

  const handleAddTask = (newTask: CCTVTask) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        return { ...p, tasks: [...p.tasks, newTask] };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (!currentProject || p.id !== currentProject.id) return p;
        return {
          ...p,
          tasks: (p.tasks || []).filter((t) => t.id !== taskId)
        };
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

  const handleUpdateTaskStatus = (
    taskId: string, 
    newStatus: TaskStatus, 
    blockerReason?: string,
    photoEvidence?: string,
    photoCaption?: string
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const updatedTasks = p.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            completedDate: newStatus === 'Done' ? new Date().toISOString().split('T')[0] : undefined,
            blockerReason: newStatus === 'Blocked' ? blockerReason : undefined,
            photoEvidence: photoEvidence !== undefined ? (photoEvidence.trim() ? photoEvidence : undefined) : t.photoEvidence,
            photoCaption: photoCaption !== undefined ? (photoCaption.trim() ? photoCaption : undefined) : t.photoCaption,
            progressPercent: newStatus === 'Done' ? 100 : newStatus === 'In progress' ? 50 : 0
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

  const handleCompleteTaskWithEvidence = (
    taskId: string,
    photoEvidence: string,
    photoCaption?: string
  ) => {
    handleUpdateTaskStatus(taskId, 'Done', undefined, photoEvidence, photoCaption);
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

  const handleUpdateTechnician = (updatedTech: TechnicianMember) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== currentProject.id) return p;
        const currentTechs = p.technicians || [];
        return {
          ...p,
          technicians: currentTechs.map((t) => (t.id === updatedTech.id ? updatedTech : t))
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
      <GridBackground
        gridSize={24}
        darkGridColor="#262626"
        showFade={true}
        fadeIntensity={25}
        className="min-h-screen h-auto w-full bg-black text-slate-100 flex items-center justify-center p-4"
      >
        <div className="text-center space-y-4 max-w-md p-6 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-2xl">
          <div className="text-3xl">📹</div>
          <h2 className="text-base font-bold text-white">No camera project connected yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select your facility from the top menu or ask your lead installer for an access link.
          </p>
          <button
            onClick={() => setModalState({ isOpen: true, mode: 'project' })}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
          >
            Create or Connect Project
          </button>
        </div>
      </GridBackground>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 relative selection:bg-white selection:text-black">
      {/* Decoupled Hardware-Accelerated Fixed Grid Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          contain: 'strict',
        }}
      >
        <GridBackground
          gridSize={24}
          darkGridColor="#262626"
          showFade={true}
          fadeIntensity={25}
          className="w-full h-full min-h-screen bg-black"
        />
      </div>

      {/* Main Scrollable Viewport Content */}
      <div className="relative z-10 w-full min-h-screen">
        {!currentProject ? (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 text-center shadow-xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs border border-amber-100">
                <FolderCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">No Projects Found</h2>
                <p className="text-xs text-slate-500 mt-1">
                  All projects have been removed. You can create a new project or restore the default demo projects.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, mode: 'project' })}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                >
                  Create New Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjects(INITIAL_PROJECTS);
                    setSelectedProjectId(INITIAL_PROJECTS[0].id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Restore Demo Projects
                </button>
              </div>
            </div>
          </div>
        ) : currentUser.role === 'client' ? (
          <CrextioDashboard
            project={currentProject}
            execStatus={execStatus}
            currentUser={currentUser}
            onResolveBlocker={undefined}
            onUpdateCameraCount={handleUpdateCameraCount}
            onCopyReport={handleCopyReport}
            copied={copied}
            onToggleRole={handleToggleRole}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onCompleteTaskWithEvidence={undefined}
            onOpenProjectSelector={() => setShowProjectSelector(true)}
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
            onCompleteTaskWithEvidence={handleCompleteTaskWithEvidence}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onAddCamera={handleAddCamera}
            onUpdateCamera={handleUpdateCamera}
            onDeleteCamera={handleDeleteCamera}
            onBatchDeleteCameras={handleBatchDeleteCameras}
            onBatchUpdateCameraStatus={handleBatchUpdateCameraStatus}
            onAddBlocker={handleAddBlocker}
            onAddTechnician={handleAddTechnician}
            onUpdateTechnician={handleUpdateTechnician}
            onDeleteTechnician={handleDeleteTechnician}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onResetProjectData={handleResetProjectData}
            onToggleRole={handleToggleRole}
            onCopyReport={handleCopyReport}
            copied={copied}
            adminPassword={adminPassword}
            onUpdateAdminPassword={handleUpdateAdminPassword}
            onOpenImportModal={() => setShowImportModal(true)}
            onOpenProjectSelector={() => setShowProjectSelector(true)}
          />
        )}

        {/* Import Docx / Project Report Modal */}
        <ImportProjectModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportProject={handleImportProject}
        />

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

        {/* Sidenav Project Selector Drawer */}
        <ProjectSelectorDrawer
          isOpen={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
          activeProject={currentProject}
          projects={projects}
          onSelectProject={handleSelectProject}
          onRemoveProject={currentUser.role === 'installer' ? handleRemoveProject : undefined}
          currentUserRole={currentUser.role}
        />

        {/* Global Facebook Messenger Floating Popup (Shared across Client & Admin) */}
        {currentProject && (
          <FloatingMessenger
            projectId={currentProject.id}
            projectName={currentProject.name}
            currentUserRole={currentUser.role}
            currentUserName={currentUser.name}
            onSyncNote={handleAddNote}
          />
        )}
      </div>
    </div>
  );
};
