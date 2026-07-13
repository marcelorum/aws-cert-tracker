import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useUIStore } from './stores/ui-store';

function syncThemeClass(themeMode: 'light' | 'dark' | 'system') {
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function App() {
  const themeMode = useUIStore((s) => s.themeMode);

  // Sync theme class on mount and when themeMode changes
  useEffect(() => {
    syncThemeClass(themeMode);
  }, [themeMode]);

  // Listen for OS-level preference changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [themeMode]);

  return <RouterProvider router={router} />;
}
