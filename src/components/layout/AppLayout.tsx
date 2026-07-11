import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../stores/ui-store';

export function AppLayout() {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-gray-500 hover:text-gray-700 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              AWS Cloud Practitioner
            </h2>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
