import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface KanbanProgressProps {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  failedTasks: number;
  className?: string;
  onFilterClick?: (status: 'In progress' | 'Done' | 'Blocked' | 'All') => void;
}

export function KanbanProgress({
  totalTasks,
  inProgressTasks,
  completedTasks,
  failedTasks,
  className,
  onFilterClick,
}: KanbanProgressProps) {
  const safeTotal = totalTasks > 0 ? totalTasks : 1;

  const inProgressPct = totalTasks > 0 ? Math.round((inProgressTasks / safeTotal) * 100) : 0;
  const completedPct = totalTasks > 0 ? Math.round((completedTasks / safeTotal) * 100) : 0;
  const failedPct = totalTasks > 0 ? Math.round((failedTasks / safeTotal) * 100) : 0;

  const progressRows = [
    {
      id: 'in-progress',
      label: 'Task In Progress',
      count: inProgressTasks,
      percent: inProgressPct,
      trackColor: '#1677ff', // Ant Design primary blue from sketch
      bgColor: 'bg-[#1677ff]',
      status: 'In progress' as const,
    },
    {
      id: 'completed',
      label: 'Task Completed',
      count: completedTasks,
      percent: completedPct,
      trackColor: '#52c41a', // Ant Design success green from sketch
      bgColor: 'bg-[#52c41a]',
      status: 'Done' as const,
    },
    {
      id: 'failed',
      label: 'Task Failed',
      count: failedTasks,
      percent: failedPct,
      trackColor: '#ff4d4f', // Ant Design error red from sketch
      bgColor: 'bg-[#ff4d4f]',
      status: 'Blocked' as const,
    },
  ];

  return (
    <div
      className={cn(
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[24px] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-wide uppercase">
            Kanban Progress Overview
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            ({totalTasks} Total Tasks)
          </span>
        </div>
        {onFilterClick && (
          <button
            type="button"
            onClick={() => onFilterClick('All')}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {progressRows.map((row) => (
          <div
            key={row.id}
            onClick={() => onFilterClick?.(row.status)}
            className={cn(
              'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group transition-colors p-1.5 rounded-xl',
              onFilterClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''
            )}
          >
            <div className="w-36 shrink-0 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 font-sans">
                {row.label}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 sm:hidden">
                {row.count} ({row.percent}%)
              </span>
            </div>

            {/* Progress Rail and Track matching sketch spec */}
            <div className="flex-1 flex items-center gap-3">
              <div
                className="ant-progress-rail relative flex-1 h-2 rounded-full overflow-hidden bg-black/[0.06] dark:bg-white/[0.08]"
                style={{ height: '8px' }}
              >
                <motion.div
                  className={cn('ant-progress-track h-full rounded-full', row.bgColor)}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, row.percent))}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  style={{ backgroundColor: row.trackColor, height: '8px' }}
                />
              </div>

              <div className="hidden sm:flex items-center gap-1.5 w-24 justify-end font-mono shrink-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {row.count}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({row.percent}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanProgress;
