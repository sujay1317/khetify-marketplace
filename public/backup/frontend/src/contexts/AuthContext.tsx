import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, usersApi, apiClient, type ProfileDto } from '@/services/api';

type AppRole = 'admin' | 'seller' | 'customer';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: ProfileDto | null;
  role: AppRole | null;
  loading: boolean;
  session: { access_token: string } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authApi.me();
      setUser({ id: userData.id, email: userData.email });
      setRole(userData.role as AppRole);
      try {
        const profileData = await usersApi.getProfile();
        setProfile(profileData);
      } catch {
        setProfile(null);
      }
    } catch {
      apiClient.setToken(null);
      setUser(null);
      setRole(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    apiClient.setToken(response.token);
    setUser({ id: response.user.id, email: response.user.email });
    setRole(response.user.role as AppRole);
    try {
      const profileData = await usersApi.getProfile();
      setProfile(profileData);
    } catch {
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const response = await authApi.register({ email, password, fullName, phone });
    apiClient.setToken(response.token);
    setUser({ id: response.user.id, email: response.user.email });
    setRole(response.user.role as AppRole);
    try {
      const profileData = await usersApi.getProfile();
      setProfile(profileData);
    } catch {
      setProfile(null);
    }
  };

  const signOut = async () => {
    apiClient.setToken(null);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, role, loading,
      session: apiClient.getToken() ? { access_token: apiClient.getToken()! } : null,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};