import { useCallback, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUIStore, type ThemeMode } from '../../stores/ui-store';

function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

export function ThemeToggle() {
  const themeMode = useUIStore((s) => s.themeMode);
  const setTheme = useUIStore((s) => s.setTheme);

  const effectiveTheme = useMemo(() => getEffectiveTheme(themeMode), [themeMode]);

  const isDark = effectiveTheme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  const handleToggle = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return (
    <button
      onClick={handleToggle}
      aria-label={label}
      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
