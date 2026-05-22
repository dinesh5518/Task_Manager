import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiClipboard,
  FiLayout,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useProfileStore } from '../../store/useProfileStore';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Dashboard', icon: FiHome, route: '/dashboard' },
  { label: 'Tasks', icon: FiClipboard, route: '/tasks' },
  { label: 'Kanban', icon: FiLayout, route: '/board' },
  { label: 'Analytics', icon: FiBarChart2, route: '/analytics' },
  { label: 'Profile', icon: FiUser, route: '/profile' },
  { label: 'Settings', icon: FiSettings, route: '/settings' },
];

const AppShell = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const profile = useProfileStore((state) => state.profile);

  const rootClass = isDarkMode ? 'min-h-screen bg-[#0f172a]' : 'min-h-screen bg-slate-100';
  const borderClass = 'border border-white/10';
  const displayName = profile?.name || user?.name || 'User';
  const avatar = profile?.avatar;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={rootClass}>
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className={clsx('glass flex min-h-[calc(100vh-40px)] flex-col gap-6 rounded-[32px] p-6 shadow-2xl shadow-slate-950/30', borderClass)}
          >
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-[#0f172a]/90 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Control Center</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Task Manager</h2>
              <p className="mt-2 text-sm text-slate-400">Profile, settings and workspace navigation.</p>
            </div>

            <nav className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.route;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.route)}
                    className={clsx(
                      'group flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition duration-200',
                      active
                        ? 'border-indigo-400/40 bg-indigo-500/15 text-white'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white'
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200 transition duration-200 group-hover:bg-violet-500/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
              >
                <span>Theme</span>
                {isDarkMode ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
              </button>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-400/30" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-rose-400/30 hover:bg-rose-500/10"
                    aria-label="Logout"
                  >
                    <FiLogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="flex flex-col gap-6"
          >
            {(title || subtitle) && (
              <div className={clsx('glass rounded-[32px] p-6 shadow-2xl shadow-slate-950/30', borderClass)}>
                {subtitle && <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{subtitle}</p>}
                {title && <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>}
              </div>
            )}
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
