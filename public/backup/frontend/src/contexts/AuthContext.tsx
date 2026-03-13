import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, usersApi, apiClient, AuthResponse, ProfileDto } from '@/services/api';

type AppRole = 'admin' | 'seller' | 'customer';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  shop_image: string | null;
  free_delivery: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: { access_token: string } | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfileDto(dto: ProfileDto): Profile {
  return {
    id: dto.userId,
    user_id: dto.userId,
    full_name: dto.fullName,
    phone: dto.phone,
    avatar_url: dto.avatarUrl,
    shop_image: dto.shopImage,
    free_delivery: dto.freeDelivery,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('khetify_token');
      if (!token) {
        setLoading(false);
        return;
      }

      apiClient.setToken(token);

      try {
        const me = await authApi.getMe();
        const profileDto = await usersApi.getProfile();

        setUser({ id: me.id, email: profileDto.email || '' });
        setSession({ access_token: token });
        setProfile(mapProfileDto(profileDto));
        setRole(me.role as AppRole);
      } catch {
        // Token invalid/expired
        apiClient.setToken(null);
        localStorage.removeItem('khetify_token');
        localStorage.removeItem('khetify_refresh_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthResponse = async (response: AuthResponse) => {
    apiClient.setToken(response.token);
    localStorage.setItem('khetify_refresh_token', response.refreshToken);

    setUser({ id: response.user.id, email: response.user.email });
    setSession({ access_token: response.token });
    setRole(response.user.role as AppRole);

    try {
      const profileDto = await usersApi.getProfile();
      setProfile(mapProfileDto(profileDto));
    } catch {
      setProfile({
        id: response.user.id,
        user_id: response.user.id,
        full_name: response.user.fullName,
        phone: null,
        avatar_url: null,
        shop_image: null,
        free_delivery: null,
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, _role: AppRole) => {
    try {
      const response = await authApi.register({ email, password, fullName, phone });
      await handleAuthResponse(response);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      await handleAuthResponse(response);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    apiClient.setToken(null);
    localStorage.removeItem('khetify_token');
    localStorage.removeItem('khetify_refresh_token');
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
