import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickLogin: (role: 'STUDENT' | 'ADMIN' | 'VALIDATOR') => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type StoredUser = User & {
  fullName?: string;
  universityId?: string;
  isActive?: boolean;
};

const normalizeStoredUser = (user: StoredUser): User => ({
  ...user,
  name: user.name || user.fullName || 'Pengguna',
  userId: user.userId || user.universityId,
  status:
    user.status || (user.isActive === undefined ? undefined : user.isActive ? 'AKTIF' : 'NONAKTIF'),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);



  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const restoredToken = await api.restoreSession();
        if (!restoredToken || !isMounted) return;
        setToken(restoredToken);
        const res = await api.getProfile();
        if (res.success && isMounted) {
          setUser(normalizeStoredUser(res.data));
        }
      } catch {
        api.setAccessToken(null);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        api.setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        setToken(response.data.accessToken);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: 'STUDENT' | 'ADMIN' | 'VALIDATOR') => {
    const emailMap = {
      STUDENT: 'student@university.edu',
      ADMIN: 'admin@university.edu',
      VALIDATOR: 'validator1@university.edu',
    };
    await login(emailMap[role], 'password123');
  };

  const logout = () => {
    api.logout().catch(() => {});
    setUser(null);
    setToken(null);

  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role.toUpperCase() === role.toUpperCase();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Persist to backend mock so it survives relogin
      api.updateUser(user.id, updates).catch((err) => {
        console.error('Failed to update user profile in backend:', err);
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickLogin,
        logout,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
