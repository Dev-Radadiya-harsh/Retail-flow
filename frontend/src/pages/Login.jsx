import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = { manager: '/manager', owner: '/owner', employee: '/employee' };

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isLoading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(ROLE_HOME[user.role] || '/employee', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email.trim()) { setError('Email is required'); return; }
    if (!formData.password.trim()) { setError('Password is required'); return; }

    setSubmitting(true);
    const result = await login(formData.email.trim(), formData.password);

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
    }
    // If success → onAuthStateChanged fires → isAuthenticated becomes true → useEffect above redirects
  };

  // Full-page loader while session is restored from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-600 mb-1">RetailFlow</h1>
          <p className="text-gray-500 text-sm">Retail Management System</p>
        </div>

        {/* Login Card */}
        <div className="card p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label block mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="label block mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-base"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Access is restricted to authorized users only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
