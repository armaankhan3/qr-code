import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem('auth_token', token);
    } else {
      setAuthToken(null);
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  // when token exists, try to load current user
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await api.get('/users/profile');
        if (!cancelled) setUser(res.data.user || null);
      } catch (e) {
        // invalid token or expired
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const login = ({ token: t, user: u }) => {
    setToken(t || null);
    setUser(u || null);
  };
  const logout = () => { setToken(null); setUser(null); };
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
