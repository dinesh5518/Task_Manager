import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { FiArrowRight, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import AppShell from '../components/layout/AppShell';
import { useTaskStore } from '../store/useTaskStore';
import { useThemeStore } from '../store/useThemeStore';
import { useProfileStore } from '../store/useProfileStore';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import TaskModal from '../components/TaskModal';
import { formatLocalDate, getLocalDueDaysLeft } from '../utils/dateUtils';

const columns = [
  { key: 'PENDING', title: 'Todo', description: 'Backlog tasks ready to start' },
  { key: 'IN_PROGRESS', title: 'In Progress', description: 'Work currently in motion' },
  { key: 'COMPLETED', title: 'Completed', description: 'Tasks that are done' }
];

const priorityStyles = {
  URGENT: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  HIGH: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  MEDIUM: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  LOW: 'border-slate-500/30 bg-slate-500/10 text-slate-300'
};

const formatDate = (rawDate) => formatLocalDate(rawDate);

const getDueLabel = (rawDate) => {
  if (!rawDate) return 'No deadline';
  return getLocalDueDaysLeft(rawDate) || 'Invalid date';
};

const getNextStatus = (status) => {
  if (status === 'PENDING') return 'IN_PROGRESS';
  if (status === 'IN_PROGRESS') return 'COMPLETED';
  return 'PENDING';
};

const getActionLabel = (status) => {
  if (status === 'PENDING') return 'Start';
  if (status === 'IN_PROGRESS') return 'Complete';
  return 'Reopen';
};

const KanbanBoard = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const initTheme = useThemeStore((state) => state.initTheme);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    initTheme();
    fetchProfile().catch(() => {});
  }, [initTheme, fetchProfile]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const columnTasks = useMemo(
    () => ({
      PENDING: tasks.filter((task) => !task.status || task.status === 'PENDING'),
      IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
      COMPLETED: tasks.filter((task) => task.status === 'COMPLETED')
    }),
    [tasks]
  );

  const handleDragStart = (taskId) => (event) => {
    setDraggedTaskId(taskId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveColumn(null);
  };

  const handleDragOver = (event, columnKey) => {
    event.preventDefault();
    setActiveColumn(columnKey);
  };

  const handleDragLeave = () => {
    setActiveColumn(null);
  };

  const handleDrop = async (event, columnKey) => {
    event.preventDefault();
    setActiveColumn(null);
    const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === columnKey) return;

    setStatusSaving(true);
    try {
      await updateTask(taskId, { status: columnKey });
    } catch (err) {
      console.error('Kanban status update failed', err);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleStatusChange = async (task) => {
    const nextStatus = getNextStatus(task.status);
    setStatusSaving(true);
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      if (detailTask?.id === task.id) {
        setDetailTask(updated);
      }
      toast.success(nextStatus === 'COMPLETED' ? 'Task completed' : 'Task moved forward');
    } catch (err) {
      console.error('Kanban status update failed', err);
      toast.error(err?.response?.data?.message || err?.message || 'Unable to update task status');
    } finally {
      setStatusSaving(false);
    }
  };

  const openTaskDetail = (task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const closeTaskDetail = () => {
    setDetailOpen(false);
  };

  const openEditFromDetail = (task) => {
    setEditingTask(task);
    setModalOpen(true);
    setDetailOpen(false);
  };

  const handleSaveTask = async (taskData) => {
    if (!editingTask?.id) return;
    try {
      const updated = await updateTask(editingTask.id, taskData);
      if (detailTask?.id === editingTask.id) {
        setDetailTask(updated);
      }
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Unable to update task');
      throw err;
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      if (detailTask?.id === taskId) {
        closeTaskDetail();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Unable to delete task');
    }
  };

  return (
    <>
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTask} initialTask={editingTask} />
      <TaskDetailDrawer
        open={detailOpen}
        task={detailTask}
        onClose={closeTaskDetail}
        onEdit={() => openEditFromDetail(detailTask)}
        onDelete={() => { if (detailTask) handleDelete(detailTask.id); }}
        onStatusChange={() => { if (detailTask) handleStatusChange(detailTask); }}
      />
      <AppShell title="Premium task flow" subtitle="Kanban board">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass flex flex-col gap-4 rounded-[32px] border border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="max-w-2xl text-sm text-slate-400">
            Drag tasks across Todo, In Progress, and Completed. Status changes persist immediately and dashboard stats stay in sync.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchTasks}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
            >
              <FiRefreshCw className="h-4 w-4" /> Refresh
            </button>
            <span className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-300">
              {tasks.length} total tasks
            </span>
          </div>
        </motion.div>

        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {columns.map((column) => (
            <motion.div
              key={column.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onDragOver={(event) => handleDragOver(event, column.key)}
              onDrop={(event) => handleDrop(event, column.key)}
              onDragLeave={handleDragLeave}
              className={`rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 transition ${activeColumn === column.key ? 'ring-2 ring-indigo-500/40' : ''}`}
            >
              <div className="mb-6 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{column.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{column.description}</h2>
                </div>
                <span className="rounded-full bg-slate-900/70 px-3 py-1 text-sm text-slate-300">
                  {columnTasks[column.key]?.length ?? 0}
                </span>
              </div>

              <div className="space-y-4">
                {loading && (
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-400">Loading tasks…</div>
                )}
                {error && (
                  <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-6 text-sm text-rose-200">{error}</div>
                )}

                <AnimatePresence initial={false}>
                  {columnTasks[column.key]?.map((task) => (
                    <motion.article
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      draggable
                      onDragStart={handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openTaskDetail(task)}
                      className="cursor-pointer group overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-black/30 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${priorityStyles[task.priority || 'MEDIUM']}`}>
                            {task.priority || 'MEDIUM'}
                          </div>
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{task.category || 'General'}</p>
                        </div>
                        <span className="rounded-3xl bg-white/5 px-3 py-1 text-xs text-slate-300">{getDueLabel(task.dueDate)}</span>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">{task.title || 'Untitled task'}</h3>
                        <p className="text-sm leading-6 text-slate-400">{task.description || 'No description available yet.'}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                          <FiTrendingUp className="h-4 w-4 text-slate-400" />
                          {formatDate(task.dueDate)}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusChange(task);
                          }}
                          disabled={statusSaving}
                          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiArrowRight className="h-4 w-4" /> {getActionLabel(task.status)}
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>

                {!loading && columnTasks[column.key]?.length === 0 && (
                  <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-500">
                    Drag a task here or use the dashboard to add new cards.
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </AppShell>
    </>
  );
};

export default KanbanBoard;
