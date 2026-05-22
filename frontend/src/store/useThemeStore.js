import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyThemeClass = (isDark) => {
  document.documentElement.classList.toggle('dark', isDark);
};

const readLegacyTheme = () => {
  try {
    const legacy = window.localStorage.getItem('dashboard-theme');
    if (legacy) return legacy === 'dark';
  } catch {
    // ignore
  }
  return true;
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: readLegacyTheme(),
      initialized: false,

      initTheme: () => {
        const { isDarkMode, initialized } = get();
        if (initialized) return;
        applyThemeClass(isDarkMode);
        set({ initialized: true });
      },

      setTheme: (isDark) => {
        applyThemeClass(isDark);
        try {
          window.localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
        } catch {
          // ignore
        }
        set({ isDarkMode: isDark });
      },

      toggleTheme: () => {
        const next = !get().isDarkMode;
        get().setTheme(next);
      },
    }),
    {
      name: 'app-theme',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeClass(state.isDarkMode);
        }
      },
    }
  )
);
