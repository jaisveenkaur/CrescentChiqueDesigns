'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { User, authService } from './auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (): Promise<User | null> => {
    try {
      console.log(`[AUTH CHECK] Checking active session via /auth/me...`);
      const response = await api.get('/auth/me');
      setUser(response.data);
      console.log(`[PROFILE LOADED] Successful user context: ${response.data.email}`);
      console.log(`[ROLE FOUND] User profile loaded with role: ${response.data.role}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('is_logged_in', 'true');
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('user_name', response.data.name);
        localStorage.setItem('user_email', response.data.email);
        localStorage.setItem('user_id', response.data.id);
      }
      return response.data;
    } catch (error: any) {
      console.error(`[SESSION FAILED] Profile refresh failed:`, error.response?.status, error.response?.data);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('is_logged_in');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`[AUTH CHECK] Checking local active session flag`);
    const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('is_logged_in') : null;
    if (isLoggedIn) {
      console.log(`[TOKEN FOUND / SESSION FOUND] Local login flag detected, fetching profile...`);
      refreshProfile();
    } else {
      console.log(`[AUTH CHECK] No active local session flag found`);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, remember: boolean = false) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password, remember);
      setUser(result.user);
      return result;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
