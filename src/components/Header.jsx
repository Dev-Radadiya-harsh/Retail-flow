import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ role, pageTitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  // Use actual logged-in user data
  const displayName = user?.name || 'User';
  const displayRole = user?.role === 'owner' ? 'Owner' : 'Employee';
  
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {displayName} ({displayRole})
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{displayRole} Portal</p>
          </div>
          
          {/* User Avatar */}
          <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-semibold text-base">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-outline text-sm px-4 py-2"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
