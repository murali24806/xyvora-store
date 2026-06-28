import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AdminAuthContext = createContext(null);
const TOKEN_KEY = 'xyvora_admin_token';

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = async (username, password) => {
    const { data } = await api.post('/auth/admin-login', { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
