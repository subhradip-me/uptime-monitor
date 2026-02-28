import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  FileText, 
  User, 
  LogOut,
  Terminal,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/targets', icon: Target, label: 'targets' },
    { path: '/logs', icon: FileText, label: 'logs' },
  ];

  return (
    <div className="min-h-screen bg-term-bg text-term-green flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-40 w-64 bg-term-bg-light border-r border-term-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 flex flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-term-border bg-term-bg">
          <div className="flex items-center space-x-3">
            <Terminal className="h-5 w-5 text-term-green" />
            <div>
              <span className="text-sm font-bold text-term-white tracking-wider">UPTIME</span>
              <span className="text-xs text-term-green block">v2.0.0</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-term-gray hover:text-term-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Info */}
        <div className="px-4 py-3 border-b border-term-border">
          <div className="text-xs text-term-gray space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-term-green rounded-full animate-pulse"></span>
              <span>SYSTEM ONLINE</span>
            </div>
            <div>PID: {Math.floor(Math.random() * 9000) + 1000}</div>
            <div>UPTIME: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="px-4 mb-2 text-xs text-term-gray uppercase tracking-wider">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-term-border p-4">
          <div className="px-4 mb-2 text-xs text-term-gray uppercase tracking-wider">Session</div>
          <div className="flex items-center justify-between p-3 border border-term-border bg-term-bg">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-term-cyan" />
              <div>
                <span className="text-sm text-term-white">{user?.username}</span>
                <span className="text-xs text-term-gray block">{user?.role || 'operator'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-term-red hover:bg-term-red hover:text-term-bg transition-colors border border-term-red"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-term-bg-light border-b border-term-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border border-term-border text-term-green hover:bg-term-green hover:text-term-bg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-term-green" />
              <span className="font-bold text-term-white tracking-wider">UPTIME</span>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* CRT Scanline Effect */}
      <div className="scanline" />
    </div>
  );
};

export default Layout;
