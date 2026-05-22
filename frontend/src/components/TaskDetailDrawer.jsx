import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiEdit3, FiTrash2, FiCheckCircle, FiClock, FiTag, FiChevronRight, FiCalendar, FiLayers, FiRefreshCw } from 'react-icons/fi';
import { useEffect } from 'react';
import { formatLocalDateTime } from '../utils/dateUtils';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return formatLocalDateTime(value);
};

const getActivityEvents = (task) => {
  const events = [];

  if (task.createdAt) {
    events.push({
      title: 'Task created',
      timestamp: formatDateTime(task.createdAt),
      description: 'Initial task record added to the system.',
      icon: FiLayers,
    });
  }

  if (task.updatedAt && task.updatedAt !== task.createdAt) {
    events.push({
      title: 'Task updated',
      timestamp: formatDateTime(task.updatedAt),
      description: 'Task details or status were modified.',
      icon: FiRefreshCw,
    });
  }

  if (task.status === 'COMPLETED') {
    events.push({
      title: 'Task completed',
      timestamp: task.updatedAt ? formatDateTime(task.updatedAt) : formatDateTime(task.dueDate),
      description: 'Task was marked complete and moved off the active pipeline.',
      icon: FiCheckCircle,
    });
  } else {
    events.push({
      title: `Status: ${task.status || 'PENDING'}`,
      timestamp: formatDateTime(task.updatedAt || task.createdAt),
      description: 'Current workflow state for this task.',
      icon: FiChevronRight,
    });
  }

  return events;
};

const statusSteps = [
  { key: 'PENDING', label: 'Todo' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

const TaskDetailDrawer = ({ open, task, onClose, onEdit, onDelete, onStatusChange }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !task) return null;

  const activityEvents = getActivityEvents(task);
  const currentStatusIndex = statusSteps.findIndex((step) => step.key === (task.status || 'PENDING'));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex justify-end overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          type="button"
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          aria-label="Close task detail drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.section
          className="relative z-10 flex h-full w-full max-w-[560px] flex-col overflow-y-auto bg-slate-950/95 p-6 shadow-2xl shadow-black/40 sm:w-[min(48vw,560px)]"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Task details</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{task.title || 'Untitled task'}</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-400">Premium task summary with live status, timeline, and activity insights.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-black/10">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Information</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl bg-slate-950/50 p-4">
                  <p className="text-sm font-medium text-slate-400">Category</p>
                  <p className="mt-2 text-base font-semibold text-white">{task.category || 'General'}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/50 p-4">
                    <p className="text-sm font-medium text-slate-400">Priority</p>
                    <p className="mt-2 text-base font-semibold text-white">{task.priority || 'MEDIUM'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/50 p-4">
                    <p className="text-sm font-medium text-slate-400">Status</p>
                    <p className="mt-2 text-base font-semibold text-white">{task.status || 'PENDING'}</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-950/50 p-4">
                  <p className="text-sm font-medium text-slate-400">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(task.tags || []).length ? (
                      task.tags.map((tag) => (
                        <span key={tag} className="rounded-2xl bg-white/5 px-3 py-1 text-sm text-slate-200">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-2xl bg-white/5 px-3 py-1 text-sm text-slate-400">No tags assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-black/10">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Dates</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-slate-950/50 p-4">
                  <p className="text-sm font-medium text-slate-400">Created</p>
                  <p className="mt-2 text-base font-semibold text-white">{formatDateTime(task.createdAt)}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/50 p-4">
                  <p className="text-sm font-medium text-slate-400">Updated</p>
                  <p className="mt-2 text-base font-semibold text-white">{formatDateTime(task.updatedAt)}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/50 p-4">
                  <p className="text-sm font-medium text-slate-400">Due</p>
                  <p className="mt-2 text-base font-semibold text-white">{formatDateTime(task.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-black/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Activity</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Recent task events</h3>
                </div>
                <FiClock className="h-6 w-6 text-slate-400" />
              </div>
              <div className="mt-6 space-y-4">
                {activityEvents.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.title + event.timestamp} className="rounded-3xl bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-300">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{event.title}</p>
                            <p className="text-sm text-slate-400">{event.description}</p>
                          </div>
                        </div>
                        <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{event.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-black/10">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status timeline</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Workflow progress</h3>
              <div className="mt-6 space-y-4">
                {statusSteps.map((step, index) => {
                  const active = index <= currentStatusIndex;
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900/80">
                        <div className={`h-3.5 w-3.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                        {index < statusSteps.length - 1 && (
                          <span className="absolute right-[-1.8rem] top-1/2 h-px w-14 bg-slate-700/80" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-white">{step.label}</p>
                        <p className="text-sm text-slate-400">{active ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-indigo-500/15 px-5 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
              >
                <FiEdit3 className="h-4 w-4" /> Edit Task
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
              >
                <FiTrash2 className="h-4 w-4" /> Delete
              </button>
              <button
                type="button"
                onClick={onStatusChange}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <FiCheckCircle className="h-4 w-4" /> Mark Complete
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailDrawer;
