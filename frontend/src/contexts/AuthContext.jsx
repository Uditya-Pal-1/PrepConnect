import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiUrl } from '../lib/data';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const cached = JSON.parse(localStorage.getItem('user')); return cached ? { ...cached, id: cached.id || cached._id } : null; }
    catch { return null; }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(apiUrl('/api/users/profile'), { credentials: 'include', headers: { Authorization: `Bearer ${token}` } })
        .then(async response => {
          if (response.status === 401) throw new Error('session-expired');
          if (!response.ok) return null;
          const profile = await response.json();
          profile.id = profile.id || profile._id;
          setUser(profile); localStorage.setItem('user', JSON.stringify(profile));
          return profile;
        })
        .catch(error => { if (error.message === 'session-expired') { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); } })
        .finally(() => setReady(true));
    } else setReady(true);
    const onExpired = () => { setUser(null); setReady(true); localStorage.removeItem('user'); localStorage.removeItem('token'); };
    window.addEventListener('skillbridge:session-expired', onExpired);
    return () => window.removeEventListener('skillbridge:session-expired', onExpired);
  }, []);

  const login = useCallback((userData, token) => {
    const normalized = { ...userData, id: userData.id || userData._id };
    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));
    if (token) localStorage.setItem("token", token);
  }, []);

  const logout = useCallback(() => {
    fetch(apiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const updateUser = useCallback((userData) => {
    const normalized = { ...userData, id: userData.id || userData._id };
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
