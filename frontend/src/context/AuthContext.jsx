import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext();
const SESSION_KEY = 'retailflow_auth_session';
const TOKEN_KEY   = 'retailflow_token';

export function AuthProvider({ children }) {
  const [user, setUser]              = useState(null);
  const [isAuthenticated, setIsAuth] = useState(false);
  const [isLoading, setIsLoading]    = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    try {
      const token   = localStorage.getItem(TOKEN_KEY);
      const session = localStorage.getItem(SESSION_KEY);
      if (token && session) {
        // Basic JWT expiry check (decode without verify — just read exp)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser(JSON.parse(session));
          setIsAuth(true);
        } else {
          // Token expired — clear
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Email + password → API → JWT stored locally
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/email-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        return {
          success: false,
          error:
            'The app could not read the server response. On Firebase Hosting, create frontend/.env.production with VITE_API_BASE_URL=https://YOUR-RENDER.onrender.com/api, then run npm run build and deploy again.',
        };
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed. Please try again.' };
      }

      const session = {
        id:    data.user.id,
        name:  data.user.name,
        email: data.user.email,
        role:  data.user.role,
      };

      localStorage.setItem(TOKEN_KEY,   data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      setIsAuth(true);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error:
          'Could not reach the API. Check that the backend is running on Render and that VITE_API_BASE_URL is set before building the frontend.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
