import { NavLink } from 'react-router';
import { LayoutDashboard, CheckSquare, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/ui-store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0',
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-brand-600">CLF Tracker</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">AWS CLF-C02 Tracker</p>
        </div>
      </aside>
    </>
  );
}
