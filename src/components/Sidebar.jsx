import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Use user from AuthContext if role prop not provided
  const userRole = role || user?.role;

  const navigation = [
    {
      name: 'Owner Dashboard',
      path: ROUTES.OWNER_DASHBOARD,
      icon: '📊',
      role: 'owner'
    },
    {
      name: 'Employee Dashboard',
      path: ROUTES.EMPLOYEE_DASHBOARD,
      icon: '👤',
      role: 'employee'
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => item.role === userRole);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600 tracking-tight">RetailFlow</h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">Retail Management System</p>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
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
    </div>
  );
};

export default Sidebar;
