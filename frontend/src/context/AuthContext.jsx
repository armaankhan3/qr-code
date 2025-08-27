import { createContext, useState, useContext, useEffect } from 'react';
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

  const login = ({ token: t, user: u }) => {
    setToken(t || null);
    setUser(u || null);
  };
  const logout = () => { setToken(null); setUser(null); };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
