import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0',
  suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  draft: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-0',
  synced: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0',
  sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  free: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0',
  pro: 'bg-primary/10 text-primary border-0',
};

export default function StatusBadge({ status, label }) {
  return (
    <Badge className={`text-xs font-medium px-2.5 py-0.5 ${statusStyles[status] || statusStyles.active}`}>
      {label || status}
    </Badge>
  );
}