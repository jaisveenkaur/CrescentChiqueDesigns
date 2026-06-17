import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string, remember: boolean = false): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password, remember });
      const { user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', 'session_active');
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_name', user.name);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_id', user.id);
      }
      return response.data;
    } catch (error: any) {
      console.error(
        "POST /auth/login failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  register: async (data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    city: string;
    state: string;
    address?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error(
        "POST /auth/register failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      console.error(
        "POST /auth/logout failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
      }
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error(
        "GET /auth/profile failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data && response.data.user && typeof window !== 'undefined') {
        if (response.data.user.name) localStorage.setItem('user_name', response.data.user.name);
      }
      return response.data;
    } catch (error: any) {
      console.error(
        "PUT /auth/profile failed",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};
