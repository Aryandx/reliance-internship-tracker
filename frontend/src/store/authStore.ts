import { create } from 'zustand';
import api from '../api/axios';

export type UserRole = 'HR' | 'MANAGER' | 'TECH_LEAD' | 'BUDDY' | 'INTERN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ token: accessToken, refreshToken, user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/register', data);
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ token: accessToken, refreshToken, user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null });
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null });
    }
  },
}));
