import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  manager: [
    { name: 'All Shops', path: '/manager', icon: '🏪' },
  ],
  owner: [
    { name: 'Dashboard',     path: '/owner',    icon: '📊' },
    { name: 'Sales History', path: '/sales',    icon: '📋' },
    { name: 'My Team',       path: '/users',    icon: '👥' },
    { name: 'Settings',      path: '/settings', icon: '⚙️' },
  ],
  employee: [
    { name: 'Dashboard', path: '/employee', icon: '👤' },
  ],
};

const Sidebar = ({ role }) => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = role || user?.role;
  const navItems = NAV[userRole] || [];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600 tracking-tight">RetailFlow</h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">Retail Management System</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      {user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
