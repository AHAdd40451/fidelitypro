import React, { createContext, useState, useContext, useEffect } from 'react';

const STORAGE_KEY = 'fidelitypro_auth';

const AuthContext = createContext();

const DEMO_USERS = {
  merchant: { id: 'u-merchant', name: 'Pierre Martin', email: 'merchant@demo.fr', role: 'merchant' },
  admin: { id: 'u-admin', name: 'Admin Principal', email: 'admin@demo.fr', role: 'admin' },
  superadmin: { id: 'u-super', name: 'Super Admin', email: 'super@demo.fr', role: 'superadmin' },
};

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const stored = loadStoredUser();
    if (stored) {
      setUser(stored);
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
    setAuthChecked(true);
  }, []);

  const login = async (email, password, role = 'merchant') => {
    const resolvedRole = role || 'merchant';
    const mockUser = DEMO_USERS[resolvedRole] ?? DEMO_USERS.merchant;
    const sessionUser = { ...mockUser, email: email || mockUser.email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsAuthenticated(true);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkUserAuth = () => {
    const stored = loadStoredUser();
    if (stored) {
      setUser(stored);
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError: null,
      login,
      logout,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
