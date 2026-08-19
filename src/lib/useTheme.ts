import { useCallback, useState } from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'revenue-reports-theme';

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark() ? 'dark' : 'light';
}

/**
 * Reads/writes an explicit theme choice. Until the user toggles, no
 * data-theme attribute is stamped on <html> and the page follows the OS
 * setting via prefers-color-scheme in index.css — toggling stamps an
 * explicit choice that always wins over the OS setting from then on.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

  return { theme, toggle };
}
