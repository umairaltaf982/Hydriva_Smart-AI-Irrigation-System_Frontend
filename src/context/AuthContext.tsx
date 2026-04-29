'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('hydriva_token', t);
    Cookies.set('hydriva_token', t, { expires: 7 });
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hydriva_token');
    Cookies.remove('hydriva_token');
  };

  const fetchMe = useCallback(async (t: string) => {
    try {
      const { data } = await axios.get(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(data);
      setToken(t);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('hydriva_token');
    if (t) { fetchMe(t); } else { setLoading(false); }
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${BASE}/auth/login`, { email, password });
    saveAuth(data.token, data.user);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const { data } = await axios.post(`${BASE}/auth/register`, { name, email, password, role });
    saveAuth(data.token, data.user);
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
