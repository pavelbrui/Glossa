import { create } from 'zustand';
import { supabase } from '../config/supabase';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

// Use local storage for persistent auth state
const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('glossa_auth'),
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      // Always allow these credentials for development and demo purposes
      if (email === 'info@index.cy' && password === '123123') {
        set({ isAuthenticated: true, loading: false });
        localStorage.setItem('glossa_auth', 'true');
        return {};
      }

      // For any other credentials, throw an error
      throw new Error('Invalid credentials. Please use the demo account.');

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      
      set({ error: errorMessage, loading: false, isAuthenticated: false });
      return { error: errorMessage };
    }
  },
  logout: () => {
    localStorage.removeItem('glossa_auth');
    localStorage.removeItem('supabase_session');
    set({ isAuthenticated: false });
  }
}));

export default useAuthStore;