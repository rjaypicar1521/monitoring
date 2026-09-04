'use client';

import * as React from 'react';
import { RotateCcw, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string | number;
  title: string;
  subtitle?: string;
  time?: string;
  count?: number;
  type?: 'alert' | 'success' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'NPM Install Complete',
    subtitle: '1,227 packages added!',
    time: 'just now',
    count: 2,
  },
  {
    id: 2,
    title: 'Build Succeeded',
    subtitle: 'Build finished in 12.34s',
    time: '1m 11s',
  },
  {
    id: 3,
    title: 'Lint Passed',
    subtitle: 'No problems found',
    time: '5m',
  },
];

const transition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
};

const getCardVariants = (i: number) => ({
  collapsed: {
    marginTop: i === 0 ? 0 : -44,
    scaleX: 1 - Math.min(i, 4) * 0.04,
  },
  expanded: {
    marginTop: i === 0 ? 0 : 6,
    scaleX: 1,
  },
});

const textSwitchTransition: Transition = {
  duration: 0.22,
  ease: 'easeInOut',
};

const notificationTextVariants = {
  collapsed: { opacity: 1, y: 0, pointerEvents: 'auto' },
  expanded: { opacity: 0, y: -16, pointerEvents: 'none' },
};

const viewAllTextVariants = {
  collapsed: { opacity: 0, y: 16, pointerEvents: 'none' },
  expanded: { opacity: 1, y: 0, pointerEvents: 'auto' },
};

export interface NotificationListProps {
  notifications?: NotificationItem[];
  title?: string;
  onViewAll?: () => void;
  className?: string;
}

function NotificationList({
  notifications = defaultNotifications,
  title = 'Notifications',
  onViewAll,
  className,
}: NotificationListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const displayList = notifications && notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <motion.div
      className={cn(
        'bg-neutral-100 dark:bg-neutral-900 p-3.5 rounded-3xl w-80 space-y-3 shadow-xl select-none border border-neutral-200/80 dark:border-neutral-800',
        className
      )}
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      whileHover="expanded"
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      <div className="pt-1 max-h-[380px] overflow-y-auto overflow-x-hidden pr-0.5">
        {displayList.map((notification, i) => (
          <motion.div
            key={notification.id}
            className={cn(
              'rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow duration-200 relative border border-transparent',
              notification.type === 'alert'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60 text-amber-950 dark:text-amber-100'
                : notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100'
                : 'bg-white dark:bg-neutral-800 border-neutral-200/60 dark:border-neutral-700/60 text-neutral-900 dark:text-neutral-100'
            )}
            variants={getCardVariants(i)}
            transition={transition}
            style={{
              zIndex: displayList.length - i,
            }}
          >
            <div className="flex justify-between items-center gap-2">
              <h1 className="text-xs font-semibold truncate flex items-center gap-1.5">
                {notification.type === 'alert' && (
                  <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
                )}
                {notification.type === 'success' && (
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                )}
                <span className="truncate">{notification.title}</span>
              </h1>
              {notification.count !== undefined && (
                <div className="flex items-center text-[10px] gap-0.5 font-medium text-neutral-500 dark:text-neutral-300 shrink-0">
                  <RotateCcw className="size-2.5" />
                  <span>{notification.count}</span>
                </div>
              )}
            </div>
            {notification.subtitle && (
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5 truncate">
                {notification.time && <span>{notification.time}&nbsp;•&nbsp;</span>}
                <span>{notification.subtitle}</span>
              </div>
            )}
            {notification.actionLabel && notification.onAction && (
              <div className="mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.onAction?.();
                  }}
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  {notification.actionLabel}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-full bg-neutral-400 text-white text-xs flex items-center justify-center font-semibold">
            {displayList.length}
          </div>
          <span className="grid">
            <motion.span
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 row-start-1 col-start-1"
              variants={notificationTextVariants}
              transition={textSwitchTransition}
            >
              {title}
            </motion.span>
            <motion.span
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 cursor-pointer select-none row-start-1 col-start-1 hover:text-black dark:hover:text-white"
              variants={viewAllTextVariants}
              transition={textSwitchTransition}
              onClick={(e) => {
                if (onViewAll) {
                  e.stopPropagation();
                  onViewAll();
                }
              }}
            >
              View all <ArrowUpRight className="size-3.5" />
            </motion.span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export { NotificationList };
export default NotificationList;
