import React, { useState } from 'react';
import { CCTVProject, CCTVTask, TaskStatus, RiskItem, BlockerItem, AuthUser } from '../types';
import { CheckCircle2, Clock, AlertOctagon, Plus, ShieldAlert, AlertTriangle, Check, Layers, Wrench, User } from 'lucide-react';

interface ProjectListProps {
  project: CCTVProject;
  initialTab?: 'tasks' | 'risks' | 'blockers' | 'decisions';
  currentUser?: AuthUser | null;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, blockerReason?: string) => void;
  onResolveBlocker: (blockerId: string) => void;
  onOpenAddTaskModal: () => void;
  onOpenAddRiskModal: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  project,
  initialTab = 'tasks',
  currentUser,
  onUpdateTaskStatus,
  onResolveBlocker,
  onOpenAddTaskModal,
  onOpenAddRiskModal
}) => {
  const isInstaller = currentUser?.role === 'installer';
  const [activeTab, setActiveTab] = useState<'tasks' | 'risks' | 'blockers' | 'decisions'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [blockerPromptTaskId, setBlockerPromptTaskId] = useState<string | null>(null);
  const [blockerReasonInput, setBlockerReasonInput] = useState('');

  const statusColors: Record<TaskStatus, string> = {
    'Done': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'In progress': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    'Blocked': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    'Not started': 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const handleStatusClick = (task: CCTVTask, status: TaskStatus) => {
    if (status === 'Blocked') {
      setBlockerPromptTaskId(task.id);
      setBlockerReasonInput(task.blockerReason || '');
    } else {
      onUpdateTaskStatus(task.id, status);
    }
  };

  const submitBlockerReason = (taskId: string) => {
    onUpdateTaskStatus(taskId, 'Blocked', blockerReasonInput || 'Blocked pending dependency');
    setBlockerPromptTaskId(null);
    setBlockerReasonInput('');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 pt-2 bg-slate-950/40">
        <div className="flex space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tasks & Milestones ({project.tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blockers')}
            className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'blockers'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Blockers ({project.blockers.filter(b => !b.resolved).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'risks'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Risks & Mitigations ({project.risks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'decisions'
                ? 'border-purple-500 text-purple-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Decisions ({project.decisions.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 pb-2">
          {isInstaller && activeTab === 'tasks' && (
            <button
              onClick={onOpenAddTaskModal}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition cursor-pointer"
              title="Installer action: Add task milestone"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          )}

          {isInstaller && activeTab === 'risks' && (
            <button
              onClick={onOpenAddRiskModal}
              className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition cursor-pointer"
              title="Installer action: Add risk item"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Risk</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-4">
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-2.5">
            {project.tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No tasks defined for this CCTV project yet. Click "Add Task" above.
              </div>
            ) : (
              project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {task.category}
                      </span>
                      <h4 className="text-sm font-medium text-slate-100">{task.title}</h4>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Owner: <strong className="text-slate-300 font-normal">{task.owner}</strong></span>
                      {task.completedDate && (
                        <span>Completed: <span className="font-mono text-emerald-400">{task.completedDate}</span></span>
                      )}
                      {task.targetDate && !task.completedDate && (
                        <span>Target: <span className="font-mono text-slate-300">{task.targetDate}</span></span>
                      )}
                    </div>

                    {task.status === 'Blocked' && task.blockerReason && (
                      <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 px-2.5 py-1 rounded mt-1.5 flex items-start gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Blocker:</strong> {task.blockerReason}</span>
                      </div>
                    )}

                    {blockerPromptTaskId === task.id && (
                      <div className="mt-2 p-2 rounded bg-slate-900 border border-rose-600/50 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Describe what is blocking this CCTV task..."
                          value={blockerReasonInput}
                          onChange={(e) => setBlockerReasonInput(e.target.value)}
                          className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-rose-500"
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => submitBlockerReason(task.id)}
                            className="text-xs px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                          >
                            Set Blocker
                          </button>
                          <button
                            onClick={() => setBlockerPromptTaskId(null)}
                            className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Pills / Changer */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                    {isInstaller ? (
                      (['Not started', 'In progress', 'Blocked', 'Done'] as TaskStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusClick(task, st)}
                          className={`text-xs px-2 py-1 rounded border transition cursor-pointer ${
                            task.status === st
                              ? statusColors[st] + ' font-bold shadow-sm'
                              : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded border font-semibold ${statusColors[task.status]}`}>
                        ● {task.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BLOCKERS TAB */}
        {activeTab === 'blockers' && (
          <div className="space-y-3">
            {project.blockers.filter(b => !b.resolved).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center gap-2">
                <Check className="w-8 h-8 text-emerald-500/50" />
                <span>No active blockers! All systems clear.</span>
              </div>
            ) : (
              project.blockers.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-lg border flex flex-col sm:flex-row justify-between gap-3 ${
                    b.resolved
                      ? 'border-slate-800 bg-slate-950/30 opacity-60'
                      : 'border-rose-500/40 bg-rose-950/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      <h4 className="text-sm font-semibold text-rose-200">{b.description}</h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Required Action:</strong> {b.unblockAction}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span>Owner: <span className="text-slate-200">{b.owner}</span></span>
                      <span>Since: <span className="font-mono text-slate-300">{b.since}</span></span>
                    </div>
                  </div>

                  {!b.resolved && (
                    <button
                      onClick={() => onResolveBlocker(b.id)}
                      className="self-start sm:self-center shrink-0 text-xs px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* RISKS TAB */}
        {activeTab === 'risks' && (
          <div className="space-y-3">
            {project.risks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No risks logged.
              </div>
            ) : (
              project.risks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <h4 className="text-sm font-medium text-slate-100">{risk.description}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`px-2 py-0.5 rounded uppercase font-mono font-semibold ${
                        risk.impact === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        risk.impact === 'med' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        Impact: {risk.impact}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        Likelihood: {risk.likelihood}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 space-y-1">
                    <div><strong>Signal:</strong> {risk.signal}</div>
                    <div><strong>Mitigation:</strong> {risk.mitigation}</div>
                    <div className="flex gap-4 pt-1 text-slate-400">
                      <span>Owner: <strong className="text-slate-300 font-normal">{risk.owner}</strong></span>
                      <span>Due: <span className="font-mono text-slate-300">{risk.dueDate || '(date not provided)'}</span></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* DECISIONS TAB */}
        {activeTab === 'decisions' && (
          <div className="space-y-3">
            {project.decisions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No formal decisions logged for this project yet.
              </div>
            ) : (
              project.decisions.map((d) => (
                <div key={d.id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-sky-300">{d.decision}</h4>
                    <span className="text-xs font-mono text-slate-400">{d.date}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Decision Maker(s):</strong> {d.decisionMaker}
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>What Changed:</strong> {d.whatChanged}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
