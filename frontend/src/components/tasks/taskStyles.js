export const statusStyles = {
  PENDING: 'bg-amber-500/15 text-amber-200 border-amber-500/20',
  IN_PROGRESS: 'bg-sky-500/15 text-sky-200 border-sky-500/20',
  COMPLETED: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20',
};

export const priorityStyles = {
  LOW: 'bg-emerald-500/10 text-emerald-200',
  MEDIUM: 'bg-sky-500/10 text-sky-200',
  HIGH: 'bg-violet-500/10 text-violet-200',
  URGENT: 'bg-rose-500/10 text-rose-200',
};

export const taskStatCards = [
  { title: 'Total Tasks', key: 'total', gradient: 'from-violet-500 to-indigo-500' },
  { title: 'Completed', key: 'completed', gradient: 'from-emerald-500 to-sky-500' },
  { title: 'Pending', key: 'pending', gradient: 'from-amber-400 to-amber-600' },
  { title: 'Productivity', key: 'productivity', gradient: 'from-fuchsia-500 to-violet-500' },
];
