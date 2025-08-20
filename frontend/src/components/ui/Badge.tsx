import React from 'react';
import { clsx } from 'clsx';
import { TaskStatus, Priority } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'priority';
  status?: TaskStatus;
  priority?: Priority;
  className?: string;
}

const statusClasses = {
  [TaskStatus.PENDING]: 'status-pending',
  [TaskStatus.IN_PROGRESS]: 'status-in-progress',
  [TaskStatus.COMPLETED]: 'status-completed',
  [TaskStatus.BACKBURNER]: 'status-backburner',
};

const priorityClasses = {
  [Priority.LOW]: 'priority-low',
  [Priority.MEDIUM]: 'priority-medium',
  [Priority.HIGH]: 'priority-high',
  [Priority.CRITICAL]: 'priority-critical',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className,
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  let variantClasses = '';
  
  if (variant === 'status' && status) {
    variantClasses = statusClasses[status];
  } else if (variant === 'priority' && priority) {
    variantClasses = priorityClasses[priority];
  } else {
    variantClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }

  return (
    <span className={clsx(baseClasses, variantClasses, className)}>
      {children}
    </span>
  );
};