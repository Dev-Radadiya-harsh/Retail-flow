import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateCredentials } from '../data/users';

const AuthContext = createContext();

const AUTH_SESSION_KEY = 'retailflow_auth_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const savedSession = localStorage.getItem(AUTH_SESSION_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session && session.id && session.name && session.role) {
          setUser(session);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      localStorage.removeItem(AUTH_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (name, password) => {
    const validatedUser = validateCredentials(name, password);
    
    if (validatedUser) {
      // Create session
      const session = {
        id: validatedUser.id,
        name: validatedUser.name,
        role: validatedUser.role
      };

      // Save to state
      setUser(session);
      setIsAuthenticated(true);

      // Persist to localStorage
      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      } catch (error) {
        console.error('Failed to save session:', error);
      }

      return { success: true, user: session };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setIsAuthenticated(false);

    // Clear localStorage
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
