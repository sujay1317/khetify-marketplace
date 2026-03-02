import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'seller' | 'customer';

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
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const clearPersistedAuthState = () => {
    try {
      const storageKeys = [
        ...Object.keys(localStorage),
        ...Object.keys(sessionStorage),
      ];

      storageKeys
        .filter((key) => key.includes('auth-token') || key.startsWith('sb-'))
        .forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
    } catch (error) {
      console.warn('Could not clear persisted auth state:', error);
    }
  };

  const resetAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session recovery error:', error);
          clearPersistedAuthState();
          await supabase.auth.signOut();
          resetAuthState();
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await fetchUserData(data.session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearPersistedAuthState();
        resetAuthState();
      }
    };

    void initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authUser: User) => {
    try {
      const userId = authUser.id;

      // Fetch or create profile
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profileData) {
        await supabase.from('profiles').insert({
          user_id: userId,
          full_name: authUser.user_metadata?.full_name ?? null,
          phone: authUser.user_metadata?.phone ?? null,
        });

        const { data: createdProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        profileData = createdProfile;
      }

      setProfile((profileData as Profile) ?? null);

      // Fetch or create role
      let { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const metadataRole = authUser.user_metadata?.role;
      const desiredRole: AppRole =
        metadataRole === 'seller' || metadataRole === 'admin' ? metadataRole : 'customer';

      if (!roleData && desiredRole !== 'admin') {
        await supabase.from('user_roles').insert({
          user_id: userId,
          role: desiredRole,
        });

        const { data: createdRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        roleData = createdRole;
      }

      setRole((roleData?.role as AppRole | undefined) ?? (desiredRole !== 'admin' ? desiredRole : null));
    } catch (error) {
      console.error('Error fetching user data:', error);

      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        clearPersistedAuthState();
        resetAuthState();
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          role: role
        }
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    clearPersistedAuthState();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      loading,
      signUp,
      signIn,
      signOut
    }}>
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
