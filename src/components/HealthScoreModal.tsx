import React from 'react';
import { X, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthScore } from '../types';

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: HealthScore;
  projectName: string;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({
  isOpen,
  onClose,
  healthScore,
  projectName
}) => {
  if (!isOpen) return null;

  const scoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 3) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const categories = [
    { label: 'Schedule', score: healthScore.schedule, desc: 'Pacing against milestones and deadlines' },
    { label: 'Delivery / Scope', score: healthScore.scope, desc: 'Ratio of completed cameras & tasks' },
    { label: 'Quality', score: healthScore.quality, desc: 'Hardware stability and signal assurance' },
    { label: 'Team / Resourcing', score: healthScore.resourcing, desc: 'Technician bandwidth and owner allocation' },
    { label: 'Risk / Dependencies', score: healthScore.risk, desc: 'Active blockers and supply/permit hazards' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Project Health Score</h3>
              <p className="text-xs text-slate-400">{projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Score Badge */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-slate-400 font-medium">Composite Score</span>
            <div className="text-2xl font-bold font-mono text-white">
              {healthScore.total} <span className="text-sm font-normal text-slate-400">/ 25</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${scoreColor(healthScore.total / 5)}`}>
            {healthScore.total >= 20 ? 'HIGH STABILITY' : healthScore.total >= 14 ? 'MODERATE RISK' : 'ELEVATED RISK'}
          </div>
        </div>

        {/* 5 Scoring Pillars */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium text-slate-200">{cat.label}</div>
                <div className="text-[11px] text-slate-400">{cat.desc}</div>
              </div>
              <div className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${scoreColor(cat.score)}`}>
                {cat.score} / 5
              </div>
            </div>
          ))}
        </div>

        {/* Facts vs Inferences (Step 3 Justification) */}
        <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-400 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> FACTS (Explicitly Verified)
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
              {healthScore.facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3.5 h-3.5" /> INFERENCES (Analytical Assessment)
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
              {healthScore.inferences.map((inf, i) => (
                <li key={i}>{inf}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
