import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { ShieldCheck, User, Wrench, Lock, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: AuthUser) => void;
  currentUser: AuthUser | null;
  canClose?: boolean;
}

export const PRESET_USERS: Record<UserRole, AuthUser> = {
  client: {
    id: 'usr-client',
    name: 'Alex Morgan',
    role: 'client',
    title: 'Client Project Sponsor'
  },
  installer: {
    id: 'usr-installer',
    name: 'Marcus Vance',
    role: 'installer',
    title: 'Lead Installer & Administrator'
  }
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser,
  canClose = true
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (role: UserRole) => {
    onLogin(PRESET_USERS[role]);
    if (onClose) onClose();
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    if ((u === 'installer' || u === 'admin') && p === 'admin123') {
      onLogin(PRESET_USERS.installer);
      if (onClose) onClose();
    } else if ((u === 'client' || u === 'user') && p === 'user123') {
      onLogin(PRESET_USERS.client);
      if (onClose) onClose();
    } else {
      setError('Invalid credentials. Use Quick Login or check hint below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-5 p-6 relative">
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1 flex flex-col items-center">
          <BrandLogo size="lg" showText={true} className="mb-2" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Select Your Workspace Role
          </h2>
          <p className="text-xs text-slate-400">
            Choose how you want to view and manage this project.
          </p>
        </div>

        {/* 1-Click Role Switch Cards */}
        <div className="space-y-3">
          {/* Option 1: Client / User */}
          <div
            onClick={() => handleQuickLogin('client')}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
              currentUser?.role === 'client'
                ? 'bg-sky-950/40 border-sky-500/50 ring-1 ring-sky-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span>Client / Stakeholder View</span>
                  {currentUser?.role === 'client' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-900 text-sky-200 border border-sky-700">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Plain-language updates, progress bars, and decision sign-offs.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
          </div>

          {/* Option 2: Installer / Admin */}
          <div
            onClick={() => handleQuickLogin('installer')}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
              currentUser?.role === 'installer'
                ? 'bg-purple-950/40 border-purple-500/50 ring-1 ring-purple-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span>Installer / Administrator</span>
                  {currentUser?.role === 'installer' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900 text-purple-200 border border-purple-700">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Full control: add tasks, update camera counts, and manage blockers.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
            or sign in with password
          </span>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Role / Username</label>
            <div className="relative">
              <input
                type="text"
                placeholder="client or installer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="user123 or admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </form>

        {/* Credential Hint */}
        <div className="text-[11px] text-slate-500 text-center font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
          Demo: <strong>client</strong>/<strong>user123</strong> • <strong>installer</strong>/<strong>admin123</strong>
        </div>
      </div>
    </div>
  );
};
