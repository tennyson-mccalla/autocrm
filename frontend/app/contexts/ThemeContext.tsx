'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function shouldUseDarkMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if it's nighttime (between 6 PM and 6 AM)
  const hour = new Date().getHours();
  const isNightTime = hour < 6 || hour >= 18;

  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return prefersDark || isNightTime;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved preference, use system/time preference
      setTheme(shouldUseDarkMode() ? 'dark' : 'light');
    }

    // Listen for system preference changes (only if no saved preference)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setTheme(shouldUseDarkMode() ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check every hour for time-based changes (only if no saved preference)
    const interval = setInterval(() => {
      if (!localStorage.getItem('theme')) {
        setTheme(shouldUseDarkMode() ? 'dark' : 'light');
      }
    }, 60 * 60 * 1000); // Every hour

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearInterval(interval);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Update HTML class when theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
