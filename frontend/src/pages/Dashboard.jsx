import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationCenter from '../components/NotificationCenter';
import { FiHome, FiClipboard, FiLayout, FiBarChart2, FiSettings, FiUser, FiLogOut, FiBell, FiSearch, FiMoon, FiSun, FiCheckCircle, FiClock, FiTrendingUp, FiArrowUpRight, FiPlus, FiEdit3, FiTrash2, FiCalendar } from 'react-icons/fi';
import { useThemeStore } from '../store/useThemeStore';
import { formatLocalDate, parseLocalDateTime } from '../utils/dateUtils';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import TaskModal from '../components/TaskModal';
import TaskDetailDrawer from '../components/TaskDetailDrawer';

const navItems = [
  { label: 'Dashboard', icon: FiHome, action: 'dashboard' },
  { label: 'Tasks', icon: FiClipboard, route: '/tasks' },
  { label: 'Kanban', icon: FiLayout, route: '/board' },
  { label: 'Analytics', icon: FiBarChart2, route: '/analytics' },
  { label: 'Profile', icon: FiUser, route: '/profile' },
  { label: 'Settings', icon: FiSettings, route: '/settings' },
];

const statusStyles = {
  PENDING: 'bg-amber-500/15 text-amber-200 border-amber-500/20',
  IN_PROGRESS: 'bg-sky-500/15 text-sky-200 border-sky-500/20',
  COMPLETED: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20',
};

const priorityStyles = {
  LOW: 'bg-emerald-500/10 text-emerald-200',
  MEDIUM: 'bg-sky-500/10 text-sky-200',
  HIGH: 'bg-violet-500/10 text-violet-200',
  URGENT: 'bg-rose-500/10 text-rose-200',
};

const dashboardCards = [
  { title: 'Total Tasks', key: 'total', icon: FiClipboard, gradient: 'from-violet-500 to-indigo-500' },
  { title: 'Completed Tasks', key: 'completed', icon: FiCheckCircle, gradient: 'from-emerald-500 to-sky-500' },
  { title: 'Pending Tasks', key: 'pending', icon: FiClock, gradient: 'from-amber-400 to-amber-600' },
  { title: 'Productivity', key: 'productivity', icon: FiTrendingUp, gradient: 'from-fuchsia-500 to-violet-500' },
];

const formatDate = (value) => formatLocalDate(value);

const scrollToSection = (target) => {
  const element = document.getElementById(target);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
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
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
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

  const rootClass = isDarkMode ? 'min-h-screen bg-[#0f172a]' : 'min-h-screen bg-slate-100';
  const borderClass = 'border border-white/10';
  const surfaceClass = 'glass rounded-[32px] ' + borderClass + ' p-6 shadow-2xl shadow-slate-950/30';

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchNotifications();
    scanDueNotifications().then((created) => {
      if (created?.length) {
        toast.warning(`You have ${created.length} new deadline alert${created.length === 1 ? '' : 's'}`);
      }
    });

    const interval = setInterval(async () => {
      const created = await scanDueNotifications();
      if (created?.length) {
        toast.warning(`You have ${created.length} new deadline alert${created.length === 1 ? '' : 's'}`);
      }
      fetchNotifications();
    }, 300000);

    return () => clearInterval(interval);
  }, [fetchNotifications, scanDueNotifications]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING').length;
  const productivity = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getTimestamp = (value) => {
    const dateValue = parseLocalDateTime(value);
    return dateValue ? dateValue.getTime() : Date.now();
  };

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => {
          const aDate = getTimestamp(a.updatedAt || a.createdAt || a.dueDate);
          const bDate = getTimestamp(b.updatedAt || b.createdAt || b.dueDate);
          return bDate - aDate;
        })
        .slice(0, 5),
    [tasks]
  );

  const upcomingDeadlines = useMemo(() => {
    const now = Date.now();
    return [...tasks]
      .filter((task) => {
        const due = task.dueDate ? getTimestamp(task.dueDate) : 0;
        return due && due >= now;
      })
      .sort((a, b) => getTimestamp(a.dueDate) - getTimestamp(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        iso: date.toISOString().slice(0, 10),
      };
    });

    return days.map((day) => {
      const dayTasks = tasks.filter((task) => (task.dueDate || task.createdAt || '').slice(0, 10) === day.iso);
      return {
        ...day,
        total: dayTasks.length,
        completed: dayTasks.filter((task) => task.status === 'COMPLETED').length,
      };
    });
  }, [tasks]);

  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#34d399' },
    { name: 'Pending', value: pendingTasks, color: '#f59e0b' },
    { name: 'In Progress', value: totalTasks - completedTasks - pendingTasks, color: '#38bdf8' },
  ];

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
      const matchesDueDate =
        !dueDateFilter || (task.dueDate || '').slice(0, 10) === dueDateFilter;

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

  const closeTaskDetail = () => {
    setDetailOpen(false);
  };

  const openEditFromDetail = (task) => {
    setEditingTask(task);
    setModalOpen(true);
    setDetailOpen(false);
  };

  const handleToggleNotifications = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!notificationsOpen) {
      try {
        await fetchNotifications();
        await scanDueNotifications();
      } catch (error) {
        console.error('Notification toggle failed:', error);
      }
    }

    setNotificationsOpen((prev) => !prev);
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
        closeTaskDetail();
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
      if (nextStatus === 'COMPLETED') {
        toast.success('Task completed');
      } else {
        toast('Task status updated');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update status');
    }
  };

  return (
    <div className={rootClass}>
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTask} initialTask={editingTask} />
      <TaskDetailDrawer
        open={detailOpen}
        task={detailTask}
        onClose={closeTaskDetail}
        onEdit={() => openEditFromDetail(detailTask)}
        onDelete={() => { if (detailTask) handleDelete(detailTask.id); }}
        onStatusChange={() => { if (detailTask) handleStatusToggle(detailTask); }}
      />
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={"glass flex min-h-[calc(100vh-40px)] flex-col gap-6 rounded-[32px] " + borderClass + " p-6 shadow-2xl shadow-slate-950/30"}
          >
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-[#0f172a]/90 p-5 shadow-lg shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Control Center</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Task Manager</h2>
              <p className="mt-2 text-sm text-slate-400">Premium analytics, tasks and deadlines in one place.</p>
            </div>

            <nav className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (item.route) {
                        navigate(item.route);
                        return;
                      }
                      scrollToSection(item.action);
                    }}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-200 transition duration-200 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200 transition duration-200 group-hover:bg-violet-500/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-left transition hover:opacity-90"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-700 dark:text-slate-400">Signed in as</p>
                  <p className="mt-2 text-sm font-semibold text-white">{user?.name || 'User'}</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition duration-200 hover:border-rose-400/30 hover:bg-rose-500/10"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div className={surfaceClass}>
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-700 dark:text-slate-400">Welcome back</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{`Hello, ${user?.name?.split(' ')[0] || 'Leader'}`}</h1>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-400 sm:text-base">Explore live task insights, deadlines, and productivity metrics.</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:brightness-110"
                  >
                    <FiPlus className="h-5 w-5" />
                    New Task
                  </button>
                  <div className="relative w-full sm:w-[320px]">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-indigo-400/40 focus:bg-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition duration-200 hover:border-indigo-400/30 hover:bg-indigo-500/10"
                  >
                    {isDarkMode ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={notificationsOpen}
                      onMouseDown={(event) => event.preventDefault()}
                    onClick={handleToggleNotifications}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition duration-200 hover:border-indigo-400/30 hover:bg-indigo-500/10"
                    >
                      <FiBell className="h-5 w-5" />
                      {notifications.filter((notification) => !notification.read).length > 0 && (
                        <span className="absolute right-0 top-0 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                          {notifications.filter((notification) => !notification.read).length}
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-indigo-400/40"
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-indigo-400/40"
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-indigo-400/40"
                />
                <div className="relative w-full">
                  <input
                    ref={dueDateFilterRef}
                    type="date"
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 pr-12 text-slate-100 outline-none transition duration-200 focus:border-indigo-400/40"
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
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-full p-2 text-slate-400 transition duration-200 hover:bg-white/10 hover:text-white"
                    aria-label="Open due-date picker"
                  >
                    <FiCalendar className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardCards.map((card, index) => {
                const Icon = card.icon;
                const value =
                  card.key === 'total'
                    ? totalTasks
                    : card.key === 'completed'
                    ? completedTasks
                    : card.key === 'pending'
                    ? pendingTasks
                    : `${productivity}%`;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="glass rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{card.title}</p>
                        <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
                      </div>
                      <div className={`grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br ${card.gradient} text-white shadow-lg shadow-slate-950/25`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-700 dark:text-slate-400">Modern overview of your task ecosystem.</p>
                  </motion.div>
                );
              })}
            </section>

            <section id="analytics" className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30"
              >
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Weekly Productivity</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Workload trend</h2>
                  </div>
                  <span className="rounded-3xl bg-slate-950/70 px-4 py-2 text-sm text-slate-300">Last 7 days</span>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={4} dot={{ fill: '#c084fc' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30"
              >
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Status Breakdown</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Task health</h2>
                  </div>
                  <span className="rounded-3xl bg-slate-950/70 px-4 py-2 text-sm text-slate-300">Live update</span>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={96} paddingAngle={4}>
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ color: '#cbd5e1', marginTop: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
              <motion.div
                id="tasks"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30"
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Task Inbox</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Your active tasks</h2>
                  </div>
                  <span className="rounded-3xl bg-slate-950/70 px-4 py-2 text-sm text-slate-300">{filteredTasks.length} items</span>
                </div>

                <div className="space-y-4">
                  {loading && <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-300">Loading tasks...</div>}
                  {!loading && filteredTasks.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-700/60 bg-slate-950/70 p-8 text-center text-slate-400">No tasks found. Create your first task to get started.</div>
                  )}
                  {!loading && filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openTaskDetail(task)}
                      className="cursor-pointer group rounded-[28px] border border-white/10 bg-slate-950/80 p-5 text-slate-100 transition duration-200 hover:border-indigo-400/30 hover:bg-slate-900/95"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">
                            <span>{task.category || 'General'}</span>
                            <span className={`rounded-full px-3 py-1 ${priorityStyles[task.priority] || 'bg-slate-700/70 text-slate-200'}`}>{task.priority || 'MEDIUM'}</span>
                          </div>
                          <h3 className="mt-3 text-xl font-semibold text-white">{task.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-400">{task.description || 'No description added yet.'}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${statusStyles[task.status] || 'border-slate-700/70 text-slate-300'}`}>{task.status || 'PENDING'}</span>
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                            <FiClock className="h-4 w-4 text-slate-400" /> {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-700/60 pt-4 text-sm text-slate-300">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditModal(task);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
                        >
                          <FiEdit3 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(task.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-rose-500/10 px-4 py-2 text-rose-200 transition hover:border-rose-400/30 hover:bg-rose-500/20"
                        >
                          <FiTrash2 className="h-4 w-4" /> Delete
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusToggle(task);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-slate-100 transition hover:bg-white/10"
                        >
                          <FiArrowUpRight className="h-4 w-4" /> {task.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                id="settings"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30"
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Upcoming Deadlines</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Urgent priorities</h2>
                  </div>
                  <span className="rounded-3xl bg-slate-950/70 px-4 py-2 text-sm text-slate-300">Focus mode</span>
                </div>

                <div className="space-y-4">
                  {upcomingDeadlines.length ? (
                    upcomingDeadlines.map((task) => (
                      <div key={task.id} className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 text-slate-100 transition duration-200 hover:border-fuchsia-400/30 hover:bg-slate-900/95">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                            <p className="mt-2 text-sm text-slate-400">Due {formatDate(task.dueDate)}</p>
                          </div>
                          <span className={`rounded-3xl px-4 py-2 text-sm font-semibold ${priorityStyles[task.priority] || 'bg-slate-700/70 text-slate-200'}`}>{task.priority || 'MEDIUM'}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/80 px-3 py-2 text-slate-200">{task.status || 'PENDING'}</span>
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-3 py-2 text-slate-200">{Math.max(0, Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000))} days left</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[28px] border border-dashed border-slate-700/60 bg-slate-950/70 p-8 text-center text-slate-400">No upcoming deadlines yet. Add a task to populate urgent items.</div>
                  )}
                </div>
              </motion.div>
            </section>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
