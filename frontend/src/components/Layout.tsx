import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/entry', label: 'New Entry', icon: '✨' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/chart', label: 'Chart', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-lavender-500 flex items-center justify-center shadow-soft group-hover:shadow-glow-rose transition-shadow duration-300">
                <span className="text-xl">🌸</span>
              </div>
              <span className="font-bold text-xl text-warm-800 hidden sm:block">
                Symptothermie
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link flex items-center gap-2 ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-warm-500 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 font-medium"
            >
              <span className="text-lg">👋</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
