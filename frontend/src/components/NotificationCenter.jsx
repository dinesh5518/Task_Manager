import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiInfo, FiTrash2, FiX } from 'react-icons/fi';

const typeMeta = {
  SUCCESS: { label: 'Success', icon: FiCheckCircle, accent: 'bg-emerald-500/10 text-emerald-300' },
  WARNING: { label: 'Warning', icon: FiAlertTriangle, accent: 'bg-yellow-500/10 text-amber-300' },
  ERROR: { label: 'Error', icon: FiX, accent: 'bg-rose-500/10 text-rose-300' },
  INFO: { label: 'Info', icon: FiInfo, accent: 'bg-sky-500/10 text-sky-300' },
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationCenter = ({
  open,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClear,
}) => {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="fixed right-6 top-24 z-[9999] w-[min(100%,24rem)] max-w-md rounded-[32px] border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Notification center</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Premium alerts</h2>
              <p className="text-sm text-slate-400">Keep track of task updates, deadlines, and premium warnings.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-300 transition hover:bg-white/10"
              aria-label="Close notifications"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/70 px-4 py-2 text-sm text-slate-200">
              <FiClock className="h-4 w-4 text-slate-400" />
              {unreadCount} unread
            </span>
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-sm text-slate-400">
                No notifications yet. Your premium alerts will appear here.
              </div>
            ) : (
              notifications.map((notification) => {
                const meta = typeMeta[notification.type] || typeMeta.INFO;
                const Icon = meta.icon;
                return (
                  <div
                    key={notification.id}
                    className={`group flex flex-col gap-3 rounded-[28px] border border-white/10 p-4 transition ${notification.read ? 'bg-slate-950/80' : 'bg-slate-900/95 shadow-lg shadow-black/20'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${meta.accent}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{meta.label}</p>
                          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onMarkRead(notification.id)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300 transition hover:bg-white/10"
                      >
                        {notification.read ? 'Read' : 'Mark read'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDate(notification.createdAt)}</span>
                      {!notification.read && <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300">New</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NotificationCenter;
