import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('auth_token'),
  );
  const [loading, setLoading] = useState(true); // START WITH TRUE TO AVOID FLICKER IF AUTHENTICATING

  const login = useCallback(async (credential) => {
    setLoading(true);
    try {
      const { user: userData } = await authService.googleSignIn(credential);
      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate the auth token on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, restoreSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
