import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/theme';
import { clsx } from 'clsx';

export const ThemeToggle: React.FC = () => {
  const { mode, setTheme } = useThemeStore();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center bg-background-secondary rounded-element p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={clsx(
            'relative flex items-center justify-center w-8 h-8 rounded transition-colors',
            mode === value
              ? 'bg-primary-500 text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={label}
        >
          <Icon size={16} />
          {mode === value && (
            <motion.div
              className="absolute inset-0 bg-primary-500 rounded"
              layoutId="theme-toggle-bg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Icon size={16} className="relative z-10" />
        </motion.button>
      ))}
    </div>
  );
};