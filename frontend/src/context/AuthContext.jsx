import { createContext, useContext, useState, useEffect } from 'react';
import { studentApi, driverApi, adminApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const [studentRes, driverRes, adminRes] = await Promise.allSettled([
        studentApi.getStatus(),
        driverApi.getStatus(),
        adminApi.getStatus(),
      ]);

      if (studentRes.status === 'fulfilled' && studentRes.value.role === 'student') {
        setUser({ ...studentRes.value, role: 'student' });
      } else if (driverRes.status === 'fulfilled' && driverRes.value.role === 'driver') {
        setUser(driverRes.value);
      } else if (adminRes.status === 'fulfilled' && adminRes.value.role === 'admin') {
        setUser(adminRes.value);
      }
    } catch (e) {
      // Not logged in
    } finally {
      setLoading(false);
    }
  }

  async function login(role, username, password) {
    let res;
    if (role === 'student') res = await studentApi.login(username, password);
    else if (role === 'driver') res = await driverApi.login(username, password);
    else if (role === 'admin') res = await adminApi.login(username, password);

    if (!res || !res.role) {
      throw new Error('Login failed: invalid response');
    }
    setUser(res);
    return res;
  }

  async function logout() {
    if (user?.role === 'student') await studentApi.logout();
    else if (user?.role === 'driver') await driverApi.logout();
    else if (user?.role === 'admin') await adminApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}