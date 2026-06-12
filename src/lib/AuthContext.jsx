import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

const fetchProfile = async (userId) => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setUser(session.user);
        setProfile(prof);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setUser(session.user);
        setProfile(prof);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const prof = await fetchProfile(data.user.id);
    setUser(data.user);
    setProfile(prof);
    setIsAuthenticated(true);
    return { user: data.user, profile: prof };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const checkUserAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const prof = await fetchProfile(session.user.id);
      setUser(session.user);
      setProfile(prof);
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError: null,
      isAdmin: profile?.role === 'admin',
      isMerchant: profile?.role === 'merchant',
      merchantId: profile?.merchant_id ?? null,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
