import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Login dummy disimpan di state/context (tanpa localStorage sesuai permintaan)
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inisialisasi cek sesi saat awal render
    const initAuth = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message || 'Terjadi kesalahan sistem' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}

export default useAuth;
