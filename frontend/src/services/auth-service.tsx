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
      const response = await api.get('/auth/me');
      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', 'session_active');
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('user_name', response.data.name);
        localStorage.setItem('user_email', response.data.email);
        localStorage.setItem('user_id', response.data.id);
      }
      return response.data;
    } catch (error: any) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
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
    // Check if token exists before making request to avoid redundant me-calls
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      refreshProfile();
    } else {
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
