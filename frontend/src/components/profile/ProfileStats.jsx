import { motion } from 'framer-motion';
import { FiActivity, FiAward, FiCheckCircle, FiClipboard } from 'react-icons/fi';

const statCards = [
  { key: 'totalTasks', label: 'Total Tasks', icon: FiClipboard, gradient: 'from-violet-500 to-indigo-500' },
  { key: 'completedTasks', label: 'Completed', icon: FiCheckCircle, gradient: 'from-emerald-500 to-sky-500' },
  { key: 'productivityPercentage', label: 'Productivity', icon: FiAward, gradient: 'from-fuchsia-500 to-violet-500', suffix: '%' },
  { key: 'activeStreak', label: 'Active Streak', icon: FiActivity, gradient: 'from-amber-400 to-orange-500', suffix: ' days' },
];

const ProfileStats = ({ stats }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {statCards.map((card, index) => {
      const Icon = card.icon;
      const value = stats?.[card.key] ?? 0;
      return (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="glass rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {value}
                {card.suffix || ''}
              </p>
            </div>
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default ProfileStats;
