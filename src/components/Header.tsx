import React from 'react';
import { 
  ClipboardCheck, 
  Copy, 
  User, 
  Wrench, 
  Plus
} from 'lucide-react';
import { CCTVProject, ExecutiveStatus, AuthUser } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  projects: CCTVProject[];
  selectedProject: CCTVProject;
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  execStatus: ExecutiveStatus;
  onCopyReport: () => void;
  copied: boolean;
  currentUser: AuthUser;
  onToggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onOpenNewProjectModal,
  execStatus,
  onCopyReport,
  copied,
  currentUser,
  onToggleRole
}) => {
  const isInstaller = currentUser.role === 'installer';

  const statusBadge = {
    'On track': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'At risk': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Off track': 'bg-rose-500/15 text-rose-400 border-rose-500/30'
  }[execStatus.schedule] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Project Selector */}
        <div className="flex items-center space-x-3">
          <BrandLogo size="sm" showText={true} />

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Project Switcher */}
          <select
            value={selectedProject.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 hover:border-slate-600 text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 max-w-[150px] sm:max-w-xs truncate cursor-pointer transition shadow-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {isInstaller && (
            <button
              onClick={onOpenNewProjectModal}
              className="hidden md:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Add a new project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>

        {/* Right Controls: Status, Simple Role Toggle, Copy Update */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Status Badge */}
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusBadge}`}>
            ● {execStatus.schedule}
          </span>

          {/* Simple 1-Click Role Switcher */}
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
              isInstaller
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
                : 'bg-sky-950/60 border-sky-500/40 text-sky-300 hover:bg-sky-900/60'
            }`}
            title="Click to toggle between Client and Admin mode"
          >
            {isInstaller ? (
              <>
                <Wrench className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin View</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Client View</span>
              </>
            )}
          </button>

          {/* 1-Click Copy Update */}
          <button
            onClick={onCopyReport}
            className="flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm transition cursor-pointer"
            title="Copy weekly update email to clipboard"
          >
            {copied ? (
              <>
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Update</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
