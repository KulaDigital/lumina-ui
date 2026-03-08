import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { authApi } from '../api';

export interface UserRole {
  role: 'super_admin' | 'client';
  clientId?: number | string;
  userName?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  authLoading: boolean;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [fetchedRoleForSession, setFetchedRoleForSession] = useState<string | null>(null);

  // Fetch user role from backend
  const fetchUserRole = async (sessionId?: string) => {
    setRoleLoading(true);
    try {
      const response = await authApi.getMe(true);
      const { role, client_id, user_name } = response;
      setUserRole({ role, clientId: client_id, userName: user_name });
      // Track that we've fetched the role for this session
      if (sessionId) {
        setFetchedRoleForSession(sessionId);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setUserRole(null);
    } finally {
      setRoleLoading(false);
    }
  };

  // Initialize session on mount and refresh
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isComponentMounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        
        if (!isComponentMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Fetch role if session exists and we haven't fetched it for this session yet
        if (currentSession?.access_token) {
          const sessionId = currentSession.user?.id;
          if (sessionId !== fetchedRoleForSession) {
            await fetchUserRole(sessionId);
          }
        }

        // Listen to auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event: string, newSession: any) => {
          if (!isComponentMounted) return;
          
          setSession(newSession);
          setUser(newSession?.user || null);

          if (newSession?.access_token) {
            const sessionId = newSession.user?.id;
            // Only fetch role if this is a new session we haven't fetched for
            if (sessionId !== fetchedRoleForSession) {
              await fetchUserRole(sessionId);
            }
          } else {
            setUserRole(null);
            setFetchedRoleForSession(null);
          }
        });

        // Store unsubscribe function to be called on cleanup
        unsubscribe = () => subscription?.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isComponentMounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    // Return cleanup function that unsubscribes from auth listener
    return () => {
      isComponentMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchedRoleForSession]);

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setUserRole(null);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, authLoading, roleLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
