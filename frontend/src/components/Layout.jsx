import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  FileText, 
  User, 
  LogOut,
  Activity,
  Menu,
  X
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
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/targets', icon: Target, label: 'Targets' },
    { path: '/logs', icon: FileText, label: 'Logs' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-40 w-64 bg-white border-r-2 border-black transform transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 flex flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span className="text-lg font-bold">Uptime Monitor</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
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
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t-2 border-black p-4">
          <div className="flex items-center justify-between p-3 border-2 border-black bg-neo-gray">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="text-sm font-semibold">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-neo-red hover:text-white transition-colors border-2 border-black"
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
        <div className="lg:hidden bg-white border-b-2 border-black px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border-2 border-black"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span className="font-bold">Uptime</span>
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
    </div>
  );
};

export default Layout;