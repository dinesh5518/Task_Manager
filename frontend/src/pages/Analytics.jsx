import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiArrowUpRight, FiCircle, FiClock, FiBell, FiCheckCircle, FiLayers, FiStar } from 'react-icons/fi';
import AppShell from '../components/layout/AppShell';
import { useTaskStore } from '../store/useTaskStore';
import { useThemeStore } from '../store/useThemeStore';
import { useProfileStore } from '../store/useProfileStore';
import { fetchAnalytics } from '../services/analyticsService';

const statusColors = ['#f59e0b', '#38bdf8', '#34d399'];
const priorityColors = ['#f97316', '#ef4444', '#8b5cf6', '#22c55e'];
const heatmapColors = ['#0f172a', '#1e293b', '#2563eb', '#7c3aed', '#c084fc'];

const Analytics = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const initTheme = useThemeStore((state) => state.initTheme);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const triggerKey = useMemo(() => [tasks.length, tasks.filter((task) => task.status === 'COMPLETED').length, tasks.filter((task) => task.status === 'PENDING').length].join('-'), [tasks]);

  useEffect(() => {
    initTheme();
    fetchProfile().catch(() => {});
  }, [initTheme, fetchProfile]);

  useEffect(() => {
    const source = fetchAnalytics();
    setLoading(true);
    setError(null);
    source.then((result) => {
      setAnalytics(result);
      setLoading(false);
    }).catch((err) => {
      setError(err?.response?.data?.message || err?.message || 'Unable to load analytics');
      setLoading(false);
    });
  }, [triggerKey]);

  const overview = analytics?.overview || {};
  const trends = analytics?.trends || {};
  const statusData = analytics?.status || [];
  const priorityData = analytics?.priority || [];
  const heatmapData = analytics?.heatmap?.data || [];
  const deadlines = analytics?.deadlines || {};
  const categories = analytics?.categories?.distribution || [];
  const recentActivity = analytics?.recentActivity || [];
  const performance = analytics?.performance || {};

  const totalScore = overview.productivityPercentage ?? 0;

  const heatmapScale = (count) => {
    if (count >= 4) return heatmapColors[4];
    if (count >= 2) return heatmapColors[3];
    if (count >= 1) return heatmapColors[2];
    return heatmapColors[1];
  };

  return (
    <AppShell title="Enterprise productivity insights" subtitle="Premium Analytics">
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass rounded-[32px] border border-white/10 p-6 shadow-2xl shadow-slate-950/30"
      >
        <p className="max-w-2xl text-sm text-slate-400">
          Actionable task analytics, heatmaps, trend signals and category intelligence for your premium workflow.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/80 px-5 py-4 shadow-xl shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Productivity</p>
            <p className="mt-3 text-3xl font-semibold text-white">{loading ? '...' : `${totalScore}%`}</p>
            <p className="mt-2 text-sm text-slate-400">Live completion gauge</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/80 px-5 py-4 shadow-xl shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Weekly rate</p>
            <p className="mt-3 text-3xl font-semibold text-white">{loading ? '...' : `${overview.weeklyCompletionRate ?? 0}%`}</p>
            <p className="mt-2 text-sm text-slate-400">Current work week</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-950/80 to-slate-900/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                <FiArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Trends</p>
                <p className="mt-1 text-lg font-semibold text-white">Real-time updates</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Productivity overview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Status and speed</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Updated live on task activity</div>
              </div>

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {loading ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-28 animate-pulse rounded-[28px] bg-slate-900/80" />
                )) : (
                  [
                    { label: 'Total tasks', value: overview.totalTasks, icon: <FiLayers className="h-5 w-5" />, accent: 'from-violet-500 to-indigo-500' },
                    { label: 'Completed', value: overview.completedTasks, icon: <FiCheckCircle className="h-5 w-5" />, accent: 'from-emerald-500 to-sky-500' },
                    { label: 'Pending', value: overview.pendingTasks, icon: <FiClock className="h-5 w-5" />, accent: 'from-amber-400 to-amber-600' },
                    { label: 'Overdue', value: overview.overdueTasks, icon: <FiBell className="h-5 w-5" />, accent: 'from-rose-500 to-fuchsia-500' }
                  ].map((item) => (
                    <div key={item.label} className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 sm:p-5">
                      <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-xs sm:tracking-[0.22em]" title={item.label}>
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{item.value ?? 0}</p>
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md sm:h-11 sm:w-11 ${item.accent} text-white`}>
                          {item.icon}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Productivity trends</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Daily and monthly performance</h2>
                </div>
                <span className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Trend horizon</span>
              </div>

              <div className="space-y-8">
                <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Daily completed tasks</p>
                      <h3 className="text-xl font-semibold text-white">Last 2 weeks</h3>
                    </div>
                    <div className="text-sm text-slate-400">Live activity</div>
                  </div>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends.dailyProductivity || []} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                        <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} labelStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="completed" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">Weekly productivity</p>
                        <h3 className="text-xl font-semibold text-white">6-week trend</h3>
                      </div>
                    </div>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends.weeklyProductivity || []} margin={{ top: 10, right: 14, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
                          <Area type="monotone" dataKey="completed" stroke="#38bdf8" fill="url(#weeklyGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">Monthly completion</p>
                        <h3 className="text-xl font-semibold text-white">6-month rhythm</h3>
                      </div>
                    </div>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trends.monthlyProductivity || []} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                          <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
                          <Bar dataKey="completed" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Task status analytics</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Pipeline health</h2>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[0.55fr_0.45fr]">
                <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="label" innerRadius={58} outerRadius={100} paddingAngle={4} stroke="transparent">
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${entry.label}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid gap-4">
                  {statusData.map((item) => (
                    <div key={item.label} className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 px-4 py-4 sm:px-5">
                      <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-xs sm:tracking-[0.22em]" title={item.label}>
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{item.value}</p>
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11"
                          style={{ backgroundColor: `${item.color}20`, color: item.color }}
                        >
                          <FiCircle className="h-5 w-5 shrink-0" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Task priority analytics</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Priority distribution</h2>
                </div>
              </div>
              <div className="space-y-4">
                {priorityData.map((item, idx) => (
                  <div key={item.label} className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                    <p className="truncate text-sm text-slate-400" title={item.label}>
                      {item.label}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p className="text-xl font-semibold tabular-nums text-white">{item.value}</p>
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <FiStar className="h-5 w-5 shrink-0" />
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
                      <div className="h-2 rounded-full" style={{ width: `${totalScore}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="grid gap-5">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Task heatmap</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Completion intensity</h2>
                </div>
                <div className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">{analytics?.heatmap?.bestStreak ?? 0} day streak</div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {heatmapData.length === 0 ? (
                    <div className="col-span-2 flex h-60 items-center justify-center text-slate-500">No activity tracked yet.</div>
                  ) : (
                    <div className="grid grid-cols-7 gap-2">
                      {heatmapData.map((cell) => (
                        <div key={cell.date} className="group relative">
                          <div className="h-12 w-12 rounded-xl border border-white/10" style={{ backgroundColor: heatmapScale(cell.count) }} />
                          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-md bg-slate-950/95 px-2 py-1 text-xs text-slate-100 shadow-xl group-hover:block">
                            {cell.date}: {cell.count} activity
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Weekly performance</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Consistency & speed</h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'This week', value: performance.tasksCompletedThisWeek, detail: 'Tasks completed' },
                  { label: 'Avg completion', value: `${performance.avgCompletionTimeHours ?? 0}h`, detail: 'Per completed task' },
                  { label: 'Best day', value: performance.mostProductiveDay, detail: 'Highest completion' },
                  { label: 'Consistency', value: `${performance.completionConsistency ?? 0}%`, detail: 'Active completion days' }
                ].map((item) => (
                  <div key={item.label} className="rounded-[28px] border border-white/10 bg-slate-900/70 px-5 py-6">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{item.label}</p>
                    <p className="mt-4 text-3xl font-semibold text-white">{item.value ?? '—'}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Upcoming deadlines</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Urgency dashboard</h2>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Due soon', value: deadlines.dueSoonCount, accent: 'bg-amber-500/10 text-amber-200' },
                      { label: 'Overdue', value: deadlines.overdueCount, accent: 'bg-rose-500/10 text-rose-200' },
                      { label: 'Today', value: deadlines.dueTodayCount, accent: 'bg-sky-500/10 text-sky-200' },
                      { label: 'This month', value: deadlines.dueThisMonthCount, accent: 'bg-violet-500/10 text-violet-200' }
                    ].map((item) => (
                      <div key={item.label} className={`rounded-[24px] border border-white/10 p-4 ${item.accent}`}>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{item.label}</p>
                        <p className="mt-3 text-2xl font-semibold text-white">{item.value ?? 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Upcoming tasks</p>
                  <div className="mt-4 space-y-3">
                    {deadlines.upcomingTasks?.length ? deadlines.upcomingTasks.map((task) => (
                      <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-white">{task.title}</p>
                          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">{task.priority}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">Due {task.dueDate}</p>
                      </div>
                    )) : (
                      <div className="text-slate-500">No urgent deadlines in the next three days.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Category analytics</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Workstream distribution</h2>
                </div>
                <span className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Top: {analytics?.categories?.mostActiveCategory ?? 'None'}</span>
              </div>
              <div className="space-y-4">
                {categories.length ? categories.slice(0, 5).map((item) => (
                  <div key={item.category} className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{item.category}</p>
                        <p className="mt-2 text-sm text-slate-400">{item.completed}/{item.total} completed</p>
                      </div>
                      <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">{item.completionRate}%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
                      <div className="h-2 rounded-full bg-sky-500" style={{ width: `${item.completionRate}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 text-slate-500">Category analytics will appear once tasks are organized.</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 }} className="glass rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Recent activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Latest productivity events</h2>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.length ? recentActivity.map((item) => (
              <div key={item.id} className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-400">{item.category} • {item.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{item.event}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.timestamp.replace('T', ' ')}</p>
                </div>
              </div>
            )) : (
              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 text-slate-500">No recent activity is available yet.</div>
            )}
          </div>
        </motion.section>
    </AppShell>
  );
};

export default Analytics;
