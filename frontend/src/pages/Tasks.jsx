import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FiArrowUpRight,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiEdit3,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
} from 'react-icons/fi';
import AppShell from '../components/layout/AppShell';
import NotificationCenter from '../components/NotificationCenter';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import TaskModal from '../components/TaskModal';
import { priorityStyles, statusStyles, taskStatCards } from '../components/tasks/taskStyles';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProfileStore } from '../store/useProfileStore';
import { useTaskStore } from '../store/useTaskStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatLocalDate } from '../utils/dateUtils';

const formatDate = (value) => formatLocalDate(value);

const Tasks = () => {
  const initTheme = useThemeStore((state) => state.initTheme);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const dueDateFilterRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = useNotificationStore((state) => state.notifications);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const scanDueNotifications = useNotificationStore((state) => state.scanDueNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  useEffect(() => {
    initTheme();
    fetchProfile().catch(() => {});
    fetchTasks();
    fetchNotifications();
    scanDueNotifications().catch(() => {});
  }, [initTheme, fetchProfile, fetchTasks, fetchNotifications, scanDueNotifications]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING').length;
  const productivity = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statValues = {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    productivity: `${productivity}%`,
  };

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query);
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesCategory =
        !categoryFilter || task.category?.toLowerCase().includes(categoryFilter.trim().toLowerCase());
      const matchesDueDate = !dueDateFilter || (task.dueDate || '').slice(0, 10) === dueDateFilter;
      return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesDueDate;
    });
  }, [searchTerm, priorityFilter, statusFilter, categoryFilter, dueDateFilter, tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const openTaskDetail = (task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask?.id) {
        await updateTask(editingTask.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await addTask(taskData);
        toast.success('Task created successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to save task');
      throw error;
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      if (detailTask?.id === taskId) {
        setDetailOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to delete task');
    }
  };

  const handleStatusToggle = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const updated = await updateTask(task.id, { ...task, status: nextStatus });
      if (detailTask?.id === task.id) {
        setDetailTask(updated);
      }
      toast.success(nextStatus === 'COMPLETED' ? 'Task completed' : 'Task reopened');
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update status');
    }
  };

  const handleToggleNotifications = async () => {
    if (!notificationsOpen) {
      await fetchNotifications();
      await scanDueNotifications();
    }
    setNotificationsOpen((prev) => !prev);
  };

  const statIcons = {
    total: FiClipboard,
    completed: FiCheckCircle,
    pending: FiClock,
    productivity: FiTrendingUp,
  };

  return (
    <AppShell title="Task workspace" subtitle="Task management">
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTask} initialTask={editingTask} />
      <TaskDetailDrawer
        open={detailOpen}
        task={detailTask}
        onClose={() => setDetailOpen(false)}
        onEdit={() => openEditModal(detailTask)}
        onDelete={() => detailTask && handleDelete(detailTask.id)}
        onStatusChange={() => detailTask && handleStatusToggle(detailTask)}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {taskStatCards.map((card, index) => {
          const Icon = statIcons[card.key];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-[28px] border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{card.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{statValues[card.key]}</p>
                </div>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[32px] border border-white/10 p-6 shadow-2xl shadow-slate-950/30"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <p className="max-w-xl text-sm text-slate-400">
            Search, filter, and manage all your tasks in one premium workspace. Changes sync with dashboard and Kanban.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <FiPlus className="h-5 w-5" />
              New Task
            </button>
            <div className="relative w-full sm:w-[280px]">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400/40"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleNotifications}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
                aria-label="Notifications"
              >
                <FiBell className="h-5 w-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              <NotificationCenter
                open={notificationsOpen}
                notifications={notifications}
                onClose={() => setNotificationsOpen(false)}
                onMarkRead={markAsRead}
                onMarkAllRead={markAllAsRead}
                onClear={clearNotifications}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400/40"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter category"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400/40"
          />
          <div className="relative w-full">
            <input
              ref={dueDateFilterRef}
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-indigo-400/40"
            />
            <button
              type="button"
              onClick={() => {
                if (dueDateFilterRef.current?.showPicker) {
                  dueDateFilterRef.current.showPicker();
                } else {
                  dueDateFilterRef.current?.focus();
                }
              }}
              className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Open due-date picker"
            >
              <FiCalendar className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Task inbox</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Your active tasks</h2>
          </div>
          <span className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-300">Loading tasks...</div>
          )}
          {!loading && filteredTasks.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-700/60 bg-slate-950/70 p-8 text-center text-slate-400">
              No tasks found. Create your first task to get started.
            </div>
          )}
          {!loading &&
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.2) }}
                onClick={() => openTaskDetail(task)}
                className="group cursor-pointer rounded-[28px] border border-white/10 bg-slate-950/80 p-5 text-slate-100 transition duration-200 hover:border-indigo-400/30 hover:bg-slate-900/95"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                      <span>{task.category || 'General'}</span>
                      <span className={`rounded-full px-3 py-1 ${priorityStyles[task.priority] || 'bg-slate-700/70 text-slate-200'}`}>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-white">{task.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">{task.description || 'No description added yet.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${statusStyles[task.status] || 'border-slate-700/70 text-slate-300'}`}>
                      {task.status || 'PENDING'}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                      <FiClock className="h-4 w-4 text-slate-400" />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4 text-sm text-slate-300">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(task);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
                  >
                    <FiEdit3 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-rose-500/10 px-4 py-2 text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <FiTrash2 className="h-4 w-4" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(task);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 transition hover:bg-white/10"
                  >
                    <FiArrowUpRight className="h-4 w-4" />
                    {task.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.section>
    </AppShell>
  );
};

export default Tasks;
