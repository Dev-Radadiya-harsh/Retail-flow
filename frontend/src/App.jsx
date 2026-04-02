import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserManagement from './pages/UserManagement';
import SalesHistory from './pages/SalesHistory';
import BillsHistory from './pages/BillsHistory';
import Settings from './pages/Settings';
import ManagerDashboard from './pages/ManagerDashboard';

const ROLE_HOME = {
  manager:  '/manager',
  owner:    '/owner',
  employee: '/employee',
};

function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        navigate(ROLE_HOME[user.role] || '/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-500 text-sm">Loading RetailFlow...</p>
        </div>
      </div>
    );
  }
  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected — all roles */}
              <Route element={<ProtectedRoute />}>
                {/* Manager */}
                <Route path="/manager"  element={<ManagerDashboard />} />

                {/* Owner */}
                <Route path="/owner"    element={<OwnerDashboard />} />
                <Route path="/sales"    element={<SalesHistory />} />
                <Route path="/bills"    element={<BillsHistory />} />
                <Route path="/users"    element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />

                {/* Employee */}
                <Route path="/employee" element={<EmployeeDashboard />} />
              </Route>

              <Route path="/"  element={<RootRedirect />} />
              <Route path="*"  element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
