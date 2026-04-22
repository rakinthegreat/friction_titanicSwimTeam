'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const darkMode = useUserStore((state) => state.preferences.darkMode);
  const setDarkMode = useUserStore((state) => state.setDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-3 rounded-2xl bg-card shadow-neo-out hover:scale-105 active:shadow-neo-in transition-all text-accent group"
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <Sun size={20} className="group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
