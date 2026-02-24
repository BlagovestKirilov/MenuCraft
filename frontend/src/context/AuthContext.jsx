import { createContext, useState, useCallback, useMemo } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const isAuthenticated = !!token;
  const isAdmin = role === 'ADMIN';

  const saveSession = useCallback((data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.role) {
      localStorage.setItem('role', data.role);
      setRole(data.role);
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      saveSession(data);
      return data;
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ token, role, isAuthenticated, isAdmin, login, logout }),
    [token, role, isAuthenticated, isAdmin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
