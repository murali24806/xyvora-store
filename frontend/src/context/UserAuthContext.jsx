import React, { createContext, useContext } from 'react';

const UserAuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {}
});

export const useUserAuth = () => useContext(UserAuthContext);

export const UserAuthProvider = ({ children }) => {
  return (
    <UserAuthContext.Provider value={{ user: null, login: async () => {}, register: async () => {}, loginWithGoogle: async () => {}, logout: async () => {} }}>
      {children}
    </UserAuthContext.Provider>
  );
};