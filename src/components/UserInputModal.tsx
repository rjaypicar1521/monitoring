import React, { useState } from 'react';
import { X, Camera, CheckSquare, AlertTriangle } from 'lucide-react';
import { CCTVProject, CCTVTask, TaskCategory, TaskStatus, RiskItem } from '../types';

interface UserInputModalProps {
  mode: 'project' | 'task' | 'risk';
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: CCTVProject) => void;
  onAddTask: (task: CCTVTask) => void;
  onAddRisk: (risk: RiskItem) => void;
  currentProject: CCTVProject;
}

export const UserInputModal: React.FC<UserInputModalProps> = ({
  mode,
  isOpen,
  onClose,
  onAddProject,
  onAddTask,
  onAddRisk,
  currentProject
}) => {
  // New Project Form State
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [location, setLocation] = useState('');
  const [targetLaunchDate, setTargetLaunchDate] = useState('');
  const [teamLead, setTeamLead] = useState('');
  const [totalCameras, setTotalCameras] = useState('16');
  const [updateCadence, setUpdateCadence] = useState<'Daily' | 'Weekly'>('Weekly');
  const [audience, setAudience] = useState<'Team' | 'Exec' | 'Client'>('Exec');

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Camera Mounting');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('Not started');
  const [taskOwner, setTaskOwner] = useState('');
  const [taskTargetDate, setTaskTargetDate] = useState('');

  // New Risk Form State
  const [riskDesc, setRiskDesc] = useState('');
  const [riskImpact, setRiskImpact] = useState<'low' | 'med' | 'high'>('med');
  const [riskLikelihood, setRiskLikelihood] = useState<'low' | 'med' | 'high'>('med');
  const [riskSignal, setRiskSignal] = useState('');
  const [riskMitigation, setRiskMitigation] = useState('');
  const [riskOwner, setRiskOwner] = useState('');
  const [riskDue, setRiskDue] = useState('');

  if (!isOpen) return null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProj: CCTVProject = {
      id: `proj-${Date.now()}`,
      name: projectName.trim(),
      goal: projectGoal.trim() || 'Finish all CCTV installation and commissioning phases.',
      location: location.trim() || 'On-site',
      targetLaunchDate: targetLaunchDate || '',
      startDate: new Date().toISOString().split('T')[0],
      teamLead: teamLead.trim() || 'Lead Engineer',
      updateCadence,
      audience,
      totalCameras: parseInt(totalCameras, 10) || 16,
      installedCameras: 0,
      tasks: [
        {
          id: `t-${Date.now()}-1`,
          title: 'Initial walk-through and cable route validation',
          category: 'Site Survey',
          status: 'In progress',
          owner: teamLead || 'Lead Engineer',
          targetDate: targetLaunchDate
        }
      ],
      risks: [],
      blockers: [],
      decisions: []
    };

    onAddProject(newProj);
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: CCTVTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      category: taskCategory,
      status: taskStatus,
      owner: taskOwner.trim() || currentProject.teamLead || 'Unassigned',
      targetDate: taskTargetDate || undefined,
      completedDate: taskStatus === 'Done' ? new Date().toISOString().split('T')[0] : undefined
    };

    onAddTask(newTask);
    onClose();
  };

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskDesc.trim()) return;

    const newRisk: RiskItem = {
      id: `risk-${Date.now()}`,
      description: riskDesc.trim(),
      impact: riskImpact,
      likelihood: riskLikelihood,
      signal: riskSignal.trim() || 'Early project observation',
      mitigation: riskMitigation.trim() || 'Monitor closely during next shift',
      owner: riskOwner.trim() || currentProject.teamLead,
      dueDate: riskDue || undefined
    };

    onAddRisk(newRisk);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            {mode === 'project' && <Camera className="w-5 h-5 text-sky-400" />}
            {mode === 'task' && <CheckSquare className="w-5 h-5 text-sky-400" />}
            {mode === 'risk' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            <h3 className="text-base font-semibold text-white">
              {mode === 'project' && 'User Input 1: Add New CCTV Project'}
              {mode === 'task' && `Add Task to ${currentProject.name}`}
              {mode === 'risk' && `Log Risk for ${currentProject.name}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE: PROJECT */}
        {mode === 'project' && (
          <form onSubmit={handleCreateProject} className="space-y-3.5 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Airport Concourse C CCTV Overhaul"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">One-line Goal</label>
              <input
                type="text"
                placeholder="e.g. Finish all 48 camera runs and NVR config before Q4 inspection."
                value={projectGoal}
                onChange={(e) => setProjectGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Site Location</label>
                <input
                  type="text"
                  placeholder="Terminal 2 / Perimeter North"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Launch Date</label>
                <input
                  type="date"
                  value={targetLaunchDate}
                  onChange={(e) => setTargetLaunchDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Cameras</label>
                <input
                  type="number"
                  min="1"
                  value={totalCameras}
                  onChange={(e) => setTotalCameras(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Update Cadence</label>
                <select
                  value={updateCadence}
                  onChange={(e) => setUpdateCadence(e.target.value as 'Daily' | 'Weekly')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as 'Team' | 'Exec' | 'Client')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Exec">Executive</option>
                  <option value="Client">Client</option>
                  <option value="Team">Team</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Team / Lead Owner</label>
              <input
                type="text"
                placeholder="e.g. John Doe (Lead Installer)"
                value={teamLead}
                onChange={(e) => setTeamLead(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-md"
              >
                Create Project
              </button>
            </div>
          </form>
        )}

        {/* MODE: TASK */}
        {mode === 'task' && (
          <form onSubmit={handleCreateTask} className="space-y-3.5 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Run 12-strand armored optical fiber to IDF-2"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Not started">Not started</option>
                  <option value="In progress">In progress</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Owner</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance"
                  value={taskOwner}
                  onChange={(e) => setTaskOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={taskTargetDate}
                  onChange={(e) => setTaskTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-md"
              >
                Add Task
              </button>
            </div>
          </form>
        )}

        {/* MODE: RISK */}
        {mode === 'risk' && (
          <form onSubmit={handleCreateRisk} className="space-y-3.5 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Risk Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Switchboard overload during peak night IR illuminator load."
                value={riskDesc}
                onChange={(e) => setRiskDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Impact</label>
                <select
                  value={riskImpact}
                  onChange={(e) => setRiskImpact(e.target.value as 'low' | 'med' | 'high')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Likelihood</label>
                <select
                  value={riskLikelihood}
                  onChange={(e) => setRiskLikelihood(e.target.value as 'low' | 'med' | 'high')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Warning Signal (Indicator)</label>
              <input
                type="text"
                placeholder="e.g. Breaker heat threshold reading 48°C at 70% load."
                value={riskSignal}
                onChange={(e) => setRiskSignal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mitigation Action</label>
              <input
                type="text"
                placeholder="e.g. Distribute PoE load across IDF-1 and IDF-2 secondary supply."
                value={riskMitigation}
                onChange={(e) => setRiskMitigation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner</label>
                <input
                  type="text"
                  placeholder="Marcus Vance"
                  value={riskOwner}
                  onChange={(e) => setRiskOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={riskDue}
                  onChange={(e) => setRiskDue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-md"
              >
                Save Risk
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
