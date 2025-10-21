import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: 'driver' | 'admin';
  full_name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDriver: boolean;
  isAdmin: boolean;
}

export const useAuth = (requiredRole?: 'driver' | 'admin') => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    isDriver: false,
    isAdmin: false,
  });

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
            isDriver: false,
            isAdmin: false,
          });
          if (requiredRole) {
            navigate('/auth');
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [requiredRole, navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
          isDriver: false,
          isAdmin: false,
        });
        
        if (requiredRole) {
          navigate('/auth');
        }
        return;
      }

      // Get user profile with role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load user profile');
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
          isDriver: false,
          isAdmin: false,
        });
        return;
      }

      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        role: profile.role,
        full_name: profile.full_name || '',
      };

      const isDriver = profile.role === 'driver';
      const isAdmin = profile.role === 'admin';

      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
        isDriver,
        isAdmin,
      });

      // Role-based access control
      if (requiredRole && profile.role !== requiredRole) {
        toast.error(`Access denied. This page is for ${requiredRole}s only.`);
        
        // Redirect based on actual role
        if (profile.role === 'admin') {
          navigate('/admin');
        } else if (profile.role === 'driver') {
          navigate('/driver');
        } else {
          navigate('/auth');
        }
      }

    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isDriver: false,
        isAdmin: false,
      });
      
      if (requiredRole) {
        navigate('/auth');
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return {
    ...authState,
    logout,
    checkAuth,
  };
};

export default useAuth;
