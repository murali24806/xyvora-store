import React, { createContext, useContext } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  return (
    <AdminAuthContext.Provider
      value={{
        token: 'admin_bypass',
        adminToken: 'admin_bypass',
        isAuthenticated: true,
        login: async () => ({ token: 'admin_bypass' }),
        logout: () => {}
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};