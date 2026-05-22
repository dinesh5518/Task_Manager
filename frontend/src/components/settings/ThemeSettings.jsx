import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useThemeStore } from '../../store/useThemeStore';
import { clsx } from 'clsx';

const ThemeSettings = ({ onPersist }) => {
  const { isDarkMode, setTheme } = useThemeStore();

  const selectTheme = (dark) => {
    setTheme(dark);
    onPersist?.(dark ? 'dark' : 'light');
  };

  const options = [
    { id: 'dark', label: 'Dark mode', icon: FiMoon, active: isDarkMode },
    { id: 'light', label: 'Light mode', icon: FiSun, active: !isDarkMode },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <motion.button
            key={option.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectTheme(option.id === 'dark')}
            className={clsx(
              'flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition duration-300',
              option.active
                ? 'border-indigo-400/50 bg-indigo-500/15 text-white shadow-lg shadow-indigo-900/20'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-indigo-400/30'
            )}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-medium">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ThemeSettings;
