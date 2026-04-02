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
    { name: 'Bills',         path: '/bills',    icon: '🧾' },
    { name: 'My Team',       path: '/users',    icon: '👥' },
    { name: 'Settings',      path: '/settings', icon: '⚙️' },
  ],
  employee: [
    { name: 'Dashboard', path: '/employee', icon: '👤' },
    { name: 'My Bills',  path: '/bills',    icon: '🧾' },
  ],
};

const Sidebar = ({ role, collapsed = false, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = role || user?.role;
  const navItems = NAV[userRole] || [];

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300`}
    >
      {/* Brand */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-2">
          <div className={`${collapsed ? 'w-full text-center' : ''}`}>
            <h1 className={`font-bold text-primary-600 tracking-tight ${collapsed ? 'text-lg' : 'text-2xl'}`}>
              {collapsed ? 'RF' : 'RetailFlow'}
            </h1>
            {!collapsed && (
              <p className="text-xs text-gray-500 mt-1.5 font-medium">Retail Management System</p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md px-2 py-1 text-sm"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '⟩' : '⟨'}
          </button>
        </div>
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
                className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <span className={`text-lg ${collapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                {!collapsed && item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      {user && (
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2`}>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
