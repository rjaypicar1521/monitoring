import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Check, 
  FolderCheck, 
  Clock, 
  Layers, 
  ChevronRight,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { CCTVProject } from '../types';

interface ProjectSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: CCTVProject | null;
  projects: CCTVProject[];
  onSelectProject: (projectId: string) => void;
}

export const ProjectSelectorDrawer: React.FC<ProjectSelectorDrawerProps> = ({
  isOpen,
  onClose,
  activeProject,
  projects,
  onSelectProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);

  // Reset internal states on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedPendingId(null);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Pending projects: all projects except the currently active one
  const pendingProjects = useMemo(() => {
    const activeId = activeProject?.id;
    return projects
      .filter((p) => !activeId || p.id !== activeId)
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.organization && p.organization.toLowerCase().includes(q))
        );
      });
  }, [projects, activeProject, searchQuery]);

  // Action: onClick on Active Project
  const handleOpenActiveProject = () => {
    onClose();
  };

  // Action: confirm and set active project from footer
  const handleConfirmSetActiveProject = () => {
    if (selectedPendingId) {
      onSelectProject(selectedPendingId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside 
        className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-r border-slate-200 animate-in slide-in-from-left duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Select project"
      >
        {/* 1. Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Select project
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Switch or inspect CCTV monitoring environments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Optional Controls: Search Input */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Scrollable List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* SECTION A — Currently active project */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Currently active project
              </span>
              {activeProject && (
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                  1 Online
                </span>
              )}
            </div>

            {activeProject ? (
              <div
                onClick={handleOpenActiveProject}
                className="group relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#181a20] text-white border-2 border-slate-800 shadow-md hover:border-amber-400 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                        {activeProject.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        {activeProject.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
                      <span>{activeProject.totalCameras} Cameras</span>
                      <span>•</span>
                      <span>{activeProject.tasks.length} Tasks</span>
                    </div>
                  </div>

                  {/* Active Badge */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-amber-300 flex items-center gap-0.5">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No active project selected
              </div>
            )}
          </div>

          {/* SECTION B — Pending projects */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pending projects
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                {pendingProjects.length} Available
              </span>
            </div>

            {pendingProjects.length > 0 ? (
              <div className="space-y-2">
                {pendingProjects.map((project) => {
                  const isCandidateSelected = selectedPendingId === project.id;
                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedPendingId(project.id)}
                      className={`group relative p-3 rounded-2xl border transition cursor-pointer ${
                        isCandidateSelected
                          ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-bold text-xs truncate ${
                              isCandidateSelected ? 'text-amber-950' : 'text-slate-800'
                            }`}>
                              {project.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="truncate flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              {project.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                            <span>{project.totalCameras} Cameras</span>
                            <span>•</span>
                            <span>Target: {project.targetLaunchDate}</span>
                          </div>
                        </div>

                        {/* Secondary Text: "Pending" & Radio selection state */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium font-mono">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            Pending
                          </span>

                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            isCandidateSelected
                              ? 'bg-amber-500 border-amber-600 text-slate-950'
                              : 'border-slate-300 group-hover:border-slate-400 bg-white'
                          }`}>
                            {isCandidateSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
                <FolderCheck className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No pending projects</p>
                <p className="text-[11px] text-slate-400">
                  {searchQuery ? 'Try clearing your search query' : 'All available projects are currently active or none imported'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Footer Actions */}
        <div className="p-4 border-t border-slate-200/90 bg-slate-50/90 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer text-center"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={!selectedPendingId}
            onClick={handleConfirmSetActiveProject}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
              selectedPendingId
                ? 'bg-[#111317] hover:bg-black text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Set active project</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
