import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      mode: 'system',
      resolvedTheme: 'light',

      // Actions
      setTheme: (mode) => {
        const resolvedTheme = resolveTheme(mode);
        set({ mode, resolvedTheme });
        applyTheme(resolvedTheme);
      },

      toggleTheme: () => {
        const { mode } = get();
        if (mode === 'system') {
          // If system, switch to opposite of current resolved theme
          const systemTheme = getSystemTheme();
          const newMode = systemTheme === 'dark' ? 'light' : 'dark';
          get().setTheme(newMode);
        } else {
          // Toggle between light and dark
          const newMode = mode === 'light' ? 'dark' : 'light';
          get().setTheme(newMode);
        }
      },

      initializeTheme: () => {
        const { mode } = get();
        const resolvedTheme = resolveTheme(mode);
        set({ resolvedTheme });
        applyTheme(resolvedTheme);

        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            const currentMode = get().mode;
            if (currentMode === 'system') {
              const newResolvedTheme = getSystemTheme();
              set({ resolvedTheme: newResolvedTheme });
              applyTheme(newResolvedTheme);
            }
          };

          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'focusflow-theme',
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
  )
);